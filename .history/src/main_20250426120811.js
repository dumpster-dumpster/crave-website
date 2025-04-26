import * as THREE from 'three';
import { createNoise2D, createNoise3D } from 'simplex-noise';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { PMREMGenerator } from 'three';

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

// Load the HDR environment map
const rgbeLoader = new RGBELoader();
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

rgbeLoader.load('/studio_small_04_4k.hdr', (texture) => {
  const envMap = pmremGenerator.fromEquirectangular(texture).texture;

  // Set the environment map for the scene
  scene.environment = envMap;
  scene.background = envMap; // Optional: Use the HDR as the background

  // Dispose of the original texture to save memory
  texture.dispose();
  pmremGenerator.dispose();
});

// Create a green sphere
const geometry = new THREE.SphereGeometry(2, 320, 320);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, }); // Green color
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Create a plane to act as background
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 1; // Rotate the plane to be horizontal
plane.position.y = -1; // Position the plane below the sphere
scene.add(plane);

// Update the sphere material to use the environment map
const reflectiveMaterial = new THREE.MeshStandardMaterial({
  color: 0xc0c0c0, // Silver color
  metalness: 1, // Fully metallic
  roughness: 0.2, // Smooth for better reflections
  envMapIntensity: 2 // Adjust reflection intensity
});
sphere.material = reflectiveMaterial;

// Prepare for fluid motion
const simplex = createNoise3D();
const noiseParams = {
  scale: 0.5,
  speed: 0.15,
  strength: 0.5
};
const originalVertices = geometry.attributes.position.array.slice();
const vertices = geometry.attributes.position.array;

function applyFluidMotion(time) {
  for (let i = 0; i < vertices.length; i += 3) {
    const x = originalVertices[i];
    const y = originalVertices[i + 1];
    const z = originalVertices[i + 2];

    // Use simplex noise to create fluid motion
    const noiseX = simplex(x * noiseParams.scale, y * noiseParams.scale, time * noiseParams.speed);
    const noiseY = simplex(y * noiseParams.scale, z * noiseParams.scale, time * noiseParams.speed);
    const noiseZ = simplex(z * noiseParams.scale, x * noiseParams.scale, time * noiseParams.speed);

    vertices[i] = x + noiseX * noiseParams.strength;
    vertices[i + 1] = y + noiseY * noiseParams.strength;
    vertices[i + 2] = z + noiseZ * noiseParams.strength;
  }
  geometry.attributes.position.needsUpdate = true;
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  const time = performance.now() * 0.001;

  // Apply fluid motion to the sphere
  applyFluidMotion(time);

  // Rotate the sphere
  sphere.rotation.y += 0.01;

  renderer.render(scene, camera);
}

animate();
