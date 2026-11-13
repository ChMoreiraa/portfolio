import './estilo.css';
import './estilo-v3.css';
import './estilo-v4.css';
import './estilo-v5.css';
import './estilo-fluxo.css';
import './estilo-demos.css';
import './estilo-catalogo.css';
import { montarFluxo } from './fluxo.js';
import { criarCarga } from './carga.js';
import { renderTime, ligarTime } from './demos.js';
import { renderBarbu, ligarBarbu, vitrineBarbu, ajustarVitrine } from './barbu.js';
import './estilo-barbu.css';
import './estilo-aparelhos.css';
import './estilo-responsivo.css';
import { notebook, palco, ligarAparelhos } from './aparelhos.js';
import { ligarVooCarreira } from './voo-carreira.js';
import { areas, iconeCatalogo, corDe } from './catalogo.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { perfil } from './config.js';
import { projetos, falasRobo, carreira } from './conteudo.js';
import { renderTeclado, teclaDe, fileiras } from './teclas.js';
import { visual } from './visuais.js';
import { aplicar, registrar, t, getIdioma, setIdioma, aoTrocarIdioma } from './i18n.js';
import { alternarSom, clique, impacto } from './som.js';
import { criarFundo } from './fundo.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const html = document.documentElement;
const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ponteiroFino = matchMedia('(hover: hover) and (pointer: fine)').matches;
const EASE = 'expo.inOut';

let lenis = null;
let robo = null;
let roboCarreira = null; // o robô que voa pela Carreira
let carga = { pronto() {}, fim: Promise.resolve(), aberta: Promise.resolve() };
// Espera um momento ocioso do navegador (com teto) para criar o que é pesado e fica longe do topo
const ocioso = () => new Promise((ok) => ('requestIdleCallback' in window ? requestIdleCallback(() => ok(), { timeout: 1500 }) : setTimeout(ok, 200)));
// Teclado 3D, aurora e planeta só nascem depois da abertura (compilar tudo junto travava os olhos)
const depoisDaAbertura = () => carga.fim.then(ocioso);
let secaoAtual = 'inicio';
let globo = null;
let fundo = null;
let caseCtx = null;
const estado = { vista: 'home', caseId: null, scrollHome: 0, homeIniciada: false, ocupado: false };

const nomeDe = (p) => (getIdioma() === 'en' && p.nomeEn) || p.nome;
const tx = (o) => (typeof o === 'string' ? o : o[getIdioma()] ?? o.pt);

/* ================================================================== */
/* Renderização                                                        */
/* ================================================================== */

// Glifo de cada projeto (traço, 24×24)
const GLIFOS = {
  ombuds: '<path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  agentes: '<circle cx="12" cy="5" r="2.2"/><circle cx="5" cy="17.5" r="2.2"/><circle cx="19" cy="17.5" r="2.2"/><circle cx="12" cy="12.5" r="1.7"/><path d="M12 7.2v3.6M10.6 13.6l-3.8 2.4M13.4 13.6l3.8 2.4"/>',
  libras: '<path d="M8 13V6a1.5 1.5 0 0 1 3 0v5M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6a1.5 1.5 0 0 1 3 0v7c0 4-2.5 7-6 7-2.5 0-4-1.3-5.2-3.4L4.2 13.5a1.5 1.5 0 0 1 2.6-1.5L8 14"/>',
  verocar: '<path d="M4.5 16h15v-3.2l-2.3-4.8H6.8L4.5 12.8z"/><circle cx="8" cy="16.5" r="1.9"/><circle cx="16" cy="16.5" r="1.9"/><path d="M4.5 12.8h15"/>',
  cepflow: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
  barbu: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.1 8.1L20 20M8.1 15.9L20 4"/>',
};
const iconeDe = (nome) => fileiras.flatMap((f) => f.teclas).find((k) => k.nome === nome);
const iconeHtml = (nome, cls = '') => {
  const k = iconeDe(nome);
  if (!k) return '';
  return k.img
    ? `<img class="${cls} ${k.inverte ? 'inverte' : ''}" src="${k.img}" alt="${nome}" title="${nome}" draggable="false" />`
    : `<svg class="${cls}" viewBox="0 0 24 24" role="img" aria-label="${nome}"><title>${nome}</title><path fill="${k.cor === 'currentColor' ? 'currentColor' : k.cor}" d="${k.svg}"/></svg>`;
};
// Posições dos ícones que orbitam a capa (em % da capa)
const ORBITA = [[16, 26], [82, 22], [86, 70], [14, 74], [50, 12], [52, 88]];

function renderGrade() {
  $('#grade').innerHTML = projetos.map((p, i) => `
    <a class="pcard" href="/trabalhos/${p.id}" data-id="${p.id}" style="--h:${p.hue}">
      <div class="pcard__capa">
        <div class="pcard__grade" aria-hidden="true"></div>
        <div class="pcard__luz" aria-hidden="true"></div>
        <div class="pcard__anel" aria-hidden="true"></div>
        ${p.icones.map((n, j) => `<span class="pcard__chip" style="--x:${ORBITA[j][0]}%;--y:${ORBITA[j][1]}%;--d:${j * 0.4}s">${iconeHtml(n)}</span>`).join('')}
        <span class="pcard__glifo"><svg viewBox="0 0 24 24" aria-hidden="true">${GLIFOS[p.id]}</svg></span>
        <span class="pcard__tipo mono">${String(i + 1).padStart(2, '0')} · ${t(`tipo.${p.tipo}`)}</span>
        ${p.vivo ? `<span class="pcard__vivo mono"><b></b>${t('card.vivo')}</span>` : ''}
      </div>
      <div class="pcard__corpo">
        <h3 class="pcard__nome">${nomeDe(p)}</h3>
        <p class="pcard__resumo">${tx(p.resumo)}</p>
        ${p.solucaoCurta ? `<p class="pcard__sol"><b class="mono">${t('card.solucao')}</b>${tx(p.solucaoCurta)}</p>` : ''}
        <div class="pcard__rodape">
          <span class="pcard__icones">${p.icones.map((n) => iconeHtml(n)).join('')}</span>
          <span class="pcard__btn"><span>${t('card.btn')}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
        </div>
      </div>
    </a>`).join('');
  ligarPcards();
}

// Inclinação 3D e borda que acende seguindo o mouse
function ligarPcards() {
  if (!ponteiroFino || reduzido) return;
  $$('.pcard').forEach((el) => {
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3' });
    gsap.set(el, { transformPerspective: 1000 });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
      rx((0.5 - py) * 7);
      ry((px - 0.5) * 9);
    });
    el.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });
}

