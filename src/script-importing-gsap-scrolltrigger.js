import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
// https://threejs.org/docs/#examples/en/loaders/GLTFLoader
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Base
 */
// Debug
const gui = new GUI();

// https://lil-gui.georgealways.com/
// Create dropdowns by passing an array or object of named values
const debugSettings = {
	modelToLoad: "duck",
};
const modelDropdownController = gui.add(debugSettings, "modelToLoad", {
	Duck: "duck",
	"Duck (Draco loader via WASM)": "duck-draco",
	Helmet: "helmet",
	"Fox (Animated)": "fox",
});
modelDropdownController.onChange(loadSelectedModel);

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Animation Mixer
let mixer = null;

/**
 * Models
 */
const gltfLoader = new GLTFLoader();

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");
gltfLoader.setDRACOLoader(dracoLoader);

let currentModel; // state
loadSelectedModel("duck");

function loadModel(modelPath) {
	gltfLoader.load(
		modelPath,
		(gltf) => {
			console.log("success, gltf file loaded", { gltf });

			currentModel = gltf.scene; // TODO: is this updated?

			currentModel.scale.set(0.5, 0.5, 0.5);
			currentModel.position.set(2, 1, 0);
			currentModel.rotation.set(0, Math.PI * 1.5, 0);

			// Special case, scaling needed for Fox + animation
			if (modelPath === "/models/Fox/glTF/Fox.gltf") {
				mixer = new THREE.AnimationMixer(gltf.scene);

				// multiple animations are contained
				// const action = mixer.clipAction(gltf.animations[0]);
				const action = mixer.clipAction(gltf.animations[1]);
				console.log(action);
				action.play();

				currentModel.scale.set(0.025, 0.025, 0.025);
			}

			scene.add(currentModel);

			initScrollTriggers(currentModel);
		},
		() => {
			console.log("progress");
		},
		() => {
			console.log("error");
		},
	);
}

function loadSelectedModel(selectedModel) {
	console.log("loadSelectedModel", { selectedModel });

	// Remove the current model from the scene if exists
	if (currentModel) {
		console.log("Current model found, removing it from scene", {
			currentModel,
		});
		scene.remove(currentModel);
	}

	if (selectedModel === "duck") {
		loadModel("/models/Duck/glTF-Embedded/Duck.gltf");
	}

	if (selectedModel === "helmet") {
		loadModel("/models/FlightHelmet/glTF/FlightHelmet.gltf");
	}

	if (selectedModel === "duck-draco") {
		loadModel("/models/Duck/glTF-Draco/Duck.gltf");
	}

	if (selectedModel === "fox") {
		loadModel("/models/Fox/glTF/Fox.gltf");
	}
}
/**
 * Floor
 */
/*const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: "#444444",
    metalness: 0,
    roughness: 0.5,
  })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);*/

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/**
 * Sizes
 */
// TODO: use canvas size instead of window size
const sizes = {
	width: 500,
	height: 500,
};

window.addEventListener("resize", () => {
	// TODO: what is needed here for responsiveness?
	// Update sizes
	// sizes.width = window.innerWidth;
	// sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	100,
);
camera.position.set(2, 2, 2);
scene.add(camera);

// Controls
/*const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;*/

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearAlpha(0); // Set clear alpha to make the background transparent

/**
 * Animate (needed for ThreeJS)
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
	const elapsedTime = clock.getElapsedTime();
	const deltaTime = elapsedTime - previousTime;
	previousTime = elapsedTime;

	// Update animation mixer
	if (mixer !== null) {
		mixer.update(deltaTime);
	}

	// Update controls
	// controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();

/**
 * Add GSAP ScrollTrigger animation
 *
 */

// TODO: do we need to use the canvas?
function initScrollTriggers(currentModel) {
	const animationTimeline = gsap.timeline({
		default: {
			duration: 1,
			ease: "power2.inOut",
		},
		scrollTrigger: {
			trigger: canvas,
			start: "top center", // Trigger when the top of the canvas reaches the center of the viewport
			end: "bottom center", // Trigger when the bottom of the canvas reaches the center of the viewport
			scrub: 1,
			markers: true, // Show markers on the timeline
		},
		onStart: () => {
			console.log("Animation started!");
		},
		onUpdate: (progress) => {
			console.log("Animation progress:", progress);
		},
		onComplete: () => {
			console.log("Animation completed!");
		},
		onInterrupt: () => {
			console.log("Animation interrupted!");
		},
	});

	// Rotate the model around its own center horizontally - or the camera.rotation?
	animationTimeline.to(currentModel.rotation, {
		duration: 1,

		// TODO: does not work
		/*y: (index, target, targets) => {
			// Calculate the target rotation dynamically
			const currentRotation = currentModel.rotation.y;
			console.log({ currentRotation });
			const fullRotation = Math.PI * 2;
			return currentRotation + fullRotation;
		},*/

		// https://gsap.com/docs/v3/GSAP/gsap.to()/#relative-values

		// TODO: do we need to starting value?
		// otherwise this is the end state
		y: currentModel.rotation.y + Math.PI * 2, // 3 full rotations
		// TODO: this only works in one direction, not the other with Math.PI *2 --> why?
		// y: Math.Pi, // Rotate by radian (adjust as needed)
		// y: currentModel.rotation + -Math.PI * 2,
		// x: Math.PI * 2,
		// z:
		// y: "+=180", // Rotate by radian (adjust as needed)
		// ease: "power2.inOut",
		onStart: () => {
			console.log("rotate started!");
		},
		onComplete: () => {
			console.log("rotate completed!");
		},
		onUpdate: () => {
			// Log the rotation values
			console.log(
				"Rotation values (x, y, z):",
				currentModel.rotation.x,
				currentModel.rotation.y,
				currentModel.rotation.z,
			);
		},
	});

	// Scale the model to make it a bit bigger
	animationTimeline.to(
		currentModel.scale,
		{
			duration: 1,
			x: currentModel.scale.x + 0.5, // Increase scale by 20%
			y: currentModel.scale.y + 0.5,
			z: currentModel.scale.z + 0.5,
			ease: "power2.inOut",
		},
		"-=1",
	); // Start the scale animation 1 second (duration of rotation) before the end of the timeline
}
