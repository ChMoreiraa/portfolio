// Planeta em pontos com conexões partindo de São José dos Campos. Arrasta para girar.
import * as THREE from 'three';
import { feature } from 'topojson-client';
import terra from 'world-atlas/land-110m.json';

const R = 1.6;
const BASE = { nome: 'São José dos Campos', lat: -23.18, lon: -45.88 };
const CIDADES = [
  { lat: 38.72, lon: -9.14 },   // Lisboa
  { lat: 51.51, lon: -0.13 },   // Londres
  { lat: 52.52, lon: 13.4 },    // Berlim
  { lat: 40.71, lon: -74.0 },   // Nova York
  { lat: 43.65, lon: -79.38 },  // Toronto
  { lat: 37.77, lon: -122.42 }, // São Francisco
  { lat: 19.43, lon: -99.13 },  // Cidade do México
  { lat: -34.6, lon: -58.38 },  // Buenos Aires
  { lat: 35.68, lon: 139.69 },  // Tóquio
  { lat: -33.92, lon: 18.42 },  // Cidade do Cabo
  { lat: 25.2, lon: 55.27 },    // Dubai
];

function vetor(lat, lon, raio = R) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(-raio * Math.sin(phi) * Math.cos(theta), raio * Math.cos(phi), raio * Math.sin(phi) * Math.sin(theta));
}

// Rasteriza os continentes num canvas equirretangular para testar "é terra?"
function mascaraTerra() {
  const W = 720, H = 360;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#fff';
  const geo = feature(terra, terra.objects.land);
  const poligonos = geo.features
    ? geo.features.flatMap((f) => (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates))
    : geo.geometry.type === 'Polygon' ? [geo.geometry.coordinates] : geo.geometry.coordinates;
  poligonos.forEach((poly) => {
    g.beginPath();
    poly.forEach((anel) => {
      anel.forEach(([lon, lat], i) => {
        const x = ((lon + 180) / 360) * W;
        const y = ((90 - lat) / 180) * H;
        i ? g.lineTo(x, y) : g.moveTo(x, y);
      });
      g.closePath();
    });
    g.fill('evenodd');
  });
  const dados = g.getImageData(0, 0, W, H).data;
  return (lat, lon) => {
    const x = Math.min(W - 1, Math.floor(((lon + 180) / 360) * W));
    const y = Math.min(H - 1, Math.floor(((90 - lat) / 180) * H));
    return dados[(y * W + x) * 4] > 128;
  };
}

