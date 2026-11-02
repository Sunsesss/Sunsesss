import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const section = document.querySelector('#kns');
const canvas = document.querySelector('#kns-canvas');
const visual = document.querySelector('#kns-visual');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
// Upper-right execution from the supplied slide, confirmed by the user.
const chapters = [
  { title: 'Цифровое\nуправление.', description: 'Рабочие режимы и состояние модуля — под контролем.', metric: '95–265', label: 'В · входное напряжение', secondary: '50–60 Гц\nКоэффициент мощности 0,99' },
  { title: 'Питание\nпод задачу.', description: 'Регулируемые выходные параметры для питания вашей системы.', metric: '3–33', label: 'В · выходное напряжение', secondary: 'Постоянный ток\nВыходной ток до 53 А' },
  { title: 'Продуманная\nэффективность.', description: 'Эффективное преобразование энергии с низкими пульсациями на выходе.', metric: '≥93%', label: 'КПД', secondary: 'Пульсации выходного\nнапряжения — до 40 мВ' },
  { title: 'Для сложных\nусловий.', description: 'Мощность зависит от выбранного режима охлаждения.', metric: '−50…+50', label: '°C · рабочая температура', secondary: 'До 1500 Вт — принудительное\nДо 1000 Вт — конвекционное' },
];
let chapter = -1;
let targetProgress = 0;
let currentProgress = 0;
let visible = false;
let frame = 0;
let renderer;
let model;
let scene;
let camera;
let ready = false;
const clamp = THREE.MathUtils.clamp;
const toLines = (node, text) => { node.replaceChildren(...text.split('\n').flatMap((line, i) => i ? [document.createElement('br'), document.createTextNode(line)] : [document.createTextNode(line)])); };

function updateChapter(progress) {
  const next = Math.min(3, Math.floor(progress * 4));
  section.style.setProperty('--kns-progress', `${progress * 100}%`);
  if (next === chapter) return;
  chapter = next;
  const data = chapters[next];
  document.querySelector('#kns-chapter-number').textContent = `0${next + 1} / 04`;
  toLines(document.querySelector('#kns-feature-title'), data.title);
  document.querySelector('#kns-feature-description').textContent = data.description;
  document.querySelector('#kns-metric').textContent = data.metric;
  document.querySelector('#kns-metric-label').textContent = data.label;
  toLines(document.querySelector('#kns-secondary'), data.secondary);
  section.querySelectorAll('[data-kns-step]').forEach((button, index) => button.setAttribute('aria-pressed', String(index === next)));
  section.dataset.chapter = String(next);
  if (visible && !reducedMotion.matches) {
    for (const element of section.querySelectorAll('.kns-chapter, .kns-annotation')) {
      element.getAnimations().forEach(animation => animation.cancel());
      element.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 320, easing: 'ease-out' });
    }
  }
}

function measureProgress() {
  if (!reducedMotion.matches) {
    const box = section.getBoundingClientRect();
    targetProgress = clamp(-box.top / Math.max(1, section.offsetHeight - innerHeight), 0, 1);
  }
  updateChapter(targetProgress);
  requestRender();
}

function requestRender() {
  if (!frame && ready && visible && !document.hidden) frame = requestAnimationFrame(render);
}

function render() {
  frame = 0;
  if (!ready || !visible || document.hidden) return;
  currentProgress = reducedMotion.matches ? targetProgress : THREE.MathUtils.lerp(currentProgress, targetProgress, 0.12);
  if (Math.abs(currentProgress - targetProgress) < 0.0005) currentProgress = targetProgress;
  // Front plate -> populated PCB -> connectors -> back of the PCB.
  model.rotation.y = 1.25 - currentProgress * 4.25;
  model.rotation.x = -0.12 + Math.sin(currentProgress * Math.PI) * 0.13;
  model.rotation.z = -0.055;
  scene.updateMatrixWorld();
  renderer.render(scene, camera);
  canvas.dataset.rotation = model.rotation.y.toFixed(3);
  if (currentProgress !== targetProgress) requestRender();
}

function sizeRenderer() {
  if (!renderer) return;
  const { width, height } = visual.getBoundingClientRect();
  if (!width || !height) return;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.position.z = camera.aspect < 0.8 ? 9.9 : 8.3;
  camera.updateProjectionMatrix();
  requestRender();
}

function mesh(geometry, material, parent, x = 0, y = 0, z = 0) {
  const item = new THREE.Mesh(geometry, material);
  item.position.set(x, y, z);
  parent.add(item);
  return item;
}

