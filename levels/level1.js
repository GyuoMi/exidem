// The Initial Descent
import * as THREE from "three";
import { ModelLoader } from "../scripts/ModelLoader.js";
import { Player } from "../scripts/Player.js";
import { SceneManager } from "../scripts/SceneManager.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Interactions } from "../scripts/mechanics/Interactions.js";
import { Sounds } from "../scripts/mechanics/Sounds.js";

export default function loadLevel1(modelLoader, scene, worldOctree, player) {
  const interactions = new Interactions(scene, player, worldOctree);
  const sounds = new Sounds(player.camera);
  sounds.loadAudio("deep_ac", "../assets/audio/deep_ac.wav");
  sounds.loadAudio("ambience_short", "../assets/audio/ambient_cross.mp3", () => {
    sounds.playAmbientTrack("ambience_short");
});

  // transformation stacks arent used since the scene is static
  modelLoader.loadStairModel((stairModel) => {
    let currentPosition = new THREE.Vector3(0, 0, 0); 
    let currentRotation = 0; 

    //let fillPos = new THREE.Vector3(0, 0, 0);
    //let fillRot = 0;
    //const stairCloneBottom = stairModel.clone();
    //  fillRot += Math.PI / 2;
    //  fillPos.x += 8.7;
    //  fillPos.z -= 0.73;
    //  fillPos.y += 2.94;
    //  stairCloneBottom.position.copy(fillPos);
    //  stairCloneBottom.rotation.y = fillRot;
    //
    //  scene.add(stairCloneBottom);
    //  worldOctree.fromGraphNode(stairCloneBottom);
      
      
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

      const stairCloneTop = stairModel.clone();
      //currentPosition.set(8, 2.7 * numStairs, -8);
      currentPosition.x += 9.4;
      currentPosition.z += 6.5;
      currentPosition.y -= 0.94;
      stairCloneTop.position.copy(currentPosition);
      stairCloneTop.rotation.y = currentRotation;

      scene.add(stairCloneTop);
      worldOctree.fromGraphNode(stairCloneTop);

      currentRotation += Math.PI / 2;

    interactions.initializeRandomItems();
  });

  //modelLoader.loadBoss()
  modelLoader.loadWall("innerWall", (wallModel) => {
    let currentPosition = new THREE.Vector3(4, 0, -4); 
    const wall = wallModel.clone();
    wall.position.copy(currentPosition);
    scene.add(wall);
    worldOctree.fromGraphNode(wall);
  });

  modelLoader.loadWall("outerWall_window",(wallModel) => {
    let currentPosition = new THREE.Vector3(4, 0, -4); 
    const wall = wallModel.clone();
    wall.rotation.y += Math.PI;
    wall.scale.set(4.5, 3.4, 4.2);
    wall.position.copy(currentPosition);
    scene.add(wall);
    worldOctree.fromGraphNode(wall);
  });

  sounds.loadPositionalAudio("deep_ac", "assets/audio/deep_ac.wav", (acSound) => {
        modelLoader.loadAC((acModel) => {
            let currentPosition = new THREE.Vector3(12.6, 12, -5);
            const ac = acModel.clone();
            ac.scale.set(4, 4, 4);
            ac.rotation.y = Math.PI;
            ac.position.copy(currentPosition);
            scene.add(ac);
            
            ac.add(acSound);
            acSound.setLoop(true);
            acSound.play(); 
        });
    });
}
