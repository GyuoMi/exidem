import * as THREE from "three";
import { ModelLoader } from "../ModelLoader.js";  

export class Interactions {
  constructor(scene, player, worldOctree) {
    this.scene = scene;
    this.player = player;
    this.worldOctree = worldOctree;
    this.modelLoader = new ModelLoader(scene, worldOctree);

    this.items = [
      "paper_bag", "small_radio", "note", "key", "diary", 
      "exit_sign", "cardboard_box", "robbie_rabbit"
    ];

    this.itemLocations = [
      new THREE.Vector3(-3.6, 2.55, 2.61),
      new THREE.Vector3(3.82, 3.85, -0.47),
      new THREE.Vector3(10.61, 5.49, 1.79),
      //new THREE.Vector3(-3, 1, 0.5),
      //new THREE.Vector3(2, 5, -1.5),
      //new THREE.Vector3(-2, 4.5, 1),
      //new THREE.Vector3(1.5, 6, -2),
      //new THREE.Vector3(-0.5, 7.2, 1)
    ];

    this.activeItems = [];
    this.activeLocations = [];
    this.interactedItems = 0;
    this.levelEnded = false;

    this.initializeRandomItems();
  }

initializeRandomItems() {
    // Shuffle the item list and location list
    const shuffledItems = this.items.sort(() => 0.5 - Math.random());
    const shuffledLocations = this.itemLocations.sort(() => 0.5 - Math.random());

    // Select two items and two locations
    this.activeItems = shuffledItems.slice(0, 2);
    this.activeLocations = shuffledLocations.slice(0, 2);

    // Load and place the items in the scene
    for (let i = 0; i < this.activeItems.length; i++) {
        const itemType = this.activeItems[i];
        const itemLocation = this.activeLocations[i];

        this.modelLoader.loadItem(itemType, (itemModel) => {
            // Set the position of the item model
            itemModel.position.copy(itemLocation);
            
            // Add the item to the scene
            this.scene.add(itemModel);
            
            // Log the loaded item's details to verify its loading and position
            console.log(`Item loaded: ${itemType} at position (${itemLocation.x}, ${itemLocation.y}, ${itemLocation.z})`);

            // Optionally visualize the bounding box
            const boxHelper = new THREE.BoxHelper(itemModel, 0xffff00);
            this.scene.add(boxHelper);
        });
    }
}

  // Call this method when player interacts with an item
  interactWithItem(itemType) {
    // Handle item-specific interactions
    if (itemType === "paper_bag" || itemType === "small_radio" || itemType === "cardboard_box") {
      // Play auditory story element
      this.playAudio(itemType);
    } else if (itemType === "note" || itemType === "key" || itemType === "diary") {
      // Display written text
      this.displayText(itemType);
    } else if (itemType === "exit_sign") {
      // Trigger special event logic for the exit sign
      this.handleExitSign();
    } else if (itemType === "robbie_rabbit") {
      // Handle Robbie the Rabbit interaction
      this.handleRobbieInteraction();
    }

    this.interactedItems++;

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

