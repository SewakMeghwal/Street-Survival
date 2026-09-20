import * as THREE from 'three';
import { GAME_CONFIG } from '../game/GameConfig.js';

/**
 * SafeZones.js
 * Creates glowing green safe zone areas (Houses, Police Booths, Community Gates).
 * When player is inside, dogs stop attacking and player health/stamina recovers.
 */

export class SafeZones {
  constructor(scene) {
    this.scene = scene;
    this.zones = []; // Array of { position: THREE.Vector3, radius: number, mesh: THREE.Mesh }
  }

  clear() {
    this.zones.forEach(z => this.scene.remove(z.mesh));
    this.zones = [];
  }

  addSafeZone(position, radius = GAME_CONFIG.WORLD.SAFE_ZONE_RADIUS, name = 'Safe Zone') {
    const geo = new THREE.RingGeometry(radius * 0.85, radius, 32);
    geo.rotateX(-Math.PI / 2);

    const mat = new THREE.MeshBasicMaterial({
      color: 0x00e676,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(position);
    mesh.position.y = 0.05; // Slightly above ground to prevent Z-fighting
    this.scene.add(mesh);

    const zoneObj = { position: position.clone(), radius, mesh, name };
    this.zones.push(zoneObj);
    return zoneObj;
  }

  isPositionInSafeZone(pos) {
    for (let i = 0; i < this.zones.length; i++) {
      const z = this.zones[i];
      const dx = pos.x - z.position.x;
      const dz = pos.z - z.position.z;
      if (dx * dx + dz * dz <= z.radius * z.radius) {
        return true;
      }
    }
    return false;
  }

  update(delta) {
    // Pulse ring opacity
    const time = performance.now() * 0.003;
    this.zones.forEach(z => {
      z.mesh.material.opacity = 0.4 + Math.sin(time) * 0.2;
    });
  }
}
