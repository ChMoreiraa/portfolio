// Dados pessoais do portfólio. Edite aqui: o resto do site lê deste arquivo.
export const perfil = {
  nome: 'Carlos Henrique Moreira',
  email: 'ch.moreiragoncalves26@gmail.com',
  // Só dígitos, com DDI e DDD. Ex.: '5512999999999'. Vazio esconde o botão.
  whatsapp: '5512981552453',
  linkedin: 'https://www.linkedin.com/in/carlos-henrique-moreira-gon%C3%A7alves-b2720b323/',
  github: 'https://github.com/ChMoreiraa',
  // Coloque a foto em public/foto.png (PNG com fundo transparente, de preferência). Sem o arquivo, aparece o monograma.
  foto: '/foto.png',
  cidade: 'São José dos Campos · SP',
  // Como o formulário de contato envia:
  //  'mailto'    → abre o app de e-mail da pessoa com a mensagem pronta (padrão, sem serviço)
  //  'netlify'   → Netlify Forms (ative "Form detection" no painel da Netlify)
  //  'formspree' → Formspree; ponha o ID do formulário em formspreeId
  formulario: { modo: 'mailto', formspreeId: '' },
  fuso: 'America/Sao_Paulo',
};
