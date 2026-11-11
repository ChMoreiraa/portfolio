// Abertura "robô acordando": os olhos abrem e piscam enquanto o site carrega; no fim, crescem até
// tomar a tela e se desfazem revelando o site. Só na 1ª visita da sessão (o index.html decide antes da
// primeira pintura, com a classe `sem-carga`). Mínimo ~2 s para dar tempo de ver; no máximo 6 s.
import { gsap } from 'gsap';
import { getIdioma } from './i18n.js';

const MINIMO = 2000, MAXIMO = 6000, OLHOS_ABERTOS = 1350;
const FRASES = {
  pt: ['acordando…', 'calibrando o visor…', 'ligando os sensores…', 'quase lá…'],
  en: ['waking up…', 'calibrating the visor…', 'turning sensors on…', 'almost there…'],
};

export function criarCarga() {
  const html = document.documentElement;
  const el = document.getElementById('carga');
  const nada = { pronto() {}, fim: Promise.resolve(), aberta: Promise.resolve() };
  if (!el) return nada;
  if (html.classList.contains('sem-carga')) { el.remove(); return nada; }

  const idioma = getIdioma();
  const frases = FRASES[idioma] ?? FRASES.pt;
  const num = document.getElementById('carga-num');
  const frase = document.getElementById('carga-frase');
  const barra = document.getElementById('carga-barra');
  document.getElementById('carga-pular').textContent = idioma === 'en' ? 'tap to skip' : 'toque para pular';
  frase.textContent = frases[0];
  scrollTo(0, 0);

  let pronto = false, saindo = false, mostrado = 0, liberar, abriu;
  const fim = new Promise((ok) => (liberar = ok));
  // Enquanto os olhos abrem, o site não começa nada pesado (era aí que a animação engasgava)
  const aberta = new Promise((ok) => (abriu = ok));
  setTimeout(() => abriu(), OLHOS_ABERTOS);
  const inicio = performance.now();

  let antes = inicio;
  function quadro(agora) {
    if (saindo) return;
    const t = agora - inicio;
    const dt = Math.min(1000, agora - antes);
    antes = agora;
    // Enquanto espera, o alvo sobe até ~90% e desacelera; pronto (e passado o mínimo) vai a 100%
    const alvo = (pronto && t >= MINIMO) || t >= MAXIMO ? 100 : 90 * (1 - Math.exp(-t / 1300));
    // Anda pelo tempo, não por quadro (aba em segundo plano roda a 1 quadro/s). Pronto: corre para os 100%
    mostrado += (alvo - mostrado) * (1 - Math.exp(-dt / (alvo === 100 ? 110 : 220)));
    if (alvo === 100 && mostrado > 98.5) mostrado = 100;
    num.textContent = `${String(Math.floor(mostrado)).padStart(3, '0')}%`;
    barra.style.transform = `scaleX(${mostrado / 100})`;
    frase.textContent = frases[Math.min(frases.length - 1, Math.floor((mostrado / 100) * frases.length))];
    if (mostrado >= 100) return sair();
    requestAnimationFrame(quadro);
  }
  requestAnimationFrame(quadro);

  function sair() {
    if (saindo) return;
    saindo = true;
    abriu();
    num.textContent = '100%';
    barra.style.transform = 'scaleX(1)';
    try { sessionStorage.setItem('carga-vista', '1'); } catch {}
    const visor = el.querySelector('.carga__visor');
    const olhos = el.querySelector('.carga__olhos');
    const olho = el.querySelectorAll('.carga__olho');
    // Para as animações de CSS (piscar, olhar) e assume com o GSAP a partir do olho aberto
    olhos.style.animation = 'none';
    olho.forEach((o) => { o.style.animation = 'none'; });
    gsap.set(olho, { scaleY: 1, transformOrigin: '50% 50%' });

    gsap.timeline({ onComplete: () => { el.remove(); html.classList.remove('carregando'); } })
      .to(el.querySelectorAll('.carga__info, .carga__pular, .carga__antena'), { opacity: 0, y: 8, duration: 0.3, ease: 'power2.in' })
      // Uma última piscada, de olhos bem abertos
      .to(olho, { scaleY: 0.08, duration: 0.09, ease: 'power2.in' }, 0.15)
      .to(olho, { scaleY: 1, duration: 0.16, ease: 'power2.out' })
      // O visor some e os olhos crescem até virar a tela
      .to(visor, { backgroundColor: 'rgba(0,0,0,0)', borderColor: 'rgba(0,0,0,0)', boxShadow: '0 0 0 0 rgba(0,0,0,0)', duration: 0.35 }, '<')
      .to(olho, { scale: 46, duration: 0.95, ease: 'expo.in' }, '-=0.05')
      .add(() => liberar(), '-=0.15')
      .to(el, { opacity: 0, duration: 0.7, ease: 'power2.out' });
  }

  // Clicar ou apertar uma tecla pula a espera
  const pular = () => { mostrado = 100; sair(); };
  el.addEventListener('click', pular);
  addEventListener('keydown', pular, { once: true });

  return { pronto() { pronto = true; }, fim, aberta };
}
