import * as THREE from 'three';
import { ProceduralMeshFactory } from '../utils/ProceduralMeshFactory.js';

/**
 * Trees.js
 * Places trees and foliage in Zone 3 (Park) and along sidewalks.
 */

export class Trees {
  constructor(scene, collisionSystem) {
    this.scene = scene;
    this.collisionSystem = collisionSystem;
  }

  buildParkAndGreenery() {
    // Zone 3: Central Park Area (X: 40 to 90, Z: 40 to 90)
    const parkGrass = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 50),
      new THREE.MeshStandardMaterial({ color: 0x388e3c, roughness: 0.8 })
    );
    parkGrass.rotation.x = -Math.PI / 2;
    parkGrass.position.set(65, 0.015, 65);
    this.scene.add(parkGrass);

    // Park Trees
    const treePositions = [
      [50, 50], [80, 50], [50, 80], [80, 80],
      [65, 55], [55, 70], [75, 70], [65, 80],
      [-40, 15], [-70, 15], [40, -15], [70, -15]
    ];

    treePositions.forEach(pos => {
      const tree = ProceduralMeshFactory.createTree();
      tree.position.set(pos[0], 0, pos[1]);
      this.scene.add(tree);

      if (this.collisionSystem) {
        // Trunk collider
        this.collisionSystem.addBoxCollider(
          new THREE.Vector3(pos[0] - 0.3, 0, pos[1] - 0.3),
          new THREE.Vector3(pos[0] + 0.3, 4, pos[1] + 0.3),
          'tree'
        );
      }
    });
  }
}
