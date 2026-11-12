# </CHM> · portfólio

Meu portfólio pessoal. Sou engenheiro de IA na Controller Automotive e desenvolvedor full-stack, e estou me
formando em Engenharia de Software. Quis um site que mostrasse o que eu faço de verdade: sistemas completos,
do back-end à interface, com IA e automação onde fazem diferença, e não só uma lista de tecnologias.

Fiz tudo sem framework, só com Vite, Three.js e GSAP. A ideia era ter liberdade total na animação e manter o
site leve.

## O que tem aqui

- **Robô 3D no topo.** Ele acorda na tela de carregamento, segue o cursor, pisca e fala quando você clica nele.
- **Teclado 3D nas stacks.** Cada tecla é uma tecnologia que eu uso. Dá pra apertar, arrastar ou digitar no
  seu teclado. Embaixo tem o catálogo completo, separado por área.
- **Cases com demo de verdade:**
  - **CEPFlow** roda o front real dentro de um celular, chamando a API no ar (e o Swagger numa aba ao lado).
  - **Barbú** é o app de agendamento em Flutter recriado pro navegador, com um painel mostrando o que ele grava
    no Firestore e o webhook que manda pro n8n.
  - **Time de agentes** tem uma simulação do planejador e dos agentes trabalhando.
  - **LibrasFlow**, meu TCC, abre a demo pública de reconhecimento de Libras.
- **Como eu trabalho**, desenhado como um fluxo no estilo n8n. Dá pra arrastar os nós e executar o fluxo.
- Planeta em pontos no contato, aurora no fundo que muda de cor por seção, tema claro e escuro, PT e EN.
- Funciona bem no celular: menu de tela cheia, teclado ajustado e o fluxo fica na vertical.

E tem um segredo. Se não achar, olha o rodapé.

## Rodando local

Precisa de Node 22.

```bash
npm install
npm run dev      # abre em http://localhost:5173
npm run build    # gera a pasta dist/
npm run preview  # serve o build pra conferir
```

## Onde fica cada coisa

| O quê | Arquivo |
|---|---|
| Meus contatos (e-mail, WhatsApp, LinkedIn, GitHub) | `src/config.js` |
| Textos em PT/EN, projetos e carreira | `src/conteudo.js` |
| Página, rotas e animações | `src/main.js` |
| Tela de carregamento | `src/carga.js` |
| Robô e planeta | `src/robo.js`, `src/globo.js` |
| Teclado 3D e catálogo de stacks | `src/teclado3d.js`, `src/catalogo.js` |
| Fundo (aurora e constelação) | `src/fundo.js` |
| Fluxo do "Como eu trabalho" | `src/fluxo.js` |
| Demo do Barbú e do time de agentes | `src/barbu.js`, `src/demos.js` |
| Estilos | `src/estilo*.css` (as cores ficam em `:root`, no `estilo.css`) |

As rotas são `/` e `/trabalhos/<projeto>`. O `public/_redirects` faz qualquer rota abrir o `index.html`.

## Créditos

- O **LibrasFlow** foi meu TCC no IFSP, feito em dupla com o Gustavo Alves.
- O **Ultron**, que aparece no case do time de agentes, é um projeto do Vitor. Eu uso um fork dele.
- Ícones: [Simple Icons](https://simpleicons.org), [Devicon](https://devicon.dev) e
  [Material Design Icons](https://fonts.google.com/icons).
- Fontes: Instrument Serif, Geist e Geist Mono.

Fique à vontade pra olhar o código e se inspirar. Só peço que não copie os textos, a foto e os projetos, que
são meus.

---

Carlos Henrique Moreira · [LinkedIn](https://www.linkedin.com/in/carlos-henrique-moreira-gon%C3%A7alves-b2720b323/) · [GitHub](https://github.com/ChMoreiraa)
