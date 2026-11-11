import './estilo.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { perfil } from './config.js';
import { projetos, falasRobo, stack } from './conteudo.js';
import { visual } from './visuais.js';
import { aplicar, t, getIdioma, setIdioma, aoTrocarIdioma } from './i18n.js';
import { alternarSom, clique, impacto } from './som.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const html = document.documentElement;
const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ponteiroFino = matchMedia('(hover: hover) and (pointer: fine)').matches;
const EASE = 'expo.inOut';

let lenis = null;
let robo = null;
let globo = null;
let caseCtx = null;
const estado = { vista: 'home', caseId: null, scrollHome: 0, homeIniciada: false, ocupado: false };

const nomeDe = (p) => (getIdioma() === 'en' && p.nomeEn) || p.nome;
const tx = (o) => (typeof o === 'string' ? o : o[getIdioma()] ?? o.pt);

/* ================================================================== */
/* Renderização                                                        */
/* ================================================================== */

function renderGrade() {
  $('#grade').innerHTML = projetos.map((p, i) => `
    <a class="card" href="/trabalhos/${p.id}" data-id="${p.id}" style="--span:${p.span}" data-cursor="cursor.case">
      <div class="card__vis">${visual(p.visual, getIdioma())}</div>
      <div class="card__meta">
        <p class="card__linha mono"><span>${String(i + 1).padStart(2, '0')}</span><span>${t(`tipo.${p.tipo}`)}</span></p>
        <h3 class="card__nome">${nomeDe(p)}</h3>
        <p class="card__resumo">${tx(p.resumo)}</p>
        <ul class="card__tags mono">${p.stack.slice(0, 4).map((s) => `<li>${s}</li>`).join('')}</ul>
      </div>
    </a>`).join('');
}

