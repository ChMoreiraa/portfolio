// Demo interativa da página do Time de agentes. (O Barbú fica em barbu.js.)
// São simulações no navegador (sem servidor), marcadas como tal na página.

const L = (idioma) => (o) => (typeof o === 'string' ? o : o[idioma] ?? o.pt);
const esperar = (ms) => new Promise((ok) => setTimeout(ok, ms));
const agora = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

/* ================================================================== */
/* Time de agentes                                                     */
/* ================================================================== */

const AG = {
  higuruma: {
    nome: 'Higuruma', cor: '#E9B949', papel: { pt: 'Orquestrador', en: 'Orchestrator' },
    resumo: {
      pt: 'Vê todas as sessões, mostra quem faz o quê e o que precisa de você. Só delega depois do seu deferimento.',
      en: 'Sees every session, shows who does what and what needs you. Only delegates after your sign-off.',
    },
  },
  maomao: {
    nome: 'Maomao', cor: '#5EE0A8', papel: { pt: 'Revisão de PR', en: 'PR review' },
    resumo: {
      pt: 'Revisa cada PR contra o padrão do time e a issue de origem. Aponta o ajuste; nunca aprova nem faz merge.',
      en: 'Reviews every PR against the team standard and the source issue. Flags fixes; never approves or merges.',
    },
  },
  nanami: {
    nome: 'Nanami', cor: '#60A5FA', papel: { pt: 'Ambiente', en: 'Environment' },
    resumo: {
      pt: 'Cuida da máquina: memória, processos, ferramentas e automações. Trabalho repetido vira script.',
      en: 'Looks after the machine: memory, processes, tools and automations. Repeated work becomes a script.',
    },
  },
  ultron: {
    nome: 'Ultron', cor: '#F87171', papel: { pt: 'Planejador', en: 'Planner' },
    resumo: {
      pt: 'Divide a tarefa em etapas, com o modelo e o esforço que cada uma precisa. Só roda com o plano aprovado.',
      en: 'Splits the task into stages, each with the model and effort it needs. Only runs with an approved plan.',
    },
  },
};

