import * as THREE from "three";

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
  spotLight;

const containerId = "stairsBackground";

const stairDef = {
  w: 20,
  l: 80,
  h: 20,
};

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
renderer.setClearColor(0x000000, 0.5);

camera = new THREE.PerspectiveCamera(75, width / height, 1, 10000);
camera.position.copy(offset);
camera.up.set(0, 0, 1); // Set the up vector to the Z-axis

scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0025);

// Ambient light for visibility
const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);

// Point light
spotLight = new THREE.PointLight(0xffffff, 1.0, 400);
spotLight.position.set(0, 0, 500);
scene.add(spotLight);

// Light indicator sphere
const lightIndicatorGeometry = new THREE.SphereGeometry(0.5, 16, 8);
const lightIndicatorMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const lightIndicator = new THREE.Mesh(
  lightIndicatorGeometry,
  lightIndicatorMaterial,
);
lightIndicator.position.copy(spotLight.position);
scene.add(lightIndicator);
window.addEventListener('resize', () => {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;
  renderer.setSize(newWidth, newHeight);
  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();
});

// Function to draw the stairs
drawFloor = function (orientation, startPos, numOfStairs = 25, isUp = true) {
  let cube;
  for (let i = 0; i < numOfStairs; i++) {
    cube = new THREE.Mesh(
      new THREE.BoxGeometry(stairDef.w, stairDef.l, stairDef.h),
      new THREE.MeshBasicMaterial({ color: 0xff0000 }), // Changed to MeshBasicMaterial for debugging
    );

    cube.position.copy(startPos);

    switch (orientation) {
      case "+x":
        cube.position.x = startPos.x + stairDef.w * i;
        break;
      case "-x":
        cube.position.x = startPos.x - stairDef.w * i;
        break;
      case "+y":
        cube.position.y = startPos.y + stairDef.w * i;
        break;
      case "-y":
        cube.position.y = startPos.y - stairDef.w * i;
        break;
    }

    cube.position.z = isUp
      ? startPos.z + stairDef.h * i
      : startPos.z - stairDef.h * i;

    scene.add(cube);
  }

  return cube.position.clone();
};

// Animation loop
animate = function () {
  requestAnimationFrame(animate);

  switch (state) {
    case "up":
      if (endPos.clone().add(offset).distanceTo(camera.position) < 1) {
        state = "rotate";
      } else {
        camera.position.add(stepV);
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
      camera.lookAt(endPos.clone().add(new THREE.Vector3(0, 0, -400)));
      state = "up";
      break;
  }

  renderer.render(scene, camera);
};

animate();