function buildModel(backTexture, plateTexture) {
  const group = new THREE.Group();
  const mat = (color, metalness = 0, roughness = 0.5) => new THREE.MeshStandardMaterial({ color, metalness, roughness });
  const pcb = mat('#0c583c', 0.12, 0.65);
  const aluminium = mat('#b9bdc0', 0.8, 0.3);
  const dark = mat('#101619', 0.1, 0.42);
  const silver = mat('#dbdddf', 0.85, 0.25);
  const copper = mat('#b96d31', 0.85, 0.25);
  const yellow = mat('#d6b52d', 0.1, 0.48);
  const blue = mat('#114dbb', 0.05, 0.45);
  const gold = mat('#cbb879', 0.8, 0.3);
  const box = (w, h, d, material, x, y, z, parent = group) => mesh(new THREE.BoxGeometry(w, h, d), material, parent, x, y, z);
  const cylinder = (r, depth, material, x, y, z, segments = 24) => {
    const obj = mesh(new THREE.CylinderGeometry(r, r, depth, segments), material, group, x, y, z);
    obj.rotation.x = Math.PI / 2;
    return obj;
  };
  box(3.15, 3.8, 0.075, pcb, 0, 0, 0);
  const textureMaterial = new THREE.MeshStandardMaterial({ map: backTexture, roughness: 0.7, metalness: 0.08 });
  const back = mesh(new THREE.PlaneGeometry(3.13, 3.78), textureMaterial, group, 0, 0, -0.039);
  back.rotation.y = Math.PI;
  mesh(new THREE.PlaneGeometry(3.13, 3.78), textureMaterial, group, 0, 0, 0.039);

  // Plate is perpendicular to the populated PCB, as in the supplied photos.
  box(0.055, 4.18, 1.08, dark, -1.67, 0, 0.4);
  const plate = mesh(new THREE.PlaneGeometry(1.08, 4.18), new THREE.MeshStandardMaterial({ map: plateTexture, roughness: 0.55 }), group, -1.701, 0, 0.4);
  plate.rotation.y = -Math.PI / 2;
  for (const y of [-1.85, 1.85]) for (const z of [0.04, 0.51]) {
    const screw = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.022, 8), silver, group, -1.712, y, z);
    screw.rotation.z = Math.PI / 2;
  }

  // Four large electrolytic capacitors along the input side.
  for (let i = 0; i < 4; i++) {
    const y = 1.25 - i * 0.8;
    cylinder(0.21, 0.52, dark, -1.2, y, 0.32);
    cylinder(0.185, 0.012, silver, -1.2, y, 0.59);
    box(0.21, 0.012, 0.005, dark, -1.2, y, 0.602);
    box(0.012, 0.21, 0.005, dark, -1.2, y, 0.603);
  }

  // Transformer, ferrite cores and copper windings.
  box(0.72, 0.95, 0.55, dark, -0.35, 1.12, 0.34);
  box(0.57, 0.88, 0.05, yellow, -0.35, 1.12, 0.641);
  for (const [x, y] of [[-0.35, 0.18], [0.34, 0.18]]) {
    box(0.5, 0.62, 0.12, dark, x, y, 0.13);
    for (const side of [-1, 1]) box(0.08, 0.62, 0.47, dark, x + side * 0.21, y, 0.32);
    for (const side of [-1, 1]) box(0.5, 0.075, 0.47, dark, x, y + side * 0.275, 0.32);
    for (let turn = 0; turn < 15; turn++) {
      const coil = mesh(new THREE.TorusGeometry(0.17, 0.013, 6, 22), copper, group, x, y - 0.22 + turn * 0.031, 0.34);
      coil.rotation.x = Math.PI / 2;
    }
  }
  // Toroidal inductors: actual depth and copper winding geometry, not image planes.
  const toroid = (x, y, radius, cover = true) => {
    mesh(new THREE.TorusGeometry(radius, 0.09, 12, 44), yellow, group, x, y, 0.3);
    const points = [];
    for (let i = 0; i <= 540; i++) {
      const t = i / 540 * Math.PI * 2;
      const r = radius + 0.105 * Math.cos(t * 28);
      points.push(new THREE.Vector3(x + r * Math.cos(t), y + r * Math.sin(t), 0.3 + 0.105 * Math.sin(t * 28)));
    }
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 500, 0.014, 5, false), copper, group);
    if (cover) { cylinder(radius * 0.86, 0.025, yellow, x, y, 0.419); cylinder(0.035, 0.035, silver, x, y, 0.444, 10); }
  };
  toroid(1.04, 1.27, 0.31);
  toroid(-0.35, -1.13, 0.37);
  toroid(-0.35, -0.55, 0.23, false);
  toroid(1.12, -0.67, 0.2, false);
  for (const y of [1.0, 0.49, -0.02]) {
    cylinder(0.14, 0.35, blue, 0.94, y, 0.23);
    cylinder(0.127, 0.014, silver, 0.94, y, 0.412);
  }

  // Aluminium mounting / heat spreader rails and their fasteners.
  for (const x of [-0.82, 0.58]) {
    box(0.19, 3.58, 0.16, aluminium, x, 0.03, 0.45);
    box(0.07, 3.58, 0.28, aluminium, x - 0.06, 0.03, 0.3);
    for (const y of [-1.55, -0.63, 0.63, 1.55]) cylinder(0.047, 0.028, silver, x, y, 0.55, 10);
  }
  for (const y of [-1.2, 1.2]) {
    box(0.17, 0.9, 0.36, blue, 1.62, y, 0.18);
    for (let pin = 0; pin < 12; pin++) box(0.19, 0.015, 0.025, gold, 1.51, y - 0.38 + pin * 0.068, 0.39);
  }
  // Small semiconductor packages and passive components add physical scale.
  for (const [x, y] of [[1.08, 0.18], [0.26, -1.35], [1.03, -1.5], [-0.42, 1.72], [0.25, 1.72]]) {
    box(0.19, 0.25, 0.09, dark, x, y, 0.1);
    for (let pin = 0; pin < 4; pin++) for (const side of [-1, 1]) box(0.045, 0.018, 0.02, silver, x + side * 0.105, y - 0.085 + pin * 0.055, 0.071);
  }
  for (const x of [-1.4, 1.4]) for (const y of [-1.7, 1.7]) cylinder(0.055, 0.02, silver, x, y, 0.055, 12);
  return group;
}