// Stacks: faixa "Ver tudo por área" que desce abaixo do teclado, com abas por área, e recolhe de novo
function ligarCatalogo() {
  const btn = $('#btn-catalogo'), txt = $('#cat-btn-txt'), painel = $('#cat-painel');
  const chips = $('#cat-chips'), corpo = $('#cat-corpo');
  let area = 'todas', aberto = false;
  const unicos = () => [...new Map(areas.flatMap((a) => a.itens).map((k) => [k.nome, k])).values()];
  // A página muda de altura: Lenis e ScrollTrigger precisam remedir
  const remedir = () => { lenis?.resize(); ScrollTrigger.refresh(); };
  const rotulo = () => { txt.textContent = t(aberto ? 'cat.recolher' : 'cat.botao'); };

  function tile(k) {
    return `<li class="cat__item" style="--cor:${corDe(k)}">
      <span class="cat__ic">${iconeCatalogo(k)}</span>
      <span class="cat__txt"><b>${k.nome}</b>${k.uso ? `<small>${tx(k.uso)}</small>` : ''}</span>
    </li>`;
  }
  function render() {
    $('#cat-total').textContent = `${unicos().length} ${t('cat.tecs')}`;
    chips.innerHTML = [{ id: 'todas', nome: { pt: t('cat.todas'), en: t('cat.todas') }, itens: unicos() }, ...areas]
      .map((a) => `<button type="button" role="tab" class="cat__chip ${area === a.id ? 'on' : ''}" aria-selected="${area === a.id}" data-area="${a.id}">${tx(a.nome)}<span>${a.itens.length}</span></button>`).join('');
    const grupos = area === 'todas' ? areas : areas.filter((a) => a.id === area);
    corpo.innerHTML = grupos.map((a) => `<section class="cat__grupo"><h4 class="mono">${tx(a.nome)} <span>${a.itens.length}</span></h4><ul>${a.itens.map(tile).join('')}</ul></section>`).join('');
    requestAnimationFrame(() => { chips.querySelector('.on')?.scrollIntoView({ inline: 'nearest', block: 'nearest' }); atualizarSetas(); });
  }
  const cascata = (delay = 0) => {
    if (!reduzido) gsap.from($$('.cat__item', corpo), { opacity: 0, y: 16, scale: 0.97, duration: 0.55, stagger: 0.012, ease: 'expo.out', delay });
  };

  function abrir() {
    aberto = true;
    render();
    painel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    btn.classList.add('on');
    rotulo();
    clique(600, 0.08, 0.04);
    if (reduzido) return remedir();
    gsap.fromTo(painel, { height: 0, opacity: 0 }, {
      height: 'auto', opacity: 1, duration: 0.8, ease: 'expo.out',
      onComplete: () => { gsap.set(painel, { clearProps: 'height' }); remedir(); },
    });
    cascata(0.15);
  }
  function fechar() {
    aberto = false;
    btn.setAttribute('aria-expanded', 'false');
    btn.classList.remove('on');
    rotulo();
    clique(420, 0.06, 0.04);
    const fim = () => { painel.hidden = true; gsap.set(painel, { clearProps: 'all' }); remedir(); };
    // Se o botão saiu da tela (recolheu pelo fim da lista), a tela volta até ele junto com a faixa
    const r = btn.getBoundingClientRect();
    if (r.top < 0 || r.bottom > innerHeight) {
      const y = scrollY + r.top - innerHeight * 0.45;
      if (lenis) lenis.scrollTo(y, { duration: reduzido ? 0 : 0.9, force: true });
      else scrollTo({ top: y, behavior: reduzido ? 'auto' : 'smooth' });
    }
    if (reduzido) return fim();
    gsap.to(painel, { height: 0, opacity: 0, duration: 0.6, ease: 'expo.inOut', onComplete: fim });
  }
  // Setas das abas: no celular as categorias rolam de lado; a seta mostra que tem mais e leva até elas
  const setas = $$('[data-rolar]');
  const atualizarSetas = () => {
    const max = chips.scrollWidth - chips.clientWidth;
    setas[0].hidden = chips.scrollLeft <= 4;
    setas[1].hidden = max <= 4 || chips.scrollLeft >= max - 4;
  };
  setas.forEach((s) => s.addEventListener('click', () => {
    chips.scrollBy({ left: Number(s.dataset.rolar) * chips.clientWidth * 0.7, behavior: reduzido ? 'auto' : 'smooth' });
    clique(1000, 0.04, 0.03);
  }));
  chips.addEventListener('scroll', atualizarSetas, { passive: true });
  new ResizeObserver(atualizarSetas).observe(chips);

  rotulo();
  btn.addEventListener('click', () => (aberto ? fechar() : abrir()));
  $('#cat-recolher').addEventListener('click', fechar);
  chips.addEventListener('click', (e) => {
    const b = e.target.closest('[data-area]');
    if (!b || b.dataset.area === area) return;
    area = b.dataset.area;
    clique(1100, 0.04, 0.03);
    // A troca de aba muda a altura da faixa: anima da altura velha para a nova
    const antes = painel.offsetHeight;
    render();
    if (reduzido) return remedir();
    gsap.fromTo(painel, { height: antes }, { height: 'auto', duration: 0.5, ease: 'expo.out', onComplete: () => { gsap.set(painel, { clearProps: 'height' }); remedir(); } });
    cascata();
  });
  aoTrocarIdioma(() => { rotulo(); if (aberto) render(); });
}

// Stacks: teclado 3D (Three.js). Sem WebGL, cai para o teclado em HTML.
let kb3d = null;
async function renderStack() {
  fileiras.forEach((f) => registrar(`fil.${f.id}`, f.nome));
  const teclas = fileiras.flatMap((f) => f.teclas.map((k) => ({ ...k, cat: f.id })));
  const nome = $('#kb-nome'), uso = $('#kb-uso'), cat = $('#kb-cat');
  // Em tela de toque não existe "passar o mouse"
  const toque = matchMedia('(pointer: coarse)').matches;
  const padrao = () => { nome.textContent = t('stacks.inicio'); uso.textContent = t(toque ? 'stacks.inicioUsoToque' : 'stacks.inicioUso'); cat.textContent = ''; };
  padrao();
  const testa = document.createElement('canvas');
  if (!(testa.getContext('webgl2') || testa.getContext('webgl'))) {
    $('#kb3d').hidden = true;
    $('#teclado-area').innerHTML = renderTeclado(getIdioma());
    ligarTeclado();
    return;
  }
  await depoisDaAbertura();
  const { criarTeclado3d } = await import('./teclado3d.js');
  let ultimo = null;
  kb3d = criarTeclado3d({
    canvas: $('#kb3d-canvas'),
    teclas,
    reduzido,
    aoFocar: (k, forte) => {
      if (!k) { if (!forte) padrao(); ultimo = null; cursor.rotulo(null); return; }
      if (k !== ultimo) {
        ultimo = k;
        nome.textContent = k.nome;
        uso.textContent = tx(k.uso);
        cat.textContent = tx(fileiras.find((f) => f.id === k.cat).nome);
        $('#kb3d').style.setProperty('--luz', k.corLuz ?? k.cor);
        gsap.fromTo(nome, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: 'expo.out' });
        clique(1400 + Math.random() * 400, 0.03, forte ? 0.05 : 0.025);
      }
    },
  });
  kb3d?.setTema(html.dataset.theme);
  aoTrocarIdioma(padrao);
  addEventListener('keydown', (e) => {
    if (!kb3d || e.target.closest('input, textarea') || e.key.length !== 1 || estado.vista !== 'home') return;
    const r = $('#kb3d').getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    kb3d.apertarLetra(e.key.toLowerCase());
  });
}

function renderCarreira() {
  carreira.forEach((c, i) => {
    registrar(`car.${i}.titulo`, c.titulo);
    registrar(`car.${i}.lugar`, c.lugar);
    registrar(`car.${i}.desc`, c.desc);
  });
  $('#tempo').innerHTML = `
    <div class="tempo__trilho" aria-hidden="true"><span class="tempo__prog"></span></div>
    <ol class="tempo__lista">
      ${carreira.map((c, i) => `
        <li class="tempo__item ${i % 2 ? 'tempo__item--dir' : ''} ${c.atual ? 'tempo__item--atual' : ''}">
          <span class="tempo__ponto" aria-hidden="true"></span>
          <div class="tempo__card">
            <p class="tempo__ano mono">${c.atual ? `<b data-i18n="carreira.atual"></b>` : ''}${c.ano ? `<span>${c.ano}</span>` : ''}</p>
            <h3 class="tempo__titulo" data-i18n="car.${i}.titulo"></h3>
            <p class="tempo__lugar mono" data-i18n="car.${i}.lugar"></p>
            <p class="tempo__desc" data-i18n="car.${i}.desc"></p>
            <ul class="tempo__tags mono">${c.tags.map((g) => `<li>${g}</li>`).join('')}</ul>
          </div>
        </li>`).join('')}
    </ol>`;
}

