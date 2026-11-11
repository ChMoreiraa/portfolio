// "Como eu trabalho" como um fluxo de automação (estilo n8n): nós arrastáveis, ramificações,
// laço de correção e um pacote de dados que percorre o caminho quando o fluxo é executado.
import { gsap } from 'gsap';

// Deitado (tela larga) e em pé (celular: um nó embaixo do outro)
const WH = 1200, HH = 220;
const WV = 340, HV = 620;
const POS_V = {
  pedido: { x: 170, y: 40 }, entender: { x: 170, y: 135 }, planejar: { x: 170, y: 230 },
  construir: { x: 170, y: 325 }, testes: { x: 170, y: 448 }, entregar: { x: 170, y: 575 },
};
const LIMITE_VERTICAL = 640;

const IC = {
  raio: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  lupa: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  lista: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
  codigo: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
  losango: '<path d="M12 3l9 9-9 9-9-9z"/>',
  foguete: '<path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M9 15l-3-3c1.5-5 6-9 13-9 0 7-4 11.5-9 13z"/><circle cx="15" cy="9" r="1.5"/>',
};

const NOS = [
  { id: 'pedido', x: 95, y: 80, tipo: 'gatilho', ic: 'raio', t: { pt: 'Pedido', en: 'Request' }, s: { pt: 'ideia ou problema', en: 'idea or problem' } },
  { id: 'entender', x: 290, y: 80, ic: 'lupa', t: { pt: 'Entender', en: 'Understand' }, s: { pt: 'objetivo e o que é pronto', en: 'goal and what done means' } },
  { id: 'planejar', x: 485, y: 80, ic: 'lista', t: { pt: 'Planejar', en: 'Plan' }, s: { pt: 'em etapas pequenas', en: 'in small steps' } },
  { id: 'construir', x: 680, y: 80, ic: 'codigo', t: { pt: 'Construir', en: 'Build' }, s: { pt: 'código e automações', en: 'code and automations' } },
  { id: 'testes', x: 885, y: 80, tipo: 'decisao', ic: 'losango', t: { pt: 'Testes passam?', en: 'Tests pass?' } },
  { id: 'entregar', x: 1100, y: 80, tipo: 'fim', ic: 'foguete', t: { pt: 'Entregar', en: 'Deliver' }, s: { pt: 'e acompanhar o uso', en: 'and follow the usage' } },
];

const ARESTAS = [
  ['pedido', 'entender'], ['entender', 'planejar'], ['planejar', 'construir'], ['construir', 'testes'],
  ['testes', 'entregar', { pt: 'sim', en: 'yes' }],
  ['testes', 'construir', { pt: 'não: ajustar', en: 'no: fix' }, 'volta'],
];

const LOG = {
  pedido: { pt: 'pedido: “relatório de prazos por empresa”', en: 'request: “deadline report per company”' },
  entender: { pt: 'objetivo e critério de pronto combinados', en: 'goal and definition of done agreed' },
  planejar: { pt: 'plano em 3 etapas, a mais útil primeiro', en: '3-step plan, most useful first' },
  construir: { pt: 'primeira versão pronta', en: 'first version ready' },
  testesNao: { pt: 'um teste falhou → volta para ajustar', en: 'a test failed → back to fix' },
  ajuste: { pt: 'caso corrigido', en: 'case fixed' },
  testesSim: { pt: 'todos os testes passam', en: 'all tests pass' },
  entregar: { pt: 'entregue · acompanhando o uso', en: 'delivered · following the usage' },
};