const T = {
  titulo: { pt: 'O time em ação', en: 'The team in action' },
  aviso: { pt: 'Simulação interativa de como cada agente trabalha. Clique nos botões.', en: 'Interactive simulation of how each agent works. Click the buttons.' },
  vigiando: { pt: 'vigiando', en: 'watching' },
  julgando: { pt: 'julgando', en: 'judging' },
  operando: { pt: 'operando', en: 'operating' },
  revisando: { pt: 'revisando', en: 'reviewing' },
  concluiu: { pt: 'concluiu', en: 'done' },
  ocioso: { pt: 'aguardando', en: 'idle' },
  otimizando: { pt: 'otimizando', en: 'optimising' },
  estavel: { pt: 'estável', en: 'stable' },
  planejando: { pt: 'planejando', en: 'planning' },
  plano: { pt: 'plano pronto', en: 'plan ready' },
  executando: { pt: 'executando', en: 'running' },
  // Higuruma
  proposta: { pt: 'Proposta P3', en: 'Proposal P3' },
  propostaTxt: { pt: 'Delegar a issue #318 (prazo de manifestação vencendo sem alerta) ao agente da milestone M4?', en: 'Delegate issue #318 (report deadline expiring with no alert) to the M4 milestone agent?' },
  deferir: { pt: 'Deferir', en: 'Approve' },
  indeferir: { pt: 'Indeferir', en: 'Reject' },
  nova: { pt: 'Nova proposta', en: 'New proposal' },
  deferido: { pt: 'DEFERIDO', en: 'APPROVED' },
  indeferido: { pt: 'INDEFERIDO', en: 'REJECTED' },
  destino: { pt: 'Agente da M4', en: 'M4 agent' },
  logDef: { pt: 'deferido · carta enviada ao agente da M4', en: 'approved · letter sent to the M4 agent' },
  logOp: { pt: 'agente da M4 operando na #318', en: 'M4 agent working on #318' },
  logPr: { pt: 'PR #352 aberto · Closes #318', en: 'PR #352 opened · Closes #318' },
  logInd: { pt: 'indeferido · nada foi delegado', en: 'rejected · nothing was delegated' },
  // Maomao
  revisar: { pt: 'Revisar PRs', en: 'Review PRs' },
  pr1: { pt: 'Filtro por empresa no relatório', en: 'Per-company filter in the report' },
  pr2: { pt: 'Exportar manifestações em CSV', en: 'Export reports as CSV' },
  checks: [
    { pt: 'Segue a issue de origem', en: 'Matches the source issue' },
    { pt: 'Padrão de código do time', en: 'Team code standard' },
    { pt: 'Escopo por empresa respeitado', en: 'Per-company scope respected' },
    { pt: 'Testes de integração', en: 'Integration tests' },
  ],
  pronta: { pt: 'Pronta para o PO', en: 'Ready for the PO' },
  ajuste: { pt: 'Ajuste pedido', en: 'Changes requested' },
  comentario: { pt: '🧾 AJUSTE PEDIDO · a consulta do CSV não filtra por empresa (vazaria dados de outro cliente) e falta o teste de integração do export.', en: '🧾 CHANGES REQUESTED · the CSV query does not filter by company (it would leak another client’s data) and the export integration test is missing.' },
  nuncaMerge: { pt: 'A Maomao aponta. Quem aprova e faz merge é humano.', en: 'Maomao flags. A human approves and merges.' },
  // Nanami
  otimizar: { pt: 'Otimizar ambiente', en: 'Optimise environment' },
  orfao: { pt: 'node · órfão', en: 'node · orphan' },
  logNan: { pt: 'processo órfão encerrado · melhoria anotada', en: 'orphan process stopped · improvement logged' },
  // Ultron
  tarefa: { pt: 'adicionar autenticação por token na API de relatórios', en: 'add token authentication to the reports API' },
  planejar: { pt: 'Planejar', en: 'Plan' },
  aprovar: { pt: 'Aprovar plano', en: 'Approve plan' },
  etapas: [
    { n: { pt: 'Mapear o código', en: 'Map the code' }, papel: 'scout', modelo: 'Haiku', esforco: { pt: 'baixo', en: 'low' } },
    { n: { pt: 'Desenhar a solução', en: 'Design the solution' }, papel: 'planner', modelo: 'Opus', esforco: { pt: 'alto', en: 'high' } },
    { n: { pt: 'Implementar', en: 'Implement' }, papel: 'builder', modelo: 'Sonnet', esforco: { pt: 'médio', en: 'medium' } },
    { n: { pt: 'Verificar e testar', en: 'Verify and test' }, papel: 'checker', modelo: 'Sonnet', esforco: { pt: 'médio', en: 'medium' } },
  ],
  concluido: { pt: 'Fluxo concluído', en: 'Flow complete' },
};

function cartao(id, l, corpo) {
  const a = AG[id];
  return `
    <article class="ag" data-ag="${id}" style="--c:${a.cor}">
      <header class="ag__topo">
        <span class="ag__avatar">${a.nome[0]}</span>
        <span class="ag__id"><b>${a.nome}</b><small class="mono">${l(a.papel)}</small></span>
        <span class="ag__status mono" data-status><i></i><span></span></span>
      </header>
      <p class="ag__resumo">${l(a.resumo)}</p>
      <div class="ag__palco">${corpo}</div>
      <ol class="ag__log mono" data-log></ol>
    </article>`;
}

