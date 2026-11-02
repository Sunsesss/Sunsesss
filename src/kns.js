import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function initKns() {

const section = document.querySelector('#kns');
if (!section) return;
const canvas = document.querySelector('#kns-canvas');
const visual = document.querySelector('#kns-visual');
const marker = visual.querySelector('.kns-point');
const leader = visual.querySelector('.kns-leader');
const points = [new THREE.Vector3(-1.72, .85, .4), new THREE.Vector3(1.7, 1.2, .23), new THREE.Vector3(-.35, .15, .52), new THREE.Vector3(0, .4, -.07)];
const normals = [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1)];
const point = new THREE.Vector3();
const normal = new THREE.Vector3();
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
let lastRendered = 0;
let menuPaused = false;
const clamp = THREE.MathUtils.clamp;
const scrollRange = () => Math.max(1, section.offsetHeight - section.querySelector('.kns-sticky').offsetHeight);
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
    targetProgress = clamp(-box.top / scrollRange(), 0, 1);
  }
  updateChapter(targetProgress);
  requestRender();
}

function requestRender() {
  if (!frame && ready && visible && !document.hidden && !menuPaused) frame = requestAnimationFrame(render);
}

function render(time) {
  frame = 0;
  if (!ready || !visible || document.hidden || menuPaused) return;
  const elapsed = Math.max(16, time - lastRendered);
  if (innerWidth < 761 && elapsed < 30) { requestRender(); return; }
  lastRendered = time;
  // Time-based damping settles promptly even on a slow mobile graphics driver.
  currentProgress = reducedMotion.matches ? targetProgress : THREE.MathUtils.lerp(currentProgress, targetProgress, 1 - Math.exp(-elapsed / 105));
  if (Math.abs(currentProgress - targetProgress) < 0.0005) currentProgress = targetProgress;
  // Front plate -> populated PCB -> connectors -> back of the PCB.
  model.rotation.y = 1.25 - currentProgress * 4.25;
  model.rotation.x = -0.12 + Math.sin(currentProgress * Math.PI) * 0.13;
  model.rotation.z = -0.055;
  scene.updateMatrixWorld();
  renderer.render(scene, camera);
  if (marker && chapter >= 0) {
    const box = visual.getBoundingClientRect();
    point.copy(points[chapter]).applyMatrix4(model.matrixWorld).project(camera);
    normal.copy(normals[chapter]).transformDirection(model.matrixWorld);
    const show = normal.z > .1 && Math.abs(point.x) < .98 && Math.abs(point.y) < .98;
    marker.style.visibility = show ? 'visible' : 'hidden';
    leader.style.visibility = show && innerWidth > 760 ? 'visible' : 'hidden';
    const x = (point.x * .5 + .5) * box.width;
    const y = (-point.y * .5 + .5) * box.height;
    marker.style.left = `${x}px`; marker.style.top = `${y}px`;
    marker.textContent = `0${chapter + 1}`;
    const endpoint = section.querySelector('.kns-annotation-line').getBoundingClientRect();
    const dx = endpoint.left - box.left - x;
    const dy = endpoint.top - box.top - y;
    leader.style.left = `${x}px`; leader.style.top = `${y}px`;
    leader.style.width = `${Math.hypot(dx, dy)}px`;
    leader.style.rotate = `${Math.atan2(dy, dx)}rad`;
  }
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

async function initialize() {
  try {
    const context = canvas.getContext('webgl2', { antialias: true, alpha: true, powerPreference: 'low-power' });
    if (!context) { section.dataset.renderMode = 'fallback'; return; }
    renderer = new THREE.WebGLRenderer({ canvas, context, antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 761 ? 1.25 : 1.6));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
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
    scene.add(new THREE.HemisphereLight('#f8fbff', '#747565', .65));
    const key = new THREE.DirectionalLight('#fff8ed', 3.5);
    key.position.set(-3.5, 6, 4.5);
    key.castShadow = true;
    key.shadow.mapSize.set(innerWidth < 761 ? 512 : 1024, innerWidth < 761 ? 512 : 1024);
    key.shadow.camera.left = -4; key.shadow.camera.right = 4;
    key.shadow.camera.top = 5; key.shadow.camera.bottom = -4;
    key.shadow.camera.near = .1; key.shadow.camera.far = 20;
    key.shadow.normalBias = .025; key.shadow.bias = -.0003; key.shadow.radius = 5;
    scene.add(key);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), new THREE.ShadowMaterial({ color: '#263029', opacity: .14 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.15;
    floor.receiveShadow = true;
    scene.add(floor);
    const rim = new THREE.DirectionalLight('#b9caff', 1.5); rim.position.set(4, 2, -3); scene.add(rim);
    const fill = new THREE.DirectionalLight('#ffffff', 0.8); fill.position.set(2, -3, 4); scene.add(fill);
    const gltf = await new GLTFLoader().loadAsync('/assets/kns.glb');
    model = gltf.scene;
    // Blender model is centred and exported with glTF's Y-up convention.
    model.traverse(object => {
      if (!object.isMesh) return;
      object.castShadow = true;
      object.receiveShadow = true;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        if (material.map) material.map.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        material.envMapIntensity = .85;
      }
    });
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
  else window.scrollTo({ top: window.scrollY + section.getBoundingClientRect().top + progress * scrollRange(), behavior: 'smooth' });
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
document.addEventListener('site-menu-state', event => {
  menuPaused = Boolean(event.detail.open);
  if (menuPaused && frame) { cancelAnimationFrame(frame); frame = 0; }
  else requestRender();
});
reducedMotion.addEventListener('change', measureProgress);
updateChapter(0);

}
