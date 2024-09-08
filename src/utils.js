// utils.js
import { camera } from "./stairs.js";
export function getForwardVector() {
  const playerDirection = new THREE.Vector3();
  camera.getWorldDirection(playerDirection);
  playerDirection.y = 0;
  playerDirection.normalize();
  return playerDirection;
}

export function getSideVector() {
  const playerDirection = new THREE.Vector3();
  camera.getWorldDirection(playerDirection);
  playerDirection.y = 0;
  playerDirection.normalize();
  playerDirection.cross(camera.up);
  return playerDirection;
}
