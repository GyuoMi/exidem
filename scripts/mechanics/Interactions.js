import * as THREE from "three";
import { ModelLoader } from "../ModelLoader.js";  
import { buildTwistMaterial } from "../objects/shaderPatch.js";
import { Octree } from "three/addons/math/Octree.js";
import { Sounds } from "./Sounds.js";
import { Inventory } from "./Inventory.js";

export class Interactions {
  constructor(scene, player, worldOctree) {
    this.scene = scene;
    this.player = player;
    this.worldOctree = worldOctree;
    this.modelLoader = new ModelLoader(scene, worldOctree);
    this.sounds = new Sounds(player.camera);

    this.items = [
      { type: "paper_bag", position: new THREE.Vector3(-6.6, 1.5, -0.8) },
      { type: "note", position: new THREE.Vector3(10.65, 9.85, -12.33) },
      { type: "key", position: new THREE.Vector3(10.61, 5.49, 1.79) },
      { type: "cardboard_box", position: new THREE.Vector3(3.64, 3.2, -0.18) },
      { type: "small_radio", position: new THREE.Vector3(-3.03, 11.24, -10.33) },
    ];

    this.exit = { type: "exit_sign", position: new THREE.Vector3(12.61, 12.49, 1.79) };
    this.exitDir = Math.round(Math.random());//(Math.random()>=0.5)? 1 : 0;
    this.activeItems = [];
    this.interactedItems = 0;
    this.levelCompleted = 0;
    this.levelEnded = false;
    this.lives = 3;

    this.lifeContainer = document.getElementById("life-container");
    this.FKeyPressed = false;

    // Listen for keydown and keyup to track 'F' key state
    document.addEventListener('keydown', (event) => {
        if (event.key === 'f' || event.key === 'F') {
            this.isFKeyPressed = true;
        }
    });

    document.addEventListener('keyup', (event) => {
        if (event.key === 'f' || event.key === 'F') {
            this.isFKeyPressed = false;
        }
    });

    this.playerInventory = new Inventory();
  }

initializeRandomItems() {
    this.levelEnded = false;
    this.scene.remove(this.exit.type);

    //if (this.activeItems.length > 0){
    //  console.warn("skipping dupes, already initialized");
    //  return;
    //}
    this.activeItems = this.items.sort(() => 0.5 - Math.random()).slice(0, 2);
    this.modelLoader.loadItem(this.exit.type, (exitModel) => {
        this.exitDir = !this.exitDir;
      this.exitDir = true;
        console.log("exit:", this.exitDir === true ? "up" : this.exitDir === false ? "down" : this.exitDir);
        // logic is the sign points up when rotated, and points down by default
        if (this.exitDir){
          exitModel.rotation.y = Math.PI;
        }
        exitModel.position.copy(this.exit.position);
        //this.worldOctree.fromGraphNode(exitModel);
        // could remove exit model after each level, but the randomness might make it funny
        this.scene.add(exitModel);
    });
    for (const item of this.activeItems) {
        this.modelLoader.loadItem(item.type, (itemModel) => {
            itemModel.position.copy(item.position);
            itemModel.name = item.type;
            this.scene.add(itemModel);
            //this.worldOctree.fromGraphNode(itemModel);

            // Compute bounding box and scale it by 1.5x
            const bbox = new THREE.Box3().setFromObject(itemModel);
            
            bbox.expandByScalar(1.5);
            itemModel.userData.boundingBox = bbox;
            itemModel.userData.type = item.type;

            console.log(`Item loaded: ${item.type} with scaled bounding box at (${item.position.x}, ${item.position.y}, ${item.position.z})`);

            // Optionally visualize the scaled bounding box
            const boxHelper = new THREE.Box3Helper(bbox, 0xfff000); 
            this.scene.add(boxHelper);
        });
    }
}

checkForInteractions() {
    let nearestItem = null;
    let nearestDistance = Infinity;
    const playerPosition = this.player.playerCollider.end.clone();
    this.scene.traverse((object) => {
        if (object.userData.boundingBox) {
            const bbox = object.userData.boundingBox;
            if (bbox.containsPoint(playerPosition)) {
                // Calculate distance to determine the closest item
                const distance = playerPosition.distanceTo(object.position);

                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestItem = object;

                }
            }
        }
    });

