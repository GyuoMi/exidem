import * as THREE from "three";
import { SceneManager } from "./SceneManager.js";
import { Player } from "./Player.js";
import { ModelLoader } from "./ModelLoader.js";
import { Octree } from "three/addons/math/Octree.js";
import { Interactions } from "./mechanics/Interactions.js";
import loadLevel1 from "../levels/level1.js";

const container = document.getElementById("canvasContainer");
const scene = new THREE.Scene();
const sceneManager = new SceneManager(scene, container);

const listener = new THREE.AudioListener();
sceneManager.camera.add(listener);

const worldOctree = new Octree();
const player = new Player(worldOctree, sceneManager.camera, container, listener);
const modelLoader = new ModelLoader(sceneManager.scene, worldOctree);
const interactions = new Interactions(scene, player, worldOctree); 
player.setInteractions(interactions);


document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { // Toggle pause menu
        const pauseMenu = document.getElementById('pauseMenu');
        if (pauseMenu.style.display === 'none') {
            pauseMenu.style.display = 'flex';
            sceneManager.renderer.setAnimationLoop(null); // Stop the game loop
        } else {
            pauseMenu.style.display = 'none';
            sceneManager.renderer.setAnimationLoop(animate); // Resume the game loop
        }
    }
});

document.getElementById('resumeGame').addEventListener('click', () => {
    document.getElementById('pauseMenu').style.display = 'none';
    sceneManager.renderer.setAnimationLoop(animate); // Resume the game
});

document.getElementById('restartGame').addEventListener('click', () => {
    location.reload(); // Reload the current page to restart
});

document.getElementById('quitToMenu').addEventListener('click', () => {
    window.location.href = '../index.html'; // Switch back to the menu
});


const hud = document.getElementById('hud');
// Inside your animate or game loop
function updateHUD() {
  const playerPosition = player.camera.position;  
  const x = playerPosition.x.toFixed(2);  
  const y = playerPosition.y.toFixed(2);
  const z = playerPosition.z.toFixed(2);
  
  // Update the HUD text
  hud.innerText = `Player Position: x: ${x}, y: ${y}, z: ${z}`;
}

// modelLoader.loadStairModel();
loadLevel1(modelLoader, sceneManager.scene, worldOctree, player);

player.playerCollider.start.set(0, 10, 0);
player.playerCollider.end.set(0, 10.65, 0);
function animate() {
  const deltaTime =
    Math.min(0.05, sceneManager.clock.getDelta()) / player.STEPS_PER_FRAME;

  for (let i = 0; i < player.STEPS_PER_FRAME; i++) {
    // TODO: remove controls call here, it's just an easier speedboost lol
    player.controls(deltaTime);
    player.update(deltaTime);
    interactions.checkForInteractions();
    updateHUD();
  }



  sceneManager.render();
  sceneManager.updateStats();
}

sceneManager.renderer.setAnimationLoop(animate);
