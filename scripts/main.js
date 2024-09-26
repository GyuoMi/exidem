import * as THREE from "three";
import { SceneManager } from "./SceneManager.js";
import { Player } from "./Player.js";
import { ModelLoader } from "./ModelLoader.js";
import { Octree } from "three/addons/math/Octree.js";
import loadLevel1 from "../levels/level1.js";

const container = document.getElementById("canvasContainer");
const scene = new THREE.Scene();
const sceneManager = new SceneManager(scene, container);

const worldOctree = new Octree();
const player = new Player(worldOctree, sceneManager.camera, container, scene);
const modelLoader = new ModelLoader(sceneManager.scene, worldOctree);

// modelLoader.loadStairModel();
loadLevel1(modelLoader, scene, worldOctree, player);

player.playerCollider.start.set(0, 10, 0); // Starting above the model, adjust Y for height
player.playerCollider.end.set(0, 10.65, 0);
function animate() {
  const deltaTime =
    Math.min(0.05, sceneManager.clock.getDelta()) / player.STEPS_PER_FRAME;

  for (let i = 0; i < player.STEPS_PER_FRAME; i++) {
    player.controls(deltaTime);
    player.update(deltaTime);
    player.teleportPlayerIfOob();
  }

  sceneManager.render();
  sceneManager.updateStats();
}

sceneManager.renderer.setAnimationLoop(animate);