export function renderTime(idioma) {
  const l = L(idioma);
  const higuruma = `
    <div class="hg">
      <div class="hg__carta" data-carta>
        <p class="hg__rot mono">${l(T.proposta)}</p>
        <p class="hg__txt">${l(T.propostaTxt)}</p>
        <div class="hg__bts">
          <button class="mini mini--ok" type="button" data-acao="deferir">${l(T.deferir)}</button>
          <button class="mini" type="button" data-acao="indeferir">${l(T.indeferir)}</button>
        </div>
        <span class="hg__carimbo mono" data-carimbo></span>
      </div>
      <div class="hg__alvo" data-alvo>
        <span class="hg__alvo-ic">M4</span>
        <span><b>${l(T.destino)}</b><small class="mono" data-alvo-st>${l(T.ocioso)}</small></span>
      </div>
      <span class="hg__envelope" data-envelope aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg></span>
      <button class="mini mini--link" type="button" data-acao="nova" hidden>${l(T.nova)}</button>
    </div>`;
  const maomao = `
    <div class="mm">
      ${[['241', T.pr1], ['242', T.pr2]].map(([n, t]) => `
        <div class="mm__pr" data-pr="${n}">
          <p class="mm__cab"><span class="mono">PR #${n}</span><b>${l(t)}</b><em class="mm__selo mono" data-selo></em></p>
          <ul class="mm__checks">${T.checks.map((c) => `<li><i></i>${l(c)}</li>`).join('')}</ul>
        </div>`).join('')}
      <p class="mm__coment" data-coment>${l(T.comentario)}</p>
      <div class="mm__rodape"><button class="mini mini--ok" type="button" data-acao="revisar">${l(T.revisar)}</button><small>${l(T.nuncaMerge)}</small></div>
    </div>`;
  const nanami = `
    <div class="nn">
      <div class="nn__medidor"><span class="mono">CPU</span><span class="nn__barra"><i data-cpu></i></span><b class="mono" data-cpu-v>38%</b></div>
      <div class="nn__medidor"><span class="mono">RAM</span><span class="nn__barra"><i data-ram></i></span><b class="mono" data-ram-v>82%</b></div>
      <ul class="nn__procs mono">
        <li><span>claude</span><span>480 MB</span></li>
        <li><span>chrome</span><span>620 MB</span></li>
        <li class="nn__orfao" data-orfao><span>${l(T.orfao)}</span><span>1,2 GB</span></li>
      </ul>
      <button class="mini mini--ok" type="button" data-acao="otimizar">${l(T.otimizar)}</button>
    </div>`;
  const ultron = `
    <div class="ul">
      <div class="ul__tarefa"><span class="mono">/ultron</span><input value="${l(T.tarefa)}" aria-label="Tarefa" /><button class="mini mini--ok" type="button" data-acao="planejar">${l(T.planejar)}</button></div>
      <ol class="ul__etapas" data-etapas>
        ${T.etapas.map((e, i) => `
          <li style="--i:${i}">
            <span class="ul__n mono">${i + 1}</span>
            <span class="ul__nome"><b>${l(e.n)}</b><small class="mono">${e.papel} · ${e.modelo} · ${l(e.esforco)}</small></span>
            <span class="ul__prog"><i></i></span>
          </li>`).join('')}
      </ol>
      <div class="ul__trilha" aria-hidden="true"><span class="ul__boneco" data-boneco></span><span class="ul__bandeira">⚑</span></div>
      <button class="mini mini--ok" type="button" data-acao="aprovar" hidden>${l(T.aprovar)}</button>
    </div>`;
  return `
    <p class="time__aviso mono">${l(T.aviso)}</p>
    <div class="time-demo">
      ${cartao('higuruma', l, higuruma)}
      ${cartao('maomao', l, maomao)}
      ${cartao('nanami', l, nanami)}
      ${cartao('ultron', l, ultron)}
    </div>`;
}

