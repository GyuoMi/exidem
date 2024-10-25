import * as THREE from "three";
import { ModelLoader } from "../ModelLoader.js";  
import { buildTwistMaterial } from "../objects/shaderPatch.js";
import { Octree } from "three/addons/math/Octree.js";
import { Sounds } from "./Sounds.js";
import { Inventory } from "./Inventory.js";

// tps perspective for item interactions inverted controls
// window on wall for skybox
// rabbit on windowsill instead of peephole
export class Interactions {
  constructor(scene, player, worldOctree) {
    this.scene = scene;
    this.player = player;
    this.worldOctree = worldOctree;
    this.modelLoader = new ModelLoader(scene, worldOctree);
    this.sounds = new Sounds(player.camera);

    this.items = [
      { type: "paper_bag", position: new THREE.Vector3(-6.6, 1.5, -0.8), interacted: false },
      { type: "note", position: new THREE.Vector3(10.65, 9.85, -12.33), interacted: false },
      { type: "cardboard_box", position: new THREE.Vector3(3.64, 3.2, -0.18), interacted: false },
      { type: "key", position: new THREE.Vector3(10.61, 5.49, 1.79), interacted: false },
      { type: "small_radio", position: new THREE.Vector3(-3.03, 11.24, -10.33), interacted: false },
    ];
    // TODO: add extra second for audios since they cut out early
    // TODO: enable random exit direction
    // set the game ending
    // integrate boss and death
    // try to sort out robbie Rabbit peephole

    this.exit = { type: "exit_sign", position: new THREE.Vector3(12.61, 12.49, 1.79) };
    this.exitDir;//(Math.random()>=0.5)? 1 : 0;
    this.activeItems = [];
    this.interactedItems = 0;
    this.levelCompleted = 0;
    this.levelEnded = false;
    this.lives = 3;

    this.exitSfx = false;
    this.loadedSounds = {};

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
    this.loadAllAudio();
  }

//loadAllAudio() {
//  this.sounds.loadPositionalAudio("paper_bag", "/assets/audio/paper_bag.mp3");
//  this.sounds.loadPositionalAudio("small_radio", "/assets/audio/radio1.mp3");
//  this.sounds.loadPositionalAudio("cardboard_box", "/assets/audio/box.mp3");
//  this.sounds.loadAudio("game_over", "/assets/audio/look_behind.wav");
//  this.sounds.loadAudio("respawn", "/assets/audio/respawn.mp3");
//}

loadAllAudio() {
    this.sounds.loadPositionalAudio("paper_bag", "../assets/audio/paper_bag.mp3", (sound) => {
        this.loadedSounds.paper_bag = sound;
    });
    this.sounds.loadPositionalAudio("small_radio", "../assets/audio/radio1.mp3", (sound) => {
        this.loadedSounds.small_radio = sound;
    });
    this.sounds.loadPositionalAudio("cardboard_box", "../assets/audio/box.mp3", (sound) => {
        this.loadedSounds.cardboard_box = sound;
    });
    this.sounds.loadAudio("game_over", "../assets/audio/look_behind.wav", (sound) => {
        this.loadedSounds.game_over = sound;
    });
    this.sounds.loadAudio("respawn", "../assets/audio/respawn.mp3", (sound) => {
        this.loadedSounds.respawn = sound;
    });
}

initializeRandomItems() {
    this.levelEnded = false;
    // could remove exit model after each level, but the randomness might make it funny
    this.scene.remove(this.exit.type);

    //if (this.activeItems.length > 0){
    //  console.warn("skipping dupes, already initialized");
    //  return;
    //}
    const nextItemIndex = this.activeItems.length; 
  console.log(this.activeItems.length-1)
    const itemToLoad = this.items[nextItemIndex]; 
    this.modelLoader.loadItem(this.exit.type, (exitModel) => {
        this.exitDir = Math.round(Math.random());;
        //this.exitDir = 1;
        console.log("exit:", this.exitDir === 1 ? "up" : this.exitDir === 0 ? "down" : this.exitDir);
        // logic is the sign points down when rotated, and points up by default
        if (!this.exitDir){ // but then will be false here so it doesn't rotate
          console.log("rotated");
          exitModel.rotation.y = Math.PI;
        }
        exitModel.position.copy(this.exit.position);
        //this.worldOctree.fromGraphNode(exitModel);
        this.scene.add(exitModel);
    });
    this.modelLoader.loadItem(itemToLoad.type, (itemModel) => {
        itemModel.position.copy(itemToLoad.position);
        itemModel.name = itemToLoad.type;
        this.scene.add(itemModel);
        //this.worldOctree.fromGraphNode(itemModel);

        // Compute bounding box and scale it by 1.5x
        const bbox = new THREE.Box3().setFromObject(itemModel);
        
        bbox.expandByScalar(1.5);
        itemModel.userData.boundingBox = bbox;
        itemModel.userData.type = itemToLoad.type;

        itemToLoad.interacted = true;
        console.log(`Item loaded: ${itemToLoad.type} with scaled bounding box at (${itemToLoad.position.x}, ${itemToLoad.position.y}, ${itemToLoad.position.z})`);

        // Optionally visualize the scaled bounding box
        const boxHelper = new THREE.Box3Helper(bbox, 0xfff000); 
        this.scene.add(boxHelper);
        this.activeItems.push(itemToLoad);
      console.log(this.activeItems.length)
    });
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
            this.interactWithItem(nearestItem);
            //this.scene.remove(nearestItem);
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

  interactWithItem(itemObject) {
    const itemType = itemObject.userData.type;
    console.log("Interacting with:", itemType);

    // Play associated audio
    itemObject.add(this.loadedSounds[itemType]);
    this.sounds.playAudio(itemType);

    // Handle interactions and remove or keep the item
    if (itemType === "note" || itemType === "key") {
      this.playerInventory.addItem({
        name: itemType === "note" ? "Mysterious Note" : "Rusty Key",
        description: itemType === "note" ? "A note with cryptic writing. It might hold a clue." : "An old key. Perhaps it opens a hidden door somewhere."
      });
      this.scene.remove(itemObject);
    } else {
      // For items like paper bag, radio, and box, we play audio but do not remove them
      console.log(`${itemType} interaction completed, but item not removed.`);
    }

    this.interactedItems++;
    if (this.interactedItems >= 1) {
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
    this.sounds.playAudio("game_over");
    //this.levelEnded = true;
  }
  
  triggerGameComplete(){
    if (levelCompleted == 5){
      if (annyang) {
        const commands = {
          'angela': () => { alert('remembered'); }
        };

        annyang.addCommands(commands);

        // Start listening.
        annyang.start();
      }
    }
  }
}

