import * as THREE from 'three';
import { ProceduralMeshFactory } from '../utils/ProceduralMeshFactory.js';

/**
 * RoadSystem.js
 * Builds roads, side streets, sidewalks, crosswalks, and street lights.
 */

export class RoadSystem {
  constructor(scene, dayNightSystem) {
    this.scene = scene;
    this.dayNightSystem = dayNightSystem;
  }

  createRoadNetwork() {
    const group = new THREE.Group();

    const roadMat = new THREE.MeshStandardMaterial({ color: 0x282c34, roughness: 0.9 });
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x8a929e, roughness: 0.7 });
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xf5b041 }); // Yellow road dividing stripes

    // Main East-West Road
    const mainRoad = new THREE.Mesh(new THREE.PlaneGeometry(300, 16), roadMat);
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.position.y = 0.01;
    group.add(mainRoad);

    // Main North-South Cross Road
    const crossRoad = new THREE.Mesh(new THREE.PlaneGeometry(16, 300), roadMat);
    crossRoad.rotation.x = -Math.PI / 2;
    crossRoad.position.y = 0.01;
    group.add(crossRoad);

    // Sidewalks
    const sw1 = new THREE.Mesh(new THREE.BoxGeometry(300, 0.2, 3), sidewalkMat);
    sw1.position.set(0, 0.1, 9.5);
    const sw2 = new THREE.Mesh(new THREE.BoxGeometry(300, 0.2, 3), sidewalkMat);
    sw2.position.set(0, 0.1, -9.5);
    group.add(sw1, sw2);

    // Yellow Lane Markings along East-West Road
    for (let x = -140; x <= 140; x += 12) {
      if (Math.abs(x) < 12) continue; // Skip intersection
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(5, 0.4), stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(x, 0.02, 0);
      group.add(stripe);
    }

    // Street Lights along main road
    for (let x = -130; x <= 130; x += 30) {
      const lampNorth = ProceduralMeshFactory.createStreetLight();
      lampNorth.position.set(x, 0, 10.5);
      lampNorth.rotation.y = Math.PI;

      const lampSouth = ProceduralMeshFactory.createStreetLight();
      lampSouth.position.set(x + 15, 0, -10.5);

      group.add(lampNorth, lampSouth);

      if (this.dayNightSystem) {
        // Find bulb mesh
        lampNorth.traverse(c => { if (c.isMesh && c.geometry.type === 'SphereGeometry') this.dayNightSystem.registerStreetLamp(c); });
        lampSouth.traverse(c => { if (c.isMesh && c.geometry.type === 'SphereGeometry') this.dayNightSystem.registerStreetLamp(c); });
      }
    }

    this.scene.add(group);
  }
}
