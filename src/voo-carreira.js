// Robô da Carreira: desce com o scroll voando de marco em marco por uma curva suave (spline), parando ao lado de
// cada card e passando por trás quando o caminho cruza um. Assim que o card "Atual" aparece, ele sai do scroll e
// faz sozinho a "volta no box" (passa por trás do card e sai por cima) e pousa: pirueta, aceno e "Hoje estou aqui!".
// Na subida, ao voltar ao 1º marco: mortal para a frente, cabeça inclinada e "Foi aqui que tudo começou".
// É uma segunda cena do robô 3D (robo.js), criada só quando a Carreira está chegando perto.

export function ligarVooCarreira({ raiz, gsap, ScrollTrigger, reduzido, t }) {
  const lista = raiz.querySelector('.tempo__lista');
  const itens = [...raiz.querySelectorAll('.tempo__item')];
  if (!lista || itens.length < 2) return null;
  raiz.insertAdjacentHTML('beforeend', `
    <div class="tempo__robo" aria-hidden="true">
      <p class="tempo__balao mono"></p>
      <div class="tempo__robo-in"><canvas class="tempo__robo-canvas"></canvas></div>
    </div>`);
  const caixa = raiz.querySelector('.tempo__robo');
  const dentro = caixa.querySelector('.tempo__robo-in');
  const balao = caixa.querySelector('.tempo__balao');
  let robo = null;
  let dominio = false; // Expansão de Domínio ligada (o robô fica dourado)

  // ---------- Medidas (posição de layout: ignora o deslize de entrada dos cards) ----------
  let cache = null;
  ScrollTrigger.addEventListener('refreshInit', () => { cache = null; });
  function medir() {
    if (cache) return cache;
    const W = caixa.offsetWidth, H = caixa.offsetHeight, L = raiz.offsetWidth;
    const estreito = innerWidth <= 860;
    const cards = itens.map((item) => {
      const c = item.querySelector('.tempo__card');
      return { x: item.offsetLeft + c.offsetLeft, y: item.offsetTop + c.offsetTop, w: c.offsetWidth, h: c.offsetHeight };
    });
    const n = cards.length;
    // Parada em cada marco: no computador, no meio da metade vazia ao lado do card; no celular (cards na largura
    // toda), no canto de cima à direita do card, onde só tem o ano
    const lado = (i) => estreito
      ? { x: cards[i].x + cards[i].w - W * 0.5 + 6, y: cards[i].y + H * 0.2 }
      : { x: i % 2 === 0 ? L * 0.75 : L * 0.25, y: cards[i].y + cards[i].h / 2 };
    // Pousado: em cima do card, perto da direita, com o anel de baixo encostando na borda de cima
    const pouso = (i) => ({ x: cards[i].x + cards[i].w * (estreito ? 0.8 : 0.78), y: cards[i].y - H * 0.35 });
    // O voo com o scroll vai do pouso no 1º até chegar perto do último; dali a volta no box é por conta própria
    const ult = cards[n - 1];
    const chegada = estreito
      ? { x: ult.x + ult.w - W * 0.5 + 6, y: ult.y - H * 0.9 }
      : { x: (n - 1) % 2 === 0 ? L * 0.72 : L * 0.28, y: ult.y - H * 0.25 };
    const pontos = [pouso(0), ...cards.slice(0, n - 1).map((_, i) => lado(i)), chegada];
    cache = { W, H, L, n, estreito, cards, pontos, pousoFinal: pouso(n - 1) };
    return cache;
  }

  // ---------- Curva Catmull-Rom pelos pontos, com uma pairada curta em cada parada ----------
  const suave = (k) => (k < 0.14 ? 0 : k > 0.86 ? 1 : 0.5 - Math.cos(((k - 0.14) / 0.72) * Math.PI) / 2);
  function naCurva(pts, u, comPairada = true) {
    const m = pts.length - 1;
    const pos = Math.min(m - 1e-6, Math.max(0, u * m));
    const i = Math.floor(pos);
    const k = comPairada ? suave(pos - i) : pos - i;
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(m, i + 2)];
    const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * k + (2 * a - 5 * b + 4 * c - d) * k * k + (-a + 3 * b - 3 * c + d) * k * k * k);
    return { x: cr(p0.x, p1.x, p2.x, p3.x), y: cr(p0.y, p1.y, p2.y, p3.y), trecho: i, fracao: pos - i };
  }

  // ---------- Movimento: posição suavizada e inclinação pela velocidade ----------
  const irX = gsap.quickTo(caixa, 'x', { duration: 0.45, ease: 'power3' });
  const irY = gsap.quickTo(caixa, 'y', { duration: 0.45, ease: 'power3' });
  const inclinar = gsap.quickTo(dentro, 'rotation', { duration: 0.5, ease: 'power2' });
  let ultimo = null;
  function colocar(x, y, imediato = false) {
    const { W, H } = medir();
    // Imediato: o seguidor (quickTo) recomeça já no destino. Não pode usar killTweensOf aqui: isso mata o
    // quickTo e o robô para de acompanhar o scroll.
    if (imediato) { irX(x - W / 2, x - W / 2); irY(y - H / 2, y - H / 2); }
    else { irX(x - W / 2); irY(y - H / 2); }
    const dx = ultimo ? x - ultimo.x : 0;
    ultimo = { x, y };
    return dx;
  }
  function atrasDe(x, y) {
    const { H, cards } = medir();
    return cards.some((c) => x > c.x && x < c.x + c.w && y > c.y - H * 0.15 && y < c.y + c.h + H * 0.15);
  }

  // ---------- Balão ----------
  let timerBalao;
  function dizer(txt, ms = 3400) {
    clearTimeout(timerBalao);
    balao.textContent = txt;
    balao.classList.add('on');
    timerBalao = setTimeout(() => balao.classList.remove('on'), ms);
  }
  const calar = () => { clearTimeout(timerBalao); balao.classList.remove('on'); };

  // Sem animação: fica pousado no último marco
  if (reduzido) {
    const { pousoFinal } = medir();
    colocar(pousoFinal.x, pousoFinal.y, true);
    criar();
    return api();
  }

  // ---------- Voo com o scroll ----------
  const proxy = { u: 0 };
  let final = null; // timeline da volta no box (enquanto existe, o scroll não mexe no robô)
  const primCard = itens[0].querySelector('.tempo__card');
  const ultCard = itens[itens.length - 1].querySelector('.tempo__card');
  // O scroll só leva o robô entre dois momentos:
  //  - começo: o 1º card inteiro na tela, com espaço acima dele (abaixo do menu do topo) para o robô pousado.
  //    Subindo, é aí que ele já pousa nele e fala.
  //  - fim: o último card aparece inteiro (a base dele chega na base da tela). Descendo, é aí que ele faz a volta.
  const inicioVoo = () => `top ${Math.round((document.querySelector('.topo')?.offsetHeight || 80) + caixa.offsetHeight * 0.9)}px`;
  gsap.to(proxy, {
    u: 1, ease: 'none',
    scrollTrigger: {
      trigger: primCard, start: inicioVoo, endTrigger: ultCard, end: 'bottom bottom-=16', scrub: 1, invalidateOnRefresh: true,
      onLeave: pousoFinal,       // o card "Atual" apareceu
      onEnterBack: decolar,      // voltou a subir: sai do pouso e retoma o voo
      onLeaveBack: pousoInicial, // subiu até antes do 1º marco
      onEnter: calar,
    },
    onUpdate: () => {
      if (final) return;
      const { pontos } = medir();
      const p = naCurva(pontos, proxy.u);
      const dx = colocar(p.x, p.y);
      const voando = proxy.u > 0.01 && proxy.u < 0.99;
      inclinar(voando ? gsap.utils.clamp(-16, 16, dx * 1.4) : 0);
      if (robo) {
        robo.setVoo(voando ? 1 : 0);
        if (voando && Math.abs(dx) > 0.4) robo.olhar(gsap.utils.clamp(-1, 1, dx / 5), 0.15);
      }
      // Computador: por trás só no meio de um trecho e quando cruza um card; nas paradas fica na frente.
      // Celular: sempre na frente (por trás, nos cards da largura toda, ficava estranho)
      const { estreito } = medir();
      caixa.classList.toggle('atras', !estreito && voando && p.fracao > 0.18 && p.fracao < 0.82 && atrasDe(p.x, p.y));
      if (voando) calar();
    },
  });
  // Posição inicial (antes de qualquer scroll): pousado no 1º marco
  requestAnimationFrame(() => { const p = medir().pontos[0]; colocar(p.x, p.y, true); });

  // ---------- Pouso no último: volta no box ----------
  function pousoFinal() {
    if (final) return;
    calar();
    const { W, H, cards, n, estreito, pousoFinal: alvo } = medir();
    const c = cards[n - 1];
    const de = { x: gsap.getProperty(caixa, 'x') + W / 2, y: gsap.getProperty(caixa, 'y') + H / 2 };
    // Computador: desce pela lateral livre, passa por trás do card e sai por cima, do outro lado. Celular: direto.
    const ladoLivre = (n - 1) % 2 === 0 ? 1 : -1;
    const borda = ladoLivre > 0 ? c.x + c.w : c.x;
    const caminho = estreito ? [de, alvo] : [
      de,
      { x: borda + ladoLivre * W * 0.35, y: c.y + c.h * 0.45 },
      { x: c.x + c.w * 0.5, y: c.y + c.h * 0.7 },             // por trás do card
      { x: borda - ladoLivre * c.w * 0.85, y: c.y - H * 0.6 }, // sai por cima, do outro lado
      alvo,
    ];
    const prog = { u: 0 };
    robo?.setVoo(1);
    final = gsap.timeline({ onComplete: aterrissar });
    final.to(prog, {
      u: 1, duration: estreito ? 0.9 : 2.4, ease: 'power1.inOut',
      onUpdate: () => {
        const p = naCurva(caminho, prog.u, false);
        const dx = colocar(p.x, p.y, true);
        inclinar(gsap.utils.clamp(-18, 18, dx * 1.2));
        if (robo && Math.abs(dx) > 0.4) robo.olhar(gsap.utils.clamp(-1, 1, dx / 5), 0.15);
        // Atrás ao entrar por baixo do card e enquanto sobe por trás dele, até sair por cima
        const atras = !estreito && ((p.trecho === 1 && p.fracao > 0.25) || (p.trecho === 2 && atrasDe(p.x, p.y)));
        caixa.classList.toggle('atras', atras);
      },
    });
    if (estreito) robo?.cambalhota('mortal');
  }
  function aterrissar() {
    caixa.classList.remove('atras');
    inclinar(0);
    if (!robo) return;
    robo.setVoo(0);
    robo.olhar(0, 0);
    robo.cambalhota('pirueta');
    setTimeout(() => {
      if (!final) return; // já decolou de novo
      robo.setFeliz(true);
      robo.acenar();
      robo.falar(1800);
      dizer(t('carreira.roboFim'));
    }, 900);
    setTimeout(() => robo?.setFeliz(false), 3600);
  }
  function decolar() {
    if (!final) return;
    final.kill();
    final = null;
    calar();
    caixa.classList.remove('atras');
    robo?.setFeliz(false);
    robo?.setVoo(1);
  }

  // ---------- Pouso no 1º (subindo) ----------
  function pousoInicial() {
    calar();
    caixa.classList.remove('atras');
    inclinar(0);
    if (!robo) return;
    robo.setVoo(0);
    robo.olhar(0, 0);
    robo.cambalhota('mortal');
    setTimeout(() => {
      robo.inclinarCabeca();
      robo.falar(1600);
      dizer(t('carreira.roboInicio'));
    }, 950);
  }

  // ---------- Cria o robô 3D só quando a Carreira está chegando ----------
  ScrollTrigger.create({ trigger: raiz, start: 'top bottom+=400', onEnter: criar, onEnterBack: criar });

  async function criar() {
    if (robo || caixa.dataset.criando) return;
    caixa.dataset.criando = '1';
    const { criarRobo } = await import('./robo.js');
    robo = criarRobo({ canvas: caixa.querySelector('canvas'), reduzido, seguirMouse: false });
    if (!robo) { caixa.hidden = true; return; }
    caixa.classList.add('pronto');
    if (dominio) robo.setDominio(true);
  }

  function api() {
    return { setDominio(v) { dominio = v; robo?.setDominio(v); } };
  }
  return api();
}
