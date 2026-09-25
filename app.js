import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const VIC_SEASON = ['summer','summer','autumn','autumn','autumn','winter','winter','winter','spring','spring','spring','summer'];

const copy = {
  space: {
    title: 'From space',
    text: 'The gold line is Earth\u2019s axis. It stays aimed at the same point in the sky all year. That is why the North Star stays north and the Southern Cross stays south \u2014 even when Earth is on the opposite side of the Sun.'
  },
  south: {
    title: 'Night sky from Victoria',
    text: 'You are standing in Victoria looking up. The Southern Cross hangs in the south all year. What changes with the seasons is which other stars are up at midnight \u2014 the Sun is hiding the opposite half of the sky.'
  },
  north: {
    title: 'Night sky from the north',
    text: 'Polaris sits almost still. Everything else wheels around it as Earth spins. Six months later you are on the other side of the Sun, but the pole is still the pole \u2014 the axis never flipped.'
  }
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05060a);
scene.fog = new THREE.FogExp2(0x05060a, 0.0016);

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.05, 4000);
camera.position.set(28, 16, 34);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
document.body.prepend(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 4;
controls.maxDistance = 180;
controls.target.set(8, 0, 0);

scene.add(new THREE.AmbientLight(0x334466, 0.35));

const sun = new THREE.Mesh(new THREE.SphereGeometry(2.2, 48, 48), new THREE.MeshBasicMaterial({ color: 0xffe08a }));
scene.add(sun);
scene.add(new THREE.Mesh(new THREE.SphereGeometry(3.1, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffc14a, transparent: true, opacity: 0.18 })));
scene.add(new THREE.PointLight(0xfff1c8, 180, 200, 1.4));

const ORBIT_R = 16;
const TILT = THREE.MathUtils.degToRad(23.44);
const orbitPivot = new THREE.Object3D();
scene.add(orbitPivot);
const earthHolder = new THREE.Object3D();
earthHolder.position.x = ORBIT_R;
orbitPivot.add(earthHolder);
const tiltGroup = new THREE.Object3D();
tiltGroup.rotation.z = TILT;
earthHolder.add(tiltGroup);
const earthSpin = new THREE.Object3D();
tiltGroup.add(earthSpin);

const earth = new THREE.Mesh(
  new THREE.SphereGeometry(1.35, 64, 64),
  new THREE.MeshPhongMaterial({ color: 0x2a6cad, emissive: 0x041018, shininess: 18, specular: 0x335577 })
);
earthSpin.add(earth);

const landMat = new THREE.MeshPhongMaterial({ color: 0x3d7a4a, flatShading: true });
function blob(lat, lon, s = 0.42) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(s, 12, 10), landMat);
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const th = THREE.MathUtils.degToRad(lon + 180);
  const r = 1.32;
  m.position.set(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
  earthSpin.add(m);
}
blob(-25, 135, 0.38);
blob(40, -100, 0.55);
blob(50, 20, 0.5);
blob(10, 20, 0.48);
blob(-15, -60, 0.5);
blob(60, 90, 0.55);
blob(20, 80, 0.42);

earthSpin.add(new THREE.Mesh(
  new THREE.SphereGeometry(1.46, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0x6ec8ff, transparent: true, opacity: 0.12, side: THREE.BackSide })
));

tiltGroup.add(new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -4.2, 0), new THREE.Vector3(0, 4.2, 0)]),
  new THREE.LineBasicMaterial({ color: 0xf0c14b })
));

function latLon(obj, lat, lon, r) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const th = THREE.MathUtils.degToRad(lon + 180);
  obj.position.set(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
}
const pin = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), new THREE.MeshBasicMaterial({ color: 0x3dcaa6 }));
latLon(pin, -36.4, 145.4, 1.42);
earthSpin.add(pin);
const southObs = new THREE.Object3D();
latLon(southObs, -36.4, 145.4, 1.55);
earthSpin.add(southObs);
const northObs = new THREE.Object3D();
latLon(northObs, 51.5, 0, 1.55);
earthSpin.add(northObs);

{
  const pts = [];
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * ORBIT_R, 0, Math.sin(a) * ORBIT_R));
  }
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x243044 })));
}