/* Teclado: hover afunda a tecla e mostra no visor; letras do teclado físico apertam as teclas. */
let tecladoLigado = false;
function ligarTeclado() {
  const visorNome = $('#visor-nome');
  const visorUso = $('#visor-uso');
  const padrao = () => { visorNome.textContent = t('stacks.visor'); visorUso.textContent = t('stacks.visorUso'); };
  padrao();
  const apertar = (el, ms = 220) => {
    el.classList.add('apertada');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('apertada'), ms);
  };
  const mostrar = (el) => {
    const k = teclaDe(el);
    visorNome.textContent = k.nome;
    visorUso.textContent = tx(k.uso);
    $('#visor').style.setProperty('--luz', k.corLuz ?? k.cor);
  };
  $$('#teclado .tecla:not(.tecla--mod)').forEach((el) => {
    el.addEventListener('pointerenter', () => { el.classList.add('apertada'); mostrar(el); clique(1500 + Math.random() * 300, 0.03, 0.03); });
    el.addEventListener('pointerleave', () => el.classList.remove('apertada'));
    el.addEventListener('focus', () => mostrar(el));
    el.addEventListener('click', () => { apertar(el); mostrar(el); clique(1200, 0.04, 0.04); });
  });
  $('#teclado').addEventListener('pointerleave', padrao);

  if (tecladoLigado) return;
  tecladoLigado = true;
  // Teclado físico: a letra aperta as teclas que começam com ela
  addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea') || e.key.length !== 1 || estado.vista !== 'home') return;
    const r = $('#teclado')?.getBoundingClientRect();
    if (!r || r.bottom < 0 || r.top > innerHeight) return;
    const letra = e.key.toLowerCase();
    const alvos = $$('#teclado .tecla:not(.tecla--mod)').filter((el) => teclaDe(el).nome.toLowerCase().startsWith(letra));
    alvos.forEach((el) => apertar(el, 260));
    if (alvos[0]) { mostrar(alvos[0]); clique(1300, 0.04, 0.04); }
  });
}

// Capa da demo do LibrasFlow em cada aparelho. A câmera só funciona numa tela por vez.
function capaLibras(lado, emUsoNoOutro = false) {
  const pt = getIdioma() === 'pt';
  const outro = lado === 'nb' ? (pt ? 'no celular' : 'on the phone') : (pt ? 'no notebook' : 'on the laptop');
  if (emUsoNoOutro) {
    return `<p>${pt ? `A câmera está ligada ${outro}.` : `The camera is on ${outro}.`}</p>
      <button class="btn" type="button" data-lb-ligar="${lado}">${pt ? 'Usar aqui' : 'Use it here'}</button>`;
  }
  return `<p>${t('embed.texto')}</p>
    <button class="btn btn--cheio" type="button" data-lb-ligar="${lado}">${t('embed.botao')}</button>
    <p class="lb__priv mono">${t('embed.privacidade')}</p>`;
}

function renderCase(p) {
  const i = projetos.indexOf(p);
  const prox = projetos[(i + 1) % projetos.length];
  const links = p.links.length
    ? p.links.map((l) => `<a href="${l.href}" target="_blank" rel="noopener">${tx(l.rotulo)} ↗</a>`).join('')
    : `<span class="case__privado">${t('case.privado')}</span>`;
  const legHero = p.galeria.find((g) => g.tipo === 'visual' && g.id === p.visual);
  const extras = p.galeria.filter((g) => g !== legHero);
  const galeria = extras.map((g) => `
    <figure class="case__fig ${g.claro ? 'case__fig--claro' : ''}" data-reveal>
      <div class="case__fig-in">${g.tipo === 'img' ? `<img src="${g.src}" alt="${tx(g.legenda)}" loading="lazy" />` : visual(g.id, getIdioma())}</div>
      <figcaption class="mono">${tx(g.legenda)}</figcaption>
    </figure>`).join('');
  const demo = p.demo ? `
    <section class="case__bloco" id="testar">
      <h2 class="case__rot mono">${t('demo.titulo')}</h2>
      <form class="demo" id="demo" autocomplete="off" data-reveal>
        <label class="mono" for="demo-cep">${t('demo.rotulo')}</label>
        <div class="demo__linha">
          <input id="demo-cep" inputmode="numeric" maxlength="9" value="12246-000" />
          <button class="btn btn--cheio" type="submit">${t('demo.botao')}</button>
        </div>
        <p class="demo__aviso mono" id="demo-aviso"></p>
        <pre class="demo__saida mono" id="demo-saida"><span class="demo__vazio">// GET https://cepflow.onrender.com/api/cep/{cep}</span></pre>
      </form>
    </section>` : '';
  const pt = getIdioma() === 'pt';
  const urlCurta = (u) => u.replace('https://', '').replace(/\/$/, '');
  // Celular genérico (mesma moldura do CEPFlow): barra com o endereço e a tela
  const celular = (url, tela, abas = '') => `
    <div class="cfx__fone">
      <span class="cfx__ilha"></span>
      <div class="cfx__barra"><div class="cfx__url mono"><b>🔒</b><span data-cel-url>${url}</span></div>${abas}</div>
      <div class="cfx__tela">${tela}</div>
    </div>`;
  const embed = p.embed ? `
    <section class="case__bloco case__bloco--largo" id="testar">
      <h2 class="case__rot mono">${t('embed.titulo')}</h2>
      <div data-reveal>${palco({
        idioma: getIdioma(),
        nb: notebook({ url: urlCurta(p.embed), link: p.embed, linkRotulo: t('embed.aba'), conteudo: `<div class="lb" data-lb="nb">${capaLibras('nb')}</div>` }),
        cel: celular(urlCurta(p.embed), `<div class="lb lb--cel" data-lb="cel">${capaLibras('cel')}</div>`),
      })}</div>
    </section>` : '';
  const sim = p.simulacao ? `
    <section class="case__bloco case__bloco--largo" id="testar">
      <h2 class="case__rot mono">${t('embed.titulo')}</h2>
      <div data-reveal>${renderBarbu(getIdioma())}</div>
    </section>` : '';
  const time = p.timeDemo ? `
    <section class="case__bloco case__bloco--largo" id="testar">
      <h2 class="case__rot mono">${getIdioma() === 'pt' ? 'O time em ação' : 'The team in action'}</h2>
      <div data-reveal>${renderTime(getIdioma())}</div>
    </section>` : '';
  const cep = p.front ? `
    <section class="case__bloco case__bloco--largo" id="testar">
      <h2 class="case__rot mono">${t('embed.titulo')}</h2>
      <div data-reveal>${palco({
        idioma: getIdioma(),
        nb: notebook({
          abas: [{ id: 'app', rotulo: 'App', url: urlCurta(p.front) }, { id: 'swagger', rotulo: 'Swagger', url: urlCurta(p.swagger) }],
          conteudo: `<iframe data-nb-frame src="${p.front}" title="CEPFlow" loading="lazy"></iframe>`,
        }),
        cel: celular(urlCurta(p.front), `<iframe data-cel-frame src="${p.front}" title="CEPFlow no celular" loading="lazy"></iframe>`,
          `<div class="cfx__abas" role="tablist"><button type="button" class="on" data-cel-aba="app">App</button><button type="button" data-cel-aba="swagger">Swagger</button></div>`),
      })}</div>
      <div class="dv-info" data-reveal>
        <div class="bbx__ev"><p class="bbx__ev-t mono">${pt ? 'Front-end real · Netlify' : 'Real front-end · Netlify'}</p><p>${pt ? 'O front do projeto, em HTML, CSS e JS puro, chamando a API de verdade. Digite um CEP no notebook ou no celular.' : 'The project front-end, plain HTML, CSS and JS, calling the real API. Type a postal code on the laptop or the phone.'}</p></div>
        <div class="bbx__ev"><p class="bbx__ev-t mono">${pt ? 'API · FastAPI no Render' : 'API · FastAPI on Render'}</p><p>${pt ? 'Abra a aba Swagger no notebook ou no celular para ver e testar os endpoints na documentação gerada pelo FastAPI.' : 'Open the Swagger tab on the laptop or the phone to see and try the endpoints in the docs generated by FastAPI.'}</p></div>
        <div class="bbx__ev"><p class="bbx__ev-t mono">${pt ? 'Primeira consulta lenta?' : 'Slow first lookup?'}</p><p>${t('demo.acordando')}</p></div>
        <p class="dv-info__links"><a class="btn" href="${p.front}" target="_blank" rel="noopener">App ↗</a> <a class="btn" href="${p.swagger}" target="_blank" rel="noopener">Swagger ↗</a></p>
      </div>
    </section>` : '';
  const testar = p.embed || p.demo || p.simulacao || p.timeDemo || p.front
    ? `<a class="btn btn--cheio case__testar" href="#testar" data-testar><span>${t('case.testar')}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" /></svg></a>`
    : '';

  return `
    <article class="case container">
      <header class="case__cab">
        <a class="case__voltar mono" href="/#trabalhos" data-ancora="trabalhos">← ${t('case.voltar')}</a>
        <p class="case__meta mono">${String(i + 1).padStart(2, '0')} · ${t(`tipo.${p.tipo}`)}</p>
        <h1 class="case__nome"><span class="ln"><span>${nomeDe(p)}</span></span></h1>
        <div class="case__resumo"><p>${tx(p.resumo)}</p>${testar}</div>
        <dl class="case__info">
          <div><dt class="mono">${t('case.papel')}</dt><dd>${tx(p.papel)}</dd></div>
          <div><dt class="mono">${t('case.stack')}</dt><dd class="case__chips">${p.stack.map((s) => `<span>${s}</span>`).join('')}</dd></div>
          <div><dt class="mono">${t('case.links')}</dt><dd class="case__links">${links}</dd></div>
        </dl>
      </header>
      <div class="case__hero" id="case-hero">${p.capaTelas ? vitrineBarbu() : visual(p.visual, getIdioma())}</div>
      ${legHero ? `<p class="case__leg mono">${tx(legHero.legenda)}</p>` : ''}
      <div class="case__corpo">
        ${embed}
        ${demo}
        ${cep}
        ${sim}
        ${time}
        <section class="case__bloco"><h2 class="case__rot mono">${t('case.contexto')}</h2><p class="case__lead" data-reveal>${tx(p.contexto)}</p></section>
        <section class="case__bloco"><h2 class="case__rot mono">${t('case.desafio')}</h2><p class="case__lead" data-reveal>${tx(p.desafio)}</p></section>
        <section class="case__bloco"><h2 class="case__rot mono">${t('case.solucao')}</h2>
          <ol class="case__lista">${tx(p.solucao).map((s, j) => `<li data-reveal><span class="mono">${String(j + 1).padStart(2, '0')}</span><p>${s}</p></li>`).join('')}</ol>
        </section>
        <section class="case__bloco"><h2 class="case__rot mono">${t('case.destaques')}</h2>
          <div class="case__nums">${p.destaques.map((d) => `<div data-reveal><b>${getIdioma() === 'en' && d.nEn ? d.nEn : d.n}</b><span>${tx(d.rot)}</span></div>`).join('')}</div>
        </section>
        ${extras.length ? `<section class="case__bloco case__bloco--largo"><h2 class="case__rot mono">${t('case.galeria')}</h2><div class="case__galeria">${galeria}</div></section>` : ''}
      </div>
      <a class="case__prox" href="/trabalhos/${prox.id}">
        <span class="mono">${t('case.proximo')}</span>
        <span class="case__prox-nome">${nomeDe(prox)} <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
      </a>
    </article>`;
}

