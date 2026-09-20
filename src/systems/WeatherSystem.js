import * as THREE from 'three';

/**
 * WeatherSystem.js
 * Weather system architecture supporting Clear, Rain, and Fog weather modes.
 */

export class WeatherSystem {
  constructor(scene) {
    this.scene = scene;
    this.mode = 'CLEAR'; // 'CLEAR', 'RAIN', 'FOG'

    this.rainParticles = null;
    this.rainCount = 1200;
    this.rainGeometry = null;

    this.initRain();
  }

  initRain() {
    this.rainGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.rainCount * 3);

    for (let i = 0; i < this.rainCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 80;
      positions[i + 1] = Math.random() * 30;
      positions[i + 2] = (Math.random() - 0.5) * 80;
    }

    this.rainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const rainMaterial = new THREE.PointsMaterial({
      color: 0x88ccff,
      size: 0.15,
      transparent: true,
      opacity: 0.7
    });

    this.rainParticles = new THREE.Points(this.rainGeometry, rainMaterial);
    this.rainParticles.visible = false;
    this.scene.add(this.rainParticles);
  }

  setWeather(mode) {
    this.mode = mode;
    if (mode === 'RAIN') {
      this.rainParticles.visible = true;
    } else {
      this.rainParticles.visible = false;
    }
  }

  update(delta, playerPos) {
    if (this.mode === 'RAIN' && this.rainParticles.visible && playerPos) {
      const positions = this.rainGeometry.attributes.position.array;
      for (let i = 0; i < this.rainCount * 3; i += 3) {
        positions[i + 1] -= delta * 35; // Rain fall speed
        if (positions[i + 1] < 0) {
          positions[i] = playerPos.x + (Math.random() - 0.5) * 80;
          positions[i + 1] = playerPos.y + 25 + Math.random() * 5;
          positions[i + 2] = playerPos.z + (Math.random() - 0.5) * 80;
        }
      }
      this.rainGeometry.attributes.position.needsUpdate = true;
    }
  }
}
