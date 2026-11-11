// Robô 3D do topo: olha para o cursor, pisca, flutua, acena e fala quando clicado.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';

const COR_OLHO = new THREE.Color('#C9BBFF');
const COR_OURO = new THREE.Color('#F5C95A');

function texturaRadial(interno = 'rgba(255,255,255,1)', externo = 'rgba(255,255,255,0)') {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, interno);
  grad.addColorStop(1, externo);
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function criarRobo({ canvas, reduzido, aoPassar, aoClicar }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const cena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  cena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
  camera.position.set(0, 0.25, 9);
  camera.lookAt(0, 0.15, 0);

  // Luzes: chave branca, recorte roxo por trás, um preenchimento suave.
  const chave = new THREE.DirectionalLight('#ffffff', 1.6);
  chave.position.set(3, 5, 5);
  const recorte = new THREE.DirectionalLight('#A78BFA', 3.2);
  recorte.position.set(-4, 2.5, -4);
  const recorte2 = new THREE.DirectionalLight('#7C5CFF', 1.6);
  recorte2.position.set(4, -1, -3);
  cena.add(chave, recorte, recorte2, new THREE.HemisphereLight('#d9d2ff', '#1a1626', 0.35));

  // Materiais
  const casca = new THREE.MeshPhysicalMaterial({ color: '#ECE9F4', roughness: 0.32, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.1 });
  const escuro = new THREE.MeshPhysicalMaterial({ color: '#1B1926', roughness: 0.32, metalness: 0.6, clearcoat: 0.6 });
  const vidro = new THREE.MeshPhysicalMaterial({ color: '#07060C', roughness: 0.05, metalness: 0.25, clearcoat: 1, clearcoatRoughness: 0.02 });
  const luz = new THREE.MeshBasicMaterial({ color: COR_OLHO.clone(), toneMapped: false });
  const brilhoTex = texturaRadial();
  const brilhoMat = (op) => new THREE.SpriteMaterial({ map: brilhoTex, color: COR_OLHO.clone(), transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending });

  const robo = new THREE.Group();
  cena.add(robo);
  const flutua = new THREE.Group();
  robo.add(flutua);

  // Corpo: perfil torneado (um "feijão" liso)
  const perfil = new THREE.SplineCurve([
    new THREE.Vector2(0, -1.08), new THREE.Vector2(0.32, -1.05), new THREE.Vector2(0.54, -0.94),
    new THREE.Vector2(0.67, -0.74), new THREE.Vector2(0.72, -0.48), new THREE.Vector2(0.7, -0.22),
    new THREE.Vector2(0.62, 0.0), new THREE.Vector2(0.48, 0.17), new THREE.Vector2(0.28, 0.27), new THREE.Vector2(0, 0.3),
  ]).getPoints(64);
  const corpo = new THREE.Mesh(new THREE.LatheGeometry(perfil, 72), casca);
  flutua.add(corpo);
  // Faixa escura na cintura
  const cinto = new THREE.Mesh(new THREE.TorusGeometry(0.705, 0.035, 16, 96), escuro);
  cinto.rotation.x = Math.PI / 2;
  cinto.position.y = -0.36;
  corpo.add(cinto);
  // Luz do peito
  const peito = new THREE.Group();
  peito.position.set(0, -0.12, 0.66);
  peito.rotation.x = -0.18;
  corpo.add(peito);
  const peitoAro = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.022, 12, 48), luz);
  const peitoMiolo = new THREE.Mesh(new THREE.CircleGeometry(0.075, 32), new THREE.MeshBasicMaterial({ color: COR_OLHO.clone(), toneMapped: false, transparent: true, opacity: 0.55 }));
  const peitoBrilho = new THREE.Sprite(brilhoMat(0.5));
  peitoBrilho.scale.setScalar(0.6);
  peito.add(peitoAro, peitoMiolo, peitoBrilho);

  // Pescoço
  const pescoco = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.22, 40), escuro);
  pescoco.position.y = 0.36;
  flutua.add(pescoco);

  // Cabeça
  const cabeca = new THREE.Group();
  cabeca.position.y = 0.44;
  flutua.add(cabeca);
  const cranio = new THREE.Mesh(new RoundedBoxGeometry(1.64, 1.22, 1.3, 10, 0.46), casca);
  cranio.position.y = 0.62;
  cabeca.add(cranio);
  const visor = new THREE.Mesh(new RoundedBoxGeometry(1.32, 0.84, 0.24, 10, 0.11), vidro);
  visor.position.set(0, 0.63, 0.58);
  cabeca.add(visor);

  // Olhos
  const olhos = new THREE.Group();
  olhos.position.set(0, 0.67, 0.705);
  cabeca.add(olhos);
  const olhoGeo = new THREE.CapsuleGeometry(0.075, 0.16, 8, 24);
  const felizGeo = new THREE.TorusGeometry(0.105, 0.03, 12, 40, Math.PI);
  const olhosNormais = [], olhosFelizes = [];
  [-0.29, 0.29].forEach((x) => {
    const o = new THREE.Mesh(olhoGeo, luz);
    o.position.x = x;
    olhos.add(o);
    olhosNormais.push(o);
    const f = new THREE.Mesh(felizGeo, luz);
    f.position.set(x, -0.04, 0);
    f.visible = false;
    olhos.add(f);
    olhosFelizes.push(f);
  });
  const olhosBrilho = new THREE.Sprite(brilhoMat(0.28));
  olhosBrilho.scale.set(1.5, 0.75, 1);
  olhosBrilho.position.z = -0.02;
  olhos.add(olhosBrilho);

  // Boca: barras que mexem quando ele fala
  const boca = new THREE.Group();
  boca.position.set(0, 0.36, 0.705);
  cabeca.add(boca);
  const barras = [];
  for (let i = 0; i < 5; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.05, 0.01), luz);
    b.position.x = (i - 2) * 0.06;
    b.scale.y = 0.3;
    boca.add(b);
    barras.push(b);
  }
  boca.visible = false;

  // Orelhas
  [-1, 1].forEach((lado) => {
    const orelha = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.14, 48), escuro);
    orelha.rotation.z = Math.PI / 2;
    orelha.position.set(lado * 0.83, 0.62, 0);
    cabeca.add(orelha);
    const aro = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.022, 12, 48), luz);
    aro.rotation.y = Math.PI / 2;
    aro.position.set(lado * 0.905, 0.62, 0);
    cabeca.add(aro);
  });

  // Antena
  const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, 0.34, 16), escuro);
  haste.position.y = 1.38;
  cabeca.add(haste);
  const bulbo = new THREE.Mesh(new THREE.SphereGeometry(0.075, 32, 16), luz);
  bulbo.position.y = 1.58;
  cabeca.add(bulbo);
  const bulboBrilho = new THREE.Sprite(brilhoMat(0.7));
  bulboBrilho.scale.setScalar(0.55);
  bulboBrilho.position.y = 1.58;
  cabeca.add(bulboBrilho);

  // Braços flutuantes
  function braco(lado) {
    const g = new THREE.Group();
    g.position.set(lado * 0.8, -0.06, 0.02);
    const junta = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 16), escuro);
    const antebraco = new THREE.Mesh(new THREE.CapsuleGeometry(0.115, 0.42, 8, 24), casca);
    antebraco.position.set(lado * 0.1, -0.38, 0);
    antebraco.rotation.z = lado * 0.22;
    const mao = new THREE.Mesh(new THREE.SphereGeometry(0.135, 32, 16), casca);
    mao.position.set(lado * 0.2, -0.72, 0.02);
    g.add(junta, antebraco, mao);
    flutua.add(g);
    return g;
  }
  const bracoE = braco(-1);
  const bracoD = braco(1);

  // Base: anel de luz e sombra
  const anelBase = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.01, 8, 96), new THREE.MeshBasicMaterial({ color: COR_OLHO.clone(), toneMapped: false, transparent: true, opacity: 0.55 }));
  anelBase.rotation.x = Math.PI / 2;
  anelBase.position.y = -1.5;
  robo.add(anelBase);
  const sombra = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 2.4),
    new THREE.MeshBasicMaterial({ map: texturaRadial('rgba(10,6,24,0.55)', 'rgba(10,6,24,0)'), transparent: true, depthWrite: false }),
  );
  sombra.rotation.x = -Math.PI / 2;
  sombra.position.y = -1.52;
  robo.add(sombra);
  const halo = new THREE.Sprite(brilhoMat(0.18));
  halo.scale.set(4.2, 4.2, 1);
  halo.position.set(0, 0.3, -1.2);
  robo.add(halo);

  const corLuzes = [luz.color, peitoMiolo.material.color, anelBase.material.color, olhosBrilho.material.color, bulboBrilho.material.color, peitoBrilho.material.color, halo.material.color];

  // Tamanho
  // O canvas tem uma folga acima (--folga no CSS) para o brilho da antena não ser cortado quando o robô flutua.
  // A câmera desenha o mesmo enquadramento de antes e só estende a imagem para cima: o robô não muda de tamanho nem de lugar.
  let folga = 0;
  function redimensionar() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    folga = parseFloat(getComputedStyle(canvas).getPropertyValue('--folga')) || 0;
    const base = Math.max(1, h - folga);
    renderer.setSize(w, h, false);
    camera.aspect = w / base;
    camera.position.z = w / base < 0.75 ? 11.5 : 9;
    if (folga) camera.setViewOffset(w, base, 0, -folga, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(redimensionar);
  ro.observe(canvas);
  redimensionar();

  // Olhar
  const alvo = { x: 0, y: 0 };
  const atual = { x: 0, y: 0 };
  function onMove(e) {
    const r = canvas.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height * 0.35;
    alvo.x = THREE.MathUtils.clamp((e.clientX - cx) / (innerWidth * 0.5), -1, 1);
    alvo.y = THREE.MathUtils.clamp((e.clientY - cy) / (innerHeight * 0.5), -1, 1);
    ponteiro.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    dentro = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  }
  addEventListener('pointermove', onMove, { passive: true });

  const ray = new THREE.Raycaster();
  const ponteiro = new THREE.Vector2(9, 9);
  let dentro = false;
  let passando = false;
  canvas.addEventListener('click', () => {
    if (passando) clicar();
  });

  // Estados
  const onda = { z: 0 };
  let feliz = false;
  let falando = false;
  let piscaAte = 0;
  let proximaPiscada = 1.5;

  function setFeliz(v) {
    feliz = v;
    olhosNormais.forEach((o) => (o.visible = !v));
    olhosFelizes.forEach((o) => (o.visible = v));
  }

  function acenar() {
    gsap.killTweensOf(onda);
    return gsap.timeline()
      .to(onda, { z: 2.5, duration: 0.45, ease: 'back.out(2)' })
      .to(onda, { z: 2.05, duration: 0.18, ease: 'sine.inOut', repeat: 3, yoyo: true })
      .to(onda, { z: 0, duration: 0.6, ease: 'power3.inOut' });
  }

  let timerFala;
  function falar(ms = 2200) {
    falando = true;
    boca.visible = true;
    clearTimeout(timerFala);
    timerFala = setTimeout(() => { falando = false; boca.visible = false; }, ms);
  }

  function clicar() {
    setFeliz(true);
    acenar();
    falar(1800);
    gsap.fromTo(cabeca.rotation, { z: 0 }, { z: 0.12, duration: 0.25, yoyo: true, repeat: 1, ease: 'sine.inOut' });
    setTimeout(() => setFeliz(false), 1900);
    aoClicar?.();
  }

  function setDominio(on) {
    corLuzes.forEach((c) => gsap.to(c, { r: on ? COR_OURO.r : COR_OLHO.r, g: on ? COR_OURO.g : COR_OLHO.g, b: on ? COR_OURO.b : COR_OLHO.b, duration: 0.8 }));
    gsap.to(recorte.color, { r: on ? 0.95 : 0.65, g: on ? 0.6 : 0.55, b: on ? 0.2 : 0.98, duration: 0.8 });
    setFeliz(false);
  }

  // Montagem de entrada
  function intro() {
    const tl = gsap.timeline();
    if (reduzido) return tl;
    gsap.set(corpo.scale, { x: 0.001, y: 0.001, z: 0.001 });
    gsap.set(pescoco.scale, { x: 0.001, y: 0.001, z: 0.001 });
    gsap.set(cabeca.position, { y: 3.2 });
    gsap.set(cabeca.rotation, { z: 0.5, x: -0.4 });
    gsap.set([bracoE.scale, bracoD.scale], { x: 0.001, y: 0.001, z: 0.001 });
    gsap.set(bracoE.position, { x: -1.7 });
    gsap.set(bracoD.position, { x: 1.7 });
    gsap.set(anelBase.scale, { x: 0.001, y: 0.001, z: 0.001 });
    gsap.set(olhos.scale, { y: 0.001 });
    gsap.set(bulbo.scale, { x: 0.001, y: 0.001, z: 0.001 });
    tl.to(anelBase.scale, { x: 1, y: 1, z: 1, duration: 0.9, ease: 'expo.out' }, 0)
      .to(corpo.scale, { x: 1, y: 1, z: 1, duration: 0.9, ease: 'back.out(1.6)' }, 0.1)
      .to(pescoco.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'back.out(2)' }, 0.45)
      .to(cabeca.position, { y: 0.44, duration: 1.1, ease: 'bounce.out' }, 0.45)
      .to(cabeca.rotation, { z: 0, x: 0, duration: 1.2, ease: 'elastic.out(1, 0.45)' }, 0.9)
      .to([bracoE.scale, bracoD.scale], { x: 1, y: 1, z: 1, duration: 0.7, ease: 'back.out(2)' }, 1.1)
      .to(bracoE.position, { x: -0.8, duration: 0.9, ease: 'expo.out' }, 1.1)
      .to(bracoD.position, { x: 0.8, duration: 0.9, ease: 'expo.out' }, 1.1)
      .to(bulbo.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: 'back.out(3)' }, 1.4)
      // Olhos ligam com uma falha, como lâmpada
      .to(olhos.scale, { y: 1, duration: 0.06 }, 1.75)
      .to(olhos.scale, { y: 0.1, duration: 0.05 }, 1.86)
      .to(olhos.scale, { y: 1, duration: 0.08 }, 1.95)
      .add(() => { setFeliz(true); acenar(); falar(1500); }, 2.3)
      .add(() => setFeliz(false), 3.9);
    return tl;
  }

  // Loop
  const relogio = new THREE.Clock();
  let visivel = true, rodando = true;
  const topo = new THREE.Vector3();

  function quadro() {
    if (!rodando) return;
    requestAnimationFrame(quadro);
    if (!visivel) return;
    const dt = Math.min(relogio.getDelta(), 0.05);
    const t = relogio.elapsedTime;
    const k = Math.min(1, dt * 4);

    atual.x += (alvo.x - atual.x) * k;
    atual.y += (alvo.y - atual.y) * k;

    flutua.position.y = reduzido ? 0 : Math.sin(t * 1.3) * 0.07;
    flutua.rotation.z = reduzido ? 0 : Math.sin(t * 0.9) * 0.018;
    robo.rotation.y = atual.x * 0.28;
    cabeca.rotation.y = atual.x * 0.55;
    cabeca.rotation.x = atual.y * 0.28;
    olhos.position.x = atual.x * 0.05;
    olhos.position.y = 0.67 - atual.y * 0.035;

    const altura = flutua.position.y;
    sombra.scale.setScalar(1 - altura * 1.2);
    anelBase.material.opacity = 0.45 + Math.sin(t * 2) * 0.12;
    peitoMiolo.material.opacity = 0.4 + Math.sin(t * 2.6) * 0.25;
    bulboBrilho.material.opacity = 0.55 + Math.sin(t * 3.2) * 0.3;

    bracoE.rotation.z = -0.1 - Math.sin(t * 1.3) * 0.05;
    bracoD.rotation.z = 0.1 + Math.sin(t * 1.3) * 0.05 + onda.z;
    bracoE.rotation.x = Math.sin(t * 1.1) * 0.06;

    // Piscar
    if (!feliz && t > proximaPiscada && !reduzido) {
      piscaAte = t + 0.14;
      proximaPiscada = t + 2.2 + Math.random() * 3.5;
    }
    if (!gsap.isTweening(olhos.scale)) olhos.scale.y = t < piscaAte ? 0.12 : 1;

    // Boca
    if (falando) barras.forEach((b, i) => (b.scale.y = 0.4 + Math.abs(Math.sin(t * 17 + i * 1.3)) * 1.8));

    // Hover
    if (dentro) {
      ray.setFromCamera(ponteiro, camera);
      const hit = ray.intersectObject(flutua, true).length > 0;
      if (hit !== passando) {
        passando = hit;
        canvas.style.cursor = hit ? 'pointer' : '';
        aoPassar?.(hit);
      }
    } else if (passando) {
      passando = false;
      aoPassar?.(false);
    }

    renderer.render(cena, camera);

    topo.set(0, 2.05, 0);
    cabeca.localToWorld(topo.set(0, 1.75, 0));
    topo.project(camera);
    api.balao = { x: (topo.x * 0.5 + 0.5) * canvas.clientWidth, y: (-topo.y * 0.5 + 0.5) * canvas.clientHeight - folga };
  }
  requestAnimationFrame(quadro);

  const io = new IntersectionObserver(([e]) => { visivel = e.isIntersecting; relogio.getDelta(); });
  io.observe(canvas);

  const api = {
    balao: { x: 0, y: 0 },
    intro,
    clicar,
    falar,
    setFeliz,
    setDominio,
    destruir() {
      rodando = false;
      ro.disconnect();
      io.disconnect();
      removeEventListener('pointermove', onMove);
      renderer.dispose();
    },
  };
  return api;
}
