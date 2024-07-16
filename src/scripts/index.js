import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('draco/');

// GLTF loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

//ANCHOR - Canvas
const canvas = document.querySelector('canvas.webgl');

//ANCHOR - Scene
const scene = new THREE.Scene();

//ANCHOR - Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

// Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Adjust intensity as needed
scene.add(ambientLight);

// Variable to store the loaded model
let model;

// Load Model
gltfLoader.load(
    '../../public/woman.glb',
    (gltf) => {
        const material = new THREE.MeshBasicMaterial({ color: 0x00B9E8, wireframe: true });

        // Traverse through the model's scene to find all mesh objects
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.material = material;
            }
        });

        model = gltf.scene;
        scene.add(model);

        // Calculate bounding box of the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Position the model and camera
        model.position.y -= size.y / 2;

        // Set the camera position in front of the model, higher, and further back
        const cameraDistance = size.z * 2; // Adjust distance as needed
        camera.position.set(center.x, center.y + size.y * 0.2, center.z + cameraDistance);
        camera.lookAt(center.x, center.y, center.z);

        // Update controls target
        controls.target.set(-0.0001, 0.05, 0);
        controls.update();

        // Create the particle swirl
        createParticleSwirl(center, size);
    }
);

console.log("Woman Model Attribution: Women/Female Body Base Rigged (https://skfb.ly/orItY) by camilooh is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).");

//ANCHOR - Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
scene.add(camera);

// OrbitControls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; // Enable smooth controls

// Set polar angle limits to restrict up and down rotation
controls.minPolarAngle = Math.PI / 2.2; // Limit the downward angle
controls.maxPolarAngle = 2 * Math.PI / 3; // Limit the upward angle

// Set azimuth angle limits to allow full 360 degree horizontal rotation
controls.minAzimuthAngle = -Infinity;
controls.maxAzimuthAngle = Infinity;

//ANCHOR - Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);

// Handle window resize
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
});

//ANCHOR - Create Particle Swirl
const createParticleSwirl = (center, size) => {
    const particleCount = 2000;
    const particles = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        const angle = i * 0.2; // Adjust the spacing between particles
        const radius = 0.1 + 0.5 * Math.sin(angle * 0.1); // Adjust the radius growth as needed
        const y = size.y * 0.5 * Math.cos(angle * 0.05) - 0.5 * size.y; // Adjust the height spread as needed
        particlePositions[i * 3] = center.x + radius * Math.cos(angle);
        particlePositions[i * 3 + 1] = center.y + y;
        particlePositions[i * 3 + 2] = center.z + radius * Math.sin(angle);
    }

    particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff, // Adjust the particle color
        size: 0.02 // Adjust the particle size
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    return particleSystem;
};

//ANCHOR - Animate
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update model rotation if it's loaded
    if (model) {
        model.rotation.y = elapsedTime;
    }

    // Update particle rotation
    const particleSystem = scene.children.find(child => child instanceof THREE.Points);
    if (particleSystem) {
        particleSystem.rotation.y = elapsedTime * 0.5; // Adjust the rotation speed as needed
    }

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
