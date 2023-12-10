console.log("JavaScript is working");

import * as THREE from "three";

// Canvas
const canvas = document.querySelector(".webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Objects
 */
const group = new THREE.Group();
group.position.y = -2;
group.position.x = 1.5;
scene.add(group);

const cube1 = new THREE.Mesh(
	new THREE.BoxGeometry(1, 1, 1),
	new THREE.MeshBasicMaterial({ color: "green", wireframe: true }),
);
group.add(cube1);

const cube2 = new THREE.Mesh(
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
group.add(cube3);

// Axes helper
const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

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
	width: 800,
	height: 600,
};

// field of view = 75, high (easier for beginners), aspect ratio
// Camera frustum vertical field of view, from bottom to top of view, in degrees. Default is 50.
// https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.set(null, null, 3); // z = camera is moved backward before

// distance between object and camera
// console.log(mesh.position.distanceTo(camera.position));
// https://threejs.org/docs/#api/en/math/Vector3.normalize
// mesh.position.normalize();
//console.log(mesh.position.length()); // will be 1 after normalize

// Look At
camera.lookAt(group.position);

// Renderer
const renderer = new THREE.WebGLRenderer({
	canvas,
});
renderer.setSize(sizes.width, sizes.height);

renderer.render(scene, camera);

// Animations

// used to show animations on same speed on all monitor frequencies
const clock = new THREE.Clock();

const tick = () => {
	const elapsedTime = clock.getElapsedTime();
	// console.log("tick", elapsedTime);

	group.position.y = Math.sin(elapsedTime);
	group.position.x = Math.cos(elapsedTime);

	camera.lookAt(group.position);

	// elapsedTime * Math.PI * 0.1;
	// group.rotation.z = elapsedTime;
	// group.scale.y += 0.01;

	renderer.render(scene, camera);

	/* The window.requestAnimationFrame() method tells the browser you wish to perform an animation. It requests the browser to call a user-supplied callback function before the next repaint.
	The frequency of calls to the callback function will generally match the display refresh rate. The most common refresh rate is 60hz. Source: 
	https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame*/

	window.requestAnimationFrame(tick);
};

tick();
