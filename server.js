// Solva — zero-dependency server. Serves ./public and proxies chat to Claude via fal's OpenRouter endpoint.
const http = require('http'), fs = require('fs'), path = require('path');

// Minimal .env loader (FAL_KEY=..., MODEL=..., PORT=...)
try {
  for (const line of fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {}

const PORT = process.env.PORT || 3000;
const KEY = process.env.FAL_KEY || '';
const MODEL = process.env.MODEL || 'anthropic/claude-sonnet-5.5';
const UPSTREAM = 'https://fal.run/openrouter/router/openai/v1/chat/completions';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };

function readBody(req, limit = 12e6) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > limit) { reject(new Error('too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

// Provider: Claude directly when ANTHROPIC_API_KEY is set, otherwise Claude through fal (OpenRouter).
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';

function toAnthropic(messages) {
  return messages.map(m => ({
    role: m.role,
    content: typeof m.content === 'string' ? m.content : m.content.map(part => {
      if (part.type !== 'image_url') return part;
      const m2 = /^data:(.+?);base64,(.*)$/.exec(part.image_url.url) || [];
      return { type: 'image', source: { type: 'base64', media_type: m2[1] || 'image/jpeg', data: m2[2] || '' } };
    }),
  }));
}

async function chat(req, res) {
  let body;
  try { body = JSON.parse(await readBody(req)); } catch { res.writeHead(400).end('bad request'); return; }
  const messages = (body.messages || []).slice();
  // Models expect the conversation to open with the user.
  if (messages[0]?.role === 'assistant') messages.unshift({ role: 'user', content: '(The student opened a session.)' });
  const max_tokens = Math.min(body.max_tokens || 1500, 4000), stream = !!body.stream, system = String(body.system || '');
  const fail = (code, error, detail) => res.writeHead(code, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error, detail }));
  if (!KEY && !ANTHROPIC_KEY) return void fail(500, 'No API key is set. Add FAL_KEY (or ANTHROPIC_API_KEY) to the .env file and restart.');

  let up;
  try {
    up = ANTHROPIC_KEY
      ? await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: ANTHROPIC_MODEL, system, messages: toAnthropic(messages), max_tokens, stream }),
        })
      : await fetch(UPSTREAM, {
          method: 'POST',
          headers: { Authorization: 'Key ' + KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: MODEL, messages: [{ role: 'system', content: system }, ...messages], max_tokens, stream, reasoning: { effort: 'low' } }),
        });
  } catch (e) { return void fail(502, 'Cannot reach the model: ' + e.message); }
  if (!up.ok) return void fail(502, `Model error ${up.status}`, (await up.text()).slice(0, 400));

  if (!stream) {
    const j = await up.json();
    const text = ANTHROPIC_KEY ? (j.content || []).filter(c => c.type === 'text').map(c => c.text).join('') : (j.choices?.[0]?.message?.content || '');
    return void res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ text }));
  }
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
  try {
    if (!ANTHROPIC_KEY) { for await (const chunk of up.body) res.write(chunk); }
    else { // translate Claude's event stream into the same chunk shape the browser already reads
      const dec = new TextDecoder(); let buf = '';
      for await (const chunk of up.body) {
        buf += dec.decode(chunk, { stream: true });
        let i;
        while ((i = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
          if (!line.startsWith('data:')) continue;
          try {
            const ev = JSON.parse(line.slice(5));
            if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta')
              res.write('data: ' + JSON.stringify({ choices: [{ delta: { content: ev.delta.text } }] }) + '\n\n');
          } catch {}
        }
      }
    }
  } catch {}
  res.end();
}

http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/chat') return void chat(req, res).catch(e => { try { res.writeHead(500).end(String(e)); } catch {} });
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(__dirname, 'public', path.normalize(urlPath === '/' ? '/index.html' : urlPath));
  if (!file.startsWith(path.join(__dirname, 'public'))) return void res.writeHead(403).end();
  fs.readFile(file, (err, data) => {
    if (err) return void res.writeHead(404).end('Not found');
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' }).end(data);
  });
}).on('error', e => {
  console.error(e.code === 'EADDRINUSE' ? `Port ${PORT} is already in use. Close the other program or run with PORT=3001.` : e.message);
  process.exit(1);
}).listen(PORT, () => { if (!KEY && !ANTHROPIC_KEY) console.warn('WARNING: no API key found. Copy .env.example to .env and add FAL_KEY.'); console.log(`Solva running at http://localhost:${PORT}  (${ANTHROPIC_KEY ? 'Claude direct: ' + ANTHROPIC_MODEL : 'Claude via fal: ' + MODEL})`); });
