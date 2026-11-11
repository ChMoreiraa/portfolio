# Portfólio · Carlos Henrique Moreira

Editorial, escuro com roxo. Robô 3D no topo (olha o cursor, pisca, acena e fala no clique), trabalhos em grade
bento que viram página de case com transição, processo, sobre e um planeta em pontos no contato que dá para girar.
PT/EN, tema claro/escuro, som ambiente e um domínio escondido.

Stack: Vite, Three.js, GSAP (ScrollTrigger, SplitText), Lenis, world-atlas. Sem framework.

## Rodar

```powershell
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/
```

## Onde editar

| O quê | Arquivo |
|---|---|
| E-mail, WhatsApp, LinkedIn, GitHub | `src/config.js` |
| Foto | `public/foto.jpg` (retrato 4:5; sem ela aparece o monograma) |
| Projetos, cases e todos os textos PT/EN | `src/conteudo.js` |
| Ilustrações dos cards | `src/visuais.js` |
| Robô | `src/robo.js` |
| Planeta | `src/globo.js` |
| Visual | `src/estilo.css` (cores no topo, em `:root`) |

Imagens reais ficam em `public/img/` (LibrasFlow e Ultron vêm dos repositórios; CEPFlow é print da API no ar).
Os projetos de repositório privado usam ilustrações em HTML, marcadas como "Ilustração".

## Rotas

`/` e `/trabalhos/<id>` (ombuds, agentes, libras, verocar, cepflow, barbu). O `public/_redirects` faz a Netlify
servir o `index.html` em qualquer rota.

## Publicar na Netlify

O `netlify.toml` já diz tudo: build `npm run build`, pasta `dist`.

- **Pelo GitHub:** suba o repositório e, na Netlify, faça *Add new site → Import from Git*. Cada push publica sozinho.
- **Sem GitHub:** rode `npm run build` e arraste a pasta `dist` em app.netlify.com/drop.

## Easter eggs

- Clique no robô (ele tem várias falas).
- Digite `ryoiki` na página (ou clique no `r·y·o·i·k·i` do rodapé).
- Abra o console.