    if (nearestItem) {
        this.showInteractionPrompt(nearestItem.userData.type);
        //const pickups = ["diary", "note", "key"];
        if (this.isInteractKeyPressed()) {
            this.interactWithItem(nearestItem.userData.type);
            this.scene.remove(nearestItem);
        }
    } else {
        this.hideInteractionPrompt();
    }
}


showInteractionPrompt(itemType) {
    const interactionDiv = document.getElementById("interactionPrompt");
    interactionDiv.style.display = "block";
    // TODO: fix text display so it's not like paper_bag but rather Paper Bag
    interactionDiv.innerText = `Press F to interact with ${itemType}`;
}

hideInteractionPrompt() {
    const interactionDiv = document.getElementById("interactionPrompt");
    interactionDiv.style.display = "none";
}

isInteractKeyPressed() {
  return this.isFKeyPressed;
}



  // Call this method when player interacts with an item
  interactWithItem(itemType) {
    // Handle item-specific interactions
    console.log("interacting");
    if (itemType === "paper_bag") {
        // TODO: shader twist effect
        //// Apply the twist effect to the paper bag model
        //const twistMaterial = buildTwistMaterial(4.0); // Adjust the speed by changing the amount
        //const paperBag = this.scene.getObjectByName("paper_bag");
        //if (paperBag) {
        //    paperBag.material = twistMaterial;
        //}

        this.playAudio(itemType);
    }
    if (itemType === "paper_bag" || itemType === "small_radio" || itemType === "cardboard_box") {
      // Play auditory story element
      this.playAudio(itemType);
    }// TODO: diary check
    else if (itemType === "note" || itemType === "key") {

      if (itemType === "note") {
        this.playerInventory.addItem({
          name: "Mysterious Note",
          description: "A note with cryptic writing. It might hold a clue."
        });
      } 
      if (itemType === "key") {
        this.playerInventory.addItem({
          name: "Rusty Key",
          description: "An old key. Perhaps it opens a hidden door somewhere."
        });
      }

      this.displayText(itemType);
    }
    //else if (itemType === "robbie_rabbit") {
    //  // Handle Robbie the Rabbit interaction
    //  this.handleRobbieInteraction();
    //}

    this.interactedItems++;
    console.log(this.interactedItems);
    // Check if the level should end (all items interacted with)
    if (this.interactedItems >= 2) {
      this.endLevel();
    }
  }

  playAudio(itemType) {
    // Implement audio logic here
    console.log(`Playing audio for: ${itemType}`);
  }

  displayText(itemType) {
    // Implement text display logic here
    console.log(`Displaying text for: ${itemType}`);
  }

  handleExitSign() {
    // Implement special trigger logic for the exit sign
    console.log("Exit sign interaction triggered.");
  }

  handleRobbieInteraction() {
    // Implement Robbie the Rabbit interaction logic
    console.log("Robbie the Rabbit interaction triggered.");
  }

  endLevel() {
    console.log("Level completed.");
    this.levelEnded = true;
    // Clear old items from the scene
    this.activeItems.forEach((item) => {
      const sceneItem = this.scene.getObjectByName(item.type);
      if (sceneItem) {
        this.scene.remove(sceneItem);
        // placeholder remove octree, or rebuild? idk performance hit
      }
    });

    // Reset for next level
    this.interactedItems = 0;
    this.levelCompleted += 1;
    //this.initializeRandomItems();
  }
  
  updateLives() {
    // Decrement lives only if greater than 0
    this.lives -= 1;
    console.log(this.lives)
    // Update the visual representation of lives
    const currentLives = this.lifeContainer.children;
    this.sounds.loadAudio("respawn", "/assets/audio/respawn.mp3");
    // Ensure that we don't go out of bounds
    if (this.lives >= 0 && this.lives < currentLives.length) {
        // Add the 'transparent' class to the current life being lost
        currentLives[this.lives].classList.add("transparent");
        this.sounds.playAudio("respawn");
    }

    // Check for game over
    if (this.lives <= 0) {
        this.triggerGameOver();
    }
  }


  triggerGameOver() {
    console.log("Game Over");
    //this.levelEnded = true;
  }
}

