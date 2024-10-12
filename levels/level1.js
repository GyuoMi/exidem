// The Initial Descent
import * as THREE from "three";
import { ModelLoader } from "../scripts/ModelLoader.js";
import { Player } from "../scripts/Player.js";
import { SceneManager } from "../scripts/SceneManager.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Inventory } from "../scripts/mechanics/Inventory.js"
import { Interactions } from "../scripts/mechanics/Interactions.js";

export default function loadLevel1(modelLoader, scene, worldOctree, player) {
  const interactions  = new Interactions(scene, player, worldOctree);

  modelLoader.loadStairModel((stairModel) => {
    let currentPosition = new THREE.Vector3(0, 0, 0); 
    let currentRotation = 0; 

    const numStairs = 2; 
    // create bottom half of stairs
    for (let i = 0; i < numStairs; i++) {
      const stairClone = stairModel.clone();

      stairClone.position.copy(currentPosition);
      stairClone.rotation.y = currentRotation;

      scene.add(stairClone);
      worldOctree.fromGraphNode(stairClone);
      
      currentRotation += Math.PI / 2;
      currentPosition.x += 8.7;
      currentPosition.z -= 0.73;
      currentPosition.y += 2.94; 
    }

    // set position of top half
    currentPosition.set(8, 2.7 * numStairs, -8);
    currentRotation = Math.PI; 
    // top half of stairs
    for (let i = 0; i < numStairs; i++) {
      const stairClone = stairModel.clone();

      stairClone.position.copy(currentPosition);
      stairClone.rotation.y = currentRotation;

      scene.add(stairClone);
      worldOctree.fromGraphNode(stairClone);

      currentRotation += Math.PI / 2;
      currentPosition.x -= 8.7;
      currentPosition.z += 0.73;
      currentPosition.y += 2.94;
    }

    interactions.initializeRandomItems();
  });

  modelLoader.loadWall("innerWall", (wallModel) => {
    let currentPosition = new THREE.Vector3(4, 0, -4); 
    const wall = wallModel.clone();
    wall.position.copy(currentPosition);
    scene.add(wall);
    worldOctree.fromGraphNode(wall);
    });

    modelLoader.loadWall("outerWall",(wallModel) => {
    let currentPosition = new THREE.Vector3(4, 0, -4); 
    const wall = wallModel.clone();
    wall.scale.set(4.4, wall.scale.y, 4.2);
    wall.position.copy(currentPosition);
    scene.add(wall);
    worldOctree.fromGraphNode(wall);
    });

const playerInventory = new Inventory();
document.addEventListener("keydown", (event) => {
  if (event.key === "i") { 
    playerInventory.toggle();
  }
});

// Example item pickups - replace with actual items placed in the game
  function onItemInteract(itemType) {
    if (itemType === "note") {
      playerInventory.addItem({
        name: "Mysterious Note",
        description: "A note with cryptic writing. It might hold a clue."
      });
    } else if (itemType === "key") {
      playerInventory.addItem({
        name: "Rusty Key",
        description: "An old key. Perhaps it opens a hidden door somewhere."
      });
    } else if (itemType === "diary") {
      playerInventory.addItem({
        name: "Torn Diary",
        description: "A diary with a few pages missing. The remaining entries are troubling."
      });
    }
  }

  // Example of setting up interactions (you'll need to call `onItemInteract` when an item is picked up)
  interactions.interactWithItem = (itemType) => {
    onItemInteract(itemType);
    interactions.interactedItems++; // Track interactions
  };
}
