import * as THREE from 'three';
import { ProceduralMeshFactory } from '../utils/ProceduralMeshFactory.js';

/**
 * Props.js
 * Places street vendor carts, crates, benches, construction barriers, and garbage bins.
 */

export class Props {
  constructor(scene, collisionSystem) {
    this.scene = scene;
    this.collisionSystem = collisionSystem;
  }

  placeMarketAndProps() {
    // Zone 2: Market Alley (X: -15 to -70, Z: 12 to 20)
    const cart1 = ProceduralMeshFactory.createVendorCart();
    cart1.position.set(-35, 0, 14);
    this.scene.add(cart1);

    const cart2 = ProceduralMeshFactory.createVendorCart();
    cart2.position.set(-55, 0, 14);
    cart2.rotation.y = 0.4;
    this.scene.add(cart2);

    // Benches in Park
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.8 });
    const bench1 = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.5, 0.6), benchMat);
    bench1.position.set(65, 0.25, 55);
    this.scene.add(bench1);

    // Zone 4: Construction Area Barricades (X: -60 to -90, Z: -40 to -70)
    const barMat = new THREE.MeshStandardMaterial({ color: 0xe65100, roughness: 0.6 });
    const bar1 = new THREE.Mesh(new THREE.BoxGeometry(4.0, 1.2, 0.3), barMat);
    bar1.position.set(-75, 0.6, -45);
    this.scene.add(bar1);

    if (this.collisionSystem) {
      this.collisionSystem.addMeshCollider(cart1, 'prop');
      this.collisionSystem.addMeshCollider(cart2, 'prop');
      this.collisionSystem.addMeshCollider(bench1, 'prop');
      this.collisionSystem.addMeshCollider(bar1, 'prop');
    }
  }
}
