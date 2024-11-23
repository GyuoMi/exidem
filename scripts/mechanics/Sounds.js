//import { AudioLoader, AudioListener, Audio, PositionalAudio} from 'three';
import * as THREE from "three";

export class Sounds {
    constructor(camera) {
        this.listener = new THREE.AudioListener();
        camera.add(this.listener);
        this.audioLoader = new THREE.AudioLoader();
        this.activeSounds = {};
        // track AudioContext state
        this.audioContext = this.listener.context;

        // resume AudioContext after user gesture
        window.addEventListener("click", () => this.resumeAudioContext());
        window.addEventListener("keydown", () => this.resumeAudioContext()); 
    }

    resumeAudioContext() {
      if (this.audioContext.state === "suspended") {
        this.audioContext.resume().then(() => {
            console.log("AudioContext resumed");
        });
      }
    }

    loadAudio(name, filePath, onLoadCallback) {
      this.audioLoader.load(filePath, (buffer) => {
          const audio = new THREE.Audio(this.listener);
          audio.setBuffer(buffer);
          audio.setLoop(true);
          audio.setVolume(0.5);
          this.activeSounds[name] = audio;
          
          if (onLoadCallback) onLoadCallback();
      });
    }


    loadPositionalAudio(name, url, onLoad) {
      const sound = new THREE.PositionalAudio(this.listener);
      
      this.audioLoader.load(url, (buffer) => {
          sound.setBuffer(buffer);
          sound.setRefDistance(20); // Set the distance at which the sound starts to fade
          sound.setVolume(0.25); // Adjust volume if needed
          sound.setLoop(false);
          this.activeSounds[name] = sound;

          if (onLoad) {
              onLoad(sound); // Call onLoad if provided
          }

          console.log(`Loaded positional audio: ${name}`);
      });
    }


    // Method to play an ambient track
    playAmbientTrack(name) {
        const sound = this.activeSounds[name];
        if (sound) {
            sound.play();
            console.log("now playing ambience")
        } else {
            console.error(`Sound ${name} not found in activeSounds.`);
        }
    }

    // Fades out and stops a sound
    fadeSound(name, duration = 1000) {
        const sound = this.activeSounds[name];
        if (sound) {
            const initialVolume = sound.getVolume();
            const interval = 50;
            let currentTime = 0;

            const fadeInterval = setInterval(() => {
                currentTime += interval;
                const newVolume = initialVolume * (1 - currentTime / duration);
                sound.setVolume(Math.max(newVolume, 0));
                if (currentTime >= duration) {
                    clearInterval(fadeInterval);
                    sound.stop();
                    sound.setVolume(initialVolume); // Reset for next play
                }
            }, interval);
        } else {
            console.error(`Sound ${name} not found in activeSounds.`);
        }
    }

    playAudio(name) {
        const sound = this.activeSounds[name];
        if (sound) {
            sound.play();
            sound.setLoop(false);
        } else {
            console.error(`sound ${name} not found.`);
        }
    }
      muteAllSounds(mute) {
        this.listener.gain.gain.setValueAtTime(mute ? 0 : 1, this.listener.context.currentTime);
    }
}

