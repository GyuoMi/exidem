import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { TextureLoader } from "three";
import { OctreeHelper } from "three/addons/helpers/OctreeHelper.js";

import { GUI } from "three/addons/libs/lil-gui.module.min.js";

export class ModelLoader {
  constructor(scene, worldOctree) {
    this.scene = scene;
    this.worldOctree = worldOctree;
    this.loader = new GLTFLoader();
    this.textureLoader = new TextureLoader();
  }

  loadStairModel(callback) {
    const texture = this.textureLoader.load(
      "/assets/models/StairsLat/textures/CNCR04L.JPG",
    );

    this.loader.load("/assets/models/StairsLat/objStair.glb", (gltf) => {
      gltf.scene.scale.set(3 * 1.51, 3, 3);

      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.material.map = texture;

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
            path: "/assets/models/paper_bag/scene.gltf",
            scale: 0.5,
        },
        "small_radio": { 
            path: "/assets/models/radio/scene.gltf",
            scale: 4,
        },
        "note": { 
            path: "/assets/models/note/scene.gltf",
            scale: 2.3,
        },
        "key": { 
            path: "/assets/models/key/scene.gltf",
            scale: 0.1,
        },
        //"diary": { 
        //    path: "/assets/models/diary/scene.gltf",
        //    scale: 0.2,
        //},
        "exit_sign": { 
            path: "/assets/models/exit_sign/scene.gltf",
            scale: 0.05,
        },
        "cardboard_box": { 
            path: "/assets/models/cardboard_box/scene.gltf",
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
    const texture = this.textureLoader.load("/assets/models/StairsLat/textures/CNCR03L.JPG");
    
    this.loader.load(`/assets/models/${type}.gltf`, (gltf) => {
      gltf.scene.scale.set(1.5, 1.7, 1.2);
      gltf.scene.traverse((child) => {
        if(child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.material.map = texture;

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
}