const STAR_R = 220;
const starGeo = new THREE.BufferGeometry();
const starCount = 1800;
const positions = new Float32Array(starCount * 3);
const colors = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  const theta = 2 * Math.PI * Math.random();
  const phi = Math.acos(2 * Math.random() - 1);
  positions[i*3] = STAR_R * Math.sin(phi) * Math.cos(theta);
  positions[i*3+1] = STAR_R * Math.cos(phi);
  positions[i*3+2] = STAR_R * Math.sin(phi) * Math.sin(theta);
  const c = 0.65 + Math.random() * 0.35;
  const tint = Math.random();
  colors[i*3] = c;
  colors[i*3+1] = c * (tint > 0.85 ? 0.85 : 1);
  colors[i*3+2] = c * (tint < 0.12 ? 0.85 : 1);
}
starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 1.15, vertexColors: true, sizeAttenuation: true }));
scene.add(stars);

function namedStar(dir, color, size = 0.55) {
  const p = dir.clone().normalize().multiplyScalar(STAR_R * 0.92);
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 16, 16), new THREE.MeshBasicMaterial({ color }));
  mesh.position.copy(p);
  scene.add(mesh);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(size * 2.2, 12, 12), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.22 }));
  halo.position.copy(p);
  scene.add(halo);
  return p;
}

const polarisDir = new THREE.Vector3(0, 1, 0);
namedStar(polarisDir, 0x9ec8ff, 0.7);
const cruxCenter = new THREE.Vector3(0.18, -1, 0.12);
const crux = [
  new THREE.Vector3(0.10, -1.00, 0.02),
  new THREE.Vector3(0.26, -0.96, 0.22),
  new THREE.Vector3(0.05, -0.97, 0.20),
  new THREE.Vector3(0.30, -0.98, 0.04)
];
const cruxWorld = crux.map(v => namedStar(v, 0x3dcaa6, 0.42));
scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([cruxWorld[0], cruxWorld[1]]), new THREE.LineBasicMaterial({ color: 0x3dcaa6 })));
scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([cruxWorld[2], cruxWorld[3]]), new THREE.LineBasicMaterial({ color: 0x3dcaa6 })));

const orionDirs = [
  new THREE.Vector3(1.0, 0.05, 0.15),
  new THREE.Vector3(1.0, -0.08, 0.22),
  new THREE.Vector3(0.96, 0.00, 0.05),
  new THREE.Vector3(1.02, 0.12, 0.28),
  new THREE.Vector3(0.94, -0.16, 0.10)
];
const orionWorld = orionDirs.map(v => namedStar(v, 0xe07a7a, 0.38));
scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(orionWorld), new THREE.LineBasicMaterial({ color: 0xe07a7a, transparent: true, opacity: 0.7 })));

const scorpiusDirs = [
  new THREE.Vector3(-1.0, -0.2, -0.1),
  new THREE.Vector3(-0.96, -0.12, 0.02),
  new THREE.Vector3(-0.92, -0.05, 0.12),
  new THREE.Vector3(-0.88, 0.02, 0.18)
];
const scorpiusWorld = scorpiusDirs.map(v => namedStar(v, 0xc9a0ff, 0.36));
scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(scorpiusWorld), new THREE.LineBasicMaterial({ color: 0xc9a0ff, transparent: true, opacity: 0.7 })));

function makeLabel(text, color = '#e8edf4') {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.font = '600 48px ui-sans-serif, system-ui, sans-serif';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 64);
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  spr.scale.set(18, 4.5, 1);
  return spr;
}
const labPolaris = makeLabel('POLARIS  \u00b7  stays north', '#9ec8ff');
labPolaris.position.copy(polarisDir.clone().multiplyScalar(STAR_R * 0.78));
scene.add(labPolaris);
const labCrux = makeLabel('SOUTHERN CROSS  \u00b7  stays south', '#3dcaa6');
labCrux.position.copy(cruxCenter.clone().normalize().multiplyScalar(STAR_R * 0.78));
scene.add(labCrux);
const labOrion = makeLabel('ORION', '#e07a7a');
labOrion.position.copy(orionDirs[0].clone().normalize().multiplyScalar(STAR_R * 0.78));
labOrion.scale.set(10, 2.5, 1);
scene.add(labOrion);
const labScor = makeLabel('SCORPIUS', '#c9a0ff');
labScor.position.copy(scorpiusDirs[0].clone().normalize().multiplyScalar(STAR_R * 0.78));
labScor.scale.set(12, 3, 1);
scene.add(labScor);
const labSun = makeLabel('SUN', '#f0c14b');
labSun.position.set(0, 4.2, 0);
labSun.scale.set(8, 2, 1);
scene.add(labSun);

