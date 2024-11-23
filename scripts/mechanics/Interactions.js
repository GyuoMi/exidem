import * as THREE from "three";
import { ModelLoader } from "../ModelLoader.js";  
import { buildTwistMaterial } from "../objects/shaders/shaderPatch.js";
import { Octree } from "three/addons/math/Octree.js";
import { Sounds } from "./Sounds.js";
import { Inventory } from "./Inventory.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

// tps perspective for item interactions inverted controls
// window on wall for skybox
// rabbit on windowsill instead of peephole

// funny thing i noticed, the webspeech api only works on chromium browsers
// so i decided to make a separate ending if the game is run on firefox :)
// Function to detect the browser name
function detectBrowser() {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf("Edg") > -1) return "Microsoft Edge";
    else if (userAgent.indexOf("Chrome") > -1) return "Chrome";
    else if (userAgent.indexOf("Firefox") > -1) return "Firefox";
    else if (userAgent.indexOf("Safari") > -1) return "Safari";
    else if (userAgent.indexOf("Opera") > -1) return "Opera";
    else if (userAgent.indexOf("Trident") > -1 || userAgent.indexOf("MSIE") > -1) return "Internet Explorer";
    return "Unknown";
}

let chromium = true;
let browserName;
// Initialize annyang and check if it’s a Chromium browser
function initializeAnnyang(playerCam, sounds) {
    if (annyang) {
        const commands = {
            'angela': () => {
              //sounds.muteAllSounds(true);
              sounds.playAudio("ending");
                //alert('remembered');
              playEnding();
            }
        };
        annyang.addCommands(commands);
        annyang.start();
    } else {
        chromium = false;
        browserName = detectBrowser();
        //alert(`An alternate ending unfolds in ${browserName}...The non-Chromium browser`);
        playEnding()
    }
}

// Function to play the ending sequence
function playEnding() {
    const endScreen = document.createElement('div');
    endScreen.id = 'endScreen';
    endScreen.style.position = 'fixed';
    endScreen.style.top = 0;
    endScreen.style.left = 0;
    endScreen.style.width = '100%';
    endScreen.style.height = '100%';
    endScreen.style.backgroundColor = 'black';
    endScreen.style.color = 'white';
    endScreen.style.display = 'flex';
    endScreen.style.alignItems = 'center';
    endScreen.style.justifyContent = 'center';
    endScreen.style.flexDirection = 'column';
    endScreen.style.fontFamily = 'Courier New, Courier, monospace';;
    endScreen.style.fontSize = '20px';
    endScreen.style.opacity = 0; 
    endScreen.style.transition = 'opacity 2s';
    document.body.appendChild(endScreen);

    if (chromium) {
        endScreen.innerHTML = `
            <p>
                In January 2017, Bernard Gore, a 71-year-old man suffering from dementia, became lost in the stairwell of a Westfield shopping center in Sydney. After leaving to run errands, he wandered into a confusing labyrinth of locked doors and staircases. Tragically, his body was discovered three weeks later, having laid undiscovered just meters away from where his family waited.
            </p>
            <p>
                Some elements of the story were changed for this game in order to communicate difficulties that individuals with dementia face.<br>
                Thank you for playing.
            </p>
        `;

    } else {
        endScreen.innerHTML = `
            <img src="../assets/non-chromium.png" alt="Non-Chromium Ending Image" style="max-width: 80%; height: auto; margin-bottom: 20px;">
            <p>An alternate ending unfolds here in ${detectBrowser()}...</p>
        `;
    }
    requestAnimationFrame(() => {
        endScreen.style.opacity = 1; 
    });
    
    setTimeout(() => {
        endScreen.style.transition = 'opacity 2s';
        endScreen.style.opacity = 0;
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000); 
    }, 23000); 
}

