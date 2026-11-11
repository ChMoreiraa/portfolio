// Seção Stacks: um teclado mecânico em que cada tecla é uma tecnologia.
import { siMediapipe, siGsap, siModelcontextprotocol } from 'simple-icons';
import java from 'devicon/icons/java/java-original.svg?url';
import spring from 'devicon/icons/spring/spring-original.svg?url';
import postgres from 'devicon/icons/postgresql/postgresql-original.svg?url';
import python from 'devicon/icons/python/python-original.svg?url';
import fastapi from 'devicon/icons/fastapi/fastapi-original.svg?url';
import flyway from 'devicon/icons/flyway/flyway-original.svg?url';
import hibernate from 'devicon/icons/hibernate/hibernate-original.svg?url';
import pytest from 'devicon/icons/pytest/pytest-original.svg?url';
import claude from 'devicon/icons/claude/claude-original.svg?url';
import opencv from 'devicon/icons/opencv/opencv-original.svg?url';
import sklearn from 'devicon/icons/scikitlearn/scikitlearn-original.svg?url';
import jupyter from 'devicon/icons/jupyter/jupyter-original.svg?url';
import react from 'devicon/icons/react/react-original.svg?url';
import ts from 'devicon/icons/typescript/typescript-original.svg?url';
import js from 'devicon/icons/javascript/javascript-original.svg?url';
import vite from 'devicon/icons/vitejs/vitejs-original.svg?url';
import three from 'devicon/icons/threejs/threejs-original.svg?url';
import tailwind from 'devicon/icons/tailwindcss/tailwindcss-original.svg?url';
import flutter from 'devicon/icons/flutter/flutter-original.svg?url';
import docker from 'devicon/icons/docker/docker-original.svg?url';
import gha from 'devicon/icons/githubactions/githubactions-original.svg?url';
import git from 'devicon/icons/git/git-original.svg?url';
import node from 'devicon/icons/nodejs/nodejs-original.svg?url';
import n8n from 'devicon/icons/n8n/n8n-original.svg?url';
import pwsh from 'devicon/icons/powershell/powershell-original.svg?url';
import supabase from 'devicon/icons/supabase/supabase-original.svg?url';
import firebase from 'devicon/icons/firebase/firebase-original.svg?url';

const si = (icone, cor) => ({ svg: icone.path, cor: cor ?? `#${icone.hex}` });

