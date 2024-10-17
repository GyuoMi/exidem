import * as THREE from "three";
import { ModelLoader } from "../ModelLoader.js";  
import { buildTwistMaterial } from "../objects/shaderPatch.js";

export class Interactions {
  constructor(scene, player, worldOctree) {
    this.scene = scene;
    this.player = player;
    this.worldOctree = worldOctree;
    this.modelLoader = new ModelLoader(scene, worldOctree);
    
    this.items = [
      { type: "paper_bag", position: new THREE.Vector3(-6.6, 1.5, -0.8) },
      { type: "note", position: new THREE.Vector3(10.65, 9.85, -12.33) },
      { type: "key", position: new THREE.Vector3(10.61, 5.49, 1.79) },
      { type: "cardboard_box", position: new THREE.Vector3(3.64, 3.2, -0.18) },
      { type: "small_radio", position: new THREE.Vector3(-3.03, 11.24, -10.33) },
    ];

    this.exit = { type: "exit_sign", position: new THREE.Vector3(10.61, 5.49, 1.79) };
    this.exitDir = 1;
    this.activeItems = [];
    this.activeLocations = [];
    this.interactedItems = 0;
    this.levelEnded = false;

    this.initializeRandomItems();
  }

initializeRandomItems() {
    if (this.activeItems.length > 0){
      console.warn("skipping dupes, already initialized");
      return;
    }
    this.activeItems = this.items.slice(0, 2);
    this.modelLoader.loadItem(this.exit.type, (exitModel) => {
        exitModel.position.copy(this.exit.position);
        this.exitDir = !this.exitDir;
        if (this.exitDir === 1){
          exitModel.rotation.y = Math.PI;
        }
        //this.worldOctree.fromGraphNode(exitModel);
        this.scene.add(exitModel);
    });
    for (const item of this.activeItems) {
        this.modelLoader.loadItem(item.type, (itemModel) => {
            itemModel.position.copy(item.position);
            itemModel.name = item.type;
            this.scene.add(itemModel);
            this.worldOctree.fromGraphNode(itemModel);

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
        if (this.isInteractKeyPressed()) {
            this.interactWithItem(nearestItem.userData.type);
        }
    } else {
        this.hideInteractionPrompt();
    }
}


showInteractionPrompt(itemType) {
    const interactionDiv = document.getElementById("interactionPrompt");
    interactionDiv.style.display = "block";
    interactionDiv.innerText = `Press F to interact with ${itemType}`;
}

hideInteractionPrompt() {
    const interactionDiv = document.getElementById("interactionPrompt");
    interactionDiv.style.display = "none";
}

isInteractKeyPressed() {
  
    let isPressed = false;
    document.addEventListener('keydown', (event) => {
        if (event.key === 'f' || event.key === 'F') {
          console.log("interact pressed");
            isPressed = true;
        }
    });
    return isPressed;
}

  // Call this method when player interacts with an item
  interactWithItem(itemType) {
    // Handle item-specific interactions
    console.log("interacting");
    if (itemType === "paper_bag") {
        // Apply the twist effect to the paper bag model
        const twistMaterial = buildTwistMaterial(4.0); // Adjust the speed by changing the amount
        const paperBag = this.scene.getObjectByName("paper_bag");
        if (paperBag) {
            paperBag.material = twistMaterial;
        }

        this.playAudio(itemType);
    }
    //if (itemType === "paper_bag" || itemType === "small_radio" || itemType === "cardboard_box") {
    //  // Play auditory story element
    //  this.playAudio(itemType);
    //} else if (itemType === "note" || itemType === "key" || itemType === "diary") {
    //  // Display written text
    //  this.displayText(itemType);
    //} else if (itemType === "exit_sign") {
    //  // Trigger special event logic for the exit sign
    //  this.handleExitSign();
    //} else if (itemType === "robbie_rabbit") {
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
    // Additional logic for ending the level can go here
  }
}