function renderStack() {
  $('#stack').innerHTML = Object.entries(stack).map(([k, itens]) => `
    <div class="stack__col" data-reveal>
      <p class="mono">${t(`stack.${k}`)}</p>
      <ul>${itens.map((i) => `<li>${i}</li>`).join('')}</ul>
    </div>`).join('');
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
    <section class="case__bloco">
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

  return `
    <article class="case container">
      <header class="case__cab">
        <a class="case__voltar mono" href="/#trabalhos" data-ancora="trabalhos">← ${t('case.voltar')}</a>
        <p class="case__meta mono">${String(i + 1).padStart(2, '0')} · ${t(`tipo.${p.tipo}`)}</p>
        <h1 class="case__nome"><span class="ln"><span>${nomeDe(p)}</span></span></h1>
        <p class="case__resumo">${tx(p.resumo)}</p>
        <dl class="case__info">
          <div><dt class="mono">${t('case.papel')}</dt><dd>${tx(p.papel)}</dd></div>
          <div><dt class="mono">${t('case.stack')}</dt><dd class="case__chips">${p.stack.map((s) => `<span>${s}</span>`).join('')}</dd></div>
          <div><dt class="mono">${t('case.links')}</dt><dd class="case__links">${links}</dd></div>
        </dl>
      </header>
      <div class="case__hero" id="case-hero">${visual(p.visual, getIdioma())}</div>
      ${legHero ? `<p class="case__leg mono">${tx(legHero.legenda)}</p>` : ''}
      <div class="case__corpo">
        <section class="case__bloco"><h2 class="case__rot mono">${t('case.contexto')}</h2><p class="case__lead" data-reveal>${tx(p.contexto)}</p></section>
        <section class="case__bloco"><h2 class="case__rot mono">${t('case.desafio')}</h2><p class="case__lead" data-reveal>${tx(p.desafio)}</p></section>
        <section class="case__bloco"><h2 class="case__rot mono">${t('case.solucao')}</h2>
          <ol class="case__lista">${tx(p.solucao).map((s, j) => `<li data-reveal><span class="mono">${String(j + 1).padStart(2, '0')}</span><p>${s}</p></li>`).join('')}</ol>
        </section>
        ${demo}
        <section class="case__bloco"><h2 class="case__rot mono">${t('case.destaques')}</h2>
          <div class="case__nums">${p.destaques.map((d) => `<div data-reveal><b>${getIdioma() === 'en' && d.nEn ? d.nEn : d.n}</b><span>${tx(d.rot)}</span></div>`).join('')}</div>
        </section>
        ${extras.length ? `<section class="case__bloco case__bloco--largo"><h2 class="case__rot mono">${t('case.galeria')}</h2><div class="case__galeria">${galeria}</div></section>` : ''}
      </div>
      <a class="case__prox" href="/trabalhos/${prox.id}" data-cursor="cursor.case">
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
  estado.caseId = id;
  document.title = `${nomeDe(p)} · Carlos Henrique Moreira`;
  irPara(0, true);
  if (p.demo) ligarDemo();
  if (!reduzido) gsap.set($$('[data-reveal]', el), { opacity: 0 });
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    caseCtx = gsap.context(() => animarCase(el), el);
  });
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
    const vis = a.classList.contains('card') ? $('.card__vis', a) : null;
    navegar(href.split('#')[0], { origem: vis });
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

  // Cards: a imagem abre de baixo para cima
  $$('.card').forEach((card) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: "play none none none" } });
    tl.from($('.card__vis', card), { clipPath: 'inset(100% 0 0 0 round 18px)', duration: 1.3, ease: 'expo.inOut' })
      .from($('.card__vis > .vis', card), { scale: 1.25, duration: 1.6, ease: 'expo.out' }, 0.2)
      .from($$('.card__meta > *', card), { opacity: 0, y: 16, duration: 0.9, stagger: 0.06, ease: 'expo.out' }, 0.5);
  });

  // Linha do processo
  gsap.fromTo('.processo__linha span', { scaleX: 0 }, {
    scaleX: 1, ease: 'none',
    scrollTrigger: { trigger: '.processo', start: 'top 75%', end: 'bottom 60%', scrub: true },
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
      dizer(falas[indice % falas.length]);
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
    renderStack();
    $$('#grade .card, #stack [data-reveal]').forEach((el) => gsap.set(el, { clearProps: 'all' }));
    atualizarWhats();
    if (estado.vista === 'case') {
      const el = $('#case');
      caseCtx?.revert();
      el.innerHTML = renderCase(projetos.find((p) => p.id === estado.caseId));
      gsap.set($$('[data-reveal]', el), { clearProps: 'all' });
      if (projetos.find((p) => p.id === estado.caseId).demo) ligarDemo();
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
  btn.hidden = !num;
  if (!num) return;
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

function ligarPerfil() {
  $('#email-txt').textContent = perfil.email;
  $('#btn-linkedin').href = perfil.linkedin;
  $('#btn-github').href = perfil.github;
  atualizarWhats();
  const foto = $('#foto');
  foto.addEventListener('load', () => $('#moldura').classList.remove('sem-foto'));
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
  function expandir() {
    if (ativo) return;
    ativo = true;
    impacto();
    robo?.setDominio(true);
    camada.classList.add('on');
    const k = $('.dominio__kanji');
    if (!k.querySelector('span')) k.innerHTML = [...k.textContent].map((c) => `<span>${c}</span>`).join('');
    gsap.timeline({ onComplete: () => { camada.classList.remove('on'); ativo = false; } })
      .fromTo(camada, { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', duration: 1.1, ease: EASE })
      .fromTo('.dominio__kanji span', { opacity: 0, scale: 1.8, filter: 'blur(12px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.6, stagger: 0.12, ease: 'expo.out' }, 0.5)
      .fromTo('.dominio__legenda', { opacity: 0, letterSpacing: '1em' }, { opacity: 1, letterSpacing: '0.4em', duration: 1, ease: 'expo.out' }, 1)
      .fromTo('.dominio__veredito', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' }, 1.3)
      .to(camada, { clipPath: 'circle(0% at 50% 50%)', duration: 0.9, ease: EASE }, 3.6)
      .add(() => robo?.setDominio(false), 4.2);
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
  ligarRobo().then(entradaHero);
  ligarGlobo();
}

function iniciar() {
  if (!reduzido) {
    lenis = new Lenis({ duration: 1.1, easing: (x) => Math.min(1, 1.001 - Math.pow(2, -10 * x)) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((tempo) => lenis.raf(tempo * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  renderGrade();
  renderStack();
  aplicar();
  ligarPerfil();
  ligarControles();
  ligarCursor();
  ligarRotas();
  ligarDominio();

  // Topo ganha fundo ao rolar
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => $('.topo').classList.toggle('rolou', s.scroll() > 40) });

  document.fonts.ready.then(() => {
    const id = idDaRota();
    if (id) mostrarCase(id);
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
