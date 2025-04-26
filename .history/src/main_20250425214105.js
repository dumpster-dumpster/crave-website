import * as THREE from 'three';
import SimplexNoise from 'simplex-noise';
import * as dat from 'dat.gui';

// Create the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Black background

// Create the camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// Create the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a green sphere
const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Green color
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Add a light source
const light = new THREE.PointLight(0xffffff, 200, 100);
light.position.set(10, 10, 10);
scene.add(light);

// Update the sphere material to be silver and reflective
const reflectiveMaterial = new THREE.MeshStandardMaterial({
  color: 0xc0c0c0, // Silver color
  metalness: 1, // Fully metallic
  roughness: 0.2 // Slightly smooth for reflectivity
});
sphere.material = reflectiveMaterial;

// Initialize simplex noise
const simplex = new SimplexNoise();

// GUI controls
const gui = new dat.GUI();
const noiseParams = {
  scale: 1,
  speed: 0.01,
  strength: 0.5
};
gui.add(noiseParams, 'scale', 0.1, 5).name('Scale');
gui.add(noiseParams, 'speed', 0.001, 0.1).name('Speed');
gui.add(noiseParams, 'strength', 0.1, 2).name('Strength');

// Modify sphere geometry with noise
const vertices = geometry.attributes.position.array;
const originalVertices = new Float32Array(vertices);

function applyNoise(time) {
  for (let i = 0; i < vertices.length; i += 3) {
    const x = originalVertices[i];
    const y = originalVertices[i + 1];
    const z = originalVertices[i + 2];

    const noise = simplex.noise4D(
      x * noiseParams.scale,
      y * noiseParams.scale,
      z * noiseParams.scale,
      time * noiseParams.speed
    );

    vertices[i] = x + noise * noiseParams.strength;
    vertices[i + 1] = y + noise * noiseParams.strength;
    vertices[i + 2] = z + noise * noiseParams.strength;
  }
  geometry.attributes.position.needsUpdate = true;
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  const time = performance.now() * 0.001;
  applyNoise(time);
  sphere.rotation.y += 0.01; // Rotate the sphere
  renderer.render(scene, camera);
}

animate();
