import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { TextureLoader } from "three";
import { OctreeHelper } from "three/addons/helpers/OctreeHelper.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

export class ModelLoader {
  constructor(scene, worldOctree) {
    this.scene = scene;
    this.worldOctree = worldOctree;
    this.loader = new GLTFLoader();
    this.textureLoader = new TextureLoader();
    this.fbxloader = new FBXLoader();
  }

  loadStairModel(callback) {
    this.loader.load(`../assets/models/stairs/stairs.glb`, (gltf) => {
      gltf.scene.scale.set(3 * 1.51, 3, 3);

      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          const map = child.material.map;
          map.wrapS = THREE.RepeatWrapping;
          map.wrapT = THREE.RepeatWrapping;
          map.repeat.set(4, 4);
          map.minFilter = THREE.LinearFilter;
          map.magFilter = THREE.NearestFilter;
          map.anisotropy = 1;
        }
      });

      if (callback) {
        callback(gltf.scene); 
      }
    });
  }

 loadItem(itemType, callback) {
    const modelConfigs = {
        "paper_bag": { 
            path: "../assets/models/paper_bag/scene.gltf",
            scale: 0.5,
        },
        "small_radio": { 
            path: "../assets/models/radio/scene.gltf",
            scale: 4,
        },
        "note": { 
            path: "../assets/models/note/scene.gltf",
            scale: 2.3,
        },
        "key": { 
            path: "../assets/models/key/scene.gltf",
            scale: 0.4,
        },
        //"diary": { 
        //    path: "../assets/models/diary/scene.gltf",
        //    scale: 0.2,
        //},
        "exit_sign": { 
            path: "../assets/models/exit_sign/scene.gltf",
            scale: 0.1,
        },
        "cardboard_box": { 
            path: "../assets/models/cardboard_box/scene.gltf",
            scale: 0.5,
        },
        //"robbie": { 
        //    path: "/assets/models/robbie/scene.gltf",
        //    scale: 0.3,
        //},
    };

    const config = modelConfigs[itemType];
    if (config) {
        this.loader.load(config.path, (gltf) => {
            gltf.scene.scale.set(config.scale, config.scale, config.scale);
            if (itemType === "key") {
                gltf.scene.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
            }
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;

                    const map = child.material.map;
                    map.minFilter = THREE.LinearFilter;
                    map.magFilter = THREE.NearestFilter;
                    map.anisotropy = 1;
                }
            });

            if (callback) {
                callback(gltf.scene);
            }
        });
    }
}

  loadWall(type, callback) {
    this.loader.load(`../assets/models/${type}.glb`, (gltf) => {
      gltf.scene.scale.set(1.5, 1.7, 1.2);
      gltf.scene.traverse((child) => {
        if(child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;


          const map = child.material.map;
          map.wrapS = THREE.RepeatWrapping;
          map.wrapT = THREE.RepeatWrapping;
          map.repeat.set(4,4);
          map.minFilter = THREE.LinearFilter;
          map.magFilter = THREE.NearestFilter;
          map.anisotropy = 1;
        }
      });

      if (callback) {
        callback(gltf.scene);
      }
    });
  }

  loadLamp(callback) {
    this.loader.load(`../assets/models/lamp.glb`, (gltf) => {
      gltf.scene.traverse((child) => {
        if(child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      if (callback) {
        callback(gltf.scene);
      }
    });
  }
  
  // would've been better to standardize some of these models so at least i cpould just have one function 
  // for loading in any item, passing in a path would've been better...
  // not a completely bad decision since some of these models have different material properties (mostly mine so having a filter on them doesnt work as well)
  // some also have animations, player model loading would've been here but it was easier to just manage it in the player.js due to parameters passed
  // things like the scene do have a camera property so it yeah... some things are a bit redundant
  
  loadAC(callback) {
    this.loader.load(`../assets/models/air_conditioner/scene.gltf`, (gltf) => {
      gltf.scene.scale.set(1.5, 1.7, 1.2);
      gltf.scene.traverse((child) => {
        if(child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          const map = child.material.map;
          map.minFilter = THREE.LinearFilter;
          map.magFilter = THREE.NearestFilter;
          map.anisotropy = 1;
        }
      });

      if (callback) {
        callback(gltf.scene);
      }
    });
  }

  loadCabinet(callback) {
    this.loader.load(`../assets/models/cabinet.glb`, (gltf) => {
      //gltf.scene.scale.set(1.5, 1.7, 1.2);
      gltf.scene.traverse((child) => {
        if(child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          const map = child.material.map;
          map.minFilter = THREE.LinearFilter;
          map.magFilter = THREE.NearestFilter;
          map.anisotropy = 1;
        }
      });

      if (callback) {
        callback(gltf.scene);
      }
    });
  }

  loadBarrels(type, callback) {
    this.loader.load(`../assets/models/props/${type}_props.glb`, (gltf) => {
      gltf.scene.traverse((child) => {
        if(child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          const map = child.material.map;
          map.minFilter = THREE.LinearFilter;
          map.magFilter = THREE.NearestFilter;
          map.anisotropy = 1;
        }
      });

      if (callback) {
        callback(gltf.scene);
      }
    });
  }

 //loadBoss(callback) {
 loadBoss() {
   this.fbxloader.setPath('../assets/blender/');
   this.fbxloader.load('boss.fbx', (fbx) => {
     fbx.scale.setScalar(0.1);
     fbx.traverse (c => {
       c.castShadow = true;
     });
     
     this.mixer = new THREE.AnimationMixer(fbx);
     if(fbx.animations && fbx.animations.length > 0) {
       const idle = this.mixer.clipAction(fbx.animations[0]);
       idle.play();
     }
     this.scene.add(fbx);
   });
    //this.loader.load(`assets/boss.glb`, (gltf) => {
    //  gltf.scene.scale.set(2, 2, 2);
    //  console.log(gltf.scene);
    //  gltf.scene.traverse((child) => {
    //    child.position.y += 2;
    //    if(child.isMesh) {
    //      child.castShadow = true;
    //      child.receiveShadow = true;
    //
    //      //const map = child.material.map;
    //      //map.minFilter = THREE.LinearFilter;
    //      //map.magFilter = THREE.NearestFilter;
    //      //map.anisotropy = 1;
    //    }
    //  });
    //
    //  if (callback) {
    //    callback(gltf.scene);
    //  }
    //});
 }
}
