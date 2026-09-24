import * as THREE from 'three';

/**
 * ParticleSystem.js
 * Visual particle effects: Running dust puffs, bite impact sparks, and bark shockwaves.
 */

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];

    this.dustMat = new THREE.MeshBasicMaterial({ color: 0xc2b280, transparent: true, opacity: 0.6 });
    this.hitMat = new THREE.MeshBasicMaterial({ color: 0xff1744, transparent: true, opacity: 0.9 });
    this.dustGeo = new THREE.SphereGeometry(0.08, 6, 6);
    this.hitGeo = new THREE.SphereGeometry(0.12, 6, 6);
  }

  createDustPuff(position) {
    for (let i = 0; i < 3; i++) {
      const p = new THREE.Mesh(this.dustGeo, this.dustMat.clone());
      p.position.set(
        position.x + (Math.random() - 0.5) * 0.3,
        0.05,
        position.z + (Math.random() - 0.5) * 0.3
      );
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.8,
        0.5 + Math.random() * 0.8,
        (Math.random() - 0.5) * 0.8
      );
      this.scene.add(p);
      this.particles.push({ mesh: p, vel, life: 0.4 });
    }
  }

  createHitSpark(position) {
    for (let i = 0; i < 6; i++) {
      const p = new THREE.Mesh(this.hitGeo, this.hitMat.clone());
      p.position.copy(position);
      p.position.y += 0.8;
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 3.0,
        1.0 + Math.random() * 2.0,
        (Math.random() - 0.5) * 3.0
      );
      this.scene.add(p);
      this.particles.push({ mesh: p, vel, life: 0.5 });
    }
  }

  update(delta) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta;

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.particles.splice(i, 1);
      } else {
        p.mesh.position.addScaledVector(p.vel, delta);
        p.mesh.material.opacity = p.life / 0.5;
      }
    }
  }
}
