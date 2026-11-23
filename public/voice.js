// Solva voice engine (window.Voice).
// - speak / speaker: natural tutor voices through the server (/api/tts), sentence by sentence so the
//   first words play while the rest is still being written. Reports audio level for mascot animation.
// - listen: records the microphone, stops on silence, transcribes on the server (/api/stt) so it works
//   in every browser. Reports mic level.
// - bargeIn: lets the learner interrupt just by talking.
// Without FAL_KEY on the server everything falls back to the browser's own speech APIs.
(() => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let server = false;
  const ready = fetch('/api/voice').then(r => r.json()).then(j => (server = !!j.server)).catch(() => false);

  let ctx = null;
  /** Shared AudioContext. Call from a click/tap at least once (browsers block audio before a gesture). */
  function unlock() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  const level = (analyser, data) => {
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (const v of data) sum += (v - 128) ** 2;
    return Math.min(1, Math.sqrt(sum / data.length) / 40);
  };
  const clean = t => t.replace(/```[\s\S]*?```/g, ' ').replace(/\$\$?[\s\S]+?\$\$?/g, ' ').replace(/[*`#_>]/g, '').replace(/\s+/g, ' ').trim();

  /* ---------------- speaking ---------------- */
  let speakId = 0, source = null;

  function stop() {
    speakId++;
    try { source && source.stop(); } catch {}
    source = null;
    window.speechSynthesis?.cancel();
  }

  function browserSay(text, onLevel) {
    return new Promise(resolve => {
      if (!window.speechSynthesis) return resolve();
      const u = new SpeechSynthesisUtterance(text);
      const vs = speechSynthesis.getVoices();
      u.voice = vs.find(v => /Google US English|Samantha|Aria|Jenny/.test(v.name)) || vs.find(v => v.lang === 'en-US') || null;
      u.rate = 1.04; u.pitch = 1.1;
      // No audio access to the browser voice, so fake a talking level while it speaks.
      const fake = setInterval(() => onLevel?.(0.25 + Math.random() * 0.5), 110);
      let done = false;
      const fin = () => { if (!done) { done = true; clearInterval(fake); onLevel?.(0); resolve(); } };
      u.onend = fin; u.onerror = fin;
      speechSynthesis.speak(u);
    });
  }

  async function fetchSpeech(text, tutor) {
    const r = await fetch('/api/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, tutor }) });
    if (!r.ok) throw new Error('tts ' + r.status);
    return unlock().decodeAudioData(await r.arrayBuffer());
  }

  /**
   * Streaming speaker. Feed it the reply as it is written with push(textSoFar); call end(fullText) when
   * the reply is complete. end() resolves true when everything was spoken, false if interrupted.
   * opts: { tutor, onStart(), onLevel(0..1) }
   */
  function speaker(opts = {}) {
    stop();
    const id = speakId;
    const queue = [];
    let fed = 0, ended = false, started = false, wake = null, raf = 0;
    const alive = () => id === speakId;

    function enqueue(raw) {
      const text = clean(raw);
      if (!text || !alive()) return;
      const item = { text, buf: null };
      if (server) { item.buf = fetchSpeech(text, opts.tutor); item.buf.catch(() => {}); }
      queue.push(item);
      wake?.();
    }
    // Cut at sentence ends; keep chunks long enough to sound natural (the first one may be short so audio starts fast).
    function feed(full, final) {
      const re = /[.!?]+["')\]]*\s+|\n+/g;
      let rest = full.slice(fed), cut = 0, m;
      while ((m = re.exec(rest))) {
        const end = m.index + m[0].length;
        if (end - cut >= (queue.length || started ? 70 : 24)) { enqueue(rest.slice(cut, end)); cut = end; }
      }
      fed += cut;
      if (final) { enqueue(full.slice(fed)); fed = full.length; }
    }

    const done = (async () => {
      await ready;
      let analyser = null, data = null;
      const tick = () => { opts.onLevel?.(level(analyser, data)); raf = requestAnimationFrame(tick); };
      try {
        for (;;) {
          if (!alive()) return false;
          if (!queue.length) {
            if (ended) return true;
            await new Promise(r => (wake = r));
            wake = null;
            continue;
          }
          const item = queue.shift();
          let buf = null;
          if (item.buf) { try { buf = await item.buf; } catch {} }
          if (!alive()) return false;
          if (!started) { started = true; opts.onStart?.(); }
          if (!buf) { await browserSay(item.text, opts.onLevel); continue; }
          const ac = unlock();
          if (!analyser) { analyser = ac.createAnalyser(); analyser.fftSize = 512; analyser.connect(ac.destination); data = new Uint8Array(analyser.fftSize); tick(); }
          await new Promise(res => {
            source = ac.createBufferSource(); source.buffer = buf; source.connect(analyser); source.onended = res; source.start();
          });
        }
      } finally { cancelAnimationFrame(raf); opts.onLevel?.(0); }
    })();

    return {
      push(textSoFar) { if (!ended) feed(textSoFar, false); },
      end(full) { if (!ended) { feed(full, true); ended = true; wake?.(); } return done; },
    };
  }

  /** Speak a complete text. Resolves true when finished, false if interrupted. */
  const speak = (text, opts) => speaker(opts).end(text);

  /* ---------------- listening ---------------- */
  let mic = null, micAnalyser = null, micData = null, current = null;

  async function micStream() {
    if (mic?.active) return mic;
    mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    const ac = unlock();
    micAnalyser = ac.createAnalyser(); micAnalyser.fftSize = 512; micData = new Uint8Array(micAnalyser.fftSize);
    ac.createMediaStreamSource(mic).connect(micAnalyser);
    return mic;
  }
  const micLevel = () => (micAnalyser ? level(micAnalyser, micData) : 0);
  const canRecord = () => server && !!navigator.mediaDevices?.getUserMedia && !!window.MediaRecorder;
  const dataUrl = blob => new Promise((res, rej) => { const f = new FileReader(); f.onload = () => res(f.result); f.onerror = rej; f.readAsDataURL(blob); });

  function browserListen(opts) {
    return new Promise((resolve, reject) => {
      if (!SR) return reject(new Error('unsupported'));
      const rec = new SR(); rec.lang = 'en-US'; rec.interimResults = true; rec.continuous = !!opts.long;
      let final = '', cancelled = false;
      current = { finish: () => rec.stop(), cancel: () => { cancelled = true; rec.abort(); } };
      rec.onresult = ev => { let txt = ''; for (const r of ev.results) txt += r[0].transcript; final = txt; opts.onInterim?.(txt); };
      rec.onend = () => { current = null; resolve(cancelled ? '' : final.trim()); };
      rec.onerror = e => { if (e.error === 'not-allowed') { current = null; reject(new Error('mic-denied')); } };
      try { rec.start(); opts.onState?.('listening'); } catch (e) { reject(e); }
    });
  }

  /**
   * Record one spoken turn and return its transcript ('' if nothing was said).
   * opts: { onState('listening'|'transcribing'), onLevel(0..1), onInterim(text), silenceMs, waitMs, maxMs, long }
   * Rejects with Error('mic-denied') or Error('unsupported').
   */
  async function listen(opts = {}) {
    cancelListening();
    await ready;
    if (!canRecord()) return browserListen(opts);
    let stream;
    try { stream = await micStream(); } catch { throw new Error('mic-denied'); }
    const rec = new MediaRecorder(stream), chunks = [];
    rec.ondataavailable = e => e.data.size && chunks.push(e.data);
    return new Promise((resolve, reject) => {
      const silenceMs = opts.silenceMs || 1100, waitMs = opts.waitMs || 9000, maxMs = opts.maxMs || 60000;
      let heard = false, loud = 0, quiet = 0, cancelled = false, raf = 0, last = performance.now();
      const t0 = last;
      const halt = () => { if (rec.state !== 'inactive') rec.stop(); };
      current = { finish: () => { heard = true; halt(); }, cancel: () => { cancelled = true; halt(); } };
      rec.onstop = async () => {
        cancelAnimationFrame(raf); opts.onLevel?.(0); current = null;
        if (cancelled || !heard) return resolve('');
        opts.onState?.('transcribing');
        try {
          const audio = await dataUrl(new Blob(chunks, { type: rec.mimeType || 'audio/webm' }));
          const r = await fetch('/api/stt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ audio }) });
          if (!r.ok) throw new Error('stt ' + r.status);
          resolve(((await r.json()).text || '').trim());
        } catch (e) { reject(e); }
      };
      rec.start(); opts.onState?.('listening');
      const loop = () => {
        const now = performance.now(), dt = now - last, lv = micLevel(); last = now;
        opts.onLevel?.(lv);
        if (lv > 0.12) { loud += dt; quiet = 0; if (loud > 120) heard = true; }
        else { quiet += dt; if (quiet > 300) loud = 0; }
        if ((heard && quiet > silenceMs) || (!heard && now - t0 > waitMs) || now - t0 > maxMs) return halt();
        raf = requestAnimationFrame(loop);
      };
      loop();
    });
  }
  /** Stop recording now and transcribe what was said. */
  function finishListening() { current?.finish(); }
  function cancelListening() { current?.cancel(); current = null; }

  /**
   * While the tutor is speaking, call onVoice() once if the learner starts talking over it.
   * Only works after the mic was opened by listen(). Returns a function that stops watching.
   */
  function bargeIn(onVoice) {
    if (!micAnalyser || !mic?.active) return () => {};
    let raf = 0, over = 0, last = performance.now(), base = 0, n = 0;
    const t0 = last;
    const loop = () => {
      const now = performance.now(), dt = now - last, lv = micLevel(); last = now;
      // The first half second measures how much of the tutor's own voice leaks into the mic.
      // If a lot leaks (loud speakers, no echo cancellation), talking over it cannot be told apart from the tutor: tap instead.
      if (now - t0 < 500) { base = Math.max(base, lv); n++; }
      else if (base > 0.22) return;
      else if (lv > Math.max(0.3, base * 2.5)) { over += dt; if (over > 350) return void onVoice(); }
      else over = Math.max(0, over - dt);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }

  /* ---------------- mascot ---------------- */
  /** Markup for an animated mascot. The talk frame (mouth open) is optional: it is removed if the image is missing. */
  function mascot(tutor, mood = '') {
    const base = `/img/${tutor}${mood ? '-' + mood : ''}.webp`;
    // The talk frame is drawn from the neutral pose, so it is only used with the neutral face.
    const talk = mood ? '' : `<img class="m-talk" data-talk src="/img/${tutor}-talk.webp" alt="" onerror="this.remove()">`;
    return `<div class="mascot" data-s="idle"><img class="m-base" data-face src="${base}" alt="">${talk}</div>`;
  }
  /** Returns a function that feeds an audio level (0..1) to a mascot element: bounce + mouth open/closed. */
  function animator(el) {
    let smooth = 0, openUntil = 0;
    return lv => {
      if (!el?.isConnected) return;
      smooth = lv > smooth ? lv : smooth * 0.82;
      const now = performance.now();
      if (lv > 0.16) openUntil = now + 90;
      el.style.setProperty('--lv', smooth.toFixed(3));
      el.classList.toggle('open', now < openUntil);
    };
  }

  window.speechSynthesis?.getVoices();
  window.Voice = {
    ready, unlock, speak, speaker, stop, listen, finishListening, cancelListening, bargeIn, mascot, animator,
    get server() { return server; },
    get canListen() { return canRecord() || !!SR; },
  };
})();
