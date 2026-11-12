// Teclado 3D da seção Stacks: teclas coloridas com o logo de cada tecnologia, em perspectiva.
// Hover/toque afunda a tecla, arrastar gira o teclado, letras do teclado físico apertam as teclas.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import {
  siOpenjdk, siSpring, siPostgresql, siPython, siFastapi, siFlyway, siHibernate, siPytest, siClaude, siModelcontextprotocol, siOpencv, siMediapipe, siScikitlearn, siJupyter, siReact, siTypescript, siJavascript, siVite, siThreedotjs, siGsap, siTailwindcss, siFlutter, siDocker, siGithubactions, siGit, siNodedotjs, siN8n, siSupabase, siFirebase,
} from 'simple-icons';

// Logo monocromático (simple-icons) de cada tecla. Sem logo, usa o texto.
const LOGO = {
  Java: siOpenjdk, Spring: siSpring, PostgreSQL: siPostgresql, Python: siPython, FastAPI: siFastapi,
  Flyway: siFlyway, Hibernate: siHibernate, Pytest: siPytest, Claude: siClaude, MCP: siModelcontextprotocol,
  OpenCV: siOpencv, MediaPipe: siMediapipe, 'scikit-learn': siScikitlearn, Jupyter: siJupyter, React: siReact,
  TypeScript: siTypescript, JavaScript: siJavascript, Vite: siVite, 'Three.js': siThreedotjs, GSAP: siGsap,
  Tailwind: siTailwindcss, Flutter: siFlutter, Docker: siDocker, Actions: siGithubactions, Git: siGit,
  'Node.js': siNodedotjs, n8n: siN8n, Supabase: siSupabase, Firebase: siFirebase,
};
const TEXTO = { PowerShell: '>_' };

// Cor da tecla (escolhida para ficar bonita, não só a cor oficial)
const COR = {
  Java: '#E76F00', Spring: '#5FA04E', PostgreSQL: '#336791', Python: '#3776AB', FastAPI: '#05998B', Flyway: '#CC0200',
  Hibernate: '#59666C', Pytest: '#0A9EDC', Claude: '#D97757', MCP: '#1F1D27', OpenCV: '#5C3EE8', MediaPipe: '#0097A7',
  'scikit-learn': '#F7931E', Jupyter: '#F37626', React: '#149ECA', TypeScript: '#3178C6', JavaScript: '#F0C419',
  Vite: '#8B5CF6', 'Three.js': '#E8E6EF', GSAP: '#0AE448', Tailwind: '#06B6D4', Flutter: '#02569B', Docker: '#2496ED',
  Actions: '#2088FF', Git: '#F05032', 'Node.js': '#5FA04E', n8n: '#EA4B71', PowerShell: '#2671BE', Supabase: '#3ECF8E', Firebase: '#FFA000',
};

function claro(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.62;
}

function texturaLogo(nome, corTinta) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const logo = LOGO[nome];
  if (!logo) {
    g.fillStyle = corTinta;
    g.font = '700 120px "Geist Mono", monospace';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(TEXTO[nome] ?? nome.slice(0, 2), 128, 132);
    tex.needsUpdate = true;
    return tex;
  }
  const img = new Image();
  img.onload = () => { g.drawImage(img, 40, 40, 176, 176); tex.needsUpdate = true; };
  img.src = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${corTinta}" d="${logo.path}"/></svg>`)}`;
  return tex;
}

