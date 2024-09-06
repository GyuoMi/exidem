import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

export function setupControls(camera, renderer) {
  const controls = new PointerLockControls(camera, document.body);

  // Variables for movement
  let moveForward = false,
    moveBackward = false,
    moveLeft = false,
    moveRight = false,
    canJump = false;
  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();
  let prevTime = performance.now();

  // Lock/unlock controls based on mouse click
  document.addEventListener("click", () => controls.lock());

  controls.addEventListener("lock", () => {
    document.getElementById("blocker").style.display = "none";
  });

  controls.addEventListener("unlock", () => {
    document.getElementById("blocker").style.display = "block";
  });

  // Event listeners for keydown and keyup to control movement
  const onKeyDown = (event) => {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = true;
        break;
      case "ArrowLeft":
      case "KeyA":
        moveLeft = true;
        break;
      case "ArrowDown":
      case "KeyS":
        moveBackward = true;
        break;
      case "ArrowRight":
      case "KeyD":
        moveRight = true;
        break;
      case "Space":
        if (canJump) velocity.y += 350; // Jumping strength
        canJump = false;
        break;
    }
  };

  const onKeyUp = (event) => {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = false;
        break;
      case "ArrowLeft":
      case "KeyA":
        moveLeft = false;
        break;
      case "ArrowDown":
      case "KeyS":
        moveBackward = false;
        break;
      case "ArrowRight":
      case "KeyD":
        moveRight = false;
        break;
    }
  };

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  // Function to update controls and handle movement
  const updateMovement = () => {
    const time = performance.now();
    const delta = (time - prevTime) / 1000; // Time passed between frames

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    velocity.y -= 9.8 * 100.0 * delta; // Gravity

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // Consistent movement

    if (moveForward || moveBackward) velocity.z -= direction.z * 1600.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 1600.0 * delta;

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    // Update camera's vertical position (jumping/falling)
    camera.position.y += velocity.y * delta;

    // Prevent camera from falling below a certain point (ground level)
    if (camera.position.y < 10) {
      velocity.y = 0;
      camera.position.y = 10;
      canJump = true;
    }

    prevTime = time;
  };

  // Return the controls and the update function to be used in the animation loop
  return { controls, updateMovement };
}