async function initialize() {
  try {
    const context = canvas.getContext('webgl2', { antialias: true, alpha: true, powerPreference: 'low-power' });
    if (!context) { section.dataset.renderMode = 'fallback'; return; }
    renderer = new THREE.WebGLRenderer({ canvas, context, antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    scene = new THREE.Scene();
    const environment = new RoomEnvironment();
    const environmentGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = environmentGenerator.fromScene(environment, 0.05).texture;
    scene.environmentIntensity = 0.7;
    environment.dispose();
    environmentGenerator.dispose();
    camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.15, 8.3);
    camera.lookAt(0, 0, 0);
    scene.add(new THREE.HemisphereLight('#f8fbff', '#747565', 1.25));
    const key = new THREE.DirectionalLight('#ffffff', 2); key.position.set(-3, 4, 6); scene.add(key);
    const rim = new THREE.DirectionalLight('#b9caff', 1.5); rim.position.set(4, 2, -3); scene.add(rim);
    const fill = new THREE.DirectionalLight('#ffffff', 0.8); fill.position.set(2, -3, 4); scene.add(fill);
    const loader = new THREE.TextureLoader();
    const [back, plate] = await Promise.all([loader.loadAsync('/assets/kns-pcb.png'), loader.loadAsync('/assets/kns-panel.png')]);
    for (const texture of [back, plate]) { texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy()); }
    model = buildModel(back, plate);
    scene.add(model);
    ready = true;
    section.dataset.renderMode = 'webgl';
    sizeRenderer();
    currentProgress = targetProgress;
    visual.classList.add('is-ready');
    requestRender();
    canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); ready = false; visual.classList.remove('is-ready'); section.dataset.renderMode = 'fallback'; }, { once: true });
    canvas.addEventListener('webglcontextrestored', () => { renderer?.dispose(); renderer = undefined; initialize(); }, { once: true });
  } catch {
    renderer?.dispose();
    section.dataset.renderMode = 'fallback';
    visual.classList.remove('is-ready');
  }
}

section.querySelectorAll('[data-kns-step]').forEach(button => button.addEventListener('click', () => {
  const step = Number(button.dataset.knsStep);
  const progress = (step + 0.35) / 4;
  if (reducedMotion.matches) { targetProgress = progress; updateChapter(progress); requestRender(); }
  else window.scrollTo({ top: window.scrollY + section.getBoundingClientRect().top + progress * (section.offsetHeight - innerHeight), behavior: 'smooth' });
}));

const observer = new IntersectionObserver(entries => {
  visible = entries[0].isIntersecting;
  if (visible) { if (!renderer && !section.dataset.renderMode) initialize(); measureProgress(); }
  else if (frame) { cancelAnimationFrame(frame); frame = 0; }
}, { rootMargin: '200px 0px' });
observer.observe(section);
new ResizeObserver(sizeRenderer).observe(visual);
window.addEventListener('scroll', measureProgress, { passive: true });
window.addEventListener('resize', measureProgress, { passive: true });
document.addEventListener('visibilitychange', requestRender);
reducedMotion.addEventListener('change', measureProgress);
updateChapter(0);
