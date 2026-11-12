// Notebook + celular lado a lado nos cases que dá para testar (CEPFlow, Barbú, LibrasFlow).
// No computador o notebook fica grande e o celular à frente, no canto direito; em tela pequena,
// uma aba de cada vez ("Notebook | Celular").
//
// Sites externos (iframes) são desenhados numa largura de computador (LARGURA) e reduzidos para caber
// na tela do notebook, senão abririam no layout de celular. Conteúdo nosso (o painel do Barbú) é
// desenhado direto no tamanho da tela, sem redução, para o texto não ficar miúdo.

export const LARGURA = 1100;
const ALTURA = 690; // proporção da área útil da tela (16:10 menos a barra do navegador)

const ICONE_CADEADO = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';

// Moldura do notebook. `abas`: [{ id, rotulo, url }] vira abas de navegador; `url`: endereço fixo.
export function notebook({ conteudo, abas = null, url = '', link = '', linkRotulo = '', escala = true }) {
  const barraAbas = abas ? `
      <div class="nb__abas" role="tablist">${abas.map((a, i) => `
        <button type="button" role="tab" class="nb__aba ${i === 0 ? 'on' : ''}" data-nb-aba="${a.id}" aria-selected="${i === 0}">${a.rotulo}</button>`).join('')}
      </div>` : '';
  const primeiraUrl = abas ? abas[0].url : url;
  return `
    <div class="nb">
      <div class="nb__tampa">
        <span class="nb__cam" aria-hidden="true"></span>
        <div class="nb__tela">
          <div class="nb__nav">
            <span class="nb__bolas" aria-hidden="true"><i></i><i></i><i></i></span>
            ${barraAbas}
            <span class="nb__url mono">${ICONE_CADEADO}<span data-nb-url>${primeiraUrl}</span></span>
            ${link ? `<a class="nb__ext mono" href="${link}" target="_blank" rel="noopener">${linkRotulo} ↗</a>` : ''}
          </div>
          <div class="nb__vp ${escala ? 'nb__vp--escala' : ''}" data-nb-vp data-lenis-prevent>
            ${escala ? `<div class="nb__cont" style="width:${LARGURA}px;height:${ALTURA}px">${conteudo}</div>` : conteudo}
          </div>
        </div>
      </div>
      <div class="nb__base" aria-hidden="true"><i></i></div>
    </div>`;
}

// Palco com os dois aparelhos e as abas que só aparecem em tela pequena
export function palco({ nb, cel, idioma, inicio = 'cel' }) {
  const r = idioma === 'en' ? { nb: 'Laptop', cel: 'Phone' } : { nb: 'Notebook', cel: 'Celular' };
  return `
    <div class="dv" data-dv data-vista="${inicio}">
      <div class="dv__abas" role="tablist">
        <button type="button" role="tab" data-dv-ver="nb" aria-selected="${inicio === 'nb'}">${r.nb}</button>
        <button type="button" role="tab" data-dv-ver="cel" aria-selected="${inicio === 'cel'}">${r.cel}</button>
      </div>
      <div class="dv__palco">
        <div class="dv__nb">${nb}</div>
        <div class="dv__cel">${cel}</div>
      </div>
    </div>`;
}

// Liga as abas de tela pequena e a redução dos iframes ao tamanho da tela do notebook
export function ligarAparelhos(raiz, aoTrocar) {
  raiz.querySelectorAll('[data-dv]').forEach((dv) => {
    // A tampa abre sempre que o notebook entra na tela e fecha quando sai (para abrir de novo na volta)
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      dv.classList.add('dv--anima');
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting && e.intersectionRatio >= 0.3) dv.classList.add('dv--aberto');
        else if (!e.isIntersecting) dv.classList.remove('dv--aberto');
      }, { threshold: [0, 0.3] }).observe(dv);
    }
    dv.querySelectorAll('[data-dv-ver]').forEach((b) => b.addEventListener('click', () => {
      dv.dataset.vista = b.dataset.dvVer;
      dv.querySelectorAll('[data-dv-ver]').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
      aoTrocar?.();
    }));
  });
  raiz.querySelectorAll('.nb__vp--escala').forEach((vp) => {
    const medir = () => { if (vp.clientWidth) vp.style.setProperty('--k', (vp.clientWidth / LARGURA).toFixed(4)); };
    medir();
    new ResizeObserver(medir).observe(vp);
  });
}
