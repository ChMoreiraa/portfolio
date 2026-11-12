// Barbú recriado para o navegador a partir do código Flutter do app (lib/screens, lib/models, app_theme.dart):
// mesmas telas, cores, textos, serviços, barbeiros, horários e o mesmo formato do que o app grava e envia.
import icCut from '@material-design-icons/svg/filled/content_cut.svg?raw';
import icEmail from '@material-design-icons/svg/outlined/email.svg?raw';
import icLock from '@material-design-icons/svg/outlined/lock.svg?raw';
import icFace from '@material-design-icons/svg/filled/face.svg?raw';
import icStar from '@material-design-icons/svg/filled/star.svg?raw';
import icCal from '@material-design-icons/svg/round/calendar_today.svg?raw';
import icStarR from '@material-design-icons/svg/round/star.svg?raw';
import icBag from '@material-design-icons/svg/round/shopping_bag.svg?raw';
import icPhone from '@material-design-icons/svg/round/phone_android.svg?raw';
import icHome from '@material-design-icons/svg/filled/home.svg?raw';
import icHist from '@material-design-icons/svg/filled/history.svg?raw';
import icNotif from '@material-design-icons/svg/filled/notifications_none.svg?raw';
import icPessoaO from '@material-design-icons/svg/filled/person_outline.svg?raw';
import icPessoa from '@material-design-icons/svg/filled/person.svg?raw';
import icCheck from '@material-design-icons/svg/filled/check_circle.svg?raw';
import icCheckO from '@material-design-icons/svg/filled/check_circle_outline.svg?raw';
import icVoltar from '@material-design-icons/svg/filled/arrow_back_ios.svg?raw';
import icHora from '@material-design-icons/svg/filled/access_time.svg?raw';
import icCalF from '@material-design-icons/svg/filled/calendar_today.svg?raw';
import icPresente from '@material-design-icons/svg/filled/card_giftcard.svg?raw';
import icLocal from '@material-design-icons/svg/round/location_on.svg?raw';
import icChat from '@material-design-icons/svg/round/chat.svg?raw';
import icSair from '@material-design-icons/svg/round/logout.svg?raw';
import icMais from '@material-design-icons/svg/filled/add.svg?raw';
import icRadioOn from '@material-design-icons/svg/filled/radio_button_checked.svg?raw';
import icRadioOff from '@material-design-icons/svg/filled/radio_button_unchecked.svg?raw';
import icSeta from '@material-design-icons/svg/round/chevron_right.svg?raw';
import icCaixa from '@material-design-icons/svg/outlined/inventory_2.svg?raw';
import icCamera from '@material-design-icons/svg/round/photo_camera.svg?raw';
import icEditar from '@material-design-icons/svg/outlined/edit.svg?raw';
import icEstrelaV from '@material-design-icons/svg/filled/star_border.svg?raw';
import icHistR from '@material-design-icons/svg/round/history.svg?raw';
import icNotifR from '@material-design-icons/svg/round/notifications_none.svg?raw';
import icCalR from '@material-design-icons/svg/round/calendar_today.svg?raw';
import icHoraR from '@material-design-icons/svg/round/access_time.svg?raw';
import icCutR from '@material-design-icons/svg/round/content_cut.svg?raw';
import { notebook, palco } from './aparelhos.js';

const ic = (svg, cls = '') => svg.replace('<svg', `<svg class="mi ${cls}" aria-hidden="true"`);

