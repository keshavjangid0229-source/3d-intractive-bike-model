import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ============================================
// 1. SCENE, CAMERA, RENDERER (har 3D project mein ye 3 hote hain)
// ============================================

// Scene = 3D duniya, jisme bike aur lights rakhte hain
const scene = new THREE.Scene();
scene.background = new THREE.Color('#15171a');

// Camera = hamari aankh. 45 = kitna chauda dikhe (field of view)
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(2.6, 1.3, 3.2); // camera ki shuruaati jagah (x, y, z)

// Renderer = scene aur camera ko lekar canvas par tasveer banata hai
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// ============================================
// 2. LIGHTS (bina light ke bike kaali dikhegi)
// ============================================

// Har taraf se halki roshni (upar se safed, neeche se grey)
const softLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
scene.add(softLight);

// Ek taraf se tez roshni (sooraj jaisi)
const sunLight = new THREE.DirectionalLight(0xffffff, 2);
sunLight.position.set(4, 6, 4);
scene.add(sunLight);

// ============================================
// 3. CONTROLS (mouse se ghumana aur zoom karna)
// ============================================

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.55, 0);   // camera is point ko dekhta hai (bike ka beech)
controls.autoRotate = true;        // shuru mein bike khud ghume
controls.minDistance = 1;          // isse paas zoom nahi
controls.maxDistance = 6;          // isse door zoom nahi

// ============================================
// 4. BIKE KA MODEL LOAD KARNA
// ============================================

let bike; // yahan bike save hogi, taaki baaki code use kar sake

const loader = new GLTFLoader();
loader.load('scene.gltf', function (gltf) {
  bike = gltf.scene;                 // model mil gaya
  scene.add(bike);                   // scene mein daal diya
  document.getElementById('loading').style.display = 'none'; // "Loading" chhupa do
});

// ============================================
// 5. COLOR BADALNA
// ============================================

function changeColor(color) {
  if (!bike) return; // bike abhi load nahi hui to kuch mat karo

  // traverse = bike ke andar ke har part ko ek-ek karke dekho
  bike.traverse(function (part) {
    // sirf body ke paint wale parts ka color badlo
    if (part.isMesh) {
      if (part.material.name === 'carpaint_red' || part.material.name === 'paintRed') {
        part.material.color.set(color);
      }
    }
  });
}

document.getElementById('btn-red').onclick = function () { changeColor('#d62828'); };
document.getElementById('btn-black').onclick = function () { changeColor('#111111'); };
document.getElementById('btn-blue').onclick = function () { changeColor('#1d4ed8'); };

// ============================================
// 6. CAMERA KO PART KI TARAF LE JANA (animation)
// ============================================

const info = document.getElementById('info');

// Camera ko kahan jana hai (abhi kahin nahi)
let goalPosition = null;
let goalLookAt = null;

function moveCamera(position, lookAt) {
  controls.autoRotate = false; // ghumna band
  goalPosition = new THREE.Vector3(position[0], position[1], position[2]);
  goalLookAt = new THREE.Vector3(lookAt[0], lookAt[1], lookAt[2]);
}

function showInfo(title, text) {
  info.innerHTML = '<h3>' + title + '</h3><p>' + text + '</p>';
  info.classList.remove('hidden');
}

// Engine button: camera engine ki taraf jaye aur info dikhe
document.getElementById('btn-engine').onclick = function () {
  moveCamera([1.3, 0.45, 0.6], [0, 0.35, 0.05]);
  showInfo('Engine', '950cc,200hp,150nm (CC, power, torque).');
};

// Wheel button
document.getElementById('btn-wheel').onclick = function () {
  moveCamera([1.2, 0.4, 1.5], [0, 0.3, 0.7]);
  showInfo('Front Wheel', 'best.');
};

// Reset button: wapas shuru wali jagah
document.getElementById('btn-reset').onclick = function () {
  moveCamera([2.6, 1.3, 3.2], [0, 0.55, 0]);
  info.classList.add('hidden');
};

// Agar user khud mouse se ghumaye, to camera ki auto movement band
controls.addEventListener('start', function () {
  goalPosition = null;
  controls.autoRotate = false;
});

// ============================================
// 7. ANIMATION LOOP (ye baar-baar chalta rehta hai, 1 second mein ~60 baar)
// ============================================

function animate() {
  requestAnimationFrame(animate); // agla frame bhi chalao

  // Agar camera ko kahin jana hai to har frame mein thoda-sa (5%) us taraf khiskao.
  // Isi se movement smooth dikhti hai.
  if (goalPosition) {
    camera.position.lerp(goalPosition, 0.05);
    controls.target.lerp(goalLookAt, 0.05);

    // Pahunch gaya to ruk jao
    if (camera.position.distanceTo(goalPosition) < 0.01) {
      goalPosition = null;
    }
  }

  controls.update();
  renderer.render(scene, camera); // ab tasveer banao
}

animate();

// ============================================
// 8. WINDOW KA SIZE BADLE TO (phone ghumao, window chhoti karo)
// ============================================

window.onresize = function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};
