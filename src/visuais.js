// Visuais dos projetos. Projetos privados usam ilustrações em HTML (marcadas como tal);
// os pessoais usam imagens reais dos repositórios.

const L = {
  pt: {
    painel: 'painel', manif: 'Manifestações', empresa: 'Empresa A', abertas: 'Abertas', prazo: 'No prazo', resp: 'Respondidas',
    analise: 'Em análise', novo: 'Nova', respondida: 'Respondida', atend: 'Atendimento', vistoria: 'Laudo de vistoria', cobranca: 'Cobrança',
    hatch: 'Hatch 2021 · 42 mil km', vist: 'Vistoria aprovada', risco: 'Risco de fraude', baixo: 'baixo', compra: 'Compra assistida',
    precisa: 'Precisa de você', deferir: 'deferir', indeferir: 'indeferir', p3: 'P3 · delegar a issue #318?',
    orq: 'orquestrando · 3 sessões', rev: 'revisando PR #242', amb: 'memória 61% · ok', plan: 'etapa 2 de 4',
    horario: 'Escolha o horário', confirmar: 'Confirmar', hoje: 'Hoje', amanha: 'Amanhã', sexta: 'Sex',
    ilustracao: 'Ilustração', aovivo: 'API no ar',
  },
  en: {
    painel: 'panel', manif: 'Reports', empresa: 'Company A', abertas: 'Open', prazo: 'On time', resp: 'Answered',
    analise: 'In review', novo: 'New', respondida: 'Answered', atend: 'Service', vistoria: 'Inspection report', cobranca: 'Billing',
    hatch: 'Hatchback 2021 · 42k km', vist: 'Inspection passed', risco: 'Fraud risk', baixo: 'low', compra: 'Assisted purchase',
    precisa: 'Needs you', deferir: 'approve', indeferir: 'reject', p3: 'P3 · delegate issue #318?',
    orq: 'orchestrating · 3 sessions', rev: 'reviewing PR #242', amb: 'memory 61% · ok', plan: 'stage 2 of 4',
    horario: 'Pick a time', confirmar: 'Confirm', hoje: 'Today', amanha: 'Tomorrow', sexta: 'Fri',
    ilustracao: 'Illustration', aovivo: 'Live API',
  },
};

const tag = (txt) => `<span class="vis__tag mono">${txt}</span>`;