export function ligarTime(raiz, idioma, som) {
  const l = L(idioma);
  const card = (id) => raiz.querySelector(`[data-ag="${id}"]`);
  const status = (id, txt, tipo = '') => {
    const s = card(id).querySelector('[data-status]');
    s.className = `ag__status mono ${tipo}`;
    s.querySelector('span').textContent = l(txt);
  };
  const log = (id, txt, tipo = '') => {
    const ol = card(id).querySelector('[data-log]');
    const li = document.createElement('li');
    li.className = tipo;
    li.innerHTML = `<span>${agora()}</span>${l(txt)}`;
    ol.prepend(li);
    while (ol.children.length > 3) ol.lastChild.remove();
  };
  const bip = (f = 900) => som?.(f, 0.06, 0.03);

  // Higuruma
  (() => {
    const c = card('higuruma');
    const carta = c.querySelector('[data-carta]'), carimbo = c.querySelector('[data-carimbo]');
    const env = c.querySelector('[data-envelope]'), alvo = c.querySelector('[data-alvo]'), alvoSt = c.querySelector('[data-alvo-st]');
    const nova = c.querySelector('[data-acao="nova"]');
    status('higuruma', T.vigiando);
    const travar = (on) => c.querySelectorAll('.hg__bts button').forEach((b) => (b.disabled = on));
    c.querySelector('[data-acao="deferir"]').addEventListener('click', async () => {
      travar(true); bip(700);
      status('higuruma', T.julgando, 'ocupado');
      carimbo.textContent = l(T.deferido); carimbo.className = 'hg__carimbo mono on ok';
      await esperar(600);
      log('higuruma', T.logDef);
      env.classList.add('voando');
      await esperar(900);
      env.classList.remove('voando');
      alvo.classList.add('operando');
      alvoSt.textContent = l(T.operando);
      status('higuruma', T.operando, 'ativo');
      log('higuruma', T.logOp);
      bip(1100);
      await esperar(1800);
      log('higuruma', T.logPr, 'ok');
      alvoSt.textContent = 'PR #352';
      nova.hidden = false;
    });
    c.querySelector('[data-acao="indeferir"]').addEventListener('click', async () => {
      travar(true); bip(400);
      carta.classList.add('treme');
      carimbo.textContent = l(T.indeferido); carimbo.className = 'hg__carimbo mono on erro';
      log('higuruma', T.logInd, 'erro');
      status('higuruma', T.vigiando);
      await esperar(500);
      carta.classList.remove('treme');
      nova.hidden = false;
    });
    nova.addEventListener('click', () => {
      travar(false);
      carimbo.className = 'hg__carimbo mono';
      alvo.classList.remove('operando');
      alvoSt.textContent = l(T.ocioso);
      status('higuruma', T.vigiando);
      nova.hidden = true;
    });
  })();

  // Maomao
  (() => {
    const c = card('maomao');
    const btn = c.querySelector('[data-acao="revisar"]');
    const coment = c.querySelector('[data-coment]');
    status('maomao', T.ocioso);
    // PR 241 passa em tudo; PR 242 falha em 2 itens
    const falhas = { 241: [], 242: [2, 3] };
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      coment.classList.remove('on');
      c.querySelectorAll('.mm__checks li').forEach((li) => (li.className = ''));
      c.querySelectorAll('[data-selo]').forEach((s) => { s.textContent = ''; s.className = 'mm__selo mono'; });
      status('maomao', T.revisando, 'ocupado');
      for (const n of ['241', '242']) {
        const pr = c.querySelector(`[data-pr="${n}"]`);
        pr.classList.add('lendo');
        const itens = [...pr.querySelectorAll('li')];
        for (let i = 0; i < itens.length; i++) {
          itens[i].className = 'checando';
          await esperar(420);
          const falhou = falhas[n].includes(i);
          itens[i].className = falhou ? 'falhou' : 'passou';
          bip(falhou ? 380 : 1200);
        }
        pr.classList.remove('lendo');
        const selo = pr.querySelector('[data-selo]');
        const ok = falhas[n].length === 0;
        selo.textContent = l(ok ? T.pronta : T.ajuste);
        selo.className = `mm__selo mono on ${ok ? 'ok' : 'erro'}`;
        log('maomao', { pt: `PR #${n} · ${l(ok ? T.pronta : T.ajuste)}`, en: `PR #${n} · ${l(ok ? T.pronta : T.ajuste)}` }, ok ? 'ok' : 'erro');
        await esperar(300);
      }
      coment.classList.add('on');
      status('maomao', T.concluiu, 'ativo');
      btn.disabled = false;
    });
  })();

  // Nanami
  (() => {
    const c = card('nanami');
    const cpu = c.querySelector('[data-cpu]'), ram = c.querySelector('[data-ram]');
    const cpuV = c.querySelector('[data-cpu-v]'), ramV = c.querySelector('[data-ram-v]');
    const orfao = c.querySelector('[data-orfao]');
    let ramBase = 82, otimizado = false;
    status('nanami', T.vigiando);
    const pinta = () => {
      const vc = Math.round(30 + Math.random() * 22 - (otimizado ? 12 : 0));
      const vr = Math.round(ramBase + (Math.random() * 2 - 1));
      cpu.style.width = `${vc}%`; cpuV.textContent = `${vc}%`;
      ram.style.width = `${vr}%`; ramV.textContent = `${vr}%`;
      ram.parentElement.classList.toggle('alta', vr > 78);
    };
    pinta();
    const timer = setInterval(() => { if (!document.body.contains(c)) return clearInterval(timer); pinta(); }, 1100);
    const btn = c.querySelector('[data-acao="otimizar"]');
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      status('nanami', T.otimizando, 'ocupado');
      orfao.classList.add('matando');
      bip(500);
      await esperar(900);
      orfao.classList.add('fora');
      for (let v = 82; v >= 61; v -= 3) { ramBase = v; pinta(); await esperar(70); }
      otimizado = true;
      status('nanami', T.estavel, 'ativo');
      log('nanami', T.logNan, 'ok');
      bip(1300);
      await esperar(2600);
      // depois de um tempo, o processo volta a aparecer, para dar para testar de novo
      orfao.classList.remove('matando', 'fora');
      ramBase = 82; otimizado = false;
      status('nanami', T.vigiando);
      btn.disabled = false;
    });
  })();

  // Ultron
  (() => {
    const c = card('ultron');
    const etapas = c.querySelector('[data-etapas]');
    const itens = [...etapas.children];
    const aprovar = c.querySelector('[data-acao="aprovar"]');
    const planejar = c.querySelector('[data-acao="planejar"]');
    const boneco = c.querySelector('[data-boneco]');
    status('ultron', T.ocioso);
    planejar.addEventListener('click', async () => {
      planejar.disabled = true;
      aprovar.hidden = true;
      boneco.style.left = '0%';
      itens.forEach((li) => { li.className = ''; li.querySelector('.ul__prog i').style.width = '0%'; });
      status('ultron', T.planejando, 'ocupado');
      for (const li of itens) { await esperar(350); li.classList.add('visivel'); bip(1000); }
      status('ultron', T.plano, 'ativo');
      aprovar.hidden = false;
      planejar.disabled = false;
    });
    aprovar.addEventListener('click', async () => {
      aprovar.hidden = true;
      planejar.disabled = true;
      status('ultron', T.executando, 'ocupado');
      for (let i = 0; i < itens.length; i++) {
        const li = itens[i];
        li.classList.add('rodando');
        const barra = li.querySelector('.ul__prog i');
        for (let p = 0; p <= 100; p += 10) { barra.style.width = `${p}%`; await esperar(60 + i * 15); }
        li.classList.remove('rodando');
        li.classList.add('feita');
        boneco.style.left = `${((i + 1) / itens.length) * 100}%`;
        bip(900 + i * 150);
      }
      status('ultron', T.concluido, 'ativo');
      log('ultron', T.concluido, 'ok');
      planejar.disabled = false;
    });
  })();
}
