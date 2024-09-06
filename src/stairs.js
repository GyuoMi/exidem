import * as THREE from "three";
import { setupControls } from "./controls.js";
let camera,
  renderer,
  scene,
  animate,
  drawFloor,
  state,
  stackOfPos,
  startPos,
  endPos,
  stepV,
  stepLength,
  spotLight,
  updateMovement;

const containerId = "canvasContainer";
const stairDef = { w: 20, l: 80, h: 20 };
const offset = new THREE.Vector3(-50, 10, 150);
state = "rotate";
stackOfPos = [];
startPos = new THREE.Vector3();
endPos = new THREE.Vector3();
stepV = new THREE.Vector3();
stepLength = 0.0015;
const width = window.innerWidth;
const height = window.innerHeight;

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
document.getElementById(containerId).appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;
  renderer.setSize(newWidth, newHeight);
  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();
});

camera = new THREE.PerspectiveCamera(75, width / height, 1, 10000);
camera.position.set(0, stairDef.h / 2, 0); // Positioning the camera on the first step

scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0025);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

spotLight = new THREE.PointLight(0xffffff, 1.0, 400);
spotLight.position.set(0, 0, 500);
scene.add(spotLight);

const { controls, updateMovement: movement } = setupControls(camera, renderer);
updateMovement = movement;

const lightIndicatorGeometry = new THREE.SphereGeometry(0.5, 16, 8);
const lightIndicatorMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const lightIndicator = new THREE.Mesh(
  lightIndicatorGeometry,
  lightIndicatorMaterial,
);
lightIndicator.position.copy(spotLight.position);
scene.add(lightIndicator);

const stairGroup = new THREE.Group();
scene.add(stairGroup);

drawFloor = function (orientation, startPos, numOfStairs = 25, isUp = true) {
  let cube;
  for (let i = 0; i < numOfStairs; i++) {
    cube = new THREE.Mesh(
      new THREE.BoxGeometry(stairDef.w, stairDef.h, stairDef.l),
      new THREE.MeshLambertMaterial({ color: 0xff0000 }),
    );
    cube.position.copy(startPos);

    switch (orientation) {
      case "+x":
        cube.position.x = startPos.x + stairDef.w * i;
        break;
      case "-x":
        cube.position.x = startPos.x - stairDef.w * i;
        break;
      case "+z":
        cube.position.z = startPos.z + stairDef.w * i;
        break;
      case "-z":
        cube.position.z = startPos.z - stairDef.w * i;
        break;
    }

    cube.position.y = isUp
      ? startPos.y + stairDef.h * i
      : startPos.y - stairDef.h * i;
    stairGroup.add(cube);
  }

  return cube.position.clone();
};

let lastGeneratedHeight = 10;
const raycaster = new THREE.Raycaster();
const downVector = new THREE.Vector3(0, -1, 0);

animate = function () {
  requestAnimationFrame(animate);

  // Cast the ray slightly below the camera
  const cameraFeetPosition = new THREE.Vector3(
    camera.position.x,
    camera.position.y - stairDef.h / 2,
    camera.position.z,
  );
  raycaster.set(cameraFeetPosition, downVector);

  // Check intersections with the stairs group
  const intersects = raycaster.intersectObjects(stairGroup.children, true);

  if (intersects.length > 0) {
    const distanceToGround = intersects[0].distance;
    const groundHeight = intersects[0].point.y;

    // Ensure the player stands on top of the step
    if (distanceToGround < stairDef.h + 1) {
      camera.position.y = THREE.MathUtils.lerp(
        camera.position.y,
        groundHeight + stairDef.h / 2,
        0.1,
      );
    }
  }

  updateMovement();
  switch (state) {
    case "up":
      if (endPos.clone().add(offset).distanceTo(camera.position) < 1) {
        state = "rotate";
      }
      break;

    case "rotate":
      while (stackOfPos.length < 5) {
        const lastPos =
          stackOfPos.length > 0
            ? stackOfPos[stackOfPos.length - 1]
            : new THREE.Vector3(0, 0, 0);
        const newPos = drawFloor("-x", lastPos, 25, true);
        stackOfPos.push(newPos);
      }
      startPos = endPos.clone();
      endPos = stackOfPos.shift();
      stepV = endPos
        .clone()
        .add(offset)
        .sub(camera.position)
        .multiplyScalar(stepLength);
      state = "up";
      break;
  }

  renderer.render(scene, camera);
};

let gravityState = 0;

function rotateWorld(axis, angle) {
  const quaternion = new THREE.Quaternion();
  quaternion.setFromAxisAngle(axis, angle);
  scene.applyQuaternion(quaternion);
  camera.applyQuaternion(quaternion);
  controls.object.applyQuaternion(camera.quaternion);
}

function changeGravity() {
  gravityState = (gravityState + 1) % 4;

  switch (gravityState) {
    case 1:
      rotateWorld(new THREE.Vector3(0, 1, 0), Math.PI / 2);
      camera.position.add(stepV);
      break;
    case 2:
      rotateWorld(new THREE.Vector3(0, 1, 0), Math.PI);
      camera.position.add(stepV);
      break;
    case 3:
      rotateWorld(new THREE.Vector3(0, 1, 0), (3 * Math.PI) / 2);
      camera.position.add(stepV);
      break;
    default:
      rotateWorld(new THREE.Vector3(0, 1, 0), (-gravityState * Math.PI) / 2);
      camera.position.add(stepV);
      break;
  }
}

document.addEventListener("keydown", (event) => {
  if (event.code === "KeyG") {
    changeGravity();
  }
});

animate();
