// Fundo em aurora: manchas de luz que se movem devagar atrás das seções.
// Um shader de tela cheia em meia resolução; a cor muda conforme a seção.
const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;
const FRAG = `
precision mediump float;
uniform vec2 uRes; uniform float uT; uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform float uForca;
float blob(vec2 uv, vec2 c, float r){ float d = length(uv - c); return exp(-d * d / (r * r)); }
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  uv.x *= uRes.x / uRes.y;
  float a = uRes.x / uRes.y;
  float t = uT * .05;
  vec2 c1 = vec2(a * (.25 + .18 * sin(t * 1.3)), .75 + .12 * cos(t * 1.1));
  vec2 c2 = vec2(a * (.8 + .12 * cos(t * .9)), .3 + .18 * sin(t * 1.4));
  vec2 c3 = vec2(a * (.55 + .25 * sin(t * .7 + 2.)), .5 + .25 * cos(t * .8 + 1.));
  vec3 cor = uA * blob(uv, c1, .55) + uB * blob(uv, c2, .5) + uC * blob(uv, c3, .42) * .8;
  float i = clamp(max(max(cor.r, cor.g), cor.b), 0., 1.);
  cor += (hash(gl_FragCoord.xy + uT) - .5) * .035;
  // Cor já multiplicada pela transparência: o Safari do iPhone trata o canvas sempre assim, e com a cor "crua"
  // as manchas saíam várias vezes mais claras (o fundo virava um véu cinza e o texto ficava ilegível)
  float alfa = i * uForca;
  gl_FragColor = vec4(max(cor, 0.) * alfa, alfa);
}`;

const PALETAS = {
  dark: {
    sobre: ['#6d4aff', '#2b7fff', '#a78bfa'],
    trabalhos: ['#8b5cf6', '#ec4899', '#3b82f6'],
    processo: ['#4f46e5', '#06b6d4', '#a78bfa'],
    carreira: ['#7c3aed', '#f59e0b', '#6366f1'],
    contato: ['#6d4aff', '#14b8a6', '#c084fc'],
    case: ['#6d4aff', '#3b82f6', '#a78bfa'],
  },
  light: {
    sobre: ['#c4b5fd', '#93c5fd', '#ddd6fe'],
    trabalhos: ['#c4b5fd', '#fbcfe8', '#bfdbfe'],
    processo: ['#c7d2fe', '#a5f3fc', '#ddd6fe'],
    carreira: ['#ddd6fe', '#fde68a', '#c7d2fe'],
    contato: ['#c4b5fd', '#99f6e4', '#e9d5ff'],
    case: ['#c4b5fd', '#bfdbfe', '#ddd6fe'],
  },
};

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

export function criarFundo({ reduzido }) {
  const canvas = document.createElement('canvas');
  canvas.className = 'fundo';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, antialias: false, alpha: true });
  if (!gl) { canvas.remove(); return null; }

  const prog = gl.createProgram();
  [[gl.VERTEX_SHADER, VERT], [gl.FRAGMENT_SHADER, FRAG]].forEach(([tipo, src]) => {
    const s = gl.createShader(tipo);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    gl.attachShader(prog, s);
  });
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  const u = (n) => gl.getUniformLocation(prog, n);
  const uRes = u('uRes'), uT = u('uT'), uA = u('uA'), uB = u('uB'), uC = u('uC'), uForca = u('uForca');

  let tema = document.documentElement.dataset.theme;
  let secao = 'sobre';
  const atual = PALETAS[tema][secao].map(hex);
  let forca = 0, forcaAlvo = 0;
  let dominio = false;
  const LARANJA = { dark: ['#ff7a18', '#ff3d00', '#ffb347'], light: ['#ffc58a', '#ffab73', '#ffd9a8'] };
  const constelacao = criarConstelacao({ reduzido });

  function redimensionar() {
    const k = 0.5;
    canvas.width = Math.max(2, Math.floor(innerWidth * k));
    canvas.height = Math.max(2, Math.floor(innerHeight * k));
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  addEventListener('resize', redimensionar);
  redimensionar();

  const inicio = performance.now();
  let ultimo = inicio;
  function quadro(agora) {
    requestAnimationFrame(quadro);
    const dt = Math.min((agora - ultimo) / 1000, 0.05);
    ultimo = agora;
    forca += (forcaAlvo - forca) * Math.min(1, dt * 2.5);
    constelacao?.quadro(dt, forca);
    if (forca < 0.003 && forcaAlvo === 0) { canvas.style.opacity = '0'; return; }
    canvas.style.opacity = '1';
    const alvo = (dominio ? LARANJA[tema] : PALETAS[tema][secao]).map(hex);
    atual.forEach((c, i) => c.forEach((v, j) => (c[j] = v + (alvo[i][j] - v) * Math.min(1, dt * 1.5))));
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uT, reduzido ? 0 : (agora - inicio) / 1000);
    gl.uniform3fv(uA, atual[0]);
    gl.uniform3fv(uB, atual[1]);
    gl.uniform3fv(uC, atual[2]);
    // No celular o texto fica sempre por cima da aurora (sem margens livres): um pouco mais fraca para ler bem
    const celular = innerWidth <= 860 ? 0.8 : 1;
    gl.uniform1f(uForca, forca * (tema === 'dark' ? 0.55 : 0.7) * celular);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  requestAnimationFrame(quadro);

  return {
    setSecao(nome) {
      if (!nome || nome === 'inicio' || nome === 'stacks') { forcaAlvo = 0; return; }
      secao = PALETAS[tema][nome] ? nome : 'sobre';
      forcaAlvo = 1;
    },
    setTema(novo) { tema = novo; },
    setDominio(on) { dominio = on; constelacao?.setDominio(on); },
  };
}

