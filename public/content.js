/* Study cards: curated material for every topic, shown before practice and used for the daily problem.
   key   = formulas worth memorising (LaTeX in $...$)
   ex    = one worked example: question, steps revealed one at a time, final answer
   check = one multiple-choice question; a is the index of the right choice
   plot  = optional figure: x/y ranges, curves, a shaded area under a curve, marked points */
const E = Math.exp, bell = x => E(-x * x / 2) / Math.sqrt(2 * Math.PI);
const CONTENT = {
  /* ---------- Math ---------- */
  'Linear equations': {
    key: ['$ax+b=c \\;\\Rightarrow\\; x=\\dfrac{c-b}{a}$', '$y=mx+c$', '$m=\\dfrac{y_2-y_1}{x_2-x_1}$'],
    ex: { q: 'Solve $3(x-2)=2x+5$', steps: ['$3x-6=2x+5$', '$3x-2x=5+6$'], a: '$x=11$' },
    check: { q: 'Solve $5x-7=2x+8$', c: ['$x=3$', '$x=5$', '$x=15$', '$x=\\tfrac13$'], a: 1, why: '$3x=15$' },
    plot: { x: [-2, 4], y: [-3, 9], curves: [x => 2 * x + 1], points: [[0, 1], [1, 3]] },
  },
  'Quadratics': {
    key: ['$x=\\dfrac{-b\\pm\\sqrt{b^2-4ac}}{2a}$', '$\\Delta=b^2-4ac$', '$x_{\\text{vertex}}=-\\dfrac{b}{2a}$'],
    ex: { q: 'Solve $x^2-5x+6=0$', steps: ['Find two numbers with product $6$ and sum $-5$', '$(x-2)(x-3)=0$'], a: '$x=2$ or $x=3$' },
    check: { q: 'Solve $x^2-2x-8=0$', c: ['$x=2,\\ -4$', '$x=8,\\ -1$', '$x=4,\\ -2$', '$x=-4,\\ -2$'], a: 2, why: '$(x-4)(x+2)=0$' },
    plot: { x: [0, 5], y: [-1, 6.5], curves: [x => x * x - 5 * x + 6], points: [[2, 0], [3, 0]] },
  },
  'Functions & graphs': {
    key: ['$(f\\circ g)(x)=f(g(x))$', '$f^{-1}(f(x))=x$', '$y=f(x-a)+b$: right $a$, up $b$'],
    ex: { q: 'Find $f^{-1}(x)$ for $f(x)=2x+3$', steps: ['Write $y=2x+3$', 'Solve for $x$: $x=\\dfrac{y-3}{2}$'], a: '$f^{-1}(x)=\\dfrac{x-3}{2}$' },
    check: { q: '$f(x)=x^2$, $g(x)=x+1$. Find $f(g(2))$', c: ['$9$', '$5$', '$7$', '$6$'], a: 0, why: '$g(2)=3$, then $3^2$' },
    plot: { x: [-3, 5], y: [-1, 8], curves: [x => x * x, x => (x - 2) * (x - 2) + 1] },
  },
  'Trigonometry': {
    key: ['$\\sin^2\\theta+\\cos^2\\theta=1$', '$\\tan\\theta=\\dfrac{\\sin\\theta}{\\cos\\theta}$', '$\\sin2\\theta=2\\sin\\theta\\cos\\theta$'],
    ex: { q: 'Solve $\\sin\\theta=\\tfrac12$ for $0\\le\\theta<2\\pi$', steps: ['Reference angle: $\\tfrac{\\pi}{6}$', 'Sine is positive in quadrants I and II'], a: '$\\theta=\\tfrac{\\pi}{6},\\ \\tfrac{5\\pi}{6}$' },
    check: { q: '$\\cos\\theta=0.6$ and $\\theta$ is acute. Find $\\sin\\theta$', c: ['$0.4$', '$0.36$', '$0.64$', '$0.8$'], a: 3, why: '$\\sqrt{1-0.36}$' },
    plot: { x: [0, 6.283], y: [-1.3, 1.3], curves: [Math.sin, Math.cos] },
  },
  'Derivatives': {
    key: ['$\\dfrac{d}{dx}x^n=nx^{n-1}$', "$(uv)'=u'v+uv'$", "$\\dfrac{d}{dx}f(g(x))=f'(g(x))\\,g'(x)$"],
    ex: { q: 'Differentiate $(3x^2+1)^5$', steps: ['Outer: $u^5$, inner: $u=3x^2+1$', '$5(3x^2+1)^4\\cdot 6x$'], a: '$30x(3x^2+1)^4$' },
    check: { q: "$f(x)=x^3-4x$. Find $f'(2)$", c: ['$8$', '$0$', '$12$', '$4$'], a: 0, why: "$f'(x)=3x^2-4$" },
    plot: { x: [-1.5, 2.5], y: [-1.5, 5], curves: [x => x * x, x => 2 * x - 1], points: [[1, 1]] },
  },
  'Integrals': {
    key: ['$\\displaystyle\\int x^n\\,dx=\\frac{x^{n+1}}{n+1}+C$', '$\\displaystyle\\int_a^b f(x)\\,dx=F(b)-F(a)$', '$\\displaystyle\\int u\\,dv=uv-\\int v\\,du$'],
    ex: { q: 'Evaluate $\\displaystyle\\int_0^2 3x^2\\,dx$', steps: ['Antiderivative: $x^3$', '$2^3-0^3$'], a: '$8$' },
    check: { q: 'Evaluate $\\displaystyle\\int_0^1 (2x+1)\\,dx$', c: ['$1$', '$3$', '$2$', '$\\tfrac32$'], a: 2, why: '$\\big[x^2+x\\big]_0^1$' },
    plot: { x: [0, 2.3], y: [0, 14], curves: [x => 3 * x * x], fill: { f: x => 3 * x * x, from: 0, to: 2 } },
  },
  'Probability': {
    key: ['$P(A\\cup B)=P(A)+P(B)-P(A\\cap B)$', '$P(A\\mid B)=\\dfrac{P(A\\cap B)}{P(B)}$', '$\\dbinom{n}{k}=\\dfrac{n!}{k!\\,(n-k)!}$'],
    ex: { q: 'Two fair dice. Find $P(\\text{sum}=7)$', steps: ['$36$ equally likely outcomes', '$6$ of them sum to $7$'], a: '$\\tfrac16$' },
    check: { q: 'A fair coin is tossed 3 times. $P(\\text{exactly 2 heads})$?', c: ['$\\tfrac14$', '$\\tfrac12$', '$\\tfrac38$', '$\\tfrac23$'], a: 2, why: '$\\binom32=3$ of $8$ outcomes' },
  },

  /* ---------- Physics ---------- */
  'Kinematics': {
    key: ['$v=u+at$', '$s=ut+\\tfrac12at^2$', '$v^2=u^2+2as$'],
    ex: { q: 'From rest, $a=2\\ \\text{m/s}^2$ for $5\\ \\text{s}$. Distance?', steps: ['$u=0,\\ a=2,\\ t=5$', '$s=0+\\tfrac12(2)(5^2)$'], a: '$25\\ \\text{m}$' },
    check: { q: 'A ball is dropped from rest. Speed after $3\\ \\text{s}$? ($g=10\\ \\text{m/s}^2$)', c: ['$15\\ \\text{m/s}$', '$30\\ \\text{m/s}$', '$45\\ \\text{m/s}$', '$90\\ \\text{m/s}$'], a: 1, why: '$v=gt$' },
    plot: { x: [0, 5.3], y: [0, 28], curves: [t => t * t], points: [[5, 25]] },
  },
  "Newton's laws": {
    key: ['$F_{\\text{net}}=ma$', '$W=mg$', '$F_{AB}=-F_{BA}$'],
    ex: { q: '$4\\ \\text{kg}$ box, $20\\ \\text{N}$ push, $8\\ \\text{N}$ friction. Acceleration?', steps: ['$F_{\\text{net}}=20-8=12\\ \\text{N}$', '$a=\\dfrac{12}{4}$'], a: '$3\\ \\text{m/s}^2$' },
    check: { q: 'Net force $10\\ \\text{N}$ on $2\\ \\text{kg}$. Acceleration?', c: ['$20\\ \\text{m/s}^2$', '$0.2\\ \\text{m/s}^2$', '$12\\ \\text{m/s}^2$', '$5\\ \\text{m/s}^2$'], a: 3, why: '$a=F/m$' },
  },
  'Energy & work': {
    key: ['$W=Fd\\cos\\theta$', '$E_k=\\tfrac12mv^2$', '$E_p=mgh$'],
    ex: { q: 'A ball falls $5\\ \\text{m}$ from rest. Speed at the ground? ($g=10$)', steps: ['$mgh=\\tfrac12mv^2$', '$v=\\sqrt{2gh}=\\sqrt{100}$'], a: '$10\\ \\text{m/s}$' },
    check: { q: 'Kinetic energy of a $1000\\ \\text{kg}$ car at $20\\ \\text{m/s}$?', c: ['$20\\ \\text{kJ}$', '$400\\ \\text{kJ}$', '$200\\ \\text{kJ}$', '$10\\ \\text{kJ}$'], a: 2, why: '$\\tfrac12(1000)(400)\\ \\text{J}$' },
  },
  'Momentum': {
    key: ['$p=mv$', '$F\\,\\Delta t=\\Delta p$', '$m_1u_1+m_2u_2=m_1v_1+m_2v_2$'],
    ex: { q: '$2\\ \\text{kg}$ cart at $3\\ \\text{m/s}$ sticks to a $1\\ \\text{kg}$ cart at rest. Final speed?', steps: ['Before: $p=2\\times3=6$', 'After: $(2+1)v=6$'], a: '$2\\ \\text{m/s}$' },
    check: { q: 'Momentum of a $0.5\\ \\text{kg}$ ball at $8\\ \\text{m/s}$?', c: ['$16\\ \\text{kg}\\cdot\\text{m/s}$', '$4\\ \\text{kg}\\cdot\\text{m/s}$', '$8.5\\ \\text{kg}\\cdot\\text{m/s}$', '$2\\ \\text{kg}\\cdot\\text{m/s}$'], a: 1, why: '$p=mv$' },
  },
  'Circuits': {
    key: ['$V=IR$', '$P=IV$', '$R_s=R_1+R_2,\\quad \\dfrac1{R_p}=\\dfrac1{R_1}+\\dfrac1{R_2}$'],
    ex: { q: '$12\\ \\text{V}$ across $4\\ \\Omega$ and $2\\ \\Omega$ in series. Current?', steps: ['$R=4+2=6\\ \\Omega$', '$I=\\dfrac{12}{6}$'], a: '$2\\ \\text{A}$' },
    check: { q: 'Two $6\\ \\Omega$ resistors in parallel. Total resistance?', c: ['$12\\ \\Omega$', '$6\\ \\Omega$', '$36\\ \\Omega$', '$3\\ \\Omega$'], a: 3, why: '$\\tfrac16+\\tfrac16=\\tfrac13$' },
  },
  'Waves': {
    key: ['$v=f\\lambda$', '$T=\\dfrac1f$', '$y=A\\sin(kx-\\omega t)$'],
    ex: { q: 'Sound at $340\\ \\text{m/s}$ with $f=170\\ \\text{Hz}$. Wavelength?', steps: ['$\\lambda=\\dfrac{v}{f}$', '$\\dfrac{340}{170}$'], a: '$2\\ \\text{m}$' },
    check: { q: 'Period of a $50\\ \\text{Hz}$ wave?', c: ['$0.02\\ \\text{s}$', '$0.5\\ \\text{s}$', '$50\\ \\text{s}$', '$0.2\\ \\text{s}$'], a: 0, why: '$T=1/f$' },
    plot: { x: [0, 12.566], y: [-1.4, 1.4], curves: [Math.sin] },
  },

  /* ---------- Chemistry ---------- */
  'Moles & stoichiometry': {
    key: ['$n=\\dfrac{m}{M}$', '$n=cV$', '$N=n\\,N_A$'],
    ex: { q: 'Moles in $36\\ \\text{g}$ of water? ($M=18\\ \\text{g/mol}$)', steps: ['$n=\\dfrac{m}{M}$', '$\\dfrac{36}{18}$'], a: '$2\\ \\text{mol}$' },
    check: { q: 'Mass of $0.5\\ \\text{mol}$ of NaCl? ($M=58.5\\ \\text{g/mol}$)', c: ['$117\\ \\text{g}$', '$29.25\\ \\text{g}$', '$58.5\\ \\text{g}$', '$0.0085\\ \\text{g}$'], a: 1, why: '$m=nM$' },
  },
  'Balancing equations': {
    key: ['$\\mathrm{2H_2+O_2\\to 2H_2O}$', '$\\mathrm{CH_4+2O_2\\to CO_2+2H_2O}$', '$\\mathrm{N_2+3H_2\\to 2NH_3}$'],
    ex: { q: 'Balance $\\mathrm{Fe+O_2\\to Fe_2O_3}$', steps: ['Oxygen: $\\mathrm{3O_2}$ gives $6$ O, so $\\mathrm{2Fe_2O_3}$', 'Iron: $4$ Fe on the right, so $\\mathrm{4Fe}$'], a: '$\\mathrm{4Fe+3O_2\\to 2Fe_2O_3}$' },
    check: { q: 'Balanced $\\mathrm{C_3H_8+O_2\\to CO_2+H_2O}$. Coefficient of $\\mathrm{O_2}$?', c: ['$3$', '$4$', '$5$', '$7$'], a: 2, why: '$\\mathrm{C_3H_8+5O_2\\to 3CO_2+4H_2O}$' },
  },
  'Atomic structure': {
    key: ['$A=Z+N$', 'Shell $n$ holds $2n^2$ electrons', '$E=hf$'],
    ex: { q: 'Neutrons in $^{23}_{11}\\mathrm{Na}$?', steps: ['$A=23,\\ Z=11$', '$N=A-Z$'], a: '$12$' },
    check: { q: 'Electron shells of chlorine ($Z=17$)?', c: ['$2,8,7$', '$2,8,8$', '$2,7,8$', '$8,8,1$'], a: 0, why: '$2+8+7=17$' },
  },
  'Acids & bases': {
    key: ['$\\mathrm{pH}=-\\log[\\mathrm{H^+}]$', '$\\mathrm{pH}+\\mathrm{pOH}=14$', '$K_w=[\\mathrm{H^+}][\\mathrm{OH^-}]=10^{-14}$'],
    ex: { q: 'pH of $0.01\\ \\text{M}$ HCl?', steps: ['Strong acid: $[\\mathrm{H^+}]=10^{-2}$', '$-\\log(10^{-2})$'], a: '$\\mathrm{pH}=2$' },
    check: { q: 'A solution has pH $9$. Its pOH?', c: ['$5$', '$9$', '$23$', '$-5$'], a: 0, why: '$14-9$' },
  },
  'Thermochemistry': {
    key: ['$q=mc\\,\\Delta T$', '$\\Delta H=H_{\\text{products}}-H_{\\text{reactants}}$', '$\\Delta G=\\Delta H-T\\,\\Delta S$'],
    ex: { q: 'Heat to warm $100\\ \\text{g}$ of water by $10\\ ^\\circ\\text{C}$? ($c=4.18$)', steps: ['$q=mc\\,\\Delta T$', '$100\\times4.18\\times10$'], a: '$4180\\ \\text{J}$' },
    check: { q: '$\\Delta H=-50\\ \\text{kJ}$. The reaction is…', c: ['Endothermic', 'Exothermic', 'At equilibrium', 'Impossible'], a: 1, why: 'Negative $\\Delta H$ releases heat' },
  },
  'Equilibrium': {
    key: ['$K_c=\\dfrac{[C]^c[D]^d}{[A]^a[B]^b}$', '$Q<K \\Rightarrow$ forward', '$Q>K \\Rightarrow$ reverse'],
    ex: { q: '$\\mathrm{N_2O_4\\rightleftharpoons 2NO_2}$ with $[\\mathrm{NO_2}]=0.2$, $[\\mathrm{N_2O_4}]=0.1$. $K_c$?', steps: ['$K_c=\\dfrac{[\\mathrm{NO_2}]^2}{[\\mathrm{N_2O_4}]}$', '$\\dfrac{0.2^2}{0.1}$'], a: '$0.4$' },
    check: { q: 'If $Q<K$, the reaction shifts…', c: ['Toward reactants', 'Nowhere', 'Toward products', 'Until $K$ changes'], a: 2, why: 'Too few products so far' },
    plot: { x: [0, 5], y: [0, 1.1], curves: [t => 0.4 + 0.6 * E(-t), t => 0.6 * (1 - E(-t))] },
  },

  /* ---------- Statistics ---------- */
  'Mean & variance': {
    key: ['$\\bar x=\\dfrac1n\\sum x_i$', '$s^2=\\dfrac{1}{n-1}\\sum(x_i-\\bar x)^2$', '$s=\\sqrt{s^2}$'],
    ex: { q: 'Sample variance of $2,\\ 4,\\ 6$?', steps: ['$\\bar x=4$', 'Squared deviations: $4+0+4=8$'], a: '$s^2=\\dfrac82=4$' },
    check: { q: 'Mean of $3,\\ 5,\\ 7,\\ 9$?', c: ['$5$', '$6$', '$7$', '$24$'], a: 1, why: '$24/4$' },
  },
  'Probability rules': {
    key: ['$P(A^c)=1-P(A)$', '$P(A\\cap B)=P(A)\\,P(B\\mid A)$', '$P(A\\mid B)=\\dfrac{P(B\\mid A)\\,P(A)}{P(B)}$'],
    ex: { q: 'Independent events with $P(A)=0.3$, $P(B)=0.5$. Find $P(A\\cup B)$', steps: ['$P(A\\cap B)=0.3\\times0.5=0.15$', '$0.3+0.5-0.15$'], a: '$0.65$' },
    check: { q: 'Two dice rolls. $P(\\text{at least one six})$?', c: ['$\\tfrac13$', '$\\tfrac{11}{36}$', '$\\tfrac1{36}$', '$\\tfrac{25}{36}$'], a: 1, why: '$1-\\left(\\tfrac56\\right)^2$' },
  },
  'Normal distribution': {
    key: ['$z=\\dfrac{x-\\mu}{\\sigma}$', '$68\\%,\\ 95\\%,\\ 99.7\\%$ within $1,\\ 2,\\ 3\\ \\sigma$', '$\\bar X\\sim N\\!\\left(\\mu,\\ \\dfrac{\\sigma^2}{n}\\right)$'],
    ex: { q: 'Scores are $N(70,\\ 10^2)$. The $z$-score of $85$?', steps: ['$z=\\dfrac{x-\\mu}{\\sigma}$', '$\\dfrac{85-70}{10}$'], a: '$z=1.5$' },
    check: { q: 'Share of values within $2\\sigma$ of the mean?', c: ['$68\\%$', '$95\\%$', '$99.7\\%$', '$50\\%$'], a: 1, why: 'The 68–95–99.7 rule' },
    plot: { x: [-3.5, 3.5], y: [0, 0.45], curves: [bell], fill: { f: bell, from: -1, to: 1 } },
  },
  'Hypothesis tests': {
    key: ['$z=\\dfrac{\\bar x-\\mu_0}{\\sigma/\\sqrt n}$', '$p<\\alpha \\Rightarrow$ reject $H_0$', 'Type I error: rejecting a true $H_0$'],
    ex: { q: '$n=25$, $\\bar x=52$, $\\mu_0=50$, $\\sigma=5$. Test statistic?', steps: ['$\\text{SE}=\\dfrac{5}{\\sqrt{25}}=1$', '$z=\\dfrac{52-50}{1}$'], a: '$z=2$' },
    check: { q: '$p=0.03$ and $\\alpha=0.05$. Decision?', c: ['Reject $H_0$', 'Fail to reject $H_0$', '$H_1$ is proven', 'Raise $\\alpha$'], a: 0, why: '$0.03<0.05$' },
    plot: { x: [-3.5, 3.5], y: [0, 0.45], curves: [bell], fill: { f: bell, from: 1.645, to: 3.5 } },
  },
  'Regression': {
    key: ['$\\hat y=a+bx$', '$b=r\\,\\dfrac{s_y}{s_x}$', '$R^2=r^2$'],
    ex: { q: 'Fitted line $\\hat y=2+3x$. Predict $y$ at $x=4$', steps: ['Substitute $x=4$', '$2+3(4)$'], a: '$\\hat y=14$' },
    check: { q: 'Correlation $r=0.8$. What is $R^2$?', c: ['$0.8$', '$0.64$', '$1.6$', '$0.4$'], a: 1, why: '$0.8^2$' },
    plot: { x: [0, 6], y: [0, 9], curves: [x => 1 + 1.2 * x], points: [[0.6, 1.2], [1.3, 3.2], [2.1, 3.0], [2.9, 5.2], [3.6, 4.9], [4.4, 6.9], [5.2, 6.8]] },
  },

  /* ---------- Computer Science ---------- */
  'Big-O complexity': {
    key: ['$O(1)<O(\\log n)<O(n)<O(n\\log n)<O(n^2)$', 'Binary search: $O(\\log n)$', 'Two nested loops over $n$: $O(n^2)$'],
    ex: { q: 'A loop over $n$ items contains a loop over $n$ items. Complexity?', steps: ['Outer loop runs $n$ times', 'Inner loop runs $n$ times each'], a: '$O(n^2)$' },
    check: { q: 'How many times can you halve $1024$ before reaching $1$?', c: ['$10$', '$32$', '$512$', '$1024$'], a: 0, why: '$2^{10}=1024$' },
    plot: { x: [1, 10], y: [0, 60], curves: [n => n, n => n * Math.log2(n), n => n * n] },
  },
  'Recursion': {
    key: ['$n!=n\\cdot(n-1)!,\\quad 0!=1$', '$F_n=F_{n-1}+F_{n-2}$', '$T(n)=2T(n/2)+n \\Rightarrow O(n\\log n)$'],
    ex: { q: 'Trace $\\text{fact}(4)$', steps: ['$4\\cdot\\text{fact}(3)$', '$4\\cdot3\\cdot2\\cdot1\\cdot\\text{fact}(0)$'], a: '$24$' },
    check: { q: '$F_1=F_2=1$. What is $F_6$?', c: ['$5$', '$8$', '$13$', '$6$'], a: 1, why: '$1,1,2,3,5,8$' },
  },
  'Binary & logic': {
    key: ['$1011_2=8+2+1=11$', '$A\\land B,\\quad A\\lor B,\\quad \\lnot A$', '$\\lnot(A\\land B)=\\lnot A\\lor\\lnot B$'],
    ex: { q: 'Write $13$ in binary', steps: ['$13=8+4+1$', 'Bits for $8,4,2,1$: $1,1,0,1$'], a: '$1101_2$' },
    check: { q: 'What is $1010_2$ in decimal?', c: ['$5$', '$12$', '$10$', '$20$'], a: 2, why: '$8+2$' },
  },
  'Sorting': {
    key: ['Merge sort: $O(n\\log n)$ always', 'Quicksort: $O(n\\log n)$ average, $O(n^2)$ worst', 'Bubble sort: $O(n^2)$'],
    ex: { q: 'One bubble-sort pass over $[3,\\ 1,\\ 2]$', steps: ['Swap $3,1$: $[1,\\ 3,\\ 2]$', 'Swap $3,2$: $[1,\\ 2,\\ 3]$'], a: '$[1,\\ 2,\\ 3]$' },
    check: { q: 'Which sort is $O(n\\log n)$ even in the worst case?', c: ['Bubble sort', 'Quicksort', 'Merge sort', 'Insertion sort'], a: 2, why: 'It always splits in half' },
  },
  'Graphs & trees': {
    key: ['A tree with $n$ nodes has $n-1$ edges', 'BFS uses a queue and finds shortest paths', 'Balanced BST search: $O(\\log n)$'],
    ex: { q: 'BFS from A on edges A–B, A–C, B–D. Visit order?', steps: ['Visit A, queue B and C', 'Visit B, queue D, then visit C'], a: 'A, B, C, D' },
    check: { q: 'How many edges does a tree with $10$ nodes have?', c: ['$9$', '$10$', '$11$', '$45$'], a: 0, why: '$n-1$' },
  },
};