/* ================================================================== */
/* Roteador e transições                                               */
/* ================================================================== */

function idDaRota(caminho = location.pathname) {
  const m = caminho.match(/^\/trabalhos\/([\w-]+)\/?$/);
  return m && projetos.some((p) => p.id === m[1]) ? m[1] : null;
}

function mostrarHome(ancora, restaurar = true) {
  caseCtx?.revert();
  caseCtx = null;
  $('#case').hidden = true;
  $('#case').innerHTML = '';
  $('#home').hidden = false;
  estado.vista = 'home';
  fundo?.setSecao(null);
  estado.caseId = null;
  document.title = 'Carlos Henrique Moreira · ' + t('topo.papel');
  irPara(0, true);
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    const alvo = ancora ? $(`#${ancora}`) : null;
    const y = alvo ? alvo.getBoundingClientRect().top + scrollY - 80 : restaurar ? estado.scrollHome : 0;
    irPara(y, true);
    if (!estado.homeIniciada) iniciarHome();
  });
}

function mostrarCase(id) {
  const p = projetos.find((x) => x.id === id);
  if (estado.vista === 'home') estado.scrollHome = scrollY;
  caseCtx?.revert();
  $('#home').hidden = true;
  const el = $('#case');
  el.hidden = false;
  el.innerHTML = renderCase(p);
  estado.vista = 'case';
  fundo?.setSecao('case');
  estado.caseId = id;
  document.title = `${nomeDe(p)} · Carlos Henrique Moreira`;
  irPara(0, true);
  ligarExtrasDoCase(p);
  if (!reduzido) gsap.set($$('[data-reveal]', el), { opacity: 0 });
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    caseCtx = gsap.context(() => animarCase(el), el);
  });
}

// Demo da API, embed da versão pública e o botão "Testar agora"
function ligarExtrasDoCase(p) {
  if (p.demo) ligarDemo();
  if (p.simulacao) ligarBarbu($('#testar'), getIdioma(), clique);
  if (p.capaTelas) ajustarVitrine($('#case-hero'));
  if (p.front || p.embed || p.simulacao) ligarAparelhos($('#testar'), () => { lenis?.resize(); ScrollTrigger.refresh(); });
  if (p.front) {
    // Abas de navegador do notebook: App | Swagger
    const frame = $('[data-nb-frame]'), url = $('#testar [data-nb-url]');
    $$('[data-nb-aba]').forEach((b) => b.addEventListener('click', () => {
      const sw = b.dataset.nbAba === 'swagger';
      $$('[data-nb-aba]').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', String(x === b)); });
      frame.src = sw ? p.swagger : p.front;
      url.textContent = (sw ? p.swagger : p.front).replace('https://', '').replace(/\/$/, '');
      clique(900, 0.05, 0.03);
    }));
    // Abas do celular: App | Swagger, independentes das do notebook
    const frameCel = $('[data-cel-frame]'), urlCel = $('#testar [data-cel-url]');
    $$('[data-cel-aba]').forEach((b) => b.addEventListener('click', () => {
      const sw = b.dataset.celAba === 'swagger';
      $$('[data-cel-aba]').forEach((x) => x.classList.toggle('on', x === b));
      frameCel.src = sw ? p.swagger : p.front;
      urlCel.textContent = (sw ? p.swagger : p.front).replace('https://', '').replace(/\/$/, '');
      clique(900, 0.05, 0.03);
    }));
  }
  if (p.timeDemo) ligarTime($('#testar'), getIdioma(), clique);
  $('[data-testar]')?.addEventListener('click', (e) => {
    e.preventDefault();
    const y = $('#testar').getBoundingClientRect().top + scrollY - 90;
    if (lenis) lenis.scrollTo(y, { duration: 1.2 }); else scrollTo(0, y);
  });
  if (p.embed) {
    // LibrasFlow: liga a demo num aparelho e desliga a do outro (a câmera é uma só)
    const caixa = (lado) => $(`#testar [data-lb="${lado}"]`);
    const telaCel = $('#testar .dv__cel .cfx__tela');
    function ligar(lado) {
      const outro = lado === 'nb' ? 'cel' : 'nb';
      const iframe = `<iframe src="${p.embed}" title="${nomeDe(p)}" allow="camera; fullscreen"></iframe>`;
      if (lado === 'nb') caixa('nb').outerHTML = iframe.replace('<iframe', '<iframe data-lb="nb"');
      else telaCel.innerHTML = iframe.replace('<iframe', '<iframe data-lb="cel"');
      if (outro === 'nb') caixa('nb').outerHTML = `<div class="lb lb--uso" data-lb="nb">${capaLibras('nb', true)}</div>`;
      else telaCel.innerHTML = `<div class="lb lb--cel lb--uso" data-lb="cel">${capaLibras('cel', true)}</div>`;
      clique(700, 0.1, 0.04);
    }
    $('#testar').addEventListener('click', (e) => {
      const b = e.target.closest('[data-lb-ligar]');
      if (b) ligar(b.dataset.lbLigar);
    });
  }
}

function irPara(y, imediato) {
  if (lenis) { lenis.resize(); lenis.scrollTo(y, { immediate: imediato, force: true }); }
  else scrollTo(0, y);
}

