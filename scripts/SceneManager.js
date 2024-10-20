import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";

export class SceneManager {
  constructor(scene, container) {
    this.container = container;
    this.scene = scene;
    this.scene.fog = new THREE.Fog(0x222222, 10, 40); 
    this.clock = new THREE.Clock();

    // Set up the renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.VSMShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.container.appendChild(this.renderer.domElement);

    this.stats = new Stats();
    this.stats.domElement.style.position = "absolute";
    this.stats.domElement.style.top = "0px";
    this.container.appendChild(this.stats.domElement);

    this.setupCamera();
    this.setupLights();

    window.addEventListener("resize", this.onWindowResize.bind(this));
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000000,
    );
    this.camera.rotation.order = "YXZ";
    this.scene.add(this.camera);
  }

  setupLights() {
    // Create and attach a spotlight to the exit sign
    const exitLight = new THREE.SpotLight(0xffaa33, 2); // Warm, focused light
    exitLight.position.set(12.61, 12.49, 1.79); // Position of the exit sign
    exitLight.angle = Math.PI / 6; // Narrow beam angle for focus
    exitLight.penumbra = 0.5; // Soft edge
    exitLight.distance = 20; // Limited range
    exitLight.castShadow = true;
    exitLight.shadow.mapSize.width = 512;
    exitLight.shadow.mapSize.height = 512;
    this.scene.add(exitLight);

    // Create a dim ambient light attached to the player
    const playerLight = new THREE.PointLight(0xffffff, 12.5, 10); // Soft, dim light
    playerLight.castShadow = false;
    playerLight.position.set(0, -1.5, 0); // Position relative to the player

    // Assuming you have a player object you can attach it to
    this.camera.add(playerLight); // Attach to the player

    // (Optional) Update any fog settings for a more ominous look
    this.scene.fog = new THREE.Fog(0x000000, 5, 20); // Darker fog, shorter distance
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
    this.renderer.setSize(window.innerWidth / 2, window.innerHeight / 2, false);
    this.renderer.domElement.style.imageRendering = "pixelated";
  }

  updateStats() {
    this.stats.update();
  }
}

