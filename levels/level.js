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
  sounds.loadAudio("ambience_short", "../assets/audio/ambient_cross.mp3", () => {
    sounds.playAmbientTrack("ambience_short");
});

  // transformation stacks arent used since the scene is static
  modelLoader.loadStairModel((stairModel) => {
    let currentPosition = new THREE.Vector3(0, 0, 0); 
    let currentRotation = 0; 

    let fillPos = new THREE.Vector3(0, 0, 0);
    let fillRot = 0;
    const stairCloneBottom = stairModel.clone();
      fillRot -= Math.PI / 2;
      fillPos.x -= 0.6;
      fillPos.z -= 7.50;
      fillPos.y -= 2.50;
      stairCloneBottom.position.copy(fillPos);
      stairCloneBottom.rotation.y = fillRot;

      scene.add(stairCloneBottom);
      worldOctree.fromGraphNode(stairCloneBottom);
      
      
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
	  
      const blockingGeometry = new THREE.PlaneGeometry(5,15); 
      const blockingMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide }); 
      const blockingMesh = new THREE.Mesh(blockingGeometry, blockingMaterial);

      blockingMesh.position.set(5, 20 , 1.7); 
      blockingMesh.rotation.y = Math.PI / 2; 

      scene.add(blockingMesh);

    interactions.initializeRandomItems();
  });

  //modelLoader.loadBoss()
  modelLoader.loadWall("innerWall", (wallModel) => {
    let currentPosition = new THREE.Vector3(4, -4, -4); 
    const wall = wallModel.clone();
    wall.scale.y = 2.4;
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

  modelLoader.loadBarrels("radio", (barrelModel) => {
    let currentPosition = new THREE.Vector3(12, 4.5, 1.5); 
    const barrel = barrelModel.clone();
    barrel.rotation.y -= Math.PI/ 2;
    barrel.scale.set(1.6, 1.6, 1.6);
    barrel.position.copy(currentPosition);
    scene.add(barrel);
    //worldOctree.fromGraphNode(barrel);
  });

  modelLoader.loadBarrels("bag", (barrelModel) => {
    let currentPosition = new THREE.Vector3(-4, 1.5, 1.4); 
    const barrel = barrelModel.clone();
    barrel.rotation.y += Math.PI/ 2;
    barrel.scale.set(1.6, 1.6, 1.6);
    barrel.position.copy(currentPosition);
    scene.add(barrel);
  });

  modelLoader.loadCabinet((cabinetModel) => {
    let currentPosition = new THREE.Vector3(-3.6, 9.9, -10.4); 
    const cabinet = cabinetModel.clone();
    cabinet.rotation.y += Math.PI / 2;
    cabinet.scale.set(3, 2.5, 3);
    cabinet.position.copy(currentPosition);
    scene.add(cabinet);
    worldOctree.fromGraphNode(cabinet);
  });

sounds.loadPositionalAudio("lamp_swing", "../assets/audio/lamp_swing.mp3", (lampSound) => {
    modelLoader.loadLamp((lampModel) => {
        let currentPosition = new THREE.Vector3(4, 16, -9); 
        const lamp = lampModel.clone();
        lamp.rotation.y += Math.PI / 2;
        lamp.scale.set(4, 4, 4);
        lamp.position.copy(currentPosition);
        
        // Add a point light to the lamp
        const lampLight = new THREE.PointLight(0xffddaa, 15, 5); // Color, Intensity, Range
        lampLight.castShadow = true;
        lampLight.position.set(0, -0.8, 0); // Adjust as needed to place within the lamp
        // Configure shadow properties
        lampLight.shadow.mapSize.width = 1024; // Increase for better quality
        lampLight.shadow.mapSize.height = 1024; // Increase for better quality
        lampLight.shadow.camera.near = 0.1; 
        lampLight.shadow.camera.far = 10; // Adjust to control the distance of shadows
        lampLight.shadow.bias = -0.01; // Fine-tune to reduce shadow artifacts

        //  softer shadows,  adjust the light's range
        lampLight.distance = 10; 
        lamp.add(lampLight);
        //const lampHelper = new THREE.PointLightHelper(lampLight);
        //scene.add(lampHelper);

        lamp.add(lampSound);
        lampSound.setLoop(true);
        lampSound.setVolume(0.0625);
        lampSound.play();
        scene.add(lamp);

        swingLamp(lamp);
    });
});

function swingLamp(lamp) {
    const clock = new THREE.Clock();

    function animateSwing() {
        const time = clock.getElapsedTime();
        const swingAngle = Math.sin(time * 1.6) * 0.5; // Adjust swing speed and intensityto match audio
        lamp.rotation.y = swingAngle; 
        lamp.rotation.x = swingAngle;
        requestAnimationFrame(animateSwing);
    }

    animateSwing(); 
}

  sounds.loadPositionalAudio("deep_ac", "../assets/audio/deep_ac.wav", (acSound) => {
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