function cortina(trocar) {
  const c = $('.cortina');
  if (reduzido) { trocar(); return Promise.resolve(); }
  estado.ocupado = true;
  return new Promise((ok) => {
    gsap.timeline({ onComplete: () => { estado.ocupado = false; ok(); } })
      .set(c, { display: 'block', clipPath: 'inset(100% 0 0 0)' })
      .to(c, { clipPath: 'inset(0% 0 0 0)', duration: 0.65, ease: EASE })
      .add(trocar)
      .to(c, { clipPath: 'inset(0 0 100% 0)', duration: 0.75, ease: EASE }, '+=0.05')
      .set(c, { display: 'none' });
  });
}

// O card cresce até a tela inteira e depois encolhe para o lugar da imagem do case.
function voo(origem, id) {
  if (reduzido || !origem) return cortina(() => mostrarCase(id));
  estado.ocupado = true;
  const r = origem.getBoundingClientRect();
  const clone = origem.cloneNode(true);
  clone.classList.add('voo');
  Object.assign(clone.style, { top: `${r.top}px`, left: `${r.left}px`, width: `${r.width}px`, height: `${r.height}px` });
  document.body.appendChild(clone);
  gsap.set(origem, { opacity: 0 });
  return new Promise((ok) => {
    gsap.timeline({ onComplete: () => { clone.remove(); estado.ocupado = false; ok(); } })
      .to(clone, { top: 0, left: 0, width: innerWidth, height: innerHeight, borderRadius: 0, duration: 0.85, ease: EASE })
      .add(() => {
        mostrarCase(id);
        const alvo = $('#case-hero').getBoundingClientRect();
        gsap.set('#case-hero', { opacity: 0 });
        gsap.to(clone, {
          top: alvo.top, left: alvo.left, width: alvo.width, height: alvo.height, borderRadius: 20,
          duration: 0.85, ease: EASE, delay: 0.05,
          onComplete: () => gsap.set('#case-hero', { opacity: 1 }),
        });
      })
      .to({}, { duration: 0.95 });
  });
}

function navegar(caminho, { origem, ancora } = {}) {
  if (estado.ocupado) return;
  const id = idDaRota(caminho);
  if (caminho !== location.pathname) history.pushState({}, '', caminho + (ancora ? `#${ancora}` : ''));
  clique(520, 0.08, 0.03);
  if (id) {
    if (estado.vista === 'home' && origem) voo(origem, id);
    else cortina(() => mostrarCase(id));
  } else if (estado.vista === 'case') {
    cortina(() => mostrarHome(ancora, !ancora));
  } else if (ancora) {
    const y = $(`#${ancora}`).getBoundingClientRect().top + scrollY - 80;
    if (lenis) { lenis.resize(); lenis.scrollTo(y, { duration: 1.4, force: true }); }
    else scrollTo(0, y);
  }
}

function ligarRotas() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    const href = a.getAttribute('href');
    if (!href || !href.startsWith('/')) return;
    e.preventDefault();
    if (a.dataset.ancora) return navegar('/', { ancora: a.dataset.ancora });
    if (a.hasAttribute('data-home')) return navegar('/', { ancora: estado.vista === 'home' ? null : null });
    navegar(href.split('#')[0]);
  });
  $('#topo-link').addEventListener('click', (e) => { e.preventDefault(); irPara(0, false); });
  addEventListener('popstate', () => {
    const id = idDaRota();
    if (id) cortina(() => mostrarCase(id));
    else cortina(() => mostrarHome(null, true));
  });
}

/* ================================================================== */
/* Animações                                                           */
/* ================================================================== */

function revelarTitulos(raiz) {
  $$('[data-split]', raiz).forEach((el) => {
    const s = SplitText.create(el, { type: 'words', mask: 'words' });
    gsap.from(s.words, {
      yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.04,
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: "play none none none" },
    });
  });
  const rev = $$('[data-reveal]', raiz);
  gsap.set(rev, { opacity: 0, y: 26 });
  ScrollTrigger.batch(rev, {
    start: 'top 90%',
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07 }),
  });
}

function animarHome() {
  if (reduzido) return;
  revelarTitulos($('#home'));

  // Cards de projeto: sobem em cascata, a capa abre de baixo para cima
  ScrollTrigger.batch(".pcard", {
    start: "top 90%",
    onEnter: (els) => {
      gsap.fromTo(els, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.1 });
      gsap.fromTo(els.map((el) => $(".pcard__capa", el)), { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.2, ease: "expo.inOut", stagger: 0.1 });
    },
  });
  gsap.set(".pcard", { opacity: 0 });

  // Linha do processo
  gsap.fromTo(".processo__linha span", { scaleX: 0 }, {
    scaleX: 1, ease: "none",
    scrollTrigger: { trigger: ".processo", start: "top 75%", end: "bottom 60%", scrub: true },
  });

  // Sobre: números contam do zero sempre que a seção aparece (descendo ou subindo) e no hover
  $$(".numero__desenho--grade").forEach((d) => (d.innerHTML = "<i></i>".repeat(40)));
  $$(".numero__desenho--teclas").forEach((d) => (d.innerHTML = "<i></i>".repeat(30)));
  const contar = (card) => {
    const b = $("b", card), alvo = Number(b.dataset.alvo), suf = b.dataset.sufixo || "";
    const pecas = $$(".numero__desenho > *", card);
    const obj = { v: 0 };
    gsap.killTweensOf(card._obj || {});
    card._obj = obj;
    gsap.to(obj, {
      v: alvo, duration: 1.6 + Math.min(alvo, 40) * 0.01, ease: "power2.out",
      onUpdate: () => {
        const n = Math.round(obj.v);
        b.textContent = n + (n === alvo ? suf : "");
        const acesas = Math.round((obj.v / alvo) * pecas.length);
        pecas.forEach((p, i) => p.classList.toggle("on", i < acesas));
      },
    });
  };
  const zerar = (card) => {
    gsap.killTweensOf(card._obj || {});
    $("b", card).textContent = "0";
    $$(".numero__desenho > *", card).forEach((p) => p.classList.remove("on"));
  };
  $$(".numero").forEach((card, i) => {
    ScrollTrigger.create({
      trigger: card, start: "top 92%", end: "bottom 8%",
      onEnter: () => setTimeout(() => contar(card), i * 120),
      onEnterBack: () => setTimeout(() => contar(card), i * 120),
      onLeave: () => zerar(card),
      onLeaveBack: () => zerar(card),
    });
    card.addEventListener("pointerenter", () => { zerar(card); contar(card); });
  });
  // Idiomas: as barras enchem do zero toda vez que a seção aparece (descendo ou subindo)
  const barras = $$(".idioma__barra i");
  const encher = () => gsap.fromTo(barras, { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "expo.out", stagger: 0.15, overwrite: true });
  const esvaziar = () => gsap.set(barras, { scaleX: 0, overwrite: true });
  ScrollTrigger.create({
    trigger: ".idiomas", start: "top 92%", end: "bottom 8%",
    onEnter: encher, onEnterBack: encher, onLeave: esvaziar, onLeaveBack: esvaziar,
  });

  // Foto flutuante: entra e segue o mouse de leve
  gsap.from("#flutua", {
    opacity: 0, scale: 0.85, y: 40, duration: 1.6, ease: "expo.out",
    scrollTrigger: { trigger: "#flutua", start: "top 85%", toggleActions: "play none none none" },
  });
  if (ponteiroFino) {
    const corpo = $("#flutua-corpo");
    const fx = gsap.quickTo(corpo, "x", { duration: 1.2, ease: "power3" });
    const fr = gsap.quickTo(corpo, "rotationY", { duration: 1.2, ease: "power3" });
    $("#sobre").addEventListener("pointermove", (e) => {
      const r = $("#flutua").getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth;
      fx(dx * 30); fr(dx * 14);
      // Os ícones andam no sentido contrário, cada um com sua profundidade
      const dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
      $$('#flutua-icones .ficone').forEach((el) => {
        const z = Number(el.dataset.z) || 1;
        gsap.to(el, { x: -dx * 46 * z, y: -dy * 30 * z, duration: 1.4, ease: 'power3.out', overwrite: 'auto' });
      });
    });
  }

  // Teclado 3D: o quadro aparece com profundidade
  gsap.from("#kb3d", {
    opacity: 0, y: 50, duration: 1.4, ease: "expo.out",
    scrollTrigger: { trigger: "#kb3d", start: "top 85%", toggleActions: "play none none none" },
  });

  // Carreira: a linha desenha com o scroll e cada marco acende quando ela passa
  gsap.fromTo('.tempo__prog', { scaleY: 0 }, {
    scaleY: 1, ease: 'none',
    scrollTrigger: { trigger: '.tempo__lista', start: 'top 65%', end: 'bottom 55%', scrub: 0.6 },
  });
  // No celular a linha do tempo é uma coluna só: o card sobe em vez de vir do lado (vindo do lado, vazava da tela)
  const tempoEstreito = matchMedia('(max-width: 860px)').matches;
  $$('.tempo__item').forEach((item) => {
    const card = $('.tempo__card', item);
    gsap.from(card, {
      opacity: 0, duration: 1.1, ease: 'expo.out',
      ...(tempoEstreito ? { y: 40 } : { x: item.classList.contains('tempo__item--dir') ? 60 : -60 }),
      scrollTrigger: { trigger: item, start: 'top 80%', toggleActions: 'play none none none' },
    });
    ScrollTrigger.create({ trigger: item, start: 'top 60%', toggleClass: { targets: item, className: 'aceso' } });
  });

  // Título do contato
  gsap.from('.contato__titulo .ln > *', {
    yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.1,
    scrollTrigger: { trigger: '.contato__titulo', start: 'top 85%', toggleActions: "play none none none" },
  });
  gsap.from('.contato__globo', {
    opacity: 0, scale: 0.85, duration: 1.6, ease: 'expo.out',
    scrollTrigger: { trigger: '.contato__globo', start: 'top 85%', toggleActions: "play none none none" },
  });
}