// lib/models/service_model.dart
const SERVICOS = [
  { name: 'Corte Padrão', price: 'R$ 45,00', icon: icCut },
  { name: 'Barba Premium', price: 'R$ 35,00', icon: icFace },
  { name: 'Combo Barbú', price: 'R$ 70,00', icon: icStar },
];
const BARBEIROS = ['Felipe', 'Rodrigo Art'];
const HORARIOS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
// lib/screens/home/products_page.dart
const PRODUTOS = [
  ['Pomada Matte', 'R$ 45,90', 'Fixação forte e efeito seco.'],
  ['Óleo de Barba', 'R$ 38,00', 'Hidratação e brilho natural.'],
  ['Shampoo 3 em 1', 'R$ 52,00', 'Cabelo, barba e corpo.'],
  ['Balm Modelador', 'R$ 35,00', 'Alinhamento dos fios.'],
  ['Pente de Madeira', 'R$ 25,00', 'Anti-estático e durável.'],
  ['Pós Barba Ice', 'R$ 29,90', 'Refrescância imediata.'],
];
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const diaMais = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
const id20 = () => Array.from({ length: 20 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]).join('');
// Horários já ocupados por outros clientes: sorteio fixo por barbeiro e dia (no app vem do Firestore)
const ocupadoPorOutros = (barbeiro, data, h) => {
  let x = 0;
  for (const c of `${barbeiro}${data}${h}`) x = (x * 31 + c.charCodeAt(0)) >>> 0;
  return x % 4 === 0;
};
// Regras de agenda (as do perfil do app): Seg a Sex 09h–19h, Sábado 09h–17h, Domingo fechado.
// Um horário só vale se terminar até o fechamento (1 h por atendimento) e se ainda não tiver passado.
const FECHA = [null, 19, 19, 19, 19, 19, 17];
const fechado = (d) => FECHA[d.getDay()] === null;
const noFuncionamento = (d, h) => !fechado(d) && Number(h.slice(0, 2)) + 1 <= FECHA[d.getDay()];
const passou = (d, h) => { const x = new Date(d); x.setHours(Number(h.slice(0, 2)), Number(h.slice(3, 5)), 0, 0); return x <= new Date(); };
const primeiroDiaAberto = () => { let i = 0; while (fechado(diaMais(i))) i++; return i; };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const T = {
  aviso: {
    pt: 'Use no celular ou no notebook: os dois estão sincronizados. Ao marcar um horário, veja ao lado o que o app grava no Firestore, o lembrete e o webhook que manda para o n8n.',
    en: 'Use it on the phone or the laptop: both are in sync. When you book a slot, see on the side what the app writes to Firestore, the reminder and the webhook it sends to n8n.',
  },
  bastidores: { pt: 'Nos bastidores', en: 'Behind the scenes' },
  bastSub: { pt: 'O que o app faz quando você confirma ou cancela um horário.', en: 'What the app does when you confirm or cancel a slot.' },
  bastVazio: { pt: 'Confirme um agendamento no celular para ver o que o app grava e envia.', en: 'Confirm a booking on the phone to see what the app writes and sends.' },
  lembrete: { pt: 'Lembrete local (flutter_local_notifications)', en: 'Local reminder (flutter_local_notifications)' },
  lembreteTxt: { pt: 'agendado para 60 min antes do horário', en: 'scheduled 60 min before the slot' },
  previa: { pt: 'Ver prévia no celular', en: 'Preview on the phone' },
  webhook: { pt: 'Webhook do n8n (confirmação por e-mail)', en: 'n8n webhook (e-mail confirmation)' },
  igualT: { pt: 'O que é igual ao app e o que é simulado', en: 'What matches the app and what is simulated' },
  igual: {
    pt: '<b>Igual ao app:</b> as telas, as cores, os textos, os serviços e preços, os barbeiros, os horários, a reserva em 3 etapas, o histórico com cancelamento, o Clube Barbú, a loja, o perfil e o formato dos documentos em <code>bookings</code> e <code>notifications</code> e do payload do webhook.',
    en: '<b>Same as the app:</b> screens, colours, texts, services and prices, barbers, time slots, the 3-step booking, history with cancellation, the loyalty club, the shop, the profile and the shape of the <code>bookings</code> and <code>notifications</code> documents and the webhook payload.',
  },
  simulado: {
    pt: '<b>Simulado:</b> o login aceita qualquer dado, os horários ocupados por outros clientes são sorteados por barbeiro e dia, e nada sai do seu navegador. Os dados somem ao recarregar a página. A demo também segue o horário de funcionamento do perfil (domingo fechado, sábado até 17h) e não deixa marcar horário que já passou.',
    en: '<b>Simulated:</b> sign-in accepts anything, slots taken by other customers are drawn per barber and day, and nothing leaves your browser. Data is gone when the page reloads. The demo also follows the opening hours shown in the profile (closed on Sunday, Saturday until 5 pm) and won’t book a slot that has already passed.',
  },
};