// uso: onde a tecnologia aparece no meu trabalho.
export const fileiras = [
  {
    id: 'backend',
    nome: { pt: 'Back-end', en: 'Back-end' },
    teclas: [
      { nome: 'Java', img: java, cor: '#E76F00', uso: { pt: 'Ombuds Guardian', en: 'Ombuds Guardian' } },
      { nome: 'Spring', img: spring, cor: '#6DB33F', uso: { pt: 'Ombuds Guardian · Spring Boot 4', en: 'Ombuds Guardian · Spring Boot 4' } },
      { nome: 'PostgreSQL', img: postgres, cor: '#4169E1', uso: { pt: 'Ombuds Guardian · PostgreSQL 18', en: 'Ombuds Guardian · PostgreSQL 18' } },
      { nome: 'Python', img: python, cor: '#FFD43B', uso: { pt: 'LibrasFlow · CEPFlow', en: 'LibrasFlow · CEPFlow' } },
      { nome: 'FastAPI', img: fastapi, cor: '#009688', uso: { pt: 'CEPFlow', en: 'CEPFlow' } },
      { nome: 'Flyway', img: flyway, cor: '#CC0200', uso: { pt: 'Migrations do Ombuds Guardian', en: 'Ombuds Guardian migrations' } },
      { nome: 'Hibernate', img: hibernate, cor: '#BCAE79', inverte: true, uso: { pt: 'Persistência no back-end Java', en: 'Persistence in the Java back-end' } },
      { nome: 'Pytest', img: pytest, cor: '#0A9EDC', uso: { pt: 'Testes do CEPFlow', en: 'CEPFlow tests' } },
    ],
  },
  {
    id: 'ia',
    nome: { pt: 'IA e dados', en: 'AI & data' },
    teclas: [
      { nome: 'Claude', img: claude, cor: '#D97757', uso: { pt: 'Time de agentes · dia a dia', en: 'Agent team · daily work' } },
      { nome: 'MCP', ...si(siModelcontextprotocol, 'currentColor'), corLuz: '#A78BFA', uso: { pt: 'Ferramentas dos agentes', en: 'Agent tools' } },
      { nome: 'OpenCV', img: opencv, cor: '#5C3EE8', uso: { pt: 'LibrasFlow', en: 'LibrasFlow' } },
      { nome: 'MediaPipe', ...si(siMediapipe), uso: { pt: 'LibrasFlow · 21 pontos da mão', en: 'LibrasFlow · 21 hand landmarks' } },
      { nome: 'scikit-learn', img: sklearn, cor: '#F7931E', uso: { pt: 'LibrasFlow · Random Forest', en: 'LibrasFlow · Random Forest' } },
      { nome: 'Jupyter', img: jupyter, cor: '#F37626', uso: { pt: 'Estudos e análises', en: 'Studies and analysis' } },
    ],
  },
  {
    id: 'front',
    nome: { pt: 'Front-end', en: 'Front-end' },
    teclas: [
      { nome: 'React', img: react, cor: '#61DAFB', uso: { pt: 'Ombuds Guardian · VeroCar', en: 'Ombuds Guardian · VeroCar' } },
      { nome: 'TypeScript', img: ts, cor: '#3178C6', uso: { pt: 'VeroCar · Time de agentes', en: 'VeroCar · Agent team' } },
      { nome: 'JavaScript', img: js, cor: '#F7DF1E', uso: { pt: 'Este portfólio', en: 'This portfolio' } },
      { nome: 'Vite', img: vite, cor: '#9B6BFF', uso: { pt: 'Ombuds Guardian · este portfólio', en: 'Ombuds Guardian · this portfolio' } },
      { nome: 'Three.js', img: three, cor: '#FFFFFF', inverte: true, uso: { pt: 'O robô e o planeta deste site', en: 'This site’s robot and planet' } },
      { nome: 'GSAP', ...si(siGsap), uso: { pt: 'As animações deste site', en: 'This site’s animations' } },
      { nome: 'Tailwind', img: tailwind, cor: '#38BDF8', uso: { pt: 'Front-ends em React', en: 'React front-ends' } },
      { nome: 'Flutter', img: flutter, cor: '#02569B', uso: { pt: 'Barbú', en: 'Barbú' } },
    ],
  },
  {
    id: 'infra',
    nome: { pt: 'Infra e automação', en: 'Infra & automation' },
    teclas: [
      { nome: 'Docker', img: docker, cor: '#2496ED', uso: { pt: 'CEPFlow', en: 'CEPFlow' } },
      { nome: 'Actions', img: gha, cor: '#2088FF', uso: { pt: 'CI: nada entra sem verde', en: 'CI: nothing ships without green' } },
      { nome: 'Git', img: git, cor: '#F05032', uso: { pt: 'Todos os projetos', en: 'Every project' } },
      { nome: 'Node.js', img: node, cor: '#5FA04E', uso: { pt: 'Time de agentes · automações', en: 'Agent team · automations' } },
      { nome: 'n8n', img: n8n, cor: '#EA4B71', uso: { pt: 'Automações sem código', en: 'No-code automations' } },
      { nome: 'PowerShell', img: pwsh, cor: '#5391FE', uso: { pt: 'Automação da máquina', en: 'Workstation automation' } },
      { nome: 'Supabase', img: supabase, cor: '#3ECF8E', uso: { pt: 'VeroCar', en: 'VeroCar' } },
      { nome: 'Firebase', img: firebase, cor: '#FFCA28', uso: { pt: 'Barbú', en: 'Barbú' } },
    ],
  },
];

export function renderTeclado(idioma) {
  const linhas = fileiras.map((f, fi) => `
    <div class="fileira">
      <span class="tecla tecla--mod" aria-hidden="true"><span class="tecla__face"><span class="mono" data-i18n="fil.${f.id}">${f.nome[idioma]}</span></span></span>
      ${f.teclas.map((k, ki) => {
        const icone = k.img
          ? `<img src="${k.img}" alt="" class="${k.inverte ? 'inverte' : ''}" draggable="false" />`
          : `<svg viewBox="0 0 24 24" aria-hidden="true" style="fill:${k.cor}"><path d="${k.svg}"/></svg>`;
        return `
          <button class="tecla" type="button" style="--luz:${k.corLuz ?? k.cor}" data-f="${fi}" data-k="${ki}" aria-label="${k.nome}: ${k.uso[idioma]}">
            <span class="tecla__face">${icone}<span class="tecla__nome mono">${k.nome}</span></span>
          </button>`;
      }).join('')}
    </div>`).join('');
  return `
    <div class="teclado" id="teclado">
      <div class="teclado__topo">
        <span class="teclado__marca mono">CH · 87</span>
        <div class="visor mono" id="visor" aria-live="polite">
          <span class="visor__nome" id="visor-nome"></span>
          <span class="visor__uso" id="visor-uso"></span>
        </div>
        <span class="teclado__leds" aria-hidden="true"><i></i><i></i><i></i></span>
      </div>
      <div class="teclado__placa">${linhas}</div>
    </div>`;
}

export const teclaDe = (el) => fileiras[Number(el.dataset.f)].teclas[Number(el.dataset.k)];
