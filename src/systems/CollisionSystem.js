import * as THREE from 'three';

/**
 * CollisionSystem.js
 * Fast spatial grid and axis-aligned / oriented bounding box collision system.
 * Keeps player and dogs from clipping through buildings, walls, vehicles, and props.
 */

export class CollisionSystem {
  constructor() {
    this.colliders = []; // Array of { bbox: THREE.Box3, type: string, mesh: THREE.Mesh }
  }

  clear() {
    this.colliders = [];
  }

  addBoxCollider(minVector, maxVector, type = 'wall', mesh = null) {
    const box = new THREE.Box3(minVector.clone(), maxVector.clone());
    this.colliders.push({ bbox: box, type: type, mesh: mesh });
    return box;
  }

  addMeshCollider(mesh, type = 'obstacle') {
    mesh.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(mesh);
    this.colliders.push({ bbox: box, type: type, mesh: mesh });
    return box;
  }

  /**
   * Resolve position collision for a cylinder/capsule entity (Player or Dog)
   * Modifies position vector in-place if colliding with any box collider.
   */
  resolveCapsuleCollision(position, radius, height) {
    const minY = position.y;
    const maxY = position.y + height;

    for (let i = 0; i < this.colliders.length; i++) {
      const box = this.colliders[i].bbox;

      // Check height overlap first
      if (maxY < box.min.y || minY > box.max.y) continue;

      // Closest point on 2D AABB in XZ plane
      const closestX = Math.max(box.min.x, Math.min(position.x, box.max.x));
      const closestZ = Math.max(box.min.z, Math.min(position.z, box.max.z));

      const dx = position.x - closestX;
      const dz = position.z - closestZ;
      const distSq = dx * dx + dz * dz;

      if (distSq < radius * radius && distSq > 0.00001) {
        const dist = Math.sqrt(distSq);
        const overlap = radius - dist;

        // Push position away along normal vector
        position.x += (dx / dist) * overlap;
        position.z += (dz / dist) * overlap;
      } else if (distSq === 0) {
        // Position inside box center: push out along shortest axis
        const overlapX1 = Math.abs(position.x - box.min.x);
        const overlapX2 = Math.abs(position.x - box.max.x);
        const overlapZ1 = Math.abs(position.z - box.min.z);
        const overlapZ2 = Math.abs(position.z - box.max.z);

        const minOverlap = Math.min(overlapX1, overlapX2, overlapZ1, overlapZ2);

        if (minOverlap === overlapX1) position.x = box.min.x - radius;
        else if (minOverlap === overlapX2) position.x = box.max.x + radius;
        else if (minOverlap === overlapZ1) position.z = box.min.z - radius;
        else position.z = box.max.z + radius;
      }
    }
  }

  /**
   * Raycast obstacle check to test line of sight or camera occlusion
   */
  raycastObstacle(origin, direction, maxDistance) {
    const ray = new THREE.Ray(origin, direction);
    const hitPoint = new THREE.Vector3();
    let closestDist = maxDistance;
    let hitFound = false;

    for (let i = 0; i < this.colliders.length; i++) {
      const box = this.colliders[i].bbox;
      if (ray.intersectBox(box, hitPoint)) {
        const dist = origin.distanceTo(hitPoint);
        if (dist < closestDist) {
          closestDist = dist;
          hitFound = true;
        }
      }
    }

    return hitFound ? closestDist : null;
  }
}