// Telas do app (as mesmas da demo e da vitrine do topo do case). Dependem só do estado.
function fazerTelas(st) {
  return {
    splash: () => `
      <div class="bb-splash">${ic(icCut, 'mi--100')}<p>BARBÚ</p></div>`,

    login: () => `
      <div class="bb-login">
        ${ic(icCut, 'mi--80 vermelho')}
        <p class="bb-logo">BARBÚ</p>
        <p class="bb-sub">PREMIUM EXPERIENCE</p>
        <label class="bb-campo">${ic(icEmail, 'vermelho')}<input data-email placeholder="E-mail" autocomplete="off" /></label>
        <label class="bb-campo">${ic(icLock, 'vermelho')}<input data-senha type="password" placeholder="Senha" /></label>
        <button class="bb-link bb-direita" data-acao="esqueci">Esqueceu a senha?</button>
        <button class="bb-btn bb-btn--sombra" data-acao="entrar">ENTRAR</button>
        <button class="bb-btn bb-btn--fantasma" data-acao="visitante">Entrar como visitante</button>
        ${st.idioma ? `<p class="bb-nota">${st.idioma === 'pt' ? 'Na demo, qualquer e-mail e senha entram.' : 'In the demo, any e-mail and password work.'}</p>` : ''}
        <p class="bb-rodape">Não tem uma conta? <button class="bb-link bb-forte" data-ir="cadastro">Cadastre-se</button></p>
      </div>`,

    cadastro: () => `
      <div class="bb-topo"><button data-ir="login">${ic(icVoltar)}</button></div>
      <div class="bb-login bb-login--cad">
        <p class="bb-logo bb-logo--p">CRIAR CONTA</p>
        <label class="bb-campo">${ic(icPessoaO, 'vermelho')}<input data-nome-cad placeholder="Nome completo" /></label>
        <label class="bb-campo">${ic(icEmail, 'vermelho')}<input placeholder="E-mail" /></label>
        <label class="bb-campo">${ic(icPhone, 'vermelho')}<input placeholder="Telefone" /></label>
        <label class="bb-campo">${ic(icLock, 'vermelho')}<input type="password" placeholder="Senha" /></label>
        <button class="bb-btn bb-btn--sombra" data-acao="cadastrar">CADASTRAR</button>
      </div>`,

    inicio: () => `
      <div class="bb-inicio">
      <div class="bb-ola">
        <div><p class="bb-cinza">Bem-vindo de volta,</p><p class="bb-nome">${esc(st.nome.split(' ')[0])} 💈</p></div>
        <button class="bb-avatar" data-acao="sair-dlg">${ic(icPessoa)}</button>
      </div>
      <div class="bb-marca">${ic(icCut, 'mi--40 vermelho')}<p>BARBÚ</p></div>
      <div class="bb-promo">
        <p class="bb-promo-t">PROMOÇÃO</p>
        <p class="bb-promo-g">Corte + Barba<br>20% OFF</p>
        <button class="bb-promo-btn">Resgatar Agora</button>
      </div>
      <p class="bb-secao">Nossos Serviços</p>
      <div class="bb-grade">
        <button class="bb-servico" data-ir="reserva">${ic(icCal)}<span>AGENDAR</span></button>
        <button class="bb-servico" data-ir="fidelidade">${ic(icStarR)}<span>FIDELIDADE</span></button>
        <button class="bb-servico" data-ir="produtos">${ic(icBag)}<span>PRODUTOS</span></button>
        <button class="bb-servico" data-aba="3">${ic(icPhone)}<span>CONTATO</span></button>
      </div>
      </div>`,

    historico: () => {
      const lista = st.bookings.map((b, i) => {
        let status = b.status;
        if (status === 'confirmado' && new Date(`${b.date}T${b.time}:00`) < new Date()) status = 'concluido';
        const selo = { confirmado: ['AGENDADO', 'azul'], cancelado: ['CANCELADO', 'verm'], concluido: ['CONCLUÍDO', 'verde'] }[status];
        return `
          <div class="bb-hcard">
            <div class="bb-hcab">
              <div><p class="bb-hserv">${esc(b.service)}</p><p class="bb-cinza">Barbeiro: ${esc(b.barber)}</p></div>
              <span class="bb-selo bb-selo--${selo[1]}">${selo[0]}</span>
            </div>
            <div class="bb-hlinha">${ic(icCalF)}<span>${b.date}</span>${ic(icHora)}<span>${b.time}</span></div>
            ${status === 'confirmado' ? `<button class="bb-btn-borda" data-cancelar="${i}">CANCELAR AGENDAMENTO</button>` : ''}
          </div>`;
      }).join('');
      return `<p class="bb-appbar">Meu Histórico</p>
        <div class="bb-scroll">${lista || '<p class="bb-vazio">Você ainda não tem agendamentos.</p>'}</div>`;
    },

    avisos: () => `<p class="bb-appbar">Avisos</p>
      <div class="bb-scroll">${st.avisos.length ? st.avisos.map((a) => `
        <div class="bb-aviso"><span>${ic(icNotif, 'vermelho')}</span><div><b>${esc(a.titulo)}</b><p>${esc(a.msg)}</p></div></div>`).join('')
        : '<p class="bb-vazio">Nenhum aviso por enquanto.</p>'}</div>`,

    perfil: () => {
      const proximos = st.bookings.filter((b) => b.status === 'confirmado' && new Date(`${b.date}T${b.time}:00`) >= new Date());
      return `<div class="bb-scroll bb-perfil">
        <p class="bb-cinza bb-mini">Perfil</p>
        <p class="bb-nome">Minha Conta 👤</p>
        <div class="bb-pcard">
          <span class="bb-avatar bb-avatar--g">${ic(icPessoa)}<i>${ic(icCamera)}</i></span>
          <div><b>${esc(st.nome)}</b><p class="bb-cinza">${esc(st.email)}</p></div>
          <button class="bb-ico" data-acao="editar">${ic(icEditar)}</button>
        </div>
        <p class="bb-secao bb-secao--p">Próximos Agendamentos</p>
        ${proximos.length ? proximos.map((b) => `
          <div class="bb-prox">${ic(icCutR, 'vermelho')}<div><b>${esc(b.service)}</b><p class="bb-cinza">${b.date} · ${b.time} · ${esc(b.barber)}</p></div><span class="bb-selo bb-selo--verde">Confirmado</span></div>`).join('')
          : '<p class="bb-vazio bb-vazio--e">Nenhum agendamento futuro.</p>'}
        <p class="bb-secao bb-secao--p">Configurações</p>
        <div class="bb-lista">
          <button data-aba="1">${ic(icHistR, 'vermelho')}<span>Ver Histórico de Cortes</span>${ic(icSeta)}</button>
          <button data-aba="2">${ic(icNotifR, 'vermelho')}<span>Minhas Notificações</span>${ic(icSeta)}</button>
          <button data-acao="sair-dlg">${ic(icSair, 'vermelho')}<span>Sair da Conta</span>${ic(icSeta)}</button>
        </div>
        <p class="bb-secao bb-secao--p">A Barbearia</p>
        <div class="bb-loja">
          <div class="bb-loja-cab">${ic(icCut, 'vermelho')}<div><b>BARBÚ</b><p class="bb-cinza">Barbearia Premium</p></div></div>
          <div class="bb-info">${ic(icLocal, 'vermelho')}<div><b>Endereço</b><p>Rua das Tesouras, 123 — Centro<br>Sua Cidade - SP, CEP 00000-000</p></div></div>
          <div class="bb-info">${ic(icHoraR, 'vermelho')}<div><b>Horário de Funcionamento</b><p>Seg – Sex: 09h às 19h<br>Sábado: 09h às 17h<br>Domingo: Fechado</p></div></div>
          <div class="bb-info">${ic(icChat, 'vermelho')}<div><b>WhatsApp</b><p>(11) 9 9999-9999</p></div></div>
          <div class="bb-info">${ic(icCamera, 'vermelho')}<div><b>Instagram</b><p>@barbu.barbearia</p></div></div>
        </div>
      </div>`;
    },

    reserva: () => {
      const passos = [0, 1, 2].map((i) => `<i class="${st.passo >= i ? 'on' : ''} ${st.passo === i ? 'atual' : ''}"></i>`).join('');
      let corpo = '';
      if (st.passo === 0) {
        corpo = SERVICOS.map((s) => `
          <button class="bb-sel ${st.servico === s.name ? 'on' : ''}" data-servico="${s.name}">
            ${ic(s.icon, 'mi--30')}<span><b>${s.name}</b><small>${s.price}</small></span>${st.servico === s.name ? ic(icCheck) : ''}
          </button>`).join('');
      } else if (st.passo === 1) {
        corpo = BARBEIROS.map((b) => `
          <button class="bb-barb ${st.barbeiro === b ? 'on' : ''}" data-barbeiro="${b}">
            <span class="bb-ini">${b[0]}</span><b>${b}</b>${ic(st.barbeiro === b ? icRadioOn : icRadioOff, st.barbeiro === b ? 'vermelho' : 'apagado')}
          </button>`).join('');
      } else {
        const dia = diaMais(st.dia);
        const data = iso(dia);
        const meus = st.bookings.filter((b) => b.barber === st.barbeiro && b.date === data && b.status !== 'cancelado').map((b) => b.time);
        // Do dia: só o que cabe no funcionamento; ocupados somem; os que já passaram ficam riscados
        const doDia = HORARIOS.filter((h) => noFuncionamento(dia, h) && !meus.includes(h) && !ocupadoPorOutros(st.barbeiro, data, h));
        const livres = doDia.filter((h) => !passou(dia, h));
        corpo = `
          <p class="bb-rot">Selecione o dia</p>
          <div class="bb-dias">${Array.from({ length: 14 }, (_, i) => {
            const d = diaMais(i);
            return fechado(d)
              ? `<button class="fechado" disabled title="Fechado"><b>${d.getDate()}</b><small>Fechado</small></button>`
              : `<button class="${st.dia === i ? 'on' : ''}" data-dia="${i}"><b>${d.getDate()}</b><small>${DIAS_SEMANA[d.getDay()]}</small></button>`;
          }).join('')}</div>
          <p class="bb-rot bb-rot--m">Horários disponíveis</p>
          ${st.carregando ? '<div class="bb-spin"></div>' : `
            ${doDia.length ? `<div class="bb-horas">${doDia.map((h) => passou(dia, h)
              ? `<button class="passou" disabled title="Horário já passou">${h}</button>`
              : `<button class="${st.hora === h ? 'on' : ''}" data-hora="${h}">${h}</button>`).join('')}</div>` : ''}
            ${livres.length ? '' : `<p class="bb-vazio">${st.dia === 0 && doDia.length ? 'Os horários de hoje já passaram. Escolha outro dia.' : 'Nenhum horário livre neste dia 😕'}</p>`}`}`;
      }
      const pode = (st.passo === 0 && st.servico) || (st.passo === 1 && st.barbeiro) || (st.passo === 2 && st.hora);
      return `
        <div class="bb-topo"><button data-acao="sair-reserva">${ic(icVoltar)}</button><b>Reserva</b></div>
        <div class="bb-passos">${passos}</div>
        <div class="bb-scroll bb-passo">${corpo}</div>
        <div class="bb-controle"><button class="bb-btn ${pode ? '' : 'off'}" data-acao="proximo" ${pode && !st.salvando ? '' : 'disabled'}>${st.salvando ? '<span class="bb-spin bb-spin--b"></span>' : st.passo === 2 ? 'CONFIRMAR' : 'PRÓXIMO'}</button></div>`;
    },

    fidelidade: () => `
      <div class="bb-topo"><button data-ir="principal">${ic(icVoltar)}</button><b>Fidelidade</b></div>
      <div class="bb-scroll">
        <div class="bb-fcard">
          <p class="bb-nome">Clube Barbú ⭐</p>
          <p class="bb-cinza">Você está quase lá!</p>
          <div class="bb-barra"><i style="width:70%"></i></div>
          <div class="bb-fl"><span>7 de 10 cortes</span><span>Faltam 3</span></div>
        </div>
        <div class="bb-selos">${Array.from({ length: 10 }, (_, i) => `<span class="${i < 7 ? 'on' : ''}">${ic(i < 7 ? icCut : icEstrelaV)}</span>`).join('')}</div>
        <div class="bb-premio">${ic(icPresente, 'vermelho')}<p>Complete 10 cortes e ganhe um por nossa conta.</p></div>
      </div>`,

    produtos: () => `
      <div class="bb-topo"><button data-ir="principal">${ic(icVoltar)}</button><b>Loja</b></div>
      <div class="bb-scroll">
        <p class="bb-nome bb-nome--p">Produtos Premium 🧴</p>
        <div class="bb-prods">${PRODUTOS.map(([n, p, d]) => `
          <div class="bb-prod"><div class="bb-prod-img">${ic(icCaixa, 'mi--40 vermelho-claro')}</div>
            <b>${n}</b><small>${d}</small><div class="bb-prod-pe"><span>${p}</span><button data-add="${n}">${ic(icMais)}</button></div></div>`).join('')}</div>
      </div>`,
  };
}

