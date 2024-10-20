import * as THREE from "three";
import { Capsule } from "three/addons/math/Capsule.js";
import { Inventory } from "../scripts/mechanics/Inventory.js"

export class Player {
  constructor(worldOctree, camera, container, listener) {
    this.GRAVITY = 60;
    this.STEPS_PER_FRAME = 5;
    this.walkCooldown = 0.1;
    this.lastWalkSfxUpdate - 0;
    this.worldOctree = worldOctree;
    this.camera = camera;
    this.interactions = null;
    this.playerVelocity = new THREE.Vector3();
    this.playerDirection = new THREE.Vector3();
    this.keyStates = {};
    this.container = container;
    this.listener = listener;
    this.lifeLost = false;
    this.playerCollider = new Capsule(
      new THREE.Vector3(0, 2, 0),
      new THREE.Vector3(0, 2, 0),
      0.4,
    );
    this.playerOnFloor = false;
    
    this.doorCreak = new THREE.Audio(this.listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('/assets/audio/door_creak.wav', (buffer) => {
        this.doorCreak.setBuffer(buffer);
        this.doorCreak.setVolume(0.05);
    });

    this.walkingSound = new THREE.Audio(this.listener);
    audioLoader.load('/assets/audio/walking_stone.wav', (buffer) => {
        this.walkingSound.setBuffer(buffer);
        this.walkingSound.setLoop(true); 
        this.walkingSound.setVolume(0.5); 
        this.camera.add(this.listener);
    });


    this.lifeLostSfx = new THREE.Audio(this.listener);
    audioLoader.load('/assets/audio/look_behind.wav', (buffer) => {
        this.lifeLostSfx.setBuffer(buffer);
        this.lifeLostSfx.setVolume(0.05);
    });

    this.initEventListeners();
  }
  
  setInteractions(interactions){
    // used to pull in interactions that is created after player in main.js
    // kinda hacky but fuck it
    this.interactions = interactions;
  }

  initEventListeners() {
    document.addEventListener("keydown", (event) => {
      this.keyStates[event.code] = true;
    });
    document.addEventListener("keyup", (event) => {
      this.keyStates[event.code] = false;
    });

    const playerInventory = new Inventory();
    document.addEventListener("keydown", (event) => {
      if (event.key === "i") { 
        playerInventory.toggle();
      }
    });

    this.container.addEventListener("mousedown", () => {
      document.body.requestPointerLock();

    });

    // TODO: fix unlimited vertical look
    const MIN_PITCH = -Math.PI / 2; 
    const MAX_PITCH = Math.PI / 2; 
    document.body.addEventListener("mousemove", (event) => {
      if (document.pointerLockElement === document.body) {
        this.camera.rotation.y -= event.movementX / 500;
        this.camera.rotation.x -= event.movementY / 500;
        this.camera.rotation.x = Math.max(MIN_PITCH, Math.min(MAX_PITCH, this.camera.rotation.x));
      }
    });
  }

  playerCollisions() {
    const result = this.worldOctree.capsuleIntersect(this.playerCollider);

    this.playerOnFloor = false;

    if (result) {
      this.playerOnFloor = result.normal.y > 0;
      if (!this.playerOnFloor) {
        this.playerVelocity.addScaledVector(
          result.normal,
          -result.normal.dot(this.playerVelocity),
        );
      }

      if (result.depth >= 1e-11) {
        this.playerCollider.translate(
          result.normal.multiplyScalar(result.depth),
        );
      }
    }
  }

  update(deltaTime) {
    let damping = Math.exp(-4 * deltaTime) - 1;
    this.controls(deltaTime);

    if (!this.playerOnFloor) {
      this.playerVelocity.y -= this.GRAVITY * deltaTime;
      damping *= 0.1;
    }
    this.playerVelocity.addScaledVector(this.playerVelocity, damping);

    const deltaPosition = this.playerVelocity.clone().multiplyScalar(deltaTime);
    this.playerCollider.translate(deltaPosition);

    this.playerCollisions();

    const cameraOffset = new THREE.Vector3(0,2.0,0);
    this.camera.position.copy(this.playerCollider.end).add(cameraOffset);

    this.teleportPlayerIfOob();
    //fake floor
    if (this.camera.position.y < 0) {
      this.playerVelocity.y = 0;
      this.camera.position.y = 0;
    }
  }
  
  walkingSfx() {
    const speed = this.playerVelocity.length();

    if (speed > 0.01) {
        // Player is moving
        if (!this.walkingSound.isPlaying) {
            this.walkingSound.play();
        }
        // Gradually increase volume to create a smooth fade-in
        const currentVolume = this.walkingSound.getVolume();
        const newVolume = Math.min(currentVolume + 0.01, 0.25); // Set a max volume level
        this.walkingSound.setVolume(newVolume);
    } else {
        // Player is not moving
        if (this.walkingSound.isPlaying) {
            // Gradually decrease volume to create a smooth fade-out
            console.log("stopping walking sound")
            const currentVolume = this.walkingSound.getVolume();
            const newVolume = Math.max(currentVolume - 0.01, 0.0);
            this.walkingSound.setVolume(newVolume);

            // Stop playing the sound if volume has reached 0
            if (newVolume === 0.0) {
                this.walkingSound.stop();
            }
        }
    }
  }

  getForwardVector() {
    this.camera.getWorldDirection(this.playerDirection);
    this.playerDirection.y = 0;
    this.playerDirection.normalize();
    return this.playerDirection;
  }

  getSideVector() {
    this.camera.getWorldDirection(this.playerDirection);
    this.playerDirection.y = 0;
    this.playerDirection.normalize();
    this.playerDirection.cross(this.camera.up);
    return this.playerDirection;
  }

  // TODO: fix wasd still working while pointer is locked
  controls(deltaTime) {
    // TODO: change speed so it's slower on release
    const speedDelta = deltaTime * (this.playerOnFloor ? 25 : 8);
    //const speedDelta = deltaTime * (this.playerOnFloor ? 15 : 8);

    if (this.keyStates["KeyW"]) {
      this.playerVelocity.add(
        this.getForwardVector().multiplyScalar(speedDelta),
      );
    }
    if (this.keyStates["KeyS"]) {
      this.playerVelocity.add(
        this.getForwardVector().multiplyScalar(-speedDelta),
      );
    }
    if (this.keyStates["KeyA"]) {
      this.playerVelocity.add(this.getSideVector().multiplyScalar(-speedDelta));
    }
    if (this.keyStates["KeyD"]) {
      this.playerVelocity.add(this.getSideVector().multiplyScalar(speedDelta));
    }
    
    // TODO: remove for release
    if (/*this.playerOnFloor &&*/ this.keyStates["Space"]) {
      this.playerVelocity.y = 15;
    }
  }
//TODO: update with bounding box once there is collision with a door object
   teleportPlayerIfOob() {
      const playerPos = this.camera.position;
      let teleported = false;

      // Check for wrong exit first to trigger life loss
      if ((playerPos.y < 1.32 && this.interactions.exitDir === 1) || (playerPos.y > 12.3 && playerPos.z > -2.60 && this.interactions.exitDir === 0)){
        // Wrong exit, deduct a life if level ended and life hasn't been lost yet
        console.log("wrong exit");
        if (this.interactions.levelEnded && !this.lifeLost) {
          this.interactions.updateLives();
          this.lifeLost = true;
          teleported = true;
        }
        const newPos = this.interactions.exitDir === 1 ? 
            new THREE.Vector3(playerPos.x, 13.0, playerPos.z) : 
            new THREE.Vector3(playerPos.x, 3.58, playerPos.z - 0.5);

        this.playerCollider.start.add(newPos.clone().sub(playerPos));
        this.playerCollider.end.add(newPos.clone().sub(playerPos));
        this.camera.position.set(newPos.x, newPos.y, newPos.z);
      } 
      // Correct exit handling
      else if ((playerPos.y < 1.32) || 
               (playerPos.y > 12.3 && playerPos.z > -2.60)) {
        console.log("correct exit")
        const newPos = playerPos.y < 1.32 
            ? new THREE.Vector3(playerPos.x, 13.0, playerPos.z) 
            : new THREE.Vector3(playerPos.x, 3.58, playerPos.z - 0.5);

        this.playerCollider.start.add(newPos.clone().sub(playerPos));
        this.playerCollider.end.add(newPos.clone().sub(playerPos));
        this.camera.position.set(newPos.x, newPos.y, newPos.z);
        teleported = true;
      }
      
      // Reset for next level
      if (this.interactions.levelEnded && teleported && !this.doorCreak.isPlaying ) {
        if (!this.lifeLost){
          this.doorCreak.play();
          this.interactions.initializeRandomItems();
        }
        this.lifeLost = false;
      }
  }
}