export class Interactions {
  constructor(scene, player, worldOctree) {
    this.scene = scene;
    this.player = player;
    this.worldOctree = worldOctree;
    this.modelLoader = new ModelLoader(scene, worldOctree);
    this.sounds = new Sounds(player.camera);

    this.items = [
      { type: "paper_bag", position: new THREE.Vector3(-6.6, 1.5, -0.5), interacted: false },
      { type: "note", position: new THREE.Vector3(10.65, 9.85, -12.33), interacted: false },
      { type: "cardboard_box", position: new THREE.Vector3(3.64, 3.2, -0.18), interacted: false },
      { type: "key", position: new THREE.Vector3(-2.8, 13.24, -9.3), interacted: false },
      { type: "small_radio", position: new THREE.Vector3(10.21, 5.59, 2.79), interacted: false},
    ];
    // TODO: add extra second for audios since they cut out early
    // TODO: enable random exit direction
    // set the game ending
    // integrate boss and death
    // try to sort out robbie Rabbit peephole

    this.bossModel = null;
    this.exit = { type: "exit_sign", position: new THREE.Vector3(12.61, 12.49, 1.79) };
    this.exitDir;//(Math.random()>=0.5)? 1 : 0;
    this.exitString;
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
        if (event.key.toLowerCase() === 'f') {
            this.isFKeyPressed = true;
        }
    });

    document.addEventListener('keyup', (event) => {
        if (event.key.toLowerCase() === 'f') {
            this.isFKeyPressed = false;
        }
    });

    //this.loadBossModel();
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
    this.sounds.loadAudio("ending", "../assets/audio/ending.mp3", (sound) => {
        this.loadedSounds.ending = sound;
    });  
}

initializeRandomItems() {
    this.levelEnded = false;
    // could remove exit model after each level, but the randomness might make it funny
    this.scene.remove(this.exit.type);

    if (this.items[4].interacted) {
      this.triggerGameComplete();
      return;
    }
    const itemToLoad = this.items[this.levelCompleted]; 
    this.modelLoader.loadItem(this.exit.type, (exitModel) => {
        this.exitDir = Math.round(Math.random());
        //this.exitDir = 1;
	this.exitString = this.exitDir === 1 ? "up" : this.exitDir === 0 ? "down" : this.exitDir;
        console.log("exit:", this.exitString);
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
        
        bbox.expandByScalar(1);
        itemModel.userData.boundingBox = bbox;
        itemModel.userData.type = itemToLoad.type;

        itemToLoad.interacted = true;
        //console.log(`Item loaded: ${itemToLoad.type} with scaled bounding box at (${itemToLoad.position.x}, ${itemToLoad.position.y}, ${itemToLoad.position.z})`);

        // Optionally visualize the scaled bounding box
        //const boxHelper = new THREE.Box3Helper(bbox, 0xfff000); 
        //this.scene.add(boxHelper);
        if (this.levelCompleted === 0) {
            this.showPrompt("Objective: Remember her name\n Pick up items to piece together your memory of your wife and follow the exit sign to progress");
        }
    });
}

