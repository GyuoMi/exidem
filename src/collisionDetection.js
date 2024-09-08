// collisionDetection.js
import { Capsule } from "three/addons/math/Capsule.js";
import { Octree } from "three/addons/math/Octree.js";

const STEP_HEIGHT_THRESHOLD = 0.3; // Max step height the player can walk over

export function handleCollision(
  playerCollider,
  worldOctree,
  playerVelocity,
  playerOnFloor,
) {
  const result = worldOctree.capsuleIntersect(playerCollider);

  playerOnFloor = false;

  if (result) {
    playerOnFloor = result.normal.y > 0; // Detect if the player is standing on the floor

    if (!playerOnFloor) {
      // Adjust player velocity when not on the floor
      playerVelocity.addScaledVector(
        result.normal,
        -result.normal.dot(playerVelocity),
      );
    }

    if (result.depth >= 1e-10) {
      // If the player collides with a surface, translate them out of it
      playerCollider.translate(result.normal.multiplyScalar(result.depth));
    }

    // Handle stair climbing logic
    handleStairClimbing(result, playerCollider);
  }
}

function handleStairClimbing(result, playerCollider) {
  // Detect if the collision is with a step (small vertical surface)
  const isStep = result.normal.y > 0.1 && result.depth < STEP_HEIGHT_THRESHOLD;

  if (isStep) {
    // Smoothly move the player up the step by adjusting the Y position
    const stepUpAmount = STEP_SMOOTHING_SPEED;
    playerCollider.translate(new THREE.Vector3(0, stepUpAmount, 0));
  }
}
