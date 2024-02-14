import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Activer les ombres
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Lumière ambiante plus faible
scene.add(ambientLight);

// Ajouter une source de lumière spot (projecteur)
const spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.position.set(-15, 5, -0);
spotLight.castShadow = true;
scene.add(spotLight);

spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;
spotLight.shadow.camera.near = 0.5;
spotLight.shadow.camera.far = 500;
spotLight.shadow.camera.fov = 30; // Angle du projecteur

camera.position.set(0, 1, 0);
camera.lookAt(-5, 1, 0);

const controls = new PointerLockControls(camera, renderer.domElement);
document.addEventListener('click', function () {
	controls.lock();
});
scene.add(controls.getObject());

const loader = new GLTFLoader();
loader.load(
	'models/the_attic_environment.glb',
	function(gltf) {
		gltf.scene.traverse(function(child) {
			if (child.isMesh) {
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
		scene.add(gltf.scene);
	},
	undefined,
	function(error) {
		console.error('Erreur lors du chargement du fichier glTF', error);
	}
);

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

document.addEventListener('keydown', function(event) {
	switch (event.key) {
		case 'z':
			moveForward = true;
			break;
		case 'q':
			moveLeft = true;
			break;
		case 's':
			moveBackward = true;
			break;
		case 'd':
			moveRight = true;
			break;
		case 'e':
			moveUp = true;
			break;
		case 'a':
			moveDown = true;
			break;
	}
});

document.addEventListener('keyup', function(event) {
	switch (event.key) {
		case 'z':
			moveForward = false;
			break;
		case 'q':
			moveLeft = false;
			break;
		case 's':
			moveBackward = false;
			break;
		case 'd':
			moveRight = false;
			break;
		case 'e':
			moveUp = false;
			break;
		case 'a':
			moveDown = false;
			break;
	}
});

const moveSpeed = 0.2;
const verticalSpeed = 0.1;

function updateMovement() {
	if (moveForward) controls.moveForward(moveSpeed);
	if (moveBackward) controls.moveForward(-moveSpeed);
	if (moveLeft) controls.moveRight(-moveSpeed);
	if (moveRight) controls.moveRight(moveSpeed);
	if (moveUp) controls.getObject().position.y += verticalSpeed;
	if (moveDown) controls.getObject().position.y -= verticalSpeed;
}

const playerPositionElement = document.getElementById('player-position');

function updatePlayerPosition() {
	const playerPosition = controls.getObject().position;
	playerPositionElement.innerText = `Position: (${playerPosition.x.toFixed(2)}, ${playerPosition.y.toFixed(2)}, ${playerPosition.z.toFixed(2)})`;
}

const cameraDataElement = document.getElementById('view-position');

function updateCameraData() {
	const cameraRotation = camera.rotation;
	cameraDataElement.innerText = `Orientation de la caméra: (${cameraRotation.x.toFixed(2)}, ${cameraRotation.y.toFixed(2)}, ${cameraRotation.z.toFixed(2)})`;
}

updatePlayerPosition();

const animate = function() {
	requestAnimationFrame(animate);
	updateMovement();
	updatePlayerPosition();
	updateCameraData();
	renderer.render(scene, camera);
};

animate();