// Constelação: pontos que flutuam e se ligam; o cursor atrai e liga os vizinhos, o clique espalha uma onda.
function criarConstelacao({ reduzido }) {
  if (reduzido) return null;
  const canvas = document.createElement("canvas");
  canvas.className = "constelacao";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  const g = canvas.getContext("2d");
  let W = 0, H = 0, dpr = 1;
  const pts = [];
  function redimensionar() {
    dpr = Math.min(devicePixelRatio, 1.5);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const alvo = Math.round(Math.min(110, (W * H) / 14000));
    while (pts.length < alvo) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 12, vy: (Math.random() - 0.5) * 12, r: 0.8 + Math.random() * 1.6 });
    pts.length = alvo;
  }
  addEventListener("resize", redimensionar);
  redimensionar();

  const mouse = { x: -9999, y: -9999, ativo: false };
  addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.ativo = true; }, { passive: true });
  document.addEventListener("pointerleave", () => (mouse.ativo = false));
  const ondas = [];
  addEventListener("pointerdown", (e) => ondas.push({ x: e.clientX, y: e.clientY, r: 0, vida: 1 }), { passive: true });

  let cor = "167,139,250", corLida = 0, dominio = false;
  function lerCor() {
    const v = getComputedStyle(document.documentElement).getPropertyValue("--acento").trim();
    const m = v.match(/^#([0-9a-f]{6})$/i);
    if (m) { cor = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)).join(","); return; }
    const n = v.match(/[\d.]+/g);
    if (n && n.length >= 3) cor = n.slice(0, 3).map((x) => Math.round(Number(x))).join(",");
  }

  return {
    setDominio(on) { dominio = on; },
    quadro(dt, forca) {
      canvas.style.opacity = String(Math.min(1, forca * 1.2));
      if (forca < 0.01) return;
      corLida -= dt;
      if (corLida <= 0) { lerCor(); corLida = 0.25; }
      g.clearRect(0, 0, W, H);
      const LIG = 130, RM = 190;
      ondas.forEach((o) => { o.r += dt * 520; o.vida -= dt * 0.9; });
      for (let i = ondas.length - 1; i >= 0; i--) if (ondas[i].vida <= 0) ondas.splice(i, 1);

      for (const p of pts) {
        // atração suave pelo cursor
        if (mouse.ativo) {
          const dx = mouse.x - p.x, dy = mouse.y - p.y, d = Math.hypot(dx, dy);
          if (d < RM && d > 1) { const f = (1 - d / RM) * 40; p.vx += (dx / d) * f * dt; p.vy += (dy / d) * f * dt; }
        }
        // a onda do clique empurra para fora
        for (const o of ondas) {
          const dx = p.x - o.x, dy = p.y - o.y, d = Math.hypot(dx, dy);
          if (Math.abs(d - o.r) < 40 && d > 1) { p.vx += (dx / d) * 260 * o.vida * dt; p.vy += (dy / d) * 260 * o.vida * dt; }
        }
        p.vx *= 0.985; p.vy *= 0.985;
        const vel = Math.hypot(p.vx, p.vy);
        if (vel < 6) { p.vx += (Math.random() - 0.5) * 4 * dt; p.vy += (Math.random() - 0.5) * 4 * dt; }
        if (vel > 90) { p.vx *= 90 / vel; p.vy *= 90 / vel; }
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;
      }
      g.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LIG) { g.strokeStyle = "rgba(" + cor + "," + ((1 - d / LIG) * 0.22).toFixed(3) + ")"; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
        }
        if (mouse.ativo) {
          const d = Math.hypot(a.x - mouse.x, a.y - mouse.y);
          if (d < RM) { g.strokeStyle = "rgba(" + cor + "," + ((1 - d / RM) * 0.45).toFixed(3) + ")"; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(mouse.x, mouse.y); g.stroke(); }
        }
        g.fillStyle = "rgba(" + cor + "," + (dominio ? 0.9 : 0.65) + ")";
        g.beginPath(); g.arc(a.x, a.y, a.r, 0, Math.PI * 2); g.fill();
      }
      for (const o of ondas) {
        g.strokeStyle = "rgba(" + cor + "," + (o.vida * 0.35).toFixed(3) + ")";
        g.lineWidth = 1.5;
        g.beginPath(); g.arc(o.x, o.y, o.r, 0, Math.PI * 2); g.stroke();
      }
    },
  };
}