const ABAS = ['inicio', 'historico', 'avisos', 'perfil'];
const barraNav = (aba) => `
  <nav class="bb-nav">${[[icHome, 'Início'], [icHist, 'Histórico'], [icNotif, 'Avisos'], [icPessoaO, 'Perfil']].map(([i, n], k) => `
    <button class="${aba === k ? 'on' : ''}" data-aba="${k}"><span>${ic(i)}</span><small>${n}</small></button>`).join('')}</nav>`;

// Vitrine do topo do case: três celulares parados com telas reais (login, início e reserva)
export function vitrineBarbu() {
  const st = {
    tela: 'principal', aba: 0, nome: 'Visitante', email: 'visitante@barbu.app', uid: '',
    passo: 2, servico: 'Corte de Cabelo', barbeiro: 'Felipe', dia: 0, hora: null, salvando: false, carregando: false,
    bookings: [], avisos: [],
  };
  const telas = fazerTelas(st);
  // Reserva: o próximo dia aberto depois de hoje, com o primeiro horário livre marcado
  st.dia = primeiroDiaAberto() + 1;
  while (fechado(diaMais(st.dia))) st.dia++;
  const dia = diaMais(st.dia), data = iso(dia);
  st.hora = HORARIOS.find((h) => noFuncionamento(dia, h) && !ocupadoPorOutros(st.barbeiro, data, h)) ?? null;
  const fone = (cls, miolo) => `
    <div class="bbv__fone bbx__fone ${cls}" aria-hidden="true">
      <div class="bbx__status"><span>9:41</span><span class="bbx__ilha"></span><span class="bbx__icones">▲ ◼</span></div>
      <div class="bbx__app">${miolo}</div>
    </div>`;
  return `
    <div class="bbv" inert>
      ${fone('bbv__fone--esq', `<div class="bb-tela">${telas.login()}</div>`)}
      ${fone('bbv__fone--dir', `<div class="bb-tela">${telas.reserva()}</div>`)}
      ${fone('bbv__fone--meio', `<div class="bb-tela">${telas.inicio()}</div>${barraNav(0)}`)}
    </div>`;
}

