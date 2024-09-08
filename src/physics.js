import * as THREE from "three";
import { Octree } from "three/addons/math/Octree.js";

const worldOctree = new Octree();

export function setupPhysics(scene) {
  // Initialize Octree for collision detection
  worldOctree.fromGraphNode(scene);

  return worldOctree;
}

export function checkPlayerCollisions(playerCollider) {
  const result = worldOctree.capsuleIntersect(playerCollider);

  let playerOnFloor = false;
  if (result) {
    playerOnFloor = result.normal.y > 0;
    if (!playerOnFloor) {
      playerCollider.translate(result.normal.multiplyScalar(result.depth));
    }
  }
  return playerOnFloor;
}
