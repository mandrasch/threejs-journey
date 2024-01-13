console.log("JavaScript is working");

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import GUI from "lil-gui";

/**
 * Debug UI
 */
const gui = new GUI();

const cursor = {
	x: 0,
	y: 0,
};

window.addEventListener("mousemove", (event) => {
	cursor.x = event.clientX / sizes.width - 0.5;
	cursor.y = -(event.clientY / sizes.height - 0.5);
});

// Canvas
const canvas = document.querySelector(".webgl");

// Scene
const scene = new THREE.Scene();

// Group
const group = new THREE.Group();
// group.position.y = -2;
// group.position.x = 1.5;
scene.add(group);

/**
 * Own geometry
 * Create own geometry, use Float32Array (easier for the computer to handle)
 */

// https://threejs.org/docs/#api/en/core/BufferGeometry
const bufferGeometry = new THREE.BufferGeometry();

// We create triangles
const totalElementsCount = 300;
const positionsArray = new Float32Array(totalElementsCount * 3 * 3); // every triangle has 3 vertices with x,y,z

for (let i = 0; i < totalElementsCount * 3 * 3; i++) {
	positionsArray[i] = (Math.random() - 0.5) * 4;
}

// https://threejs.org/docs/#api/en/core/BufferAttribute
const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3);
bufferGeometry.setAttribute("position", positionsAttribute);

/**
 * Objects
 */

const cube1 = new THREE.Mesh(
	new THREE.BoxGeometry(1, 1, 1, 3, 3, 3),
	new THREE.MeshBasicMaterial({
		color: "green",
		// for debugging
		wireframe: true,
	}),
);
group.add(cube1);

// Add debuggigung
gui.add(cube1.position, "y").min(-3).max(3).step(0.01);

/*
const triangles = new THREE.Mesh(
	bufferGeometry,
	new THREE.MeshBasicMaterial({
		color: "green",
		// for debugging
		wireframe: true,
	}),
);
group.add(triangles);*/

/*const cube2 = new THREE.Mesh(
	new THREE.BoxGeometry(1, 1, 1),
	new THREE.MeshBasicMaterial({ color: "orange", wireframe: true }),
);
cube2.position.x = 2;
group.add(cube2);

const cube3 = new THREE.Mesh(
	new THREE.BoxGeometry(1, 1, 1),
	new THREE.MeshBasicMaterial({ color: "red", wireframe: true }),
);
cube3.position.x = -2;
group.add(cube3);*/

// Axes helper
/*const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);*/

// Object
/*const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({
	color: "cyan",
	// debug with 	wireframe: true,
	wireframe: true,
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
mesh.position.set(0.7, -0.6, 0.3); // x, y, z
mesh.scale.set(2, 0.25, 0.5);
// Rotation - euler angles
// beware: goes by default in order of x,y, z
mesh.rotation.reorder("YXZ");
mesh.rotation.y = Math.PI * 0.25; // 3.14159, half rotation (or Math.PI * 2 for full rotation)
mesh.rotation.x = Math.PI * 0.25;
console.log(mesh.position.length()); // 0.9219544457292886 (distance of center of scene <-> object position)*/

// Camera
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener("resize", () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	// Resize will also be triggered when moved to another screen
	const pixelRatio = Math.min(window.devicePixelRatio, 2);
	renderer.setPixelRatio(pixelRatio);

	console.log("Window has been resized, new values:", {
		width: sizes.width,
		height: sizes.height,
		pixelRatio: pixelRatio,
	});
});

window.addEventListener("dblclick", () => {
	// for older safari browsers, a workaround would be needed https://stackoverflow.com/a/68803093
	if (!document.fullscreenElement) {
		canvas.requestFullscreen();
	} else {
		document.exitFullscreen();
	}
});

// field of view = 75, high (easier for beginners), aspect ratio
// Camera frustum vertical field of view, from bottom to top of view, in degrees. Default is 50.
// https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	100,
);

/*const aspectRatio = sizes.width / sizes.height;
const camera = new THREE.OrthographicCamera(
	-1 * aspectRatio,
	1 * aspectRatio,
	1,
	-1,
	0.1,
	100,
);*/

camera.position.z = 3; // move backward
// camera.position.set(null, null, 3); // z = camera is moved backward before
// Look At
camera.lookAt(group.position);
scene.add(camera);

// distance between object and camera
// console.log(mesh.position.distanceTo(camera.position));
// https://threejs.org/docs/#api/en/math/Vector3.normalize
// mesh.position.normalize();
//console.log(mesh.position.length()); // will be 1 after normalize

// Renderer
const renderer = new THREE.WebGLRenderer({
	canvas,
});
renderer.setSize(sizes.width, sizes.height);
// Handle different monitors
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.render(scene, camera);

// Animations

// used to show animations on same speed on all monitor frequencies
const clock = new THREE.Clock();

// gsap has its own tick, but we need to render it ourselves with tick()
// gsap.to(group.position, { duration: 1, delay: 1, x: 2 });
// gsap.to(group.position, { duration: 1, delay: 2, x: 0 });

/**
 * Controls
 */
// Use orbit controls to update the camera
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const tick = () => {
	const elapsedTime = clock.getElapsedTime();

	// important for damping!
	controls.update();

	// Update camera manually, invert y (other way round in threejs)
	/*camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3;
	camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3;
	camera.position.y = cursor.y * 5;
	camera.lookAt(group.position);*/

	//group.rotation.y = elapsedTime;

	/*const elapsedTime = clock.getElapsedTime();
	// console.log("tick", elapsedTime);

	group.position.y = Math.sin(elapsedTime);
	group.position.x = Math.cos(elapsedTime);

	camera.lookAt(group.position);

	// elapsedTime * Math.PI * 0.1;
	// group.rotation.z = elapsedTime;
	// group.scale.y += 0.01;*/

	renderer.render(scene, camera);

	/* The window.requestAnimationFrame() method tells the browser you wish to perform an animation. It requests the browser to call a user-supplied callback function before the next repaint.
	The frequency of calls to the callback function will generally match the display refresh rate. The most common refresh rate is 60hz. Source: 
	https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
	*/
	window.requestAnimationFrame(tick);
};

tick();
