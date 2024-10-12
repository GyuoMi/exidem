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

      const helper = new OctreeHelper(this.worldOctree);
      helper.visible = false;
      this.scene.add(helper);

      const gui = new GUI({ width: 200 });
      gui.add({ debug: false }, "debug").onChange(function (value) {
        helper.visible = value;
      });

      if (callback) {
        callback(gltf.scene); 
      }
    });
  }

  loadItem(itemType, callback){
        const modelPaths = {
      "paper_bag": "/assets/models/paper_bag/scene.gltf",
      "small_radio": "/assets/models/radio/scene.gltf",
      "note": "/assets/models/note/scene.gltf",
      "key": "/assets/models/key/scene.gltf",
      //"diary": "/assets/models/diary.gltf",
      //"exit_sign": "/assets/models/exit_sign.gltf",
      "cardboard_box": "/assets/models/cardboard_box/scene.gltf"
      //"robbie_rabbit": "/assets/models/robbie_rabbit.gltf"
    };

    const modelPath = modelPaths[itemType];
    //const scales = [];
    if (modelPath) {
      this.loader.load(modelPath, (gltf) => {
        gltf.scene.scale.set(1, 1, 1); 

        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
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
      gltf.scene.scale.set(1.5, 1.5, 1.2);
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
