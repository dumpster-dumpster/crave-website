import * as THREE from 'three';
import { createNoise2D, createNoise3D } from 'simplex-noise';

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
const spotLight = new THREE.SpotLight(0xffffff, 1000);
spotLight.angle = Math.PI / 4; // Angle of the spotlight
spotLight.penumbra = 0.5; // Soft edge of the spotlight
spotLight.decay = 3; // Decay of the light
spotLight.distance = 100; // Distance of the light
spotLight.position.set(5, 0, 0);
spotLight.target.position.set(0, 0, 0); // Target position
scene.add(spotLight);
scene.add(spotLight.target);

const spotLight1 = new THREE.SpotLight(0xffffff, 1000);
spotLight.angle = Math.PI / 4; // Angle of the spotlight
spotLight.penumbra = 0.5; // Soft edge of the spotlight
spotLight.decay = 3; // Decay of the light
spotLight.distance = 100; // Distance of the light
spotLight1.position.set(0, 0, 5);
spotLight1.target.position.set(0, 0, 0); // Target position
scene.add(spotLight1);
scene.add(spotLight1.target);

// const spotLight2 = new THREE.SpotLight(0xffffff, 15000);
// spotLight2.position.set(-10, -10, -10);
// spotLight2.target.position.set(0, 0, 0); // Target position
// scene.add(spotLight2);
// scene.add(spotLight2.target);

// Update the sphere material to be silver and reflective
const reflectiveMaterial = new THREE.MeshStandardMaterial({
  color: 0xc0c0c0, // Silver color
  metalness: 1, // Fully metallic
  roughness: 0.2 // Slightly smooth for reflectivity
});
sphere.material = reflectiveMaterial;

// Prepare for fluid motion
const simplex = createNoise3D();
const noiseParams = {
  scale: 0.5,
  speed: 0.2,
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
  applyFluidMotion(time); // Apply fluid motion to the sphere
  sphere.rotation.y += 0.01; // Rotate the sphere
  renderer.render(scene, camera);
}

animate();
