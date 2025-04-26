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

// // Create a wireframe for the sphere
// const wireframeGeometry = new THREE.WireframeGeometry(geometry);
// const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff }); // White wireframe
// const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
// scene.add(wireframe);

// Add an directionals light
// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
// directionalLight.position.set(10, 10, 10).normalize();
// directionalLight.castShadow = true; // Enable shadow casting
// scene.add(directionalLight);

// const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.1);
// directionalLight2.position.set(-10, -10, -10).normalize();
// directionalLight2.castShadow = true; // Enable shadow casting
// scene.add(directionalLight2);

// // Add a helper for the directional light
// const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1); // 1 is the size of the helper
// scene.add(directionalLightHelper);
// const directionalLightHelper1 = new THREE.DirectionalLightHelper(directionalLight2, 1); // 1 is the size of the helper
// scene.add(directionalLightHelper1);

// add a spot light
const spotLight = new THREE.SpotLight(0xffffff, 100);
spotLight.position.set(2, 2, 2);
spotLight.castShadow = true; // Enable shadow casting
spotLight.angle = Math.PI / 100; // Angle of the spotlight
spotLight.penumbra = 0.1; // Soft edge of the spotlight
spotLight.decay = 2; // Decay of the spotlight
spotLight.distance = 100; // Distance of the spotlight
scene.add(spotLight);
// Add a helper for the spotlight
const spotLightHelper = new THREE.SpotLightHelper(spotLight, 0xff0000); // Red color for the helper
scene.add(spotLightHelper);
// Add an ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
scene.add(ambientLight);
// Add a grid helper
const gridHelper = new THREE.GridHelper(10, 10, 0x0000ff, 0x808080); // Blue and gray grid
scene.add(gridHelper);
// Add an axis helper
const axesHelper = new THREE.AxesHelper(5); // Length of the axes
scene.add(axesHelper);



// Update the sphere material to be silver and reflective
const reflectiveMaterial = new THREE.MeshStandardMaterial({
  color: 0xc0c0c0, // Silver color
  metalness: 0.9, // Fully metallic
  roughness: 0.3 // Slightly smooth for reflectivity
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
