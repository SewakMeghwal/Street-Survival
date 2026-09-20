import * as THREE from 'three';
import { ProceduralMeshFactory } from '../utils/ProceduralMeshFactory.js';

/**
 * Vehicles.js
 * Places auto-rickshaws, cars, and buses around the neighborhood.
 */

export class Vehicles {
  constructor(scene, collisionSystem) {
    this.scene = scene;
    this.collisionSystem = collisionSystem;
  }

  placeVehicles() {
    // Parked Auto-Rickshaws
    const auto1 = ProceduralMeshFactory.createAutoRickshaw();
    auto1.position.set(-25, 0, 11.5);
    auto1.rotation.y = 0.3;
    this.scene.add(auto1);

    const auto2 = ProceduralMeshFactory.createAutoRickshaw();
    auto2.position.set(45, 0, -11.5);
    auto2.rotation.y = -Math.PI * 0.8;
    this.scene.add(auto2);

    // Parked Sedan Cars
    const carMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.4 });
    const car1 = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.3, 4.5), carMat);
    car1.position.set(15, 0.65, 12);
    this.scene.add(car1);

    if (this.collisionSystem) {
      this.collisionSystem.addMeshCollider(auto1, 'vehicle');
      this.collisionSystem.addMeshCollider(auto2, 'vehicle');
      this.collisionSystem.addMeshCollider(car1, 'vehicle');
    }
  }
}
