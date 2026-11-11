import { textos } from './conteudo.js';

const ouvintes = new Set();
let idioma = lerIdioma();

function lerIdioma() {
  try {
    const salvo = localStorage.getItem('idioma');
    if (salvo === 'pt' || salvo === 'en') return salvo;
  } catch {}
  return (navigator.language || 'pt').toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

export const getIdioma = () => idioma;

// Registra um texto dinâmico ({pt, en} ou string) sob uma chave.
export function registrar(chave, valor) {
  if (typeof valor === 'string') valor = { pt: valor, en: valor };
  textos.pt[chave] = valor.pt;
  textos.en[chave] = valor.en ?? valor.pt;
  return chave;
}

export const t = (chave) => textos[idioma][chave] ?? textos.pt[chave] ?? chave;

export function aplicar(raiz = document) {
  document.documentElement.lang = idioma === 'pt' ? 'pt-BR' : 'en';
  raiz.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  raiz.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    // formato: "aria-label:chave;title:chave"
    el.dataset.i18nAttr.split(';').forEach((par) => {
      const [attr, chave] = par.split(':');
      el.setAttribute(attr, t(chave));
    });
  });
}

export function setIdioma(novo) {
  if (novo === idioma) return;
  idioma = novo;
  try { localStorage.setItem('idioma', novo); } catch {}
  aplicar();
  ouvintes.forEach((fn) => fn(novo));
}

export const aoTrocarIdioma = (fn) => ouvintes.add(fn);