// Escala os celulares da vitrine para caberem no quadro (sem mexer no tamanho do quadro)
export function ajustarVitrine(raiz) {
  const v = raiz?.querySelector('.bbv');
  if (!v) return;
  const medir = () => {
    const k = Math.min((v.clientHeight * 0.84) / 700, v.clientWidth / (340 * 2.9));
    v.style.setProperty('--k', k.toFixed(4));
  };
  medir();
  const ro = new ResizeObserver(medir);
  ro.observe(v);
}

export function renderBarbu(idioma) {
  const l = (o) => o[idioma] ?? o.pt;
  // O mesmo app nos dois aparelhos; no notebook ele aparece como site (Flutter Web), sem barra de status
  const app = (aparelho) => `
      <div class="bbx__notif" data-notif></div>
      <div class="bbx__app" data-app></div>
      <div class="bbx__dialogo" data-dialogo></div>
      <div class="bbx__snack" data-snack></div>`;
  const web = `
    <div class="bbw">
      <div class="bbw__app"><div class="bbx__fone bbx__fone--web" data-aparelho="nb" data-lenis-prevent>${app('nb')}</div></div>
      <aside class="bbw__bast" data-lenis-prevent>
        <p class="bbw__t">${l(T.bastidores)}</p>
        <p class="bbw__s">${l(T.bastSub)}</p>
        <div class="bbx__eventos" data-eventos><p class="bbx__vazio">${l(T.bastVazio)}</p></div>
      </aside>
    </div>`;
  const cel = `
    <div class="bbx__fone" data-aparelho="cel" data-lenis-prevent>
      <div class="bbx__status"><span data-relogio></span><span class="bbx__ilha"></span><span class="bbx__icones">▲ ◼</span></div>
      ${app('cel')}
    </div>`;
  return `
    <p class="time__aviso mono">${l(T.aviso)}</p>
    ${palco({ idioma, nb: notebook({ url: 'barbu.app', escala: false, conteudo: web }), cel })}
    <details class="bbx__igual">
      <summary>${l(T.igualT)}</summary>
      <p>${l(T.igual)}</p>
      <p>${l(T.simulado)}</p>
    </details>`;
}