export function criarGlobo({ canvas, reduzido, tema }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const cena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 7.4);

  const mundo = new THREE.Group();
  cena.add(mundo);
  const globo = new THREE.Group();
  mundo.add(globo);
  mundo.rotation.x = -0.18;

  const cores = {
    dark: { ponto: '#D2C7FF', oceano: '#0E0D13', atm: '#8B6CFF', arco: '#C4B5FD', base: '#F5C95A' },
    light: { ponto: '#5B3FE0', oceano: '#F4F2ED', atm: '#7C5CFF', arco: '#6D4AFF', base: '#C2850F' },
  };

  // Esfera do oceano: esconde os pontos do lado de trás
  const oceanoMat = new THREE.MeshBasicMaterial({ color: '#0E0D13' });
  globo.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.985, 64, 64), oceanoMat));

  // Pontos dos continentes (distribuição de Fibonacci)
  const eTerra = mascaraTerra();
  const N = matchMedia('(max-width: 760px)').matches ? 16000 : 30000;
  const pts = [];
  const ouro = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = ouro * i;
    const lat = THREE.MathUtils.radToDeg(Math.asin(y));
    let lon = THREE.MathUtils.radToDeg(Math.atan2(Math.sin(th) * r, Math.cos(th) * r));
    if (eTerra(lat, lon)) pts.push(vetor(lat, lon));
  }
  const pGeo = new THREE.BufferGeometry().setFromPoints(pts);
  const pUni = { uCor: { value: new THREE.Color() }, uPx: { value: renderer.getPixelRatio() } };
  const pontos = new THREE.Points(pGeo, new THREE.ShaderMaterial({
    uniforms: pUni,
    transparent: true,
    vertexShader: /* glsl */ `
      uniform float uPx; varying float vLuz;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.);
        vec3 n = normalize(normalMatrix * normalize(position));
        vLuz = clamp(dot(n, normalize(-mv.xyz)), 0., 1.);
        gl_PointSize = 2.5 * uPx;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uCor; varying float vLuz;
      void main(){
        float d = length(gl_PointCoord - .5);
        if (d > .5) discard;
        gl_FragColor = vec4(uCor, (.35 + vLuz * .65) * smoothstep(.5, .15, d));
      }`,
  }));
  globo.add(pontos);

  // Atmosfera (brilho na borda)
  const atmUni = { uCor: { value: new THREE.Color() }, uForca: { value: 1 } };
  const atm = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.13, 64, 64),
    new THREE.ShaderMaterial({
      uniforms: atmUni,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        varying vec3 vN;
        void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uCor; uniform float uForca; varying vec3 vN;
        void main(){
          float i = pow(clamp(.62 - dot(vN, vec3(0., 0., 1.)), 0., 1.), 3.) ;
          gl_FragColor = vec4(uCor, i * .55 * uForca);
        }`,
    }),
  );
  mundo.add(atm);

  // Marcadores e arcos
  const base = vetor(BASE.lat, BASE.lon, R * 1.002);
  const anelGeo = new THREE.RingGeometry(0.035, 0.05, 40);
  function marcador(pos, escala, cor) {
    const g = new THREE.Group();
    g.position.copy(pos);
    g.lookAt(pos.clone().multiplyScalar(2));
    const nucleo = new THREE.Mesh(new THREE.CircleGeometry(0.026 * escala, 24), new THREE.MeshBasicMaterial({ color: cor, transparent: true }));
    const pulso = new THREE.Mesh(anelGeo, new THREE.MeshBasicMaterial({ color: cor, transparent: true, side: THREE.DoubleSide }));
    pulso.scale.setScalar(escala);
    g.add(nucleo, pulso);
    globo.add(g);
    return { g, nucleo, pulso, fase: Math.random() * 3 };
  }
  const marcadores = [marcador(base, 1.25, '#F5C95A')];

  const arcoUni = { uT: { value: 0 }, uCor: { value: new THREE.Color() } };
  const arcoMat = new THREE.ShaderMaterial({
    uniforms: arcoUni,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      attribute float aFase; varying float vU; varying float vFase;
      void main(){ vU = uv.x; vFase = aFase; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: /* glsl */ `
      uniform float uT; uniform vec3 uCor; varying float vU; varying float vFase;
      void main(){
        float p = fract(uT * .22 + vFase);
        float cauda = smoothstep(p - .22, p, vU) * step(vU, p);
        float a = .16 + cauda * .95;
        gl_FragColor = vec4(uCor, a);
      }`,
  });
  CIDADES.forEach((c, i) => {
    const fim = vetor(c.lat, c.lon, R * 1.002);
    marcadores.push(marcador(fim, 1, '#C4B5FD'));
    const dist = base.distanceTo(fim);
    const meio = base.clone().add(fim).multiplyScalar(0.5).normalize().multiplyScalar(R + dist * 0.32);
    const curva = new THREE.QuadraticBezierCurve3(base, meio, fim);
    const geo = new THREE.TubeGeometry(curva, 64, 0.006, 6, false);
    const fase = new Float32Array(geo.attributes.position.count).fill(i / CIDADES.length);
    geo.setAttribute('aFase', new THREE.BufferAttribute(fase, 1));
    globo.add(new THREE.Mesh(geo, arcoMat));
  });

  // Gira para mostrar o Brasil de frente
  const rotBase = Math.atan2(-base.x, base.z);
  globo.rotation.y = rotBase;

  function aplicarTema(novo) {
    const c = cores[novo];
    pUni.uCor.value.set(c.ponto);
    oceanoMat.color.set(c.oceano);
    atmUni.uCor.value.set(c.atm);
    atmUni.uForca.value = novo === 'dark' ? 1 : 0.55;
    arcoUni.uCor.value.set(c.arco);
    marcadores.slice(1).forEach((m) => { m.nucleo.material.color.set(c.arco); m.pulso.material.color.set(c.arco); });
    marcadores[0].nucleo.material.color.set(c.base);
    marcadores[0].pulso.material.color.set(c.base);
  }
  aplicarTema(tema);

  function redimensionar() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    pUni.uPx.value = renderer.getPixelRatio();
  }
  const ro = new ResizeObserver(redimensionar);
  ro.observe(canvas);
  redimensionar();

  // Arrastar com inércia
  let arrastando = false, ultX = 0, ultY = 0, velY = 0, velX = 0, ocioso = 0;
  canvas.style.touchAction = 'pan-y';
  canvas.addEventListener('pointerdown', (e) => {
    arrastando = true; ultX = e.clientX; ultY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add('arrastando');
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!arrastando) return;
    velY = (e.clientX - ultX) * 0.006;
    velX = (e.clientY - ultY) * 0.004;
    globo.rotation.y += velY;
    mundo.rotation.x = THREE.MathUtils.clamp(mundo.rotation.x + velX, -0.6, 0.9);
    ultX = e.clientX; ultY = e.clientY;
    ocioso = 0;
  });
  const soltar = () => { arrastando = false; canvas.classList.remove('arrastando'); };
  canvas.addEventListener('pointerup', soltar);
  canvas.addEventListener('pointercancel', soltar);

  const relogio = new THREE.Clock();
  let visivel = true, rodando = true;
  const proj = new THREE.Vector3();
  const normal = new THREE.Vector3();

  function quadro() {
    if (!rodando) return;
    requestAnimationFrame(quadro);
    if (!visivel) return;
    const dt = Math.min(relogio.getDelta(), 0.05);
    const t = relogio.elapsedTime;
    arcoUni.uT.value = t;

    if (!arrastando) {
      globo.rotation.y += velY;
      velY *= 0.94;
      velX *= 0.9;
      ocioso += dt;
      if (ocioso > 2 && !reduzido) globo.rotation.y += dt * 0.06;
    }

    marcadores.forEach((m) => {
      const s = ((t * 0.7 + m.fase) % 1.6) / 1.6;
      m.pulso.scale.setScalar((m === marcadores[0] ? 1.25 : 0.8) * (1 + s * 1.8));
      m.pulso.material.opacity = 1 - s;
    });

    renderer.render(cena, camera);

    // Posição do rótulo da base
    marcadores[0].g.getWorldPosition(proj);
    normal.copy(proj).normalize();
    const frente = normal.dot(camera.position.clone().sub(proj).normalize()) > 0.15;
    proj.project(camera);
    api.base = { x: (proj.x * 0.5 + 0.5) * canvas.clientWidth, y: (-proj.y * 0.5 + 0.5) * canvas.clientHeight, visivel: frente };
    api.aoQuadro?.(api.base);
  }
  requestAnimationFrame(quadro);

  const io = new IntersectionObserver(([e]) => { visivel = e.isIntersecting; relogio.getDelta(); });
  io.observe(canvas);

  const api = {
    base: null,
    aoQuadro: null,
    setTema: aplicarTema,
    destruir() { rodando = false; ro.disconnect(); io.disconnect(); renderer.dispose(); },
  };
  return api;
}