checkForInteractions() {
    let nearestItem = null;
    let nearestDistance = Infinity;
    const playerPosition = this.player.playerCollider.end.clone();

    // more lenient bounding box range for things like the key and radio
    const buffer = 0.5; 
    const playerBox = new THREE.Box3().setFromCenterAndSize(
        playerPosition,
        new THREE.Vector3(buffer, buffer, buffer)
    );
    this.scene.traverse((object) => {
        if (object.userData.boundingBox) {
            const bbox = object.userData.boundingBox.clone().expandByScalar(buffer);
            if (bbox.intersectsBox(playerBox)) {
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

interactWithItem(itemObject) {
  const itemType = itemObject.userData.type;
  //console.log("Interacting with:", itemType);

  // Play associated audio
  itemObject.add(this.loadedSounds[itemType]);
  this.sounds.playAudio(itemType);

  // Define item details based on type
  const itemDetails = {
    note: {
      name: "Mysterious Note",
      description: `Patient exhibits cognitive dissonance, possibly dementia.
      Frequent mentions of Rose and Angela, both potentially significant.
      Notably, Rose is often referred to as the youngest, yet the patient
      insists that Taylor is older, creating contradictions. Despite this,
      Angela is frequently recalled as possessing the oldest memories. The
      patient seems to call out to Taylor often, blurring the lines of familial
      connections. No other records seem to be on hand...`,
      promptText: `Picked up a note. \n Follow the exit sign and take the ${this.exitString} exit. \n Check inventory with 'I' for details. \n I feel very disorientated...`
    },
    key: {
      name: "Rusty Key",
      description: `This used to be a key to our special place. 
      Angela was always the light, but I can still hear Rose laughing and Taylor calling for me.
      Where do I fit in their stories?`,
      promptText: "Found an old key. It might open something important.\n Check inventory with 'I' for details."
    },
    small_radio: {
      name: "Portable Radio",
      description: `I thought I had everything, but now it’s a tangled mess. 
      Rose was my joy, Taylor my pride, yet without Angela, I feel lost. 
      Who are they to me now?`,
      promptText: "The radio crackles faintly. Perhaps it holds a clue.\n Check inventory with 'I' for details."
    }
  };

  if (itemType == "note"){
    this.player.toggleTopDownView();
  }
  if (itemDetails[itemType]) {
    this.playerInventory.addItem({
      name: itemDetails[itemType].name,
      description: itemDetails[itemType].description
    });
    this.showPrompt(itemDetails[itemType].promptText);
  } else {
    console.log(`${itemType} interaction completed, but item not removed.`);
  }

  this.interactedItems++;
  if (this.interactedItems >= 1) {
    this.endLevel();
  }
}

showPrompt(message) {
  const prompt = document.getElementById("prompt");
  prompt.innerText = message;
  prompt.classList.add("fade-in");

  setTimeout(() => {
    prompt.classList.remove("fade-in");
  }, 5000); 
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

  loadBossModel() {
    const fbxLoader = new FBXLoader();
    fbxLoader.setPath('../assets/models/boss/');
    fbxLoader.load('boss.fbx', (fbx) => {
      fbx.scale.setScalar(1);
      fbx.traverse(c => {
        c.castShadow = true;
      });

      this.mixer = new THREE.AnimationMixer(fbx);
      this.scene.add(fbx);

      // Load idle animation
      fbxLoader.load('boss_anim.fbx', (anim) => {
        this.idleAction = this.mixer.clipAction(anim.animations[0]);
        this.idleAction.play();
      });

      this.bossModel = fbx;
    });
  }

  triggerGameOver() {
    console.log("Game Over");
    this.sounds.playAudio("game_over");

    //// Teleport the boss to a position close to the player
    //if (this.bossModel) {
    //    const playerPosition = this.player.position; // Adjust to the player's approximate position
    //    this.bossModel.position.copy(playerPosition);
    //    this.bossModel.lookAt(this.camera.position); // Make the boss face the player
    //}

    // Show death screen by fading to black
    this.showDeathScreen();
  }

  // Function to show the fade-to-black death screen
  showDeathScreen() {
      const fadeOverlay = document.createElement('div');
      fadeOverlay.style.position = 'fixed';
      fadeOverlay.style.top = 0;
      fadeOverlay.style.left = 0;
      fadeOverlay.style.width = '100%';
      fadeOverlay.style.height = '100%';
      fadeOverlay.style.backgroundColor = 'black';
      fadeOverlay.style.opacity = 0;
      fadeOverlay.style.transition = 'opacity 2s'; // 2-second fade-in
      document.body.appendChild(fadeOverlay);

      // Start the fade-in effect
      setTimeout(() => {
          fadeOverlay.style.opacity = 1;
      }, 3000);

      // Redirect to the main menu after the fade-in completes
      setTimeout(() => {
          window.location.href = '../index.html'; // Adjust path to your main menu
      }, 6000); // Wait 3 seconds for full effect
  }
  
  triggerGameComplete(){
    this.showPrompt("Who Am I?");
    initializeAnnyang(this.player.camera,this.sounds);
    
  }
}

