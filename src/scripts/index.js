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

// ANCHOR - Canvas
const canvas = document.querySelector('canvas.webgl');

// ANCHOR - Scene
const scene = new THREE.Scene();

// ANCHOR - Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

// Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Adjust intensity as needed
scene.add(ambientLight);

// Variable to store the loaded model
let model;
let meMesh, stringMesh, pivot;

// Load Model
gltfLoader.load(
    '../../public/me9.glb',
    (gltf) => {
        const materials = {
            'me': new THREE.MeshBasicMaterial({ color: 0x00B9E8, wireframe: true }),
            'icons': new THREE.MeshBasicMaterial({ color: 0xFF0000 }), // Example color
            'string': new THREE.MeshBasicMaterial({ color: 0x00FF00 }) // Example color
        };

        // Traverse through the model's scene to find all mesh objects
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                const material = materials[child.name];
                if (material) {
                    child.material = material;
                }
                if (child.name === 'Me') {
                    meMesh = child;
                }
                if (child.name === 'String') {
                    stringMesh = child;
                }
            }
        });

        // Print the child models
        console.log("Child models:");
        gltf.scene.traverse((child) => {
            console.log(child);
        });

        // Create a pivot object and add the stringMesh to it
        if (meMesh && stringMesh) {
            pivot = new THREE.Object3D();
            pivot.add(stringMesh);
            meMesh.add(pivot);
        }

        model = gltf.scene;
        scene.add(model);

        // Calculate bounding box of the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Position the model and camera
        model.position.y -= size.y / 1000;

        // Set the camera position in front of the model, higher, and further back
        const cameraDistance = size.z * 4; // Adjust distance as needed
        camera.position.set(center.x, center.y + size.y * 0.2, center.z + cameraDistance);
        camera.lookAt(center.x, center.y, center.z);

        // Update controls target
        controls.target.set(-0.0001, 0.05, 0);
        controls.update();
    }
);

// ANCHOR - Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
scene.add(camera);

// OrbitControls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; // Enable smooth controls

// Set polar angle limits to restrict up and down rotation
controls.minPolarAngle = Math.PI / 2.1; // Limit the downward angle
controls.maxPolarAngle = 2 * Math.PI / 3; // Limit the upward angle

// Set azimuth angle limits to allow full 360 degree horizontal rotation
controls.minAzimuthAngle = -Infinity;
controls.maxAzimuthAngle = Infinity;

// ANCHOR - Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setClearColor(0xFEFEFA, 1); // Set the background color to #FEFEFA

// Handle window resize
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
});

// ANCHOR - Animate
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Rotate the pivot object around the y-axis
    if (pivot) {
        pivot.rotation.y = elapsedTime; // Adjust rotation speed as needed
        pivot.rotation.z = Math.PI / 50; // Tilt the pivot 45 degrees
    }

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
