import * as THREE from 'three';
import { RoadSystem } from './RoadSystem.js';
import { Buildings } from './Buildings.js';
import { Trees } from './Trees.js';
import { Vehicles } from './Vehicles.js';
import { Props } from './Props.js';
import { SafeZones } from './SafeZones.js';

/**
 * City.js
 * Master environment generator for "Survival Nagar" (North Indian Urban Neighborhood).
 * Integrates 8 Gameplay Zones:
 * 1. Residential Streets
 * 2. Market Alley
 * 3. Park
 * 4. Construction Site
 * 5. Industrial Sheds
 * 6. Main Avenue
 * 7. Dog Territory
 * 8. Safe Zones
 */

export class City {
  constructor(scene, collisionSystem, dayNightSystem) {
    this.scene = scene;
    this.collisionSystem = collisionSystem;
    this.dayNightSystem = dayNightSystem;

    this.roadSystem = new RoadSystem(scene, dayNightSystem);
    this.buildings = new Buildings(scene, collisionSystem);
    this.trees = new Trees(scene, collisionSystem);
    this.vehicles = new Vehicles(scene, collisionSystem);
    this.props = new Props(scene, collisionSystem);
    this.safeZones = new SafeZones(scene);

    this.initGround();
    this.buildCity();
  }

  initGround() {
    // Large ground plane representing dirt / concrete neighborhood foundation
    const groundGeo = new THREE.PlaneGeometry(400, 400);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x3d352e, // Warm Indian soil tone
      roughness: 0.95
    });

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  buildCity() {
    this.roadSystem.createRoadNetwork();
    this.buildings.buildNeighborhood();
    this.trees.buildParkAndGreenery();
    this.vehicles.placeVehicles();
    this.props.placeMarketAndProps();
  }

  update(delta) {
    this.safeZones.update(delta);
  }
}
