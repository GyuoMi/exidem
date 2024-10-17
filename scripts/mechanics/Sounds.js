this.doorCreak = new THREE.Audio(this.player.listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('/assets/audio/door_creak.wav', (buffer) => {
      this.doorCreak.setBuffer(buffer);
      this.doorCreak.setVolume(0.05);
    });