function animarCase(el) {
  if (reduzido) return;
  gsap.from($$('.case__cab > *:not(.case__nome)', el), { opacity: 0, y: 18, duration: 1, ease: 'expo.out', stagger: 0.06, delay: 0.5 });
  gsap.from($('.case__nome .ln > span', el), { yPercent: 110, duration: 1.3, ease: 'expo.out', delay: 0.4 });
  revelarTitulos(el);
  gsap.fromTo($('#case-hero > .vis', el), { scale: 1 }, {
    scale: 1.08, ease: 'none',
    scrollTrigger: { trigger: '#case-hero', start: 'top top', end: 'bottom top', scrub: true },
  });
}

function entradaHero() {
  if (reduzido) { robo?.intro(); return; }
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from('.topo__in > *', { opacity: 0, y: -12, duration: 1, stagger: 0.08 }, 0)
    .from('.hero .rotulo', { opacity: 0, y: 12, duration: 1 }, 0.15)
    .from('.hero__titulo .ln > *', { yPercent: 110, duration: 1.4, stagger: 0.1 }, 0.2)
    .from('.hero__sub, .hero__ctas > *', { opacity: 0, y: 18, duration: 1.1, stagger: 0.08 }, 0.55)
    .from('.hero__meta > div', { opacity: 0, y: 14, duration: 1, stagger: 0.08 }, 0.8)
    .add(() => robo?.intro(), 0.3);
}

/* ================================================================== */
/* Robô e planeta                                                      */
/* ================================================================== */

async function ligarRobo() {
  const canvas = $('#robo');
  const { criarRobo } = await import('./robo.js');
  let indice = 0;
  const balao = $('#balao');
  let timer;
  function dizer(txt, ms = 2600) {
    clearTimeout(timer);
    balao.textContent = '';
    balao.classList.add('on');
    [...txt].forEach((ch, i) => setTimeout(() => (balao.textContent += ch), i * 22));
    timer = setTimeout(() => balao.classList.remove('on'), ms + txt.length * 22);
  }
  robo = criarRobo({
    canvas,
    reduzido,
    aoPassar: (sim) => cursor.rotulo(sim ? t('cursor.robo') : null),
    aoClicar: () => {
      const falas = falasRobo[getIdioma()];
      const fala = falas[indice % falas.length];
      // A dica do "ryoiki" fica mais tempo no balão, para dar tempo de digitar olhando
      dizer(fala, fala.includes('ryoiki') ? 9000 : 2600);
      indice++;
      clique(880, 0.1, 0.04);
    },
  });
  if (!robo) { html.classList.add('sem-webgl'); return; }
  // O balão acompanha a cabeça
  gsap.ticker.add(() => {
    if (!robo.balao || estado.vista !== 'home') return;
    balao.style.transform = `translate3d(${robo.balao.x}px, ${robo.balao.y}px, 0) translate(-50%, -100%)`;
  });
  setTimeout(() => { if (estado.vista === 'home') dizer(falasRobo[getIdioma()][0], 2400); indice = 1; }, reduzido ? 300 : 2600);
}

async function ligarGlobo() {
  const canvas = $('#globo');
  const { criarGlobo } = await import('./globo.js');
  globo = criarGlobo({ canvas, reduzido, tema: html.dataset.theme });
  if (!globo) return;
  const rot = $('#globo-base');
  globo.aoQuadro = (b) => {
    rot.style.transform = `translate3d(${b.x}px, ${b.y}px, 0)`;
    rot.classList.toggle('escondido', !b.visivel);
  };
  canvas.addEventListener('pointerenter', () => cursor.rotulo(t('cursor.globo')));
  canvas.addEventListener('pointerleave', () => cursor.rotulo(null));
}

/* ================================================================== */
/* Cursor                                                              */
/* ================================================================== */

const cursor = { rotulo: () => {} };
function ligarCursor() {
  if (!ponteiroFino || reduzido) return;
  html.classList.add('cursor-on');
  const el = $('.cursor');
  const rot = $('.cursor__rotulo');
  const x = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3' });
  const y = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3' });
  addEventListener('pointermove', (e) => { el.classList.add('vivo'); x(e.clientX); y(e.clientY); });
  document.addEventListener('pointerleave', () => el.classList.remove('vivo'));
  let fixo = null;
  const mostrar = (txt) => { rot.textContent = txt || ''; el.classList.toggle('com-rotulo', !!txt); };
  cursor.rotulo = (txt) => { fixo = txt; mostrar(txt); };
  document.addEventListener('pointerover', (e) => {
    const a = e.target.closest('[data-cursor]');
    if (a) mostrar(t(a.dataset.cursor));
    el.classList.toggle('sobre-link', !!e.target.closest('a, button'));
  });
  document.addEventListener('pointerout', (e) => {
    const a = e.target.closest('[data-cursor]');
    if (a && !a.contains(e.relatedTarget)) mostrar(fixo);
  });
}

/* ================================================================== */
/* Tema, idioma, som                                                   */
/* ================================================================== */

function definirTema(novo) {
  html.dataset.theme = novo;
  try { localStorage.setItem('tema', novo); } catch {}
  $('meta[name="theme-color"]').setAttribute('content', novo === 'dark' ? '#0E0D13' : '#F4F2ED');
  globo?.setTema(novo);
  kb3d?.setTema(novo);
  fundo?.setTema(novo);
}

// Menu de tela cheia (celular e tablet): o topo fica por cima, com idioma e tema à mão
function ligarMenu() {
  const btn = $('#btn-menu'), menu = $('#menu-m');
  let aberto = false;
  function alternar(abrir = !aberto) {
    if (abrir === aberto) return;
    aberto = abrir;
    html.classList.toggle('menu-aberto', aberto);
    btn.setAttribute('aria-expanded', String(aberto));
    menu.setAttribute('aria-hidden', String(!aberto));
    if (aberto) {
      lenis?.stop();
      clique(700, 0.05, 0.03);
      if (!reduzido) gsap.fromTo($$('.menu-m__nav a, .menu-m__pe', menu), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: 'expo.out', delay: 0.12 });
    } else {
      lenis?.start();
    }
  }
  btn.addEventListener('click', () => alternar());
  // O link navega pelo roteador global (data-ancora); aqui só fecha o menu
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) alternar(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && aberto) alternar(false); });
  // Se a tela crescer até o menu do topo voltar, fecha o de tela cheia
  matchMedia('(min-width: 861px)').addEventListener('change', (e) => { if (e.matches) alternar(false); });
}

