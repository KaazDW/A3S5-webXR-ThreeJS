import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

// Basic Threejs variables
let scene;
let camera;
let renderer;
let clock;
let controls; // Variable to hold the pointer lock controls

// Main light
let lumiereExterieur1;
let lumiereExterieur2;

// Bulb lights
let ampoule1;
let ampoule2;
let ampouleOn = true;

// Variables for controlling movement
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;
let originalRotation = null;

// Sound
const switchSoundFile = './models/son.mp3'; // Adjust the path to your audio file
const switchSound = new Audio(switchSoundFile);

// Define a variable to store the clicked object
let clickedObject = null;
function init() {
    clock = new THREE.Clock();
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // ---------------- RENDERER ----------------

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; // IMPORTANT FOR SHADOWS !!!
    document.body.appendChild(renderer.domElement);

    // ---------------- CAMERA ----------------

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 1.5, 0);
    camera.lookAt(-5, 1, 0);
    scene.add(camera);

    // ---------------- LIGHTS ----------------
    const color = 0xFFFFFF;
    const intensity = 50;

    // Main Point light
    lumiereExterieur1 = new THREE.PointLight(color, intensity);
    lumiereExterieur1.castShadow = true; // IMPORTANT FOR SHADOWS !!!
    lumiereExterieur1.position.set(6, 1.5, 0);
    scene.add(lumiereExterieur1);

    // Point light 2 (opposite direction)
    lumiereExterieur2 = new THREE.PointLight(color, intensity);
    lumiereExterieur2.castShadow = true;
    lumiereExterieur2.position.set(-14, 1.5, 0);
    scene.add(lumiereExterieur2);

    const intensity2 = 10;

    // Bulb light 1
    ampoule1 = new THREE.PointLight(color, intensity2);
    ampoule1.castShadow = true;
    ampoule1.position.set(-9.25, 2.25, 0);
    scene.add(ampoule1);

    // Bulb light 2
    ampoule2 = new THREE.PointLight(color, intensity2);
    ampoule2.castShadow = true;
    ampoule2.position.set(1, 2.25, 0);
    scene.add(ampoule2);

    // ---------------- EVENTS ----------------

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('keydown', onKeyDown, false);
    window.addEventListener('keyup', onKeyUp, false);

    // Enable pointer lock controls for the camera
    controls = new PointerLockControls(camera, document.body);
    scene.add(controls.getObject());

    document.addEventListener('click', function () {
        controls.lock();
    });

    // ---------------- SCENE 3D ELEMENTS ----------------

    const loader = new GLTFLoader();
    loader.load(
        'models/the_attic_environment.glb',
        function (gltf) {
            scene.add(gltf.scene);
        },
        undefined,
        function (error) {
            console.error('Erreur lors du chargement du fichier glTF', error);
        }
    );



// Mouse click event listener
    document.addEventListener('click', function(event) {
        if (event.button === 0 && clickedObject !== null) { // Left mouse button clicked
            // Check proximity to the object
            const playerPosition = controls.getObject().position;
            const objectPosition = clickedObject.position;
            const distance = playerPosition.distanceTo(objectPosition);

            // Define a threshold distance for proximity
            const proximityThreshold = 3;
            if (distance <= proximityThreshold) {
                // Rotate the object by 45 degrees around the X axis
                clickedObject.rotation.x += Math.PI / 4;
            }
        }
    });

// Load another GLTF model
    const loader2 = new GLTFLoader();
    loader2.load(
        'models/photo_of_drum_corps_framed.glb',
        function (gltf) {
            gltf.scene.position.set(-7.8, 2.8, 0);
            gltf.scene.scale.set(0.0008, 0.0008, 0.0008);
            gltf.scene.rotation.set(0, Math.PI / 2, 0);
            scene.add(gltf.scene);

            // Set the loaded object as the clicked object
            clickedObject = gltf.scene;
            originalRotation = clickedObject.rotation.clone();

        },
        undefined,
        function (error) {
            console.error('Erreur lors du chargement du nouveau modèle glTF', error);
        }
    );


    // ---------------- STARTING THE GAME MAIN LOOP ----------------
    render();
}

