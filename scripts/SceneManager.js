import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";

export class SceneManager {
  constructor(scene, container) {
    this.container = container;
    this.scene = scene;
    //this.scene.fog = new THREE.Fog(0x222222, 10, 40); 
    this.clock = new THREE.Clock();

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

    this.environmentMap;

    this.setupCamera();
    this.setupLights();
    this.setupSkybox();
    this.setupMoonlight(); 
    this.createWindowGlass(); 

    window.addEventListener("resize", this.onWindowResize.bind(this));
  }

createWindowGlass(){
    const glassGeometry = new THREE.PlaneGeometry(3.75, 3.75); 
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 1,
        opacity: 1,
        metalness: 0,
        roughness: 0,
        ior: 1.0,
        thickness: 0.01,
        specularIntensity: 1,
        specularColor: 0xffffff,
        envMapIntensity: 1,
        lightIntensity: 1,
        exposure: 1
    });

    // Load skybox textures and set as environment map
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const envMap = cubeTextureLoader.load([
        '../assets/skybox/retro_skyboxes_pack/Dusk/vz_dusk_rt.png', 
        '../assets/skybox/retro_skyboxes_pack/Dusk/vz_dusk_lt.png', 
        '../assets/skybox/retro_skyboxes_pack/Dusk/vz_dusk_up.png', 
        '../assets/skybox/retro_skyboxes_pack/Dusk/vz_dusk_dn.png', 
        '../assets/skybox/retro_skyboxes_pack/Dusk/vz_dusk_ft.png', 
        '../assets/skybox/retro_skyboxes_pack/Dusk/vz_dusk_bk.png'  
    ]);

    // Set the cube environment map to the glass material
    envMap.mapping = THREE.CubeReflectionMapping; // Enable reflection mapping
    glassMaterial.envMap = envMap;
    glassMaterial.needsUpdate = true; // Ensure the material updates with the env map

    const glass = new THREE.Mesh(glassGeometry, glassMaterial);
    glass.position.set(-4.8, 15.5, -4); // Position it right at the window frame
    glass.rotation.y = Math.PI / 2; 
    this.scene.add(glass);

    const rainVertShader = document.getElementById('rain-vertex-shader').textContent;
    const rainFragShader = document.getElementById('rain-fragment-shader').textContent;
    const rainMaterial = new THREE.ShaderMaterial({
      vertexShader: rainVertShader,
      fragmentShader: rainFragShader,
      //transparent: true,
      uniforms: {
        u_time: { value: 0 },
        u_envMap: { value: envMap },
        u_cameraPosition: { value: new THREE.Vector3() }
      },
    });


    const rainGeometry = new THREE.PlaneGeometry(4.2, 3.75);
    const rain = new THREE.Mesh(rainGeometry, rainMaterial);
    const fixedCam = 14.0;
    rain.position.set(-4.98, 15.5, -4); 
    rain.rotation.y = glass.rotation.y; 
    rain.renderOrder = 1; // ensure rain is rendered on top of the glass
    this.scene.add(rain);
    const camera = this.camera;
    
    function animateRain(time){
      rain.material.uniforms.u_time.value = time / 1000;
      rain.material.uniforms.u_cameraPosition.value.set(0, 10, 0);
      requestAnimationFrame(animateRain);
    }
    animateRain();
}


  setupMoonlight() {
    const moonlight = new THREE.SpotLight(0xe0e0e0, 500, 25, Math.PI / 4, 0.1, 2); // Color, intensity, distance
    moonlight.position.set(-13, 20, 10); 
    moonlight.target.position.set(-3, 15, -8);
    moonlight.castShadow = true;

    // Adjust shadow settings
    moonlight.shadow.mapSize.width = 1024;
    moonlight.shadow.mapSize.height = 1024;
    moonlight.shadow.camera.near = 0.1;
    moonlight.shadow.camera.far = 50;

    // Optional: Add a helper to visualize the light
    //const helper = new THREE.PointLightHelper(moonlight, 0.5);
    const helper = new THREE.CameraHelper(moonlight.shadow.camera);
    this.scene.add(helper);

    this.scene.add(moonlight);
    this.scene.add(moonlight.target);
  }

  setupSkybox(){
    
    let materialArray = [];
    let texture_ft = new THREE.TextureLoader().load('../assets/skybox/retro_skyboxes_pack/Dusk/vz_dusk_ft.png');
    let texture_bk = new THREE.TextureLoader().load('../assets/skybox/retro_skyboxes_pack/Dusk/vz_dusk_bk.png');
    let texture_up = new THREE.TextureLoader().load('../assets/skybox/retro_skyboxes_pack/Dusk/vz_dusk_up.png');
    let texture_dn = new THREE.TextureLoader().load('../assets/skybox/retro_skyboxes_pack/Dusk/vz_dusk_dn.png');
    let texture_rt = new THREE.TextureLoader().load('../assets/skybox/retro_skyboxes_pack/Dusk/vz_dusk_rt.png');
    let texture_lt = new THREE.TextureLoader().load('../assets/skybox/retro_skyboxes_pack/Dusk/vz_dusk_lt.png');

    materialArray.push(new THREE.MeshBasicMaterial({map: texture_ft}));
    materialArray.push(new THREE.MeshBasicMaterial({map: texture_bk}));
    materialArray.push(new THREE.MeshBasicMaterial({map: texture_up}));
    materialArray.push(new THREE.MeshBasicMaterial({map: texture_dn}));
    materialArray.push(new THREE.MeshBasicMaterial({map: texture_rt}));
    materialArray.push(new THREE.MeshBasicMaterial({map: texture_lt}));

    for (let i=0; i<materialArray.length; i++)
      materialArray[i].side = THREE.BackSide;
    let skyboxGeo = new THREE.BoxGeometry(20, 20, 30);
    let skybox = new THREE.Mesh(skyboxGeo, materialArray);
    skybox.position.set(-18, 15, -4);
    this.scene.add(skybox);
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      1000000,
    );
    this.camera.rotation.order = "YXZ";
    this.scene.add(this.camera);
  }

