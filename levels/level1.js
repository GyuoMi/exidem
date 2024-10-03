// The Initial Descent
import * as THREE from "three";
import { ModelLoader } from "../scripts/ModelLoader.js";
import { Player } from "../scripts/Player.js";
import { SceneManager } from "../scripts/SceneManager.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Inventory } from "../scripts/mechanics/Inventory.js"

export default function loadLevel1(modelLoader, scene, worldOctree, player) {
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
  });

const playerInventory = new Inventory();
document.addEventListener("keydown", (event) => {
  if (event.key === "i") { 
    playerInventory.toggle();
  }
});

playerInventory.addItem({
  name: "Ann's Note",
  description: "This is the first note. It contains valuable information."
});

playerInventory.addItem({
  name: "Key",
  description: "A rusty old key. It looks like it might open a door."
});

}