function render() {
    const delta = clock.getDelta(); // get delta time between two frames
    const elapsed = clock.elapsedTime; // get elapsed time

    // Update camera position based on user input
    updateMovement();

    // Update player position and camera data
    updatePlayerPosition();
    updateCameraData();
    updateObjectDistanceStatus();

    updateBulbLightsStatus();
    updateObjectRotationStatus();

    renderer.render(scene, camera); // We are rendering the 3D world
    requestAnimationFrame(render); // we are calling render() again,  to loop
}

function updateMovement() {
    const moveSpeed = 0.05;
    const verticalSpeed = 0.03;

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction).multiplyScalar(moveSpeed);

    const right = new THREE.Vector3();
    camera.getWorldDirection(right).applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2).multiplyScalar(moveSpeed);

    const vertical = new THREE.Vector3(0, verticalSpeed, 0);

    if (moveForward) controls.moveForward(moveSpeed);
    if (moveBackward) controls.moveForward(-moveSpeed);
    if (moveLeft) controls.moveRight(-moveSpeed);
    if (moveRight) controls.moveRight(moveSpeed);
    if (moveUp) controls.getObject().position.y += verticalSpeed;
    if (moveDown) controls.getObject().position.y -= verticalSpeed;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
    switch (event.key) {
        case 'z':
            moveForward = true;
            break;
        case 's':
            moveBackward = true;
            break;
        case 'q':
            moveLeft = true;
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
        case 'c':
            toggleBulbLights();
            break;
    }
}

function onKeyUp(event) {
    switch (event.key) {
        case 'z':
            moveForward = false;
            break;
        case 's':
            moveBackward = false;
            break;
        case 'q':
            moveLeft = false;
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
}

function updatePlayerPosition() {
    const playerPositionElement = document.getElementById('player-position');
    const playerPosition = controls.getObject().position;
    playerPositionElement.innerText = `Position: (${playerPosition.x.toFixed(2)}, ${playerPosition.y.toFixed(2)}, ${playerPosition.z.toFixed(2)})`;
}

function updateCameraData() {
    const cameraDataElement = document.getElementById('view-position');
    const cameraRotation = camera.rotation;
    cameraDataElement.innerText = `Orientation de la caméra: (${cameraRotation.x.toFixed(2)}, ${cameraRotation.y.toFixed(2)}, ${cameraRotation.z.toFixed(2)})`;
}

function toggleBulbLights() {
    ampouleOn = !ampouleOn;
    ampoule1.visible = ampouleOn;
    ampoule2.visible = ampouleOn;

    // Play switch sound
    playSwitchSound();
}

function playSwitchSound() {
    switchSound.currentTime = 0; // Reset the sound playback to the beginning
    switchSound.play(); // Play the sound
}

function updateBulbLightsStatus() {
    const bulbStatusElement = document.getElementById('bulb-status');
    bulbStatusElement.innerText = `Ampoules allumées : ${ampouleOn ? 'Oui' : 'Non'}`;
}
function updateObjectRotationStatus() {
    if (clickedObject !== null) {
        const objectRotationElement = document.getElementById('object-rotation');
        const objectRotation = clickedObject.rotation;
        const remainder = objectRotation.x % (2 * Math.PI);
        if (Math.abs(remainder) < 0.01) { // Adjust the threshold as needed
            objectRotationElement.innerText = `Cadre droit ? : Oui`;
            objectRotation.x = originalRotation.x;
        } else {
            objectRotationElement.innerText = `Cadre droit ? : Non`;
        }
    }
}
function updateObjectDistanceStatus() {
    if (clickedObject !== null) {
        const objectDistanceElement = document.getElementById('object-distance');
        const playerPosition = controls.getObject().position;
        const objectPosition = clickedObject.position;
        const distance = playerPosition.distanceTo(objectPosition);
        objectDistanceElement.innerText = `Distance de l'objet: ${distance.toFixed(2)}m`;
    }
}
init();
