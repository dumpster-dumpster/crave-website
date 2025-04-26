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
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, }); // Green color
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Create a wireframe for the sphere
// const wireframeGeometry = new THREE.WireframeGeometry(geometry);
// const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0xcdcdcd }); // White wireframe
// const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
// scene.add(wireframe);

// Add an directionals light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(10, 10, 10).normalize();
directionalLight.castShadow = true; // Enable shadow casting
scene.add(directionalLight);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.1);
directionalLight2.position.set(-10, -10, -10).normalize();
directionalLight2.castShadow = true; // Enable shadow casting
scene.add(directionalLight2);

// // Add a helper for the directional light
// const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1); // 1 is the size of the helper
// scene.add(directionalLightHelper);
// const directionalLightHelper1 = new THREE.DirectionalLightHelper(directionalLight2, 1); // 1 is the size of the helper
// scene.add(directionalLightHelper1);

// Add an ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Soft white light
scene.add(ambientLight);

// Add a hemisphere light for ambient lighting
const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x444444, 0.5); // Sky color, ground color, intensity
scene.add(hemisphereLight);

// // Add a grid helper to the scene for better spatial reference
// const gridHelper = new THREE.GridHelper(10, 10); // Size and divisions
// scene.add(gridHelper);

// // Add an axes helper to visualize the coordinate axes
// const axesHelper = new THREE.AxesHelper(5); // Size of the axes
// scene.add(axesHelper);

// Update the sphere material to be silver and reflective
const reflectiveMaterial = new THREE.MeshStandardMaterial({
  color: 0xc0c0c0, // Silver color
  metalness: 1, // Fully metallic
  roughness: 0.3 // Slightly smooth for reflectivity
});
sphere.material = reflectiveMaterial;

// Create a plane that emits light
const planeGeometry = new THREE.PlaneGeometry(5, 5);
const emissiveMaterial = new THREE.MeshStandardMaterial({
  color: 0xffa500, // Orange color
  emissive: 0xfff, // Emissive color
  emissiveIntensity: 1 // Intensity of the emitted light
});
const lightPlane = new THREE.Mesh(planeGeometry, emissiveMaterial);
lightPlane.position.set(0, 3, -5); // Position the plane
lightPlane.rotation.x = -Math.PI / 4; // Angle the plane toward the sphere
scene.add(lightPlane);

// Prepare for fluid motion
const simplex = createNoise3D();
const noiseParams = {
  scale: 0.8,
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

  // Apply fluid motion to the sphere
  applyFluidMotion(time);

  // Rotate the directional lights
  directionalLight.position.x = Math.sin(time) * 10;
  directionalLight.position.z = Math.cos(time) * 10;

  directionalLight2.position.x = Math.cos(time) * 10;
  directionalLight2.position.z = Math.sin(time) * 10;

  // Rotate the sphere
  sphere.rotation.y += 0.01;

  renderer.render(scene, camera);
}

animate();
