import * as THREE from 'three';
import { ProceduralMeshFactory } from '../utils/ProceduralMeshFactory.js';

/**
 * Buildings.js
 * Generates neighborhood houses, market stalls, and industrial sheds across Survival Nagar.
 * Registers colliders and interactive entrance doors.
 */

export class Buildings {
  constructor(scene, collisionSystem) {
    this.scene = scene;
    this.collisionSystem = collisionSystem;
    this.houseDoors = [];
  }

  buildNeighborhood() {
    const wallColors = [0xe0caab, 0xd9b38c, 0xc2a688, 0x8cb3a2, 0xd4a5a5];

    // Zone 1: Residential Block (North Side: Z = 25 to 60)
    for (let x = -100; x <= 100; x += 25) {
      if (Math.abs(x) < 15) continue; // Keep main avenue clear
      const color = wallColors[Math.abs(x / 25) % wallColors.length];
      const { houseMesh, doorPivot } = ProceduralMeshFactory.createIndianHouse(12, 8, 14, color);
      houseMesh.position.set(x, 0, 35);
      this.scene.add(houseMesh);
      if (doorPivot) this.houseDoors.push(doorPivot);

      if (this.collisionSystem) {
        this.collisionSystem.addMeshCollider(houseMesh, 'building');
      }
    }

    // Zone 1 South Residential Block (Z = -25 to -60)
    for (let x = -100; x <= 100; x += 25) {
      if (Math.abs(x) < 15) continue;
      const color = wallColors[(Math.abs(x / 25) + 2) % wallColors.length];
      const { houseMesh, doorPivot } = ProceduralMeshFactory.createIndianHouse(12, 8, 14, color);
      houseMesh.position.set(x, 0, -35);
      houseMesh.rotation.y = Math.PI;
      this.scene.add(houseMesh);
      if (doorPivot) this.houseDoors.push(doorPivot);

      if (this.collisionSystem) {
        this.collisionSystem.addMeshCollider(houseMesh, 'building');
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

  animateHomeEntry(isEntering) {
    // Swing doors open smoothly when entering home
    this.houseDoors.forEach(door => {
      const targetAngle = isEntering ? -Math.PI * 0.55 : 0;
      door.rotation.y = THREE.MathUtils.lerp(door.rotation.y, targetAngle, 0.1);
    });
  }
}
