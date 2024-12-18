import * as THREE from "three";
import { Capsule } from "three/addons/math/Capsule.js";
import { Inventory } from "../scripts/mechanics/Inventory.js"
import { ModelLoader } from "../scripts/ModelLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

export class Player {
  constructor(worldOctree, camera, container, listener, scene) {
    this.GRAVITY = 60;
    this.STEPS_PER_FRAME = 5;
    this.walkCooldown = 0.1;
    this.lastWalkSfxUpdate - 0;
    this.worldOctree = worldOctree;
    this.camera = camera;
    this.scene = scene;
    this.interactions = null;
    this.playerVelocity = new THREE.Vector3();
    this.playerDirection = new THREE.Vector3();
    this.keyStates = {};
    this.container = container;
    this.listener = listener;
    this.lifeLost = false;

    this.playerModel = null;
    this.mixer = null; 
    this.idleAction = null;
    this.walkAction = null; 
    this.isTopDownView = false;

    this.playerCollider = new Capsule(
      new THREE.Vector3(0, 2, 0),
      new THREE.Vector3(0, 2.5, 0),
      1.0,
    );
    this.playerOnFloor = false;
    
    this.doorCreak = new THREE.Audio(this.listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('../assets/audio/door_creak.wav', (buffer) => {
        this.doorCreak.setBuffer(buffer);
        this.doorCreak.setVolume(0.05);
    });

    this.walkingSound = new THREE.Audio(this.listener);
    audioLoader.load('../assets/audio/walking_stone.wav', (buffer) => {
        this.walkingSound.setBuffer(buffer);
        this.walkingSound.setLoop(true); 
        this.walkingSound.setVolume(0.5); 
        this.camera.add(this.listener);
    });


    this.lifeLostSfx = new THREE.Audio(this.listener);
    audioLoader.load('../assets/audio/look_behind.wav', (buffer) => {
        this.lifeLostSfx.setBuffer(buffer);
        this.lifeLostSfx.setVolume(0.05);
    });

    this.initEventListeners();
    this.loadPlayerModel();
  }
  
  loadPlayerModel() {
    const fbxLoader = new FBXLoader();
    fbxLoader.setPath('../assets/models/player/');
    fbxLoader.load('Remy.fbx', (fbx) => {
      fbx.scale.setScalar(0.005);
      fbx.traverse(c => {
        c.castShadow = true;
      });

      this.mixer = new THREE.AnimationMixer(fbx);
      this.scene.add(fbx);

      // Load walk animation
      fbxLoader.load('Unarmed Walk Forward-inplace.fbx', (anim) => {
        this.walkingAction = this.mixer.clipAction(anim.animations[0]);
        this.walkingAction.play();
        this.walkingAction.enabled = false;
      });

      // Load idle animation
      fbxLoader.load('Unarmed Idle.fbx', (anim) => {
        this.idleAction = this.mixer.clipAction(anim.animations[0]);
        this.idleAction.play();
      });

      this.playerModel = fbx;
      this.playerModel.visible = false;

    });
  }

  toggleTopDownView() {
    // Check if in top-down view to toggle between perspectives
    this.isTopDownView = !this.isTopDownView;

    if (this.isTopDownView) {
        // Position camera for top-down view
        this.camera.position.set(this.playerModel.position.x, this.playerModel.position.y + 2, this.playerModel.position.z);
        this.camera.lookAt(this.playerModel.position); // Orient camera to look at the player model from above
        
        // Enable player model visibility
        this.playerModel.visible = true;
    } else {
        // Revert to first-person view
        const cameraOffset = new THREE.Vector3(0, 1.7, 0); // Standard first-person offset
        this.camera.position.copy(this.playerCollider.end).add(cameraOffset);
        
        // Disable player model visibility in first-person view
        this.playerModel.visible = false;
    }
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
    // Toggle inventory visibility and pointer lock on pressing "i"
    document.addEventListener("keydown", (event) => {
      if (event.key === "i") { 
        playerInventory.toggle(); // Show or hide inventory

        // Toggle pointer lock based on inventory visibility
        if (document.pointerLockElement) {
          document.exitPointerLock();
        } else {
          document.body.requestPointerLock();
        }
      }
    });

    this.container.addEventListener("mousedown", () => {
      document.body.requestPointerLock();

    });

    // TODO: fix unlimited vertical look
    const MIN_PITCH = -Math.PI / 2; 
    const MAX_PITCH = Math.PI / 2; 
    // higher is slower
    const camSpeed = 500;
    document.body.addEventListener("mousemove", (event) => {
      if (document.pointerLockElement === document.body) {
        if (!this.isTopDownView){
          this.camera.rotation.x -= event.movementY / camSpeed;
          this.camera.rotation.x = Math.max(MIN_PITCH, Math.min(MAX_PITCH, this.camera.rotation.x));
        }
        this.camera.rotation.y -= event.movementX / camSpeed;
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

    const cameraOffset = new THREE.Vector3(0,1.7,0);
    this.camera.position.copy(this.playerCollider.end).add(cameraOffset);

    this.handleAnimation();
    this.teleportPlayerIfOob();
    //fake floor
    if (this.camera.position.y < 0) {
      this.playerVelocity.y = 0;
      this.camera.position.y = 0;
    }

    if (this.playerModel) {
        this.playerModel.position.copy(this.playerCollider.end);
        this.playerModel.rotation.y = this.camera.rotation.y + Math.PI;
    }
    
    if (this.isTopDownView){
      this.camera.position.y += 2;
    }

    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
  }

  handleAnimation() {
    const speed = this.playerVelocity.length();
    if (speed > 0.01) {
      if (this.idleAction) this.idleAction.enabled = false;
      if (this.walkingAction) {
        this.walkingAction.enabled = true;
        this.walkingAction.setEffectiveWeight(1.0);
        this.walkingAction.play();
      }
    } else {
      if (this.walkingAction) {
        this.walkingAction.enabled = false;
        this.walkingAction.stop();
      }
      if (this.idleAction) {
        this.idleAction.enabled = true;
        this.idleAction.play();
      }
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
    //const speedDelta = deltaTime * (this.playerOnFloor ? 25 : 8);
    const speedDelta = deltaTime * (this.playerOnFloor ? 10 : 8);
    const forwardDirection = this.isTopDownView ? -1 : 1;
    const sideDirection = this.isTopDownView ? -1 : 1;
    if (this.keyStates["KeyW"]) {
      this.playerVelocity.add(
        this.getForwardVector().multiplyScalar(speedDelta * forwardDirection),
      );
    }
    if (this.keyStates["KeyS"]) {
      this.playerVelocity.add(
        this.getForwardVector().multiplyScalar(-speedDelta * forwardDirection),
      );
    }
    if (this.keyStates["KeyA"]) {
      this.playerVelocity.add(this.getSideVector().multiplyScalar(-speedDelta * sideDirection));
    }
    if (this.keyStates["KeyD"]) {
      this.playerVelocity.add(this.getSideVector().multiplyScalar(speedDelta * sideDirection));
    }
    
    // TODO: remove for release
    //if (/*this.playerOnFloor &&*/ this.keyStates["Space"]) {
    //  this.playerVelocity.y = 15;
    //}
  }
//TODO: update with bounding box once there is collision with a door object
   teleportPlayerIfOob() {
      const playerPos = this.camera.position;
      let teleported = false;

      // Check for wrong exit first to trigger life loss
      if ((playerPos.y < 1.32 && this.interactions.exitDir === 1) || (playerPos.y > 12.3 && playerPos.z > 0.60 && this.interactions.exitDir === 0)){
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
               (playerPos.y > 12.3 && playerPos.z > 0.60)) {
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
          if (this.isTopDownView){
            this.toggleTopDownView();
          }
          this.interactions.initializeRandomItems();
        }
        this.lifeLost = false;
      }
  }
}
