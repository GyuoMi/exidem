import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FirstPersonControls } from "three/addons/controls/FirstPersonControls.js";

var camera, scene, renderer, light, shape;
let fpControls, orbitControls;
let fpMode = false;

let player,
  playerSpeed = 0.5,
  staircaseSpeed = 0.05;
var p = Math.PI;
var extrudeSettings0 = [];
var extrudeSettings1 = [];
var geo = [];
var mat = [];
var mesh = [];
var gA = new THREE.Group();
var gB = new THREE.Group();

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor("#068", 1);
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  document.body.appendChild(renderer.domElement);
  window.addEventListener("resize", onResize, false);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
  camera.position.set(0, 10, 60);

  orbitControls = new OrbitControls(camera, renderer.domElement);
  fpControls = new FirstPersonControls(camera, renderer.domElement);
  fpControls.movementSpeed = 50;
  fpControls.lookSpeed = 0.2;
  fpControls.lookVertical = true;
  fpControls.enabled = false;

  light = new THREE.PointLight(0xffffff, 14000);
  light.position.set(20, 20, 5);
  scene.add(light);

  scene.add(new THREE.AmbientLight(0xffffff, 5));

  // Create player (sphere)
  const playerGeometry = new THREE.SphereGeometry(1, 32, 32);
  const playerMaterial = new THREE.MeshBasicMaterial({ color: "#00ff00" });
  player = new THREE.Mesh(playerGeometry, playerMaterial);
  player.position.set(0, -20, 0);
  scene.add(player);

  createStairs();
  animate();
}

function animate() {
  requestAnimationFrame(animate);

  if (fpMode) {
    fpControls.update(0.01);
  } else {
    orbitControls.update();
  }

  gA.position.y += staircaseSpeed;
  gB.position.y += staircaseSpeed;

  if (gA.position.y > 40) {
    gA.position.y -= 80;
  }

  if (gB.position.y > 40) {
    gB.position.y -= 80;
  }

  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function handleKeyDown(event) {
  switch (event.key) {
    case "ArrowUp":
      player.position.y += playerSpeed;
      break;
    case "ArrowDown":
      player.position.y -= playerSpeed;
      break;
    case "ArrowRight":
      player.position.x += playerSpeed;
      break;
    case "ArrowLeft":
      player.position.x -= playerSpeed;
      break;
    case "v": //fp mode and orbit controls
      fpMode = !fpMode;
      fpControls.enabled = fpMode;
      orbitControls.enabled = !fpMode;
      break;
  }
}
window.addEventListener("keydown", handleKeyDown);
init();

function createStairs() {
  shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(2, 0);
  shape.lineTo(4, 24);
  shape.lineTo(-2, 24);
  shape.lineTo(0, 0);

  extrudeSettings0 = {
    steps: 2,
    depth: 2,
    bevelEnabled: false,
    bevelThickness: 1,
    bevelSize: 1,
    bevelOffset: 0,
    bevelSegments: 1,
  };
  geo[0] = new THREE.ExtrudeGeometry(shape, extrudeSettings0);
  mat[0] = new THREE.MeshStandardMaterial({ color: "#666", wireframe: false });
  mesh[0] = new THREE.Mesh(geo[0], mat[0]);
  for (let z = 1; z < 20; z++) {
    mesh[z] = mesh[0].clone();
    mesh[z].position.set(z * 2, 0, 0);
    mesh[z].rotation.set(z / 3, p / 2, p / 2);
    gA.add(mesh[z]);
  }
  gA.position.set(0, -20, 0);
  gA.rotation.set(0, 0, p / 2);
  scene.add(gA);

  extrudeSettings1 = {
    steps: 2,
    depth: 0.1,
    bevelEnabled: false,
    bevelThickness: 1,
    bevelSize: 1,
    bevelOffset: 0,
    bevelSegments: 1,
  };
  geo[1] = new THREE.ExtrudeGeometry(shape, extrudeSettings1);
  mat[1] = new THREE.MeshStandardMaterial({
    color: "#f00",
    metalness: 0.4,
    roughness: 0.4,
    wireframe: false,
  });
  mesh[1] = new THREE.Mesh(geo[1], mat[1]);
  for (let z = 1; z < 20; z++) {
    mesh[z] = mesh[1].clone();
    mesh[z].position.set(z * 2, 0, 0);
    mesh[z].rotation.set(z / 3, p / 2, p / 2);
    gB.add(mesh[z]);
  }
  gB.position.set(0, -18.0, 0);
  gB.rotation.set(0, 0, p / 2);
  scene.add(gB);

  geo[2] = new THREE.CylinderGeometry(2, 2, 38);
  mat[2] = new THREE.MeshBasicMaterial({ color: "#ccc", wireframe: false });
  mesh[2] = new THREE.Mesh(geo[2], mat[2]);
  mesh[2].position.set(0, 1, 0);
  scene.add(mesh[2]);
}
