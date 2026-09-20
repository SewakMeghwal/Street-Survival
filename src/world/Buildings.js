import * as THREE from 'three';
import { ProceduralMeshFactory } from '../utils/ProceduralMeshFactory.js';

/**
 * Buildings.js
 * Generates neighborhood houses, market stalls, and industrial sheds across Survival Nagar.
 * Automatically registers bounding box colliders with CollisionSystem.
 */

export class Buildings {
  constructor(scene, collisionSystem) {
    this.scene = scene;
    this.collisionSystem = collisionSystem;
  }

  buildNeighborhood() {
    const wallColors = [0xe0caab, 0xd9b38c, 0xc2a688, 0x8cb3a2, 0xd4a5a5];

    // Zone 1: Residential Block (North Side: Z = 25 to 60)
    for (let x = -100; x <= 100; x += 25) {
      if (Math.abs(x) < 15) continue; // Keep main avenue clear
      const color = wallColors[Math.abs(x / 25) % wallColors.length];
      const house = ProceduralMeshFactory.createIndianHouse(12, 8, 14, color);
      house.position.set(x, 0, 35);
      this.scene.add(house);

      if (this.collisionSystem) {
        this.collisionSystem.addMeshCollider(house, 'building');
      }
    }

    // Zone 1 South Residential Block (Z = -25 to -60)
    for (let x = -100; x <= 100; x += 25) {
      if (Math.abs(x) < 15) continue;
      const color = wallColors[(Math.abs(x / 25) + 2) % wallColors.length];
      const house = ProceduralMeshFactory.createIndianHouse(12, 8, 14, color);
      house.position.set(x, 0, -35);
      house.rotation.y = Math.PI;
      this.scene.add(house);

      if (this.collisionSystem) {
        this.collisionSystem.addMeshCollider(house, 'building');
      }
    }

    // Zone 5: Industrial / Warehouse Area (West Side: X = -110 to -140)
    const whMat = new THREE.MeshStandardMaterial({ color: 0x5a6370, roughness: 0.8 });
    const wh1 = new THREE.Mesh(new THREE.BoxGeometry(25, 10, 40), whMat);
    wh1.position.set(-125, 5, 40);
    this.scene.add(wh1);

    const wh2 = new THREE.Mesh(new THREE.BoxGeometry(25, 10, 40), whMat);
    wh2.position.set(-125, 5, -40);
    this.scene.add(wh2);

    if (this.collisionSystem) {
      this.collisionSystem.addMeshCollider(wh1, 'warehouse');
      this.collisionSystem.addMeshCollider(wh2, 'warehouse');
    }
  }
}
