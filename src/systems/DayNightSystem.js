import * as THREE from 'three';

/**
 * DayNightSystem.js
 * Manages dynamic sky color, sunlight angle, shadows, ambient light,
 * and street lamp emissive illumination transitions.
 */

export class DayNightSystem {
  constructor(scene) {
    this.scene = scene;
    this.timeOfDay = 0.25; // 0.0 to 1.0 (0.25 = Morning, 0.5 = Noon, 0.75 = Dusk, 0.0 = Night)
    this.isNight = false;
    this.speed = 0.008; // Day cycle progression speed

    // Sunlight Directional Light
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 150;
    const d = 40;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.scene.add(this.sunLight);

    // Ambient Light
    this.ambientLight = new THREE.AmbientLight(0xdce7ff, 0.6);
    this.scene.add(this.ambientLight);

    // Fog
    this.fog = new THREE.FogExp2(0x87ceeb, 0.008);
    this.scene.fog = this.fog;

    this.streetLamps = [];
  }

  registerStreetLamp(bulbMesh) {
    this.streetLamps.push(bulbMesh);
  }

  setNightMode(enableNight) {
    this.timeOfDay = enableNight ? 0.0 : 0.5;
    this.update(0);
  }

  update(delta) {
    this.timeOfDay = (this.timeOfDay + delta * this.speed * 0.05) % 1.0;

    const angle = this.timeOfDay * Math.PI * 2;
    const sunX = Math.cos(angle) * 60;
    const sunY = Math.sin(angle) * 60;
    const sunZ = Math.sin(angle * 0.5) * 40;

    this.sunLight.position.set(sunX, sunY, sunZ);

    this.isNight = sunY < 0;

    if (!this.isNight) {
      // Day time palette
      const dayIntensity = Math.min(1.2, Math.max(0.2, sunY / 40.0));
      this.sunLight.intensity = dayIntensity;
      this.sunLight.color.setHex(0xfffaed);
      this.ambientLight.intensity = 0.6;
      this.scene.background = new THREE.Color(0x87ceeb);
      this.fog.color.setHex(0x87ceeb);
    } else {
      // Night time palette
      this.sunLight.intensity = 0.1;
      this.sunLight.color.setHex(0x334466);
      this.ambientLight.intensity = 0.2;
      this.scene.background = new THREE.Color(0x0a0c14);
      this.fog.color.setHex(0x0a0c14);
    }

    // Toggle street lamp bulbs
    this.streetLamps.forEach(bulb => {
      if (bulb.material) {
        bulb.material.color.setHex(this.isNight ? 0xffea00 : 0x444444);
      }
    });
  }
}