export function ligarBarbu(raiz, idioma, som) {
  const l = (o) => o[idioma] ?? o.pt;
  // Notebook e celular espelhados: cada um tem app, diálogo, aviso e notificação próprios
  const aparelhos = [...raiz.querySelectorAll('.bbx__fone[data-aparelho]')].map((f) => ({
    tipo: f.dataset.aparelho, app: f.querySelector('[data-app]'), dialogo: f.querySelector('[data-dialogo]'),
    snack: f.querySelector('[data-snack]'), notif: f.querySelector('[data-notif]'),
  }));
  const eventos = raiz.querySelector('[data-eventos]');
  const bip = (f = 900) => som?.(f, 0.05, 0.025);

  const st = {
    idioma, tela: 'splash', aba: 0, nome: 'Cliente', email: 'visitante@barbu.app', uid: id20().slice(0, 28),
    passo: 0, servico: null, barbeiro: null, dia: primeiroDiaAberto(), hora: null, salvando: false,
    bookings: [], avisos: [], ultimo: null,
  };

  // Relógio da barra de status
  const relogio = raiz.querySelector('[data-relogio]');
  const tick = () => (relogio.textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  tick();
  const timer = setInterval(() => { if (!document.body.contains(raiz)) return clearInterval(timer); tick(); }, 15000);

  function mostrarSnack(txt, cor = '#323232') {
    for (const { snack } of aparelhos) {
      snack.textContent = txt;
      snack.style.background = cor;
      snack.classList.add('on');
      clearTimeout(snack._t);
      snack._t = setTimeout(() => snack.classList.remove('on'), 2600);
    }
  }
  function abrirDialogo(html) { for (const { dialogo } of aparelhos) { dialogo.innerHTML = `<div class="bbx__dlg">${html}</div>`; dialogo.classList.add('on'); } }
  function fecharDialogo() { for (const { dialogo } of aparelhos) dialogo.classList.remove('on'); }

  // ---------- Bastidores ----------
  function evento(titulo, corpo, extra = '') {
    if (eventos.querySelector('.bbx__vazio')) eventos.innerHTML = '';
    const el = document.createElement('div');
    el.className = 'bbx__ev';
    el.innerHTML = `<p class="bbx__ev-t mono">${titulo}</p>${corpo}${extra}`;
    eventos.prepend(el);
    while (eventos.children.length > 6) eventos.lastChild.remove();
    return el;
  }
  const json = (o) => `<pre class="bbx__json mono">${esc(JSON.stringify(o, null, 2))
    .replace(/&quot;([^&]+)&quot;:/g, '<i>"$1"</i>:')
    .replace(/: &quot;([^&]*)&quot;/g, ': <s>"$1"</s>')}</pre>`;

  // ---------- Telas ----------
  const telas = fazerTelas(st);
  const barra = () => barraNav(st.aba);

  // Áreas que rolam dentro de uma tela: ao redesenhar a MESMA tela, a rolagem continua onde estava
  const ROLAVEIS = ['.bb-scroll', '.bb-login', '.bb-inicio', '.bb-dias'];
  let navegando = false, ultimoPasso = -1;
  function render() {
    // Trocar de etapa na reserva desliza só o conteúdo da etapa, uma vez (não a tela inteira)
    const mudouPasso = st.tela === 'reserva' && st.passo !== ultimoPasso;
    ultimoPasso = st.tela === 'reserva' ? st.passo : -1;
    const principal = st.tela === 'principal';
    const html = principal ? `<div class="bb-tela">${telas[ABAS[st.aba]]()}</div>${barra()}` : `<div class="bb-tela">${telas[st.tela]()}</div>`;
    for (const { app } of aparelhos) {
      // Escolher algo na mesma tela não é trocar de página: sem a animação de entrada (era ela que piscava)
      if (!navegando) app.classList.remove('entra');
      app.classList.toggle('passo', mudouPasso && !navegando);
      const rolagem = navegando ? null : ROLAVEIS.map((sel) => { const el = app.querySelector(sel); return el && [el.scrollTop, el.scrollLeft]; });
      app.innerHTML = html;
      rolagem?.forEach((r, i) => {
        const el = r && app.querySelector(ROLAVEIS[i]);
        if (el) { el.scrollTop = r[0]; el.scrollLeft = r[1]; }
      });
    }
  }
  function ir(tela) {
    st.tela = tela;
    for (const { app } of aparelhos) {
      app.classList.remove('entra');
      void app.offsetWidth;
      app.classList.add('entra');
    }
    navegando = true;
    render();
    navegando = false;
  }

  async function carregarHorarios() {
    st.hora = null;
    st.carregando = true;
    render();
    await new Promise((r) => setTimeout(r, 450));
    st.carregando = false;
    render();
  }

  function entrar(nome) {
    st.nome = nome || 'Cliente';
    st.aba = 0;
    ir('principal');
  }

  async function confirmar() {
    // A tela pode ter ficado aberta e o horário passado enquanto isso
    if (passou(diaMais(st.dia), st.hora)) {
      st.hora = null;
      render();
      return mostrarSnack('Esse horário já passou. Escolha outro.', '#D32F2F');
    }
    st.salvando = true;
    render();
    await new Promise((r) => setTimeout(r, 700));
    const data = iso(diaMais(st.dia));
    const doc = { userId: st.uid, service: st.servico, barber: st.barbeiro, date: data, time: st.hora, status: 'confirmado', createdAt: 'serverTimestamp()' };
    const docId = id20();
    st.bookings.unshift({ ...doc, id: docId });
    const aviso = { type: 'booking', titulo: 'Agendamento Confirmado! ✂️', msg: `${st.servico} com ${st.barbeiro} em ${data} às ${st.hora}.`, lida: false, createdAt: 'serverTimestamp()' };
    st.avisos.unshift(aviso);
    const [hh, mm] = st.hora.split(':').map(Number);
    const quando = diaMais(st.dia); quando.setHours(hh - 1, mm, 0, 0);
    const payload = { userName: st.nome, userEmail: st.email, date: data, time: st.hora, barber: st.barbeiro, service: st.servico };

    evento(`POST n8n /webhook/… · 200`, json(payload), '').classList.add('bbx__ev--n8n');
    const ev = evento(l(T.lembrete), `<p class="bbx__lem">⏰ ${quando.toLocaleDateString('pt-BR')} ${String(quando.getHours()).padStart(2, '0')}:${String(mm).padStart(2, '0')} · ${l(T.lembreteTxt)}</p>`,
      `<button class="mini" type="button">${l(T.previa)}</button>`);
    ev.querySelector('button').addEventListener('click', () => previaLembrete(st.servico, st.barbeiro, st.hora));
    evento(`Firestore · notifications/${st.uid.slice(0, 6)}…/items`, json(aviso));
    evento(`Firestore · bookings/${docId}`, json(doc)).classList.add('bbx__ev--novo');
    bip(1300);

    st.salvando = false;
    render();
    abrirDialogo(`
      ${ic(icCheckO, 'mi--80 vermelho')}
      <b>Agendado!</b>
      <p>Seu horário com ${esc(st.barbeiro)} foi reservado com sucesso.</p>
      <button class="bb-btn bb-btn--peq" data-acao="voltar-inicio">Voltar para Início</button>`);
  }

  function previaLembrete(servico, barbeiro, hora) {
    const notif = aparelhos.find((a) => a.tipo === 'cel')?.notif;
    if (!notif) return;
    notif.innerHTML = `<span class="bbx__notif-app">${ic(icCut, 'vermelho')} Barbú · agora</span><b>Lembrete de agendamento ✂️</b><span>${esc(servico)} com ${esc(barbeiro)} às ${hora}. Faltam 60 minutos.</span>`;
    notif.classList.add('on');
    bip(1600);
    clearTimeout(notif._t);
    notif._t = setTimeout(() => notif.classList.remove('on'), 4500);
  }

  // A roda do mouse na fileira de dias rola de lado (no celular é o dedo que arrasta)
  raiz.addEventListener('wheel', (e) => {
    const fila = e.target.closest('.bb-dias');
    if (!fila || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    const max = fila.scrollWidth - fila.clientWidth;
    if ((e.deltaY > 0 && fila.scrollLeft >= max) || (e.deltaY < 0 && fila.scrollLeft <= 0)) return;
    e.preventDefault();
    fila.scrollLeft += e.deltaY;
  }, { passive: false });

  // ---------- Cliques ----------
  raiz.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || b.disabled || !raiz.contains(b) || b.closest('.bbx__bast, .bbw__bast, .dv__abas')) return;
    bip(1000 + Math.random() * 200);
    const d = b.dataset;
    if (d.ir) {
      if (d.ir === 'reserva') { st.passo = 0; st.servico = st.barbeiro = st.hora = null; st.dia = primeiroDiaAberto(); }
      return ir(d.ir);
    }
    if (d.aba) { st.aba = Number(d.aba); return ir('principal'); }
    if (d.servico) { st.servico = d.servico; return render(); }
    if (d.barbeiro) { st.barbeiro = d.barbeiro; return render(); }
    if (d.dia) { st.dia = Number(d.dia); return carregarHorarios(); }
    if (d.hora) { st.hora = d.hora; return render(); }
    if (d.add) return mostrarSnack(`${d.add} adicionado!`);
    if (d.cancelar) {
      const bk = st.bookings[Number(d.cancelar)];
      bk.status = 'cancelado';
      evento(`Firestore · bookings/${bk.id} · update`, json({ status: 'cancelado' })).classList.add('bbx__ev--cancel');
      mostrarSnack('Agendamento cancelado.');
      return render();
    }
    switch (d.acao) {
      case 'entrar': {
        const email = raiz.querySelector('[data-email]')?.value.trim();
        if (email) st.email = email;
        return entrar(email ? email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Cliente');
      }
      case 'visitante': st.email = 'visitante@barbu.app'; return entrar(idioma === 'pt' ? 'Visitante' : 'Visitor');
      case 'cadastrar': return entrar(raiz.querySelector('[data-nome-cad]')?.value.trim() || 'Cliente');
      case 'esqueci':
        return abrirDialogo(`
          <b class="bb-dlg-t">Recuperar Senha</b>
          <p>Digite seu e-mail cadastrado. Enviaremos um link seguro para você criar uma nova senha.</p>
          <label class="bb-campo">${ic(icEmail, 'vermelho')}<input placeholder="E-mail" /></label>
          <div class="bb-dlg-acoes"><button class="bb-link" data-acao="fechar">CANCELAR</button><button class="bb-btn bb-btn--peq" data-acao="enviar-link">ENVIAR LINK</button></div>`);
      case 'enviar-link': fecharDialogo(); return mostrarSnack('Link de recuperação enviado! Verifique seu e-mail.', '#2e7d32');
      case 'fechar': return fecharDialogo();
      case 'sair-dlg':
        return abrirDialogo(`
          <b class="bb-dlg-t">Sair da conta</b>
          <p>Tem certeza que deseja desconectar da sua conta?</p>
          <div class="bb-dlg-acoes"><button class="bb-link" data-acao="fechar">CANCELAR</button><button class="bb-btn bb-btn--peq" data-acao="sair">SAIR</button></div>`);
      case 'sair': fecharDialogo(); return ir('login');
      case 'editar': return mostrarSnack('Edição de perfil em breve!');
      case 'sair-reserva': return ir('principal');
      case 'voltar-inicio': fecharDialogo(); st.aba = 0; return ir('principal');
      case 'proximo':
        if (st.passo < 2) { st.passo++; if (st.passo === 2) return carregarHorarios(); return render(); }
        return confirmar();
    }
  });
  for (const { dialogo } of aparelhos) dialogo.addEventListener('click', (e) => { if (e.target === dialogo) fecharDialogo(); });

  // O que se digita num aparelho aparece no outro (os campos são os mesmos nas duas telas)
  raiz.addEventListener('input', (e) => {
    const campo = e.target.closest('[data-email], [data-senha], [data-nome-cad]');
    if (!campo) return;
    const chave = ['data-email', 'data-senha', 'data-nome-cad'].find((a) => campo.hasAttribute(a));
    raiz.querySelectorAll(`[${chave}]`).forEach((c) => { if (c !== campo) c.value = campo.value; });
  });

  // Splash de 3 s como no app (aqui 1,6 s), depois o login
  render();
  setTimeout(() => ir('login'), 1600);
}