function ligarControles() {
  const btnTema = $('#btn-tema');
  btnTema.addEventListener('click', () => {
    clique(660, 0.06, 0.03);
    const novo = html.dataset.theme === 'dark' ? 'light' : 'dark';
    if (!document.startViewTransition || reduzido) return definirTema(novo);
    const r = btnTema.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const raio = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
    document.startViewTransition(() => definirTema(novo)).ready.then(() => {
      html.animate({ clipPath: [`circle(0 at ${cx}px ${cy}px)`, `circle(${raio}px at ${cx}px ${cy}px)`] },
        { duration: 800, easing: 'cubic-bezier(.76,0,.24,1)', pseudoElement: '::view-transition-new(root)' });
    });
  });

  const btnLang = $('#btn-lang');
  const marcar = () => $$('[data-l]', btnLang).forEach((s) => s.classList.toggle('on', s.dataset.l === getIdioma()));
  marcar();
  btnLang.addEventListener('click', () => {
    clique(520, 0.06, 0.03);
    gsap.to('main, .rodape', {
      opacity: 0, duration: 0.2, ease: 'power2.in',
      onComplete: () => {
        setIdioma(getIdioma() === 'pt' ? 'en' : 'pt');
        marcar();
        gsap.to('main, .rodape', { opacity: 1, duration: 0.4, ease: 'power2.out' });
        ScrollTrigger.refresh();
      },
    });
  });
  aoTrocarIdioma(() => {
    renderGrade();
    montarFluxo($('#fluxo-raiz'), { idioma: getIdioma(), reduzido, clique, aoMudarAltura: () => { lenis?.resize(); ScrollTrigger.refresh(); } });
    $$('#grade .card').forEach((el) => gsap.set(el, { clearProps: 'all' }));
    $$('#teclado .tecla:not(.tecla--mod)').forEach((el) => {
      const k = teclaDe(el);
      el.setAttribute('aria-label', `${k.nome}: ${tx(k.uso)}`);
    });
    // O visor só existe no teclado HTML de reserva (sem WebGL)
    const vNome = $('#visor-nome'), vUso = $('#visor-uso');
    if (vNome) vNome.textContent = t('stacks.visor');
    if (vUso) vUso.textContent = t('stacks.visorUso');
    atualizarWhats();
    if (estado.vista === 'case') {
      const el = $('#case');
      caseCtx?.revert();
      const p = projetos.find((x) => x.id === estado.caseId);
      el.innerHTML = renderCase(p);
      gsap.set($$('[data-reveal]', el), { clearProps: 'all' });
      ligarExtrasDoCase(p);
    }
  });

  $('#btn-som').addEventListener('click', (e) => {
    const on = alternarSom();
    e.currentTarget.classList.toggle('on', on);
    e.currentTarget.setAttribute('aria-pressed', String(on));
  });
}

/* ================================================================== */
/* Perfil, contato e demo                                              */
/* ================================================================== */

function atualizarWhats() {
  const btn = $('#btn-whats');
  const num = (perfil.whatsapp || '').replace(/\D/g, '');
  $('#li-whats').hidden = !num;
  if (!num) return;
  // 55 + DDD + número → (12) 98155-2453
  const local = num.replace(/^55/, '');
  $('#whats-txt').textContent = local.length === 11 ? `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}` : local;
  const msg = getIdioma() === 'pt' ? 'Olá, Carlos! Vi seu portfólio e quero conversar.' : 'Hi Carlos! I saw your portfolio and would like to talk.';
  btn.href = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
}

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  gsap.killTweensOf(el);
  gsap.timeline()
    .fromTo(el, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' })
    .to(el, { y: 24, opacity: 0, duration: 0.4, ease: 'power2.in' }, 2.2);
}

// Ícones "jogados" em volta da foto do Sobre: posição (%), giro, profundidade e ritmo de cada um
const ICONES_FOTO = [
  { nome: 'Python', x: 4, y: 20, r: -10, z: 1.2, d: 5.6 },
  { nome: 'Claude', x: 90, y: 13, r: 9, z: 0.8, d: 6.4 },
  { nome: 'Java', x: -3, y: 55, r: 7, z: 0.9, d: 7.1 },
  { nome: 'PostgreSQL', x: 95, y: 47, r: -8, z: 1.3, d: 5.9 },
  { nome: 'GitHub', x: 9, y: 83, r: 12, z: 1, d: 6.8 },
  { nome: 'Node.js', x: 86, y: 79, r: -6, z: 1.1, d: 6.1 },
];
function montarIconesFoto() {
  const todos = areas.flatMap((a) => a.itens);
  $('#flutua-icones').innerHTML = ICONES_FOTO.map((c, i) => {
    const k = todos.find((x) => x.nome === c.nome);
    if (!k) return '';
    return `<span class="ficone" style="--x:${c.x}%;--y:${c.y}%;--r:${c.r}deg;--d:${c.d}s;--atraso:${-i * 0.9}s;--cor:${corDe(k)}" data-z="${c.z}">
      <span class="ficone__in">${iconeCatalogo(k)}</span><small>${k.nome}</small>
    </span>`;
  }).join('');
}

function ligarPerfil() {
  $('#email-txt').textContent = perfil.email;
  $('#btn-linkedin').href = perfil.linkedin;
  $('#btn-github').href = perfil.github;
  atualizarWhats();
  const foto = $('#foto');
  foto.addEventListener('load', () => $('#flutua').classList.remove('sem-foto'));
  montarIconesFoto();
  if (perfil.foto) foto.src = perfil.foto;
  $('#btn-email').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(perfil.email);
      toast(`✓ ${t('contato.copiado')}`);
      clique(1320, 0.08, 0.04);
    } catch {
      location.href = `mailto:${perfil.email}`;
    }
  });
}

// Formulário de contato. O envio depende de perfil.formulario.modo (ver config.js).
function ligarForm() {
  const form = $('#form-contato');
  const status = $('#form-status');
  const btn = $('.form__enviar', form);
  const txt = $('.form__txt', btn);
  const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function validar() {
    let ok = true;
    $$('input[required], textarea[required]', form).forEach((campo) => {
      const erro = campo.parentElement.querySelector('.campo__erro');
      let msg = '';
      if (!campo.value.trim()) msg = t('form.obrigatorio');
      else if (campo.type === 'email' && !reEmail.test(campo.value.trim())) msg = t('form.emailInvalido');
      erro.textContent = msg;
      campo.parentElement.classList.toggle('invalido', !!msg);
      if (msg && ok) { campo.focus(); ok = false; }
    });
    return ok;
  }
  form.addEventListener('input', (e) => {
    const c = e.target.closest('.campo');
    if (c?.classList.contains('invalido')) { c.classList.remove('invalido'); c.querySelector('.campo__erro').textContent = ''; }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    status.className = 'form__status mono';
    if (!validar()) return;
    const dados = new FormData(form);
    if (dados.get('bot-field')) return;
    const modo = perfil.formulario?.modo ?? 'mailto';
    const assunto = $('input[name="assunto"]:checked + span', form)?.textContent ?? '';

    if (modo === 'mailto') {
      const tel = String(dados.get('telefone') || '').trim();
      const corpo = `${dados.get('mensagem')}\n\n— ${dados.get('nome')} (${dados.get('email')}${tel ? ` · ${tel}` : ''})`;
      location.href = `mailto:${perfil.email}?subject=${encodeURIComponent(`[Portfólio] ${assunto} · ${dados.get('nome')}`)}&body=${encodeURIComponent(corpo)}`;
      status.textContent = t('form.okMail');
      status.classList.add('ok');
      return;
    }

    form.classList.add('enviando');
    txt.textContent = t('form.enviando');
    try {
      let r;
      if (modo === 'netlify') {
        r = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(dados).toString() });
      } else {
        r = await fetch(`https://formspree.io/f/${perfil.formulario.formspreeId}`, { method: 'POST', headers: { Accept: 'application/json' }, body: dados });
      }
      if (!r.ok) throw new Error(String(r.status));
      form.reset();
      status.textContent = t('form.ok');
      status.classList.add('ok');
      clique(1320, 0.12, 0.05);
    } catch {
      status.textContent = t('form.erro');
      status.classList.add('erro');
    } finally {
      form.classList.remove('enviando');
      txt.textContent = t('form.enviar');
    }
  });
}