let mode = 'space';
let playing = true;
let speed = 1;
let month = 2.5;
let spin = 0;
let exaggerate = false;

const $ = id => document.getElementById(id);
const titleEl = $('title');
const copyEl = $('copy');
const statEl = $('stat');
const monthLabel = $('monthLabel');

function setMode(next) {
  mode = next;
  $('btnSpace').classList.toggle('active', mode === 'space');
  $('btnSouth').classList.toggle('active', mode === 'south');
  $('btnNorth').classList.toggle('active', mode === 'north');
  titleEl.textContent = copy[mode].title;
  copyEl.textContent = copy[mode].text;
  controls.enabled = mode === 'space';
  camera.fov = mode === 'space' ? 55 : 75;
  camera.updateProjectionMatrix();
}

$('btnSpace').onclick = () => setMode('space');
$('btnSouth').onclick = () => setMode('south');
$('btnNorth').onclick = () => setMode('north');
$('btnPause').onclick = () => {
  playing = !playing;
  $('btnPause').textContent = playing ? 'Pause' : 'Play';
};
$('speed').oninput = e => { speed = parseFloat(e.target.value); };
$('month').oninput = e => {
  month = parseFloat(e.target.value);
  if (playing) { playing = false; $('btnPause').textContent = 'Play'; }
  updateMonthUI();
};
$('btnParallax').onclick = () => {
  exaggerate = !exaggerate;
  $('btnParallax').classList.toggle('active', exaggerate);
  $('btnParallax').textContent = exaggerate ? 'Stars too close (fake)' : 'Exaggerate distance';
  const r = exaggerate ? 28 : STAR_R;
  const attr = stars.geometry.getAttribute('position');
  for (let i = 0; i < attr.count; i++) {
    const v = new THREE.Vector3(attr.getX(i), attr.getY(i), attr.getZ(i)).normalize().multiplyScalar(r);
    attr.setXYZ(i, v.x, v.y, v.z);
  }
  attr.needsUpdate = true;
  copyEl.textContent = exaggerate
    ? 'This is a lie on purpose. The stars have been dragged in to just beyond Earth\u2019s orbit. Now you can see the sky shift as we go around the Sun. Real stars are about 270,000 times farther than this fake shell.'
    : copy[mode].text;
};

function nightConstellation(m) {
  const t = (m % 12) / 12;
  if (t > 0.15 && t < 0.4) return 'Scorpius (Sun hides Orion)';
  if (t > 0.65 && t < 0.9) return 'Orion (Sun hides Scorpius)';
  if (t >= 0.4 && t <= 0.65) return 'the winter southern sky';
  return 'the summer southern sky';
}
function updateMonthUI() {
  const mi = ((Math.floor(month) % 12) + 12) % 12;
  monthLabel.textContent = MONTHS[mi];
  statEl.textContent = MONTHS[mi] + ' \u00b7 ' + VIC_SEASON[mi] + ' in Victoria \u00b7 midnight sky faces ' + nightConstellation(month);
}

const _world = new THREE.Vector3();
const _earth = new THREE.Vector3();
const _out = new THREE.Vector3();
const _look = new THREE.Vector3();
const _pole = new THREE.Vector3();

function placeSkyCamera(obs, preferSouth) {
  obs.getWorldPosition(_world);
  earthHolder.getWorldPosition(_earth);
  _out.copy(_world).sub(_earth).normalize();
  _pole.set(0, preferSouth ? -1 : 1, 0);
  camera.position.copy(_world).addScaledVector(_out, 0.18);
  _look.copy(_world).addScaledVector(_out, 10).addScaledVector(_pole, 4);
  camera.up.copy(_out);
  camera.lookAt(_look);
}

const clock = new THREE.Clock();
function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.05);
  if (playing) {
    month = (month + dt * speed * 0.22) % 12;
    $('month').value = month;
    updateMonthUI();
  }
  orbitPivot.rotation.y = (month / 12) * Math.PI * 2;
  spin += dt * speed * 1.6;
  earthSpin.rotation.y = spin;
  if (mode === 'space') {
    controls.target.lerp(earthHolder.getWorldPosition(_world), 0.08);
    controls.update();
  } else if (mode === 'south') {
    placeSkyCamera(southObs, true);
  } else {
    placeSkyCamera(northObs, false);
  }
  renderer.render(scene, camera);
}
updateMonthUI();
tick();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