const VIS = {
  ombuds: (l) => `
    <div class="vis vis--ombuds">
      <div class="mk-janela">
        <div class="mk-barra"><i></i><i></i><i></i><span class="mono">ombuds · ${l.painel}</span></div>
        <div class="mk-corpo">
          <aside class="mk-lado"><b></b><span></span><span class="on"></span><span></span><span></span></aside>
          <div class="mk-main">
            <div class="mk-topo"><strong>${l.manif}</strong><em class="mono">${l.empresa}</em></div>
            <div class="mk-kpis">
              <div><small>${l.abertas}</small><b>24</b></div>
              <div><small>${l.prazo}</small><b>96%</b></div>
              <div><small>${l.resp}</small><b>312</b></div>
            </div>
            <ul class="mk-lista">
              <li><span class="mono">#2481</span><span>${l.atend}</span><em class="chip chip--a">${l.analise}</em><i style="--p:.72"></i></li>
              <li><span class="mono">#2480</span><span>${l.vistoria}</span><em class="chip chip--n">${l.novo}</em><i style="--p:.18"></i></li>
              <li><span class="mono">#2476</span><span>${l.cobranca}</span><em class="chip chip--r">${l.respondida}</em><i style="--p:1"></i></li>
              <li><span class="mono">#2471</span><span>${l.atend}</span><em class="chip chip--r">${l.respondida}</em><i style="--p:1"></i></li>
            </ul>
          </div>
        </div>
      </div>
      ${tag(l.ilustracao)}
    </div>`,

  verocar: (l) => `
    <div class="vis vis--verocar">
      <div class="vc-anuncio">
        <div class="vc-foto">
          <svg viewBox="0 0 320 140" aria-hidden="true">
            <defs><linearGradient id="vcg" x1="0" x2="1"><stop offset="0" stop-color="#9AD1FF"/><stop offset="1" stop-color="#5B7CFF"/></linearGradient></defs>
            <path d="M18 98c0-14 8-22 22-25l46-9 34-26c8-6 18-9 28-9h70c12 0 22 5 30 13l26 24 32 7c12 3 20 12 20 24v13H18z" fill="url(#vcg)" opacity=".95"/>
            <path d="M128 40h52v26h-82zM190 40h30c6 0 12 3 16 8l14 18h-60z" fill="#0b1630" opacity=".55"/>
            <circle cx="84" cy="112" r="20" fill="#0b0f1d"/><circle cx="84" cy="112" r="9" fill="#9AD1FF"/>
            <circle cx="248" cy="112" r="20" fill="#0b0f1d"/><circle cx="248" cy="112" r="9" fill="#9AD1FF"/>
          </svg>
          <span class="vc-chao"></span>
        </div>
        <div class="vc-info">
          <p class="vc-titulo">${l.hatch}</p>
          <p class="vc-preco">R$ 68.900</p>
          <p class="vc-selo"><b>✓</b>${l.vist}</p>
          <div class="vc-risco"><span>${l.risco}</span><span class="mono">${l.baixo}</span><i><b></b></i></div>
          <span class="vc-botao">${l.compra}</span>
        </div>
      </div>
      ${tag(l.ilustracao)}
    </div>`,

  agentes: (l) => `
    <div class="vis vis--agentes">
      <div class="ag-term mono">
        <div class="ag-topo"><i></i><i></i><i></i><span>higuruma — ${l.painel}</span></div>
        <ul>
          <li style="--c:#E9B949"><b></b><span>higuruma</span><em>${l.orq}</em></li>
          <li style="--c:#5EE0A8"><b></b><span>maomao</span><em>${l.rev}</em></li>
          <li style="--c:#60A5FA"><b></b><span>nanami</span><em>${l.amb}</em></li>
          <li style="--c:#F87171"><b></b><span>ultron</span><em>${l.plan}</em></li>
        </ul>
        <div class="ag-pede">
          <p>${l.precisa}</p>
          <p class="ag-q">${l.p3}<span class="ag-cursor">▌</span></p>
          <p class="ag-bts"><span>${l.deferir}</span><span>${l.indeferir}</span></p>
        </div>
      </div>
      ${tag(l.ilustracao)}
    </div>`,

  barbu: (l) => `
    <div class="vis vis--barbu">
      <div class="bb-fone">
        <div class="bb-notch"></div>
        <p class="bb-tit">${l.horario}</p>
        <div class="bb-dias"><span class="on">${l.hoje}</span><span>${l.amanha}</span><span>${l.sexta}</span></div>
        <div class="bb-slots">
          <span>09:00</span><span class="off">09:30</span><span>10:00</span>
          <span class="sel">10:30</span><span>11:00</span><span class="off">11:30</span>
          <span>14:00</span><span>14:30</span><span class="off">15:00</span>
        </div>
        <span class="bb-botao">${l.confirmar}</span>
      </div>
      <div class="bb-luz"></div>
      ${tag(l.ilustracao)}
    </div>`,

  libras: () => `
    <div class="vis vis--libras">
      <img class="lb-fundo" src="/img/libras-banner.png" alt="" aria-hidden="true" loading="lazy" />
      <img class="lb-frente" src="/img/libras-banner.png" alt="LibrasFlow" loading="lazy" />
    </div>`,

  cepflow: (l) => `
    <div class="vis vis--cepflow">
      <div class="cf-req mono"><b>GET</b> /api/cep/12246-000 <span class="cf-ok">200</span></div>
      <pre class="cf-json mono">{
  <i>"cep"</i>: <s>"12246-000"</s>,
  <i>"logradouro"</i>: <s>"Avenida Alfredo Ignácio…"</s>,
  <i>"bairro"</i>: <s>"Parque Residencial Aquarius"</s>,
  <i>"cidade"</i>: <s>"São José dos Campos"</s>,
  <i>"estado"</i>: <s>"SP"</s>
}</pre>
      <span class="vis__tag vis__tag--vivo mono"><b></b>${l.aovivo}</span>
    </div>`,
};

export const visual = (id, idioma) => VIS[id](L[idioma]);