// Function to create random flickering effect
randomFlicker(light) {
    const minIntensity = 0.7; // Minimum light intensity
    const maxIntensity = 2.5; // Maximum light intensity

    function flicker() {
        const randomDelay = Math.random() * 500; // Up to half a second delay
        const randomIntensity = Math.random() * (maxIntensity - minIntensity) + minIntensity;

        // Set the light intensity to the random value
        light.intensity = randomIntensity;

        // Recursively call the flicker function after the random delay
        setTimeout(flicker, randomDelay);
    }

    // Start the initial flicker
    flicker();
}

setupLights() {
    // Create and attach a spotlight to the exit sign
    const exitLight = new THREE.SpotLight(0xffaa33, 5); // Increase intensity
    exitLight.position.set(11.61, 13.49, 1.79); // Position of the exit sign
    exitLight.angle = Math.PI / 6; // Wider beam angle
    exitLight.penumbra = 0.2; // Adjust for a softer edge
    exitLight.distance = 50; // Extend the range
    exitLight.castShadow = true;
    exitLight.shadow.mapSize.width = 512;
    exitLight.shadow.mapSize.height = 512;

    // Ensure the light is pointing towards the exit sign
    const targetObject = new THREE.Object3D();
    targetObject.position.set(12.61, 11.5, 1.79); 
    this.scene.add(targetObject);
    exitLight.target = targetObject;

    // TODO: could be better to use emission light
    this.scene.add(exitLight);
    this.randomFlicker(exitLight);
    // visualiser
    const spotLightHelper = new THREE.SpotLightHelper(exitLight);
    this.scene.add(spotLightHelper);

    // dim ambient light attached to the player
    const playerLight = new THREE.PointLight(0xffffff, 112.5, 10);
    playerLight.castShadow = true;
    playerLight.position.set(0, -1.5, 0);
    playerLight.shadow.mapSize.width = 1024; // Increase for better quality
    playerLight.shadow.mapSize.height = 1024; // Increase for better quality
    playerLight.shadow.camera.near = 0.1; 
    playerLight.shadow.camera.far = 10; // Adjust to control the distance of shadows
    playerLight.shadow.bias = -0.01; // Fine-tune to reduce shadow artifacts
    this.camera.add(playerLight);

    //this.scene.fog = new THREE.Fog(0x000000, 5, 20);
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

