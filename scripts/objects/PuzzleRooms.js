//https://codinhood.com/post/create-skybox-with-threejs/
import * as THREE from 'three';

export default class PuzzleRooms {
  constructor(containerId, skyboxFileName) {
    this.container = document.getElementById(containerId);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 45, 30000);
    this.camera.position.set(1200, -250, 2000);
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.domElement.id = "canvas";
    this.container.appendChild(this.renderer.domElement);
    
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enabled = true;
    this.controls.minDistance = 700;
    this.controls.maxDistance = 1500;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 1.0;

    this.skyboxFileName = skyboxFileName;
    this.initSkybox();
    
    window.addEventListener('resize', () => this.onWindowResize(), false);
    this.animate();
  }

  // skybox path locations 
  createPathStrings(filename) {
    const basePath = "./assets/skybox/"; 
    const baseFilename = basePath + filename;
    const fileType = ".png";
    const sides = ["ft", "bk", "up", "dn", "rt", "lf"];
    const pathStings = sides.map(side => {
      return baseFilename + "_" + side + fileType;
    });

    return pathStings;
  }

    createMaterialArray(filename) {
    const skyboxImagePaths = this.createPathStrings(filename);
    const materialArray = skyboxImagePaths.map(image => {
      let texture = new THREE.TextureLoader().load(image);
      return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
    });
    return materialArray;
  }

  initSkybox() {
    const materialArray = this.createMaterialArray(this.skyboxFileName);
    const skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
    this.skybox = new THREE.Mesh(skyboxGeo, materialArray);
    this.scene.add(this.skybox);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }
}

