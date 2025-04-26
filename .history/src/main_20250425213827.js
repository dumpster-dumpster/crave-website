import * as THREE from 'three';

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
const light = new THREE.PointLight(0xffffff, 10, 100);
light.position.set(10, 10, 10);
scene.add(light);

// Update the sphere material to be silver and reflective
const reflectiveMaterial = new THREE.MeshStandardMaterial({
  color: 0xc0c0c0, // Silver color
  metalness: 1, // Fully metallic
  roughness: 0.2 // Slightly smooth for reflectivity
});
sphere.material = reflectiveMaterial;

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  sphere.rotation.y += 0.01; // Rotate the sphere
  renderer.render(scene, camera);
}

animate();
