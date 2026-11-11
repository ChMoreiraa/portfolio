// Catálogo completo das stacks, por área (gaveta "Ver tudo por área" da seção Stacks).
import { fileiras } from './teclas.js';
import { siVercel, siGithub } from 'simple-icons';
import pandas from 'devicon/icons/pandas/pandas-original.svg?url';
import numpy from 'devicon/icons/numpy/numpy-original.svg?url';
import matplotlib from 'devicon/icons/matplotlib/matplotlib-original.svg?url';
import flask from 'devicon/icons/flask/flask-original.svg?url';
import mysql from 'devicon/icons/mysql/mysql-original.svg?url';
import netlify from 'devicon/icons/netlify/netlify-original.svg?url';
import dart from 'devicon/icons/dart/dart-original.svg?url';
import html from 'devicon/icons/html5/html5-original.svg?url';
import css from 'devicon/icons/css3/css3-original.svg?url';
import lovable from 'devicon/icons/lovable/lovable-original.svg?url';

// Ícones próprios para o que não tem logo livre
const GLIFO = {
  openai: { svg: 'M12 2.5l2.2 6.2 6.3 2.3-6.3 2.3L12 19.5l-2.2-6.2L3.5 11l6.3-2.3z', cor: '#10A37F', traco: false },
  webhook: { svg: 'M9 7a3 3 0 1 1 4.5 2.6L16 14M6.5 18.5A3 3 0 1 1 8 13h7M17.5 18.5A3 3 0 1 1 15 13.6l-2.8-4.9', cor: '#C73A63', traco: true },
  sql: { svg: 'M12 4c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3zM4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3', cor: '#7C8CF8', traco: true },
};

const doTeclado = (nome) => fileiras.flatMap((f) => f.teclas).find((k) => k.nome === nome);
const t = (nome, extra = {}) => {
  const k = doTeclado(nome);
  return { nome, img: k?.img, svg: k?.svg, cor: k?.cor, inverte: k?.inverte, uso: k?.uso, ...extra };
};
const u = (pt, en) => ({ pt, en: en ?? pt });

export const areas = [
  {
    id: 'linguagens', nome: u('Linguagens', 'Languages'),
    itens: [
      t('Python'), t('JavaScript'), t('TypeScript'), t('Java'),
      { nome: 'Dart', img: dart, uso: u('Barbú') },
      t('Flutter'),
      { nome: 'SQL', glifo: 'sql', uso: u('Consultas e modelagem de dados', 'Queries and data modelling') },
    ],
  },
  {
    id: 'ia', nome: u('IA e dados', 'AI & data'),
    itens: [
      { nome: 'OpenAI API', glifo: 'openai', uso: u('Integração com LLMs', 'LLM integration') },
      t('Claude'), t('MCP'), t('OpenCV'), t('MediaPipe'), t('scikit-learn'),
      { nome: 'Pandas', img: pandas, inverte: true, uso: u('Análise de dados', 'Data analysis') },
      { nome: 'NumPy', img: numpy, uso: u('Cálculo numérico', 'Numerical computing') },
      { nome: 'Matplotlib', img: matplotlib, uso: u('Gráficos e análise', 'Charts and analysis') },
      t('Jupyter'),
    ],
  },
  {
    id: 'backend', nome: u('Back-end'),
    itens: [
      t('Spring'), t('FastAPI'),
      { nome: 'Flask', img: flask, inverte: true, uso: u('APIs leves em Python', 'Lightweight Python APIs') },
      t('Node.js'), t('Hibernate'), t('Pytest'),
    ],
  },
  {
    id: 'dados', nome: u('Bancos de dados', 'Databases'),
    itens: [
      t('PostgreSQL'),
      { nome: 'MySQL', img: mysql, uso: u('Bancos relacionais', 'Relational databases') },
      t('Supabase'), t('Firebase'), t('Flyway'),
    ],
  },
  {
    id: 'front', nome: u('Front-end'),
    itens: [
      t('React'), t('Vite'), t('Tailwind'), t('Three.js'), t('GSAP'),
      { nome: 'HTML', img: html, uso: u('Páginas sob medida', 'Custom pages') },
      { nome: 'CSS', img: css, uso: u('Animação e layout', 'Animation and layout') },
    ],
  },
  {
    id: 'automacao', nome: u('Automação', 'Automation'),
    itens: [
      t('n8n'),
      { nome: 'Webhooks', glifo: 'webhook', uso: u('Integração entre sistemas', 'System integration') },
      t('PowerShell'), t('Actions', { nome: 'GitHub Actions' }),
    ],
  },
  {
    id: 'lowcode', nome: u('Low-code'),
    itens: [
      { nome: 'Lovable', img: lovable, uso: u('Protótipos rápidos', 'Fast prototypes') },
      t('n8n'),
    ],
  },
  {
    id: 'infra', nome: u('Infra e ferramentas', 'Infra & tools'),
    itens: [
      t('Docker'), t('Git'),
      { nome: 'GitHub', svg: siGithub.path, cor: 'currentColor', uso: u('Código, issues e PRs', 'Code, issues and PRs') },
      { nome: 'Vercel', svg: siVercel.path, cor: 'currentColor', uso: u('Deploy de front-ends', 'Front-end deploys') },
      { nome: 'Netlify', img: netlify, uso: u('Deploy deste portfólio', 'This portfolio’s deploy') },
    ],
  },
];

export function iconeCatalogo(k) {
  if (k.glifo) {
    const g = GLIFO[k.glifo];
    return `<svg viewBox="0 0 24 24" aria-hidden="true" style="${g.traco ? `fill:none;stroke:${g.cor};stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round` : `fill:${g.cor}`}"><path d="${g.svg}"/></svg>`;
  }
  if (k.img) return `<img src="${k.img}" alt="" class="${k.inverte ? 'inverte' : ''}" draggable="false" />`;
  return `<svg viewBox="0 0 24 24" aria-hidden="true" style="fill:${k.cor === 'currentColor' ? 'currentColor' : k.cor}"><path d="${k.svg}"/></svg>`;
}

export const corDe = (k) => (k.glifo ? GLIFO[k.glifo].cor : k.cor && k.cor !== 'currentColor' ? k.cor : '#A78BFA');
