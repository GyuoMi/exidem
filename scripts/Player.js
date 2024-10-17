import * as THREE from "three";
import { Capsule } from "three/addons/math/Capsule.js";

export class Player {
  constructor(worldOctree, camera, container, listener) {
    this.GRAVITY = 60;
    this.STEPS_PER_FRAME = 5;
    this.worldOctree = worldOctree;
    this.camera = camera;
    this.interactions = null;
    this.playerVelocity = new THREE.Vector3();
    this.playerDirection = new THREE.Vector3();
    this.keyStates = {};
    this.container = container;
    this.mouseTime = 0;
    this.listener = listener;
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

    const walkingSound = new THREE.Audio(listener);
    audioLoader.load('/assets/audio/walking_stone.wav', function (buffer) {
    walkingSound.setBuffer(buffer);
    walkingSound.setLoop(true); 
    walkingSound.setVolume(0.025); 
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

    this.container.addEventListener("mousedown", () => {
      document.body.requestPointerLock();

      this.mouseTime = performance.now();
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
    //fake floor
    if (this.camera.position.y < 0) {
      this.playerVelocity.y = 0;
      this.camera.position.y = 0;
    }
  }
  
  walkingSfx(type) {
    const spd = this.playerVelocity.length()
    // Inside the Player's movement update logic
    if (movementSpeed > 0.01) {
      if (!walkingSound.isPlaying) {
        walkingSound.play();
      }
      // Gradually increase the volume to avoid a jarring start
      walkingSound.setVolume(Math.min(walkingSound.getVolume() + 0.05, 0.5));   // Fade in
    } 
    else {
      if (walkingSound.isPlaying) {
        // Gradually reduce the volume to avoid a jarring stop
        walkingSound.setVolume(Math.max(walkingSound.getVolume() - 0.05, 0));
        // Stop playing the sound completely when volume reaches 0
        if (walkingSound.getVolume() <= 0) {
          walkingSound.stop();
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
    //const speedDelta = deltaTime * (this.playerOnFloor ? 25 : 8);
    const speedDelta = deltaTime * (this.playerOnFloor ? 15 : 8);

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

    if (/*this.playerOnFloor &&*/ this.keyStates["Space"]) {
      this.playerVelocity.y = 15;
    }
  }
//TODO: update with bounding box once there is collision with a door object
// Ensure this.doorCreak is properly set as an audio object
  teleportPlayerIfOob() {
    const playerPos = this.camera.position;
    let teleported = false;

    // Only allow teleport if level is complete
    if (!this.interactions.levelEnded) return;

    console.log("telelported");
    // Correct exit conditions
    if ((playerPos.y < 1.32 && this.interactions.exitDir === 1) || 
        (playerPos.y > 12.3 && playerPos.z > -2.60 && this.interactions.exitDir === 0)) {
      const newPos = this.interactions.exitDir === 1 ? 
          new THREE.Vector3(playerPos.x, 12.19, playerPos.z) : 
          new THREE.Vector3(playerPos.x, 1.58, playerPos.z - 0.5);

      this.playerCollider.start.add(newPos.clone().sub(playerPos));
      this.playerCollider.end.add(newPos.clone().sub(playerPos));
      this.camera.position.set(newPos.x, newPos.y, newPos.z);
      teleported = true;
    } else {
      // Wrong exit logic, reduce lives
      if (this.interactions.lives > 0) {
        this.interactions.lives--;
        this.interactions.updateLivesDisplay();
        if (this.interactions.lives === 0) {
          console.log("Game Over");
          // Game over logic here
        }
      }
    }

    if (teleported && this.doorCreak.isPlaying === false) {
      this.doorCreak.play();
    }
  }
}