export function montarFluxo(raiz, opcoes) {
  const { idioma, reduzido, clique } = opcoes;
  raiz._fluxo?.destruir(); // a montagem anterior (troca de idioma ou de orientação) para de observar
  const tx = (o) => o[idioma] ?? o.pt;
  const vertical = raiz.clientWidth > 0 && raiz.clientWidth < LIMITE_VERTICAL;
  const W = vertical ? WV : WH, H = vertical ? HV : HH;
  const pos = Object.fromEntries(NOS.map((n) => [n.id, vertical ? { ...POS_V[n.id] } : { x: n.x, y: n.y }]));
  raiz.innerHTML = `
    <div class="fluxo ${vertical ? 'fluxo--vertical' : ''}">
      <div class="fluxo__barra mono">
        <span class="fluxo__nome"><i></i>workflow · ${idioma === 'pt' ? 'do pedido à entrega' : 'from request to delivery'}</span>
        <label class="fluxo__opcao"><input type="checkbox" id="fluxo-falha" checked /> ${idioma === 'pt' ? 'teste falha na 1ª vez' : 'test fails the 1st time'}</label>
        <button class="fluxo__exec" type="button" id="fluxo-exec"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z"/></svg>${idioma === 'pt' ? 'Executar fluxo' : 'Run workflow'}</button>
      </div>
      <div class="fluxo__area">
        <div class="fluxo__rolagem">
          <div class="fluxo__tela"><div class="fluxo__palco" style="width:${W}px;height:${H}px">
            <svg class="fluxo__fios" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">
              <defs><marker id="fl-seta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z"/></marker></defs>
              ${ARESTAS.map(([a, b, rot, tipo], i) => `<path class="fio ${tipo ? `fio--${tipo}` : ''}" id="fio-${i}" marker-end="url(#fl-seta)"/>`).join('')}
            </svg>
            ${ARESTAS.map(([, , rot], i) => (rot ? `<span class="fio__rot mono" id="rot-${i}">${tx(rot)}</span>` : '')).join('')}
            ${NOS.map((n) => `
              <div class="no no--${n.tipo ?? 'acao'}" data-no="${n.id}" style="left:${pos[n.id].x}px;top:${pos[n.id].y}px" tabindex="0">
                <span class="no__ic"><svg viewBox="0 0 24 24" aria-hidden="true">${IC[n.ic]}</svg></span>
                <span class="no__txt"><b>${tx(n.t)}</b>${n.s ? `<small>${tx(n.s)}</small>` : ''}</span>
                <span class="no__ok" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg></span>
              </div>`).join('')}
            <span class="fluxo__pacote" id="fluxo-pacote" aria-hidden="true"></span>
          </div></div>
        </div>
        <ol class="fluxo__log mono" id="fluxo-log" aria-live="polite"><li class="vazio">${idioma === 'pt' ? '// clique em Executar fluxo · arraste os nós' : '// click Run workflow · drag the nodes'}</li></ol>
      </div>
    </div>`;

  const palco = raiz.querySelector('.fluxo__palco');
  const rolagem = raiz.querySelector('.fluxo__rolagem');
  const no = (id) => palco.querySelector(`[data-no="${id}"]`);

  // Escala para caber na largura (no celular, rola de lado)
  let escala = 1;
  function ajustar() {
    // Cruzou o limite (girou o aparelho, redimensionou): monta de novo na outra orientação
    if (raiz.clientWidth > 0 && (raiz.clientWidth < LIMITE_VERTICAL) !== vertical) {
      api.destruir();
      montarFluxo(raiz, opcoes);
      return;
    }
    const w = rolagem.clientWidth;
    escala = Math.max(0.62, Math.min(1, w / W));
    palco.style.transform = `scale(${escala})`;
    const tela = palco.parentElement;
    tela.style.width = `${W * escala}px`;
    tela.style.height = `${H * escala}px`;
  }
  const ro = new ResizeObserver(ajustar);
  ro.observe(rolagem);

  // Desenha os fios a partir do tamanho real de cada nó
  function caixa(id) {
    const el = no(id);
    const p = pos[id];
    return { x: p.x, y: p.y, w: el.offsetWidth, h: el.offsetHeight };
  }
  function caminho(a, b) {
    const A = caixa(a), B = caixa(b);
    const dx = B.x - A.x, dy = B.y - A.y;
    let s, e, c1, c2;
    if (Math.abs(dx) >= Math.abs(dy) * 0.9) {
      const dir = Math.sign(dx) || 1;
      s = { x: A.x + (dir * A.w) / 2, y: A.y };
      e = { x: B.x - (dir * B.w) / 2, y: B.y };
      const k = Math.max(40, Math.abs(e.x - s.x) * 0.5);
      c1 = { x: s.x + dir * k, y: s.y };
      c2 = { x: e.x - dir * k, y: e.y };
    } else {
      const dir = Math.sign(dy) || 1;
      s = { x: A.x, y: A.y + (dir * A.h) / 2 };
      e = { x: B.x, y: B.y - (dir * B.h) / 2 };
      const k = Math.max(40, Math.abs(e.y - s.y) * 0.5);
      c1 = { x: s.x, y: s.y + dir * k };
      c2 = { x: e.x, y: e.y - dir * k };
    }
    return { d: `M${s.x} ${s.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${e.x} ${e.y}`, meio: { x: (s.x + e.x) / 2 + (c1.x - s.x) * 0.1, y: (s.y + e.y) / 2 } };
  }
  // Fio de volta ("não: ajustar"): sai por baixo do losango e entra por baixo de Construir
  // (em pé, sai pela direita e sobe pela lateral)
  function caminhoVolta(a, b) {
    const A = caixa(a), B = caixa(b);
    if (vertical) {
      const s = { x: A.x + A.w / 2 - 22, y: A.y }, e = { x: B.x + B.w / 2, y: B.y };
      const lado = Math.min(W - 8, Math.max(s.x, e.x) + 70);
      return { d: `M${s.x} ${s.y} C${lado} ${s.y} ${lado} ${e.y} ${e.x} ${e.y}`, meio: { x: lado - 34, y: (s.y + e.y) / 2 } };
    }
    const s = { x: A.x, y: A.y + A.h / 2 - 22 }, e = { x: B.x, y: B.y + B.h / 2 };
    const fundo = Math.max(s.y, e.y) + 70;
    return { d: `M${s.x} ${s.y} C${s.x} ${fundo} ${e.x} ${fundo} ${e.x} ${e.y}`, meio: { x: (s.x + e.x) / 2, y: fundo - 18 } };
  }
  function desenhar() {
    ARESTAS.forEach(([a, b, , tipo], i) => {
      const c = tipo === 'volta' ? caminhoVolta(a, b) : caminho(a, b);
      palco.querySelector(`#fio-${i}`).setAttribute('d', c.d);
      const rot = palco.querySelector(`#rot-${i}`);
      if (rot) { rot.style.left = `${c.meio.x}px`; rot.style.top = `${c.meio.y}px`; }
    });
  }
  NOS.forEach((n) => {
    const el = no(n.id);
    el.style.left = `${pos[n.id].x}px`;
    el.style.top = `${pos[n.id].y}px`;
  });
  requestAnimationFrame(desenhar);
  document.fonts?.ready.then(desenhar);

  // Arrastar nós
  palco.querySelectorAll('.no').forEach((el) => {
    let ini = null;
    el.addEventListener('pointerdown', (e) => {
      const id = el.dataset.no;
      ini = { mx: e.clientX, my: e.clientY, x: pos[id].x, y: pos[id].y };
      el.setPointerCapture(e.pointerId);
      el.classList.add('arrastando');
    });
    el.addEventListener('pointermove', (e) => {
      if (!ini) return;
      const id = el.dataset.no;
      pos[id].x = Math.max(70, Math.min(W - 70, ini.x + (e.clientX - ini.mx) / escala));
      pos[id].y = Math.max(30, Math.min(H - 30, ini.y + (e.clientY - ini.my) / escala));
      el.style.left = `${pos[id].x}px`;
      el.style.top = `${pos[id].y}px`;
      desenhar();
    });
    const fim = () => { ini = null; el.classList.remove('arrastando'); };
    el.addEventListener('pointerup', fim);
    el.addEventListener('pointercancel', fim);
  });

  // Execução
  const pacote = palco.querySelector('#fluxo-pacote');
  const log = raiz.querySelector('#fluxo-log');
  const indice = (a, b) => ARESTAS.findIndex(([x, y]) => x === a && y === b);
  let rodando = false, inicio = 0;

  function registrar(chave, tipo = '') {
    if (log.querySelector('.vazio')) log.innerHTML = '';
    const s = ((performance.now() - inicio) / 1000).toFixed(1).padStart(4, '0');
    const li = document.createElement('li');
    li.className = tipo;
    li.innerHTML = `<span>${s}s</span>${tx(LOG[chave])}`;
    log.appendChild(li);
    log.scrollTop = log.scrollHeight;
  }
  const estadoNo = (id, cls) => {
    const el = no(id);
    el.classList.remove('ativo', 'feito', 'erro');
    if (cls) el.classList.add(cls);
  };
  function percorrer(a, b, dur = 0.7) {
    const i = indice(a, b);
    const fio = palco.querySelector(`#fio-${i}`);
    const total = fio.getTotalLength();
    fio.classList.add('vivo');
    const o = { t: 0 };
    return new Promise((ok) => {
      gsap.to(o, {
        t: 1, duration: reduzido ? 0.01 : dur, ease: 'power1.inOut',
        onUpdate: () => {
          const p = fio.getPointAtLength(o.t * total);
          pacote.style.transform = `translate(${p.x}px, ${p.y}px)`;
        },
        onComplete: () => { fio.classList.remove('vivo'); fio.classList.add('feito'); ok(); },
      });
    });
  }
  const espera = (s) => new Promise((ok) => setTimeout(ok, reduzido ? 0 : s * 1000));
  async function passo(id, chave, s = 0.35, tipo) {
    estadoNo(id, 'ativo');
    clique?.(900 + Math.random() * 300, 0.05, 0.025);
    if (chave) registrar(chave, tipo);
    await espera(s);
    estadoNo(id, 'feito');
  }

  async function executar() {
    if (rodando) return;
    rodando = true;
    const falha = raiz.querySelector('#fluxo-falha').checked;
    inicio = performance.now();
    log.innerHTML = '';
    palco.querySelectorAll('.no').forEach((el) => el.classList.remove('ativo', 'feito', 'erro'));
    palco.querySelectorAll('.fio').forEach((f) => f.classList.remove('feito', 'vivo'));
    pacote.classList.add('on');
    raiz.querySelector('.fluxo').classList.add('rodando');

    await passo('pedido', 'pedido');
    await percorrer('pedido', 'entender');
    await passo('entender', 'entender', 0.5);
    await percorrer('entender', 'planejar');
    await passo('planejar', 'planejar', 0.5);
    await percorrer('planejar', 'construir');
    await passo('construir', 'construir', 0.7);
    await percorrer('construir', 'testes');
    if (falha) {
      estadoNo('testes', 'erro');
      registrar('testesNao', 'erro');
      await espera(0.5);
      await percorrer('testes', 'construir', 0.9);
      await passo('construir', 'ajuste', 0.6);
      await percorrer('construir', 'testes');
    }
    await passo('testes', 'testesSim', 0.3, 'ok');
    await percorrer('testes', 'entregar');
    await passo('entregar', 'entregar', 0.4, 'ok');
    pacote.classList.remove('on');
    raiz.querySelector('.fluxo').classList.remove('rodando');
    rodando = false;
  }
  raiz.querySelector('#fluxo-exec').addEventListener('click', executar);

  // Roda sozinho na primeira vez que aparece
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && e.intersectionRatio > 0.45) { io.disconnect(); setTimeout(executar, 500); }
  }, { threshold: [0, 0.45] });
  io.observe(raiz);

  const api = { destruir() { ro.disconnect(); io.disconnect(); } };
  raiz._fluxo = api;
  return api;
}