function realcarJson(obj) {
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
  return esc(JSON.stringify(obj, null, 2))
    .replace(/"([^"]+)":/g, '<i>"$1"</i>:')
    .replace(/: "([^"]*)"/g, ': <s>"$1"</s>');
}

function ligarDemo() {
  const form = $('#demo');
  const input = $('#demo-cep');
  const saida = $('#demo-saida');
  const aviso = $('#demo-aviso');
  input.addEventListener('input', () => {
    const d = input.value.replace(/\D/g, '').slice(0, 8);
    input.value = d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cep = input.value.replace(/\D/g, '');
    const inicio = performance.now();
    const lento = setTimeout(() => (aviso.textContent = t('demo.acordando')), 2500);
    form.classList.add('carregando');
    saida.innerHTML = `<span class="demo__vazio">GET /api/cep/${cep || '…'}</span>`;
    try {
      const ctrl = new AbortController();
      const limite = setTimeout(() => ctrl.abort(), 45000);
      const r = await fetch(`https://cepflow.onrender.com/api/cep/${encodeURIComponent(cep || '0')}`, { signal: ctrl.signal });
      clearTimeout(limite);
      const corpo = await r.json().catch(() => ({}));
      const ms = Math.round(performance.now() - inicio);
      saida.innerHTML = `<span class="demo__status ${r.ok ? 'ok' : 'erro'}">${r.status} · ${ms} ms</span>\n${realcarJson(corpo)}`;
      aviso.textContent = '';
    } catch {
      aviso.textContent = t('demo.erro');
      saida.innerHTML = '<span class="demo__vazio">—</span>';
    } finally {
      clearTimeout(lento);
      form.classList.remove('carregando');
    }
  });
}

/* ================================================================== */
/* Expansão de domínio                                                 */
/* ================================================================== */

function ligarDominio() {
  const camada = $('#dominio');
  let ativo = false, buffer = '';
  // Depois da expansão, a página inteira fica laranja por 15 s (o tema continua o mesmo)
  const DURACAO = 15;
  const aviso = document.createElement('div');
  aviso.className = 'dominio-aviso mono';
  aviso.setAttribute('aria-hidden', 'true');
  document.body.appendChild(aviso);
  let timerLaranja;
  function laranja() {
    clearInterval(timerLaranja);
    html.classList.add('dominio-laranja');
    fundo?.setDominio(true);
    kb3d?.setDominio?.(true);
    globo?.setDominio?.(true);
    let resta = DURACAO;
    const pinta = () => (aviso.innerHTML = `領域展開 · ${t('dominio.volta')} <b>${resta}s</b>`);
    pinta();
    timerLaranja = setInterval(() => {
      resta--;
      pinta();
      if (resta > 0) return;
      clearInterval(timerLaranja);
      html.classList.remove('dominio-laranja');
      fundo?.setDominio(false);
      kb3d?.setDominio?.(false);
      globo?.setDominio?.(false);
      robo?.setDominio(false);
      roboCarreira?.setDominio(false);
    }, 1000);
  }
  function expandir() {
    if (ativo) return;
    ativo = true;
    impacto();
    robo?.setDominio(true);
    roboCarreira?.setDominio(true);
    camada.classList.add('on');
    setTimeout(laranja, 3000);
    const k = $('.dominio__kanji');
    if (!k.querySelector('span')) k.innerHTML = [...k.textContent].map((c) => `<span>${c}</span>`).join('');
    gsap.timeline({ onComplete: () => { camada.classList.remove('on'); ativo = false; } })
      .fromTo(camada, { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', duration: 1.1, ease: EASE })
      .fromTo('.dominio__kanji span', { opacity: 0, scale: 1.8, filter: 'blur(12px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.6, stagger: 0.12, ease: 'expo.out' }, 0.5)
      .fromTo('.dominio__legenda', { opacity: 0, letterSpacing: '1em' }, { opacity: 1, letterSpacing: '0.4em', duration: 1, ease: 'expo.out' }, 1)
      .fromTo('.dominio__veredito', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' }, 1.3)
      .to(camada, { clipPath: 'circle(0% at 50% 50%)', duration: 0.9, ease: EASE }, 3.6);
  }
  addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea') || e.key.length !== 1) return;
    buffer = (buffer + e.key.toLowerCase()).slice(-8);
    if (buffer.endsWith('ryoiki')) { buffer = ''; expandir(); }
  });
  $('.rodape__egg').addEventListener('click', expandir);
  console.log('%c領域展開%c\nOlá, dev. Vite + Three.js + GSAP, sem framework. Digite "ryoiki" na página. — Carlos',
    'font: italic 32px "Instrument Serif", serif; color: #A78BFA', 'font: 12px monospace');
}

/* ================================================================== */
/* Início                                                              */
/* ================================================================== */

// A home só monta gatilhos, robô e planeta quando aparece pela primeira vez.
function iniciarHome() {
  estado.homeIniciada = true;
  animarHome();
  roboCarreira = ligarVooCarreira({ raiz: $('#tempo'), gsap, ScrollTrigger, reduzido, t });
  // Com o robô pronto, a abertura pode terminar; a entrada do topo começa quando os olhos revelam o site
  // O robô nasce com os olhos já abertos; o planeta, depois que o site aparece
  carga.aberta.then(ligarRobo).then(() => { carga.pronto(); return carga.fim; }).then(entradaHero);
  depoisDaAbertura().then(ligarGlobo);
}

function iniciar() {
  carga = criarCarga();
  if (!reduzido) {
    lenis = new Lenis({ duration: 1.1, easing: (x) => Math.min(1, 1.001 - Math.pow(2, -10 * x)) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((tempo) => lenis.raf(tempo * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  renderGrade();
  renderStack();
  renderCarreira();
  montarFluxo($('#fluxo-raiz'), { idioma: getIdioma(), reduzido, clique, aoMudarAltura: () => { lenis?.resize(); ScrollTrigger.refresh(); } });
  aplicar();
  ligarPerfil();
  ligarForm();
  ligarCatalogo();
  ligarControles();
  ligarMenu();
  ligarCursor();
  ligarRotas();
  ligarDominio();

  // Fundo em aurora: some no Home e no Stacks, muda de cor nas outras seções
  depoisDaAbertura().then(() => {
    fundo = criarFundo({ reduzido });
    if (estado.vista === 'home') fundo?.setSecao(secaoAtual);
  });
  ["inicio", "sobre", "stacks", "trabalhos", "processo", "carreira", "contato"].forEach((id) => {
    const el = id === "inicio" ? $(".hero") : $("#" + id);
    ScrollTrigger.create({
      trigger: el, start: "top 55%", end: "bottom 55%",
      onToggle: (s) => { if (s.isActive) secaoAtual = id; if (s.isActive && estado.vista === "home") fundo?.setSecao(id); },
    });
  });

  // Topo ganha fundo ao rolar
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => $('.topo').classList.toggle('rolou', s.scroll() > 40) });

  document.fonts.ready.then(() => {
    const id = idDaRota();
    if (id) { mostrarCase(id); carga.pronto(); }
    else {
      $('#case').hidden = true;
      iniciarHome();
      // Link com âncora: espera a página terminar de carregar (o ScrollTrigger recalcula no load).
      const ancora = location.hash.slice(1);
      if (ancora && $(`#${CSS.escape(ancora)}`)) {
        const ir = () => setTimeout(() => navegar('/', { ancora }), 250);
        document.readyState === 'complete' ? ir() : addEventListener('load', ir, { once: true });
      }
    }
  });
}

iniciar();