export function criarTeclado3d({ canvas, teclas, reduzido, aoFocar }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch {
    return null;
  }
  // Celular e tablet: menos pixels e sombra mais simples (o teclado continua 3D, só pesa menos)
  const leve = matchMedia('(max-width: 860px), (pointer: coarse)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, leve ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = leve ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;

  const cena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  cena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  cena.environmentIntensity = 0.45;

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 11, 10);
  camera.lookAt(0, -0.3, 0);

  const sol = new THREE.DirectionalLight('#ffffff', 2.6);
  sol.position.set(-4, 10, 5);
  sol.castShadow = true;
  sol.shadow.mapSize.set(leve ? 512 : 1024, leve ? 512 : 1024);
  Object.assign(sol.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 });
  sol.shadow.radius = 4;
  sol.shadow.bias = -0.0005;
  const recorte = new THREE.DirectionalLight('#A78BFA', 1.8);
  recorte.position.set(6, 3, -6);
  cena.add(sol, recorte, new THREE.HemisphereLight('#ffffff', '#2a2340', 0.25));

  const mundo = new THREE.Group();
  cena.add(mundo);
  const placa = new THREE.Group();
  placa.rotation.y = -0.62;
  mundo.add(placa);

  // Disposição: 5 fileiras de 6, com deslocamento como num teclado de verdade
  const COLS = 6, PASSO = 1.12;
  const linhas = Math.ceil(teclas.length / COLS);
  const largura = COLS * PASSO + 0.7, profundidade = linhas * PASSO + 0.5;

  const baseMat = new THREE.MeshPhysicalMaterial({ color: '#16141d', roughness: 0.55, metalness: 0.4, clearcoat: 0.4 });
  const base = new THREE.Mesh(new RoundedBoxGeometry(largura + 0.5, 0.4, profundidade, 6, 0.18), baseMat);
  base.position.set(0.25, -0.38, 0);
  base.receiveShadow = true;
  base.castShadow = true;
  placa.add(base);

  const chao = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.35 }));
  chao.rotation.x = -Math.PI / 2;
  chao.position.y = -0.6;
  chao.receiveShadow = true;
  cena.add(chao);

  const corpoGeo = new RoundedBoxGeometry(0.96, 0.52, 0.96, 6, 0.16);
  const topoGeo = new THREE.PlaneGeometry(0.56, 0.56);
  const corpos = []; // caixas invisíveis e paradas, só para o mouse (a tecla que afunda não foge do cursor)
  const alvoGeo = new THREE.BoxGeometry(1.0, 0.7, 1.0);
  const alvoMat = new THREE.MeshBasicMaterial({ visible: false });
  const lista = teclas.map((k, i) => {
    const r = Math.floor(i / COLS), c = i % COLS;
    const cor = COR[k.nome] ?? k.cor ?? '#6d4aff';
    const tinta = claro(cor) ? '#17151d' : '#ffffff';
    const g = new THREE.Group();
    g.position.set((c - (COLS - 1) / 2) * PASSO + r * 0.18, 0, (r - (linhas - 1) / 2) * PASSO);
    const mat = new THREE.MeshPhysicalMaterial({ color: cor, roughness: 0.38, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.3, emissive: new THREE.Color(cor), emissiveIntensity: 0 });
    const corpo = new THREE.Mesh(corpoGeo, mat);
    corpo.position.y = 0.26;
    corpo.castShadow = true;
    corpo.receiveShadow = true;
    const topo = new THREE.Mesh(topoGeo, new THREE.MeshBasicMaterial({ map: texturaLogo(k.nome, tinta), transparent: true, toneMapped: false }));
    topo.rotation.x = -Math.PI / 2;
    topo.position.y = 0.525;
    g.add(corpo, topo);
    placa.add(g);
    const alvo = new THREE.Mesh(alvoGeo, alvoMat);
    alvo.position.set(g.position.x, 0.3, g.position.z);
    alvo.userData.indice = i;
    placa.add(alvo);
    corpos.push(alvo);
    return { k, g, mat, y: 0, v: 0, alvo: 0, queda: 0, ate: 0, brilho: 0 };
  });

  // Tamanho: cabe o teclado inteiro
  function redimensionar() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    // O quadro desce `--folga` abaixo da seção: o enquadramento é o da altura base e a sobra embaixo
    // só dá espaço para o canto do teclado quando ele inclina (antes cortava reto na borda)
    const folga = parseFloat(getComputedStyle(canvas).getPropertyValue('--folga')) || 0;
    const base = Math.max(1, h - folga);
    camera.aspect = w / base;
    const larga = w / base >= 1.3;
    // Quadro quase quadrado (celular e tablet em pé): câmera mais perto para o teclado encher a largura
    const z = w / base < 0.9 ? 16 : larga ? 11.6 : 11.3;
    camera.position.set(0, z * 1.05, z);
    camera.lookAt(0, -0.6, 0);
    mundo.position.x = larga ? 1.9 : 0;
    if (folga) camera.setViewOffset(w, base, 0, 0, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(redimensionar);
  ro.observe(canvas);
  redimensionar();

  // Interação
  const ray = new THREE.Raycaster();
  const ponteiro = new THREE.Vector2(9, 9);
  let dentro = false, foco = -1;
  let arrastando = false, moveu = 0, ultX = 0, velRot = 0;
  const mouse = { x: 0, y: 0 }, mouseAlvo = { x: 0, y: 0 };
  canvas.style.touchAction = 'pan-y';

  function pos(e) {
    const r = canvas.getBoundingClientRect();
    ponteiro.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    mouseAlvo.x = ponteiro.x;
    mouseAlvo.y = ponteiro.y;
  }
  canvas.addEventListener('pointerenter', () => (dentro = true));
  canvas.addEventListener('pointerleave', (e) => {
    dentro = false; mouseAlvo.x = mouseAlvo.y = 0;
    // No toque o "sair" vem logo depois de soltar o dedo: apagar o foco aí desfazia a tecla escolhida
    if (e.pointerType === 'mouse') setFoco(-1);
  });
  canvas.addEventListener('pointermove', (e) => {
    dentro = true;
    pos(e);
    if (arrastando) {
      const dx = e.clientX - ultX;
      moveu += Math.abs(dx);
      velRot = dx * 0.006;
      placa.rotation.y += velRot;
      ultX = e.clientX;
    }
  });
  canvas.addEventListener('pointerdown', (e) => {
    pos(e);
    arrastando = true; moveu = 0; ultX = e.clientX;
    canvas.setPointerCapture(e.pointerId);
  });
  // Qual tecla está no ponto do ponteiro, na hora. No toque não existe "passar por cima": o dedo encosta e solta
  // antes de o quadro seguinte procurar a tecla, então o foco ainda estava vazio e o toque não fazia nada.
  function teclaNoPonteiro() {
    ray.setFromCamera(ponteiro, camera);
    const hit = ray.intersectObjects(corpos)[0];
    return hit ? hit.object.userData.indice : -1;
  }
  const soltar = (e) => {
    if (arrastando && moveu < 6) {
      if (e && e.pointerType !== 'mouse') {
        pos(e);
        const i = teclaNoPonteiro();
        if (i >= 0) { setFoco(i); apertar(i, 260, true); }
      } else if (foco >= 0) apertar(foco, 260, true);
    }
    arrastando = false;
  };
  canvas.addEventListener('pointerup', soltar);
  canvas.addEventListener('pointercancel', () => (arrastando = false));

  function setFoco(i) {
    if (i === foco) return;
    foco = i;
    canvas.style.cursor = i >= 0 ? 'pointer' : 'grab';
    aoFocar?.(i >= 0 ? lista[i].k : null, false);
  }

  function apertar(i, ms = 200, clicado = false) {
    const t = lista[i];
    if (!t) return;
    t.ate = performance.now() + ms;
    if (clicado) aoFocar?.(t.k, true);
  }

  // Entrada: as teclas caem uma a uma
  let entrou = false;
  function entrar() {
    if (entrou) return;
    entrou = true;
    if (reduzido) return;
    lista.forEach((t, i) => {
      const r = Math.floor(i / COLS), c = i % COLS;
      t.queda = 7;
      gsap.to(t, { queda: 0, duration: 0.9, ease: 'bounce.out', delay: 0.15 + (r + c) * 0.07 });
    });
    gsap.from(placa.rotation, { y: -1.6, duration: 1.8, ease: 'expo.out' });
  }

  const relogio = new THREE.Clock();
  let visivel = false, rodando = true, proximoToque = 2;

  function quadro() {
    if (!rodando) return;
    requestAnimationFrame(quadro);
    if (!visivel) return;
    const dt = Math.min(relogio.getDelta(), 0.05);
    const t = relogio.elapsedTime;
    const agora = performance.now();

    mouse.x += (mouseAlvo.x - mouse.x) * Math.min(1, dt * 3);
    mouse.y += (mouseAlvo.y - mouse.y) * Math.min(1, dt * 3);
    mundo.rotation.x = -mouse.y * 0.08;
    mundo.rotation.z = mouse.x * 0.04;
    mundo.position.y = reduzido ? 0 : Math.sin(t * 1.1) * 0.08;
    if (!arrastando) {
      placa.rotation.y += velRot;
      velRot *= 0.93;
      // volta devagar para o ângulo bonito
      placa.rotation.y += (-0.62 - placa.rotation.y) * Math.min(1, dt * 0.6) * (Math.abs(velRot) < 0.002 ? 1 : 0);
    }

    if (dentro && !arrastando) {
      ray.setFromCamera(ponteiro, camera);
      const hit = ray.intersectObjects(corpos)[0];
      setFoco(hit ? hit.object.userData.indice : -1);
    }

    // De vez em quando "alguém digita"
    if (!reduzido && t > proximoToque && foco < 0) {
      apertar(Math.floor(Math.random() * lista.length), 170);
      proximoToque = t + 0.9 + Math.random() * 1.4;
    }

    lista.forEach((k, i) => {
      const apertada = i === foco || agora < k.ate;
      k.alvo = apertada ? -0.17 : 0;
      // mola
      const a = (k.alvo - k.y) * 320 - k.v * 22;
      k.v += a * dt;
      k.y += k.v * dt;
      k.brilho += ((apertada ? 1 : 0) - k.brilho) * Math.min(1, dt * 10);
      k.mat.emissiveIntensity = k.brilho * 0.35;
      k.g.position.y = k.y + k.queda;
    });

    renderer.render(cena, camera);
  }
  requestAnimationFrame(quadro);

  const io = new IntersectionObserver(([e]) => {
    visivel = e.isIntersecting;
    relogio.getDelta();
    if (visivel && e.intersectionRatio > 0.25) entrar();
  }, { threshold: [0, 0.25] });
  io.observe(canvas);

  return {
    apertarLetra(letra) {
      const alvos = lista.map((k, i) => (k.k.nome.toLowerCase().startsWith(letra) ? i : -1)).filter((i) => i >= 0);
      alvos.forEach((i) => apertar(i, 260));
      if (alvos.length) aoFocar?.(lista[alvos[0]].k, true);
      return alvos.length > 0;
    },
    setTema(tema) {
      baseMat.color.set(tema === 'dark' ? '#16141d' : '#d9d4ca');
      chao.material.opacity = tema === 'dark' ? 0.35 : 0.18;
    },
    destruir() { rodando = false; ro.disconnect(); io.disconnect(); renderer.dispose(); },
  };
}
