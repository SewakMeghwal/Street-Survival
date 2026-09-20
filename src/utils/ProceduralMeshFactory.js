import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator.js';

/**
 * ProceduralMeshFactory.js
 * Advanced 3D procedural asset generator.
 * Creates organic, textured low-poly models for Players, Dogs,
 * Vehicles, Buildings, Trees, and Props with anatomical articulation and PBR shaders.
 */

export class ProceduralMeshFactory {

  // =========================================================================
  // --- PLAYER MESH GENERATOR (High Detail Stylized Textured Character) ---
  // =========================================================================
  static createPlayerMesh(gender = 'male') {
    const group = new THREE.Group();
    group.name = `Player_${gender}`;

    // Generate Procedural Canvas Textures
    const faceTex = TextureGenerator.createFaceTexture(gender);
    const shirtTex = TextureGenerator.createFabricTexture(gender === 'male' ? '#1e50a2' : '#c73e3a');
    const pantsTex = TextureGenerator.createFabricTexture('#2b303a', true);

    // PBR Materials with textures
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: faceTex, roughness: 0.6 });
    const bodySkinMat = new THREE.MeshStandardMaterial({ color: gender === 'male' ? 0xd99b73 : 0xe5aa85, roughness: 0.6 });
    const shirtMat = new THREE.MeshStandardMaterial({ map: shirtTex, roughness: 0.5 });
    const jacketTrimMat = new THREE.MeshStandardMaterial({ color: 0x111622, roughness: 0.4 });
    const pantsMat = new THREE.MeshStandardMaterial({ map: pantsTex, roughness: 0.7 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.8 });
    const soleMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.5 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9 });
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x0f0f0f, roughness: 0.5 });
    const buckleMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 });

    // --- Pelvis / Hips ---
    const pelvisGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.18, 12);
    const pelvis = new THREE.Mesh(pelvisGeo, pantsMat);
    pelvis.position.y = 0.88;
    group.add(pelvis);

    // Belt
    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.04, 12), beltMat);
    belt.position.y = 0.96;
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.03), buckleMat);
    buckle.position.set(0, 0.96, 0.19);
    group.add(belt, buckle);

    // --- Torso / Chest ---
    const torsoHeight = gender === 'male' ? 0.52 : 0.48;
    const torsoTopR = gender === 'male' ? 0.22 : 0.19;
    const torsoBotR = 0.18;
    const torsoGeo = new THREE.CylinderGeometry(torsoTopR, torsoBotR, torsoHeight, 12);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = pelvis.position.y + 0.1 + torsoHeight * 0.5;
    group.add(torso);

    // Jacket Zipper & Collar Trim
    const zipper = new THREE.Mesh(new THREE.BoxGeometry(0.02, torsoHeight, 0.02), jacketTrimMat);
    zipper.position.set(0, torso.position.y, torsoTopR + 0.01);
    group.add(zipper);

    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.08, 12), jacketTrimMat);
    collar.position.y = torso.position.y + torsoHeight * 0.5 + 0.04;
    group.add(collar);

    // --- Neck & Head (Head mapped with Face Texture Map) ---
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.1, 8), bodySkinMat);
    neck.position.y = collar.position.y + 0.07;
    group.add(neck);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, neck.position.y + 0.12, 0);

    const headGeo = new THREE.SphereGeometry(0.13, 16, 16);
    // Rotate texture mapping forward
    headGeo.rotateY(Math.PI / 2);

    const head = new THREE.Mesh(headGeo, skinMat);
    headGroup.add(head);

    // Ears
    const earL = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), bodySkinMat);
    const earR = earL.clone();
    earL.position.set(-0.13, 0, 0);
    earR.position.set(0.13, 0, 0);
    headGroup.add(earL, earR);

    // Hair
    if (gender === 'male') {
      const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
      hairTop.position.y = 0.02;
      headGroup.add(hairTop);
    } else {
      const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.145, 12, 12), hairMat);
      hairTop.position.set(0, 0.02, -0.02);
      const ponytail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.01, 0.25, 8), hairMat);
      ponytail.position.set(0, -0.08, -0.16);
      ponytail.rotation.x = -0.4;
      headGroup.add(hairTop, ponytail);
    }
    group.add(headGroup);

    // --- Articulated Arms (Upper & Lower Arm Groups) ---
    const createArm = (side) => {
      const armGroup = new THREE.Group();
      const posX = side === 'left' ? -(torsoTopR + 0.05) : (torsoTopR + 0.05);
      armGroup.position.set(posX, torso.position.y + torsoHeight * 0.4, 0);

      const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), shirtMat);
      armGroup.add(shoulder);

      const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.048, 0.26, 8), shirtMat);
      upperArm.position.y = -0.13;
      armGroup.add(upperArm);

      const forearmGroup = new THREE.Group();
      forearmGroup.position.set(0, -0.26, 0);
      const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.038, 0.24, 8), bodySkinMat);
      forearm.position.y = -0.12;
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), bodySkinMat);
      hand.position.y = -0.24;
      forearmGroup.add(forearm, hand);

      armGroup.add(forearmGroup);
      return { main: armGroup, forearm: forearmGroup };
    };

    const leftArmObj = createArm('left');
    const rightArmObj = createArm('right');
    group.add(leftArmObj.main, rightArmObj.main);

    // --- Articulated Legs (Thigh + Shin + Shoe) ---
    const createLeg = (side) => {
      const legGroup = new THREE.Group();
      const posX = side === 'left' ? -0.11 : 0.11;
      legGroup.position.set(posX, pelvis.position.y - 0.05, 0);

      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.06, 0.38, 8), pantsMat);
      thigh.position.y = -0.19;
      legGroup.add(thigh);

      const shinGroup = new THREE.Group();
      shinGroup.position.set(0, -0.38, 0);
      const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.045, 0.36, 8), pantsMat);
      shin.position.y = -0.18;

      const shoeUpper = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.09, 0.23), shoeMat);
      shoeUpper.position.set(0, -0.34, 0.04);
      const shoeSole = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.25), soleMat);
      shoeSole.position.set(0, -0.39, 0.04);

      shinGroup.add(shin, shoeUpper, shoeSole);
      legGroup.add(shinGroup);

      return { main: legGroup, shin: shinGroup };
    };

    const leftLegObj = createLeg('left');
    const rightLegObj = createLeg('right');
    group.add(leftLegObj.main, rightLegObj.main);

    // Shadows setup
    group.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return {
      mesh: group,
      joints: {
        leftArm: leftArmObj.main,
        leftForearm: leftArmObj.forearm,
        rightArm: rightArmObj.main,
        rightForearm: rightArmObj.forearm,
        leftLeg: leftLegObj.main,
        leftShin: leftLegObj.shin,
        rightLeg: rightLegObj.main,
        rightShin: rightLegObj.shin,
        head: headGroup
      }
    };
  }

  // =========================================================================
  // --- DOG MESH GENERATOR (Organic Quadruped Body & Fur Texture) ---
  // =========================================================================
  static createDogMesh(config) {
    const group = new THREE.Group();
    group.name = `Dog_${config.name}`;

    const scale = config.scale || 1.0;

    // Generate Fur Texture
    const furTex = TextureGenerator.createDogFurTexture(
      config.isLeader ? '#1c1c1c' : '#8b5a2b',
      config.isLeader ? '#0a0a0a' : '#3d2817'
    );

    const furMat = new THREE.MeshStandardMaterial({ map: furTex, roughness: 0.75 });
    const snoutMat = new THREE.MeshStandardMaterial({ color: 0x1f1917, roughness: 0.6 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: config.isLeader ? 0xff0000 : 0xffaa00 });
    const teethMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const collarMat = new THREE.MeshStandardMaterial({
      color: config.isLeader ? 0xcc0000 : 0x2255bb,
      roughness: 0.4
    });
    const tagMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 });

    // --- Main Torso / Ribcage ---
    const bodyGroup = new THREE.Group();
    bodyGroup.position.y = 0.48 * scale;

    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.24 * scale, 12, 12), furMat);
    chest.scale.set(0.9, 1.1, 1.3);
    chest.position.set(0, 0.05 * scale, 0.15 * scale);

    const abdomen = new THREE.Mesh(new THREE.SphereGeometry(0.2 * scale, 12, 12), furMat);
    abdomen.scale.set(0.85, 0.95, 1.2);
    abdomen.position.set(0, 0.02 * scale, -0.2 * scale);

    bodyGroup.add(chest, abdomen);
    group.add(bodyGroup);

    // --- Neck & Head ---
    const neckGroup = new THREE.Group();
    neckGroup.position.set(0, 0.58 * scale, 0.3 * scale);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.14 * scale, 0.18 * scale, 0.28 * scale, 10), furMat);
    neck.rotation.x = 0.4;
    neck.position.set(0, 0.08 * scale, 0.05 * scale);
    neckGroup.add(neck);

    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.165 * scale, 0.165 * scale, 0.05 * scale, 12), collarMat);
    collar.position.set(0, 0.02 * scale, 0.02 * scale);
    collar.rotation.x = 0.4;

    const tag = new THREE.Mesh(new THREE.CylinderGeometry(0.03 * scale, 0.03 * scale, 0.008 * scale, 8), tagMat);
    tag.position.set(0, -0.06 * scale, 0.16 * scale);
    tag.rotation.x = Math.PI / 2;
    neckGroup.add(collar, tag);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.22 * scale, 0.15 * scale);

    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.15 * scale, 12, 12), furMat);
    skull.scale.set(0.95, 0.9, 1.1);
    headGroup.add(skull);

    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.13 * scale, 0.1 * scale, 0.22 * scale), snoutMat);
    snout.position.set(0, -0.03 * scale, 0.15 * scale);

    const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.035 * scale, 8, 8), snoutMat);
    noseTip.position.set(0, 0.02 * scale, 0.25 * scale);
    headGroup.add(snout, noseTip);

    const lowerJaw = new THREE.Mesh(new THREE.BoxGeometry(0.1 * scale, 0.04 * scale, 0.18 * scale), furMat);
    lowerJaw.position.set(0, -0.08 * scale, 0.13 * scale);

    const fangL = new THREE.Mesh(new THREE.ConeGeometry(0.012 * scale, 0.04 * scale, 4), teethMat);
    const fangR = fangL.clone();
    fangL.position.set(-0.04 * scale, -0.02 * scale, 0.22 * scale);
    fangR.position.set(0.04 * scale, -0.02 * scale, 0.22 * scale);
    fangL.rotation.x = Math.PI;
    fangR.rotation.x = Math.PI;
    headGroup.add(lowerJaw, fangL, fangR);

    const isErectEar = config.name.includes('Hound') || config.isLeader;
    const createEar = (side) => {
      const earGroup = new THREE.Group();
      const posX = side === 'left' ? -0.11 * scale : 0.11 * scale;
      earGroup.position.set(posX, 0.11 * scale, 0);

      const earMesh = new THREE.Mesh(
        isErectEar
          ? new THREE.ConeGeometry(0.06 * scale, 0.18 * scale, 4)
          : new THREE.BoxGeometry(0.06 * scale, 0.18 * scale, 0.03 * scale),
        furMat
      );
      if (isErectEar) {
        earMesh.rotation.set(-0.2, 0, side === 'left' ? -0.2 : 0.2);
      } else {
        earMesh.rotation.set(0.3, 0, side === 'left' ? -0.4 : 0.4);
      }
      earGroup.add(earMesh);
      return earGroup;
    };
    headGroup.add(createEar('left'), createEar('right'));

    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.025 * scale, 8, 8), eyeMat);
    const eyeR = eyeL.clone();
    eyeL.position.set(-0.075 * scale, 0.04 * scale, 0.11 * scale);
    eyeR.position.set(0.075 * scale, 0.04 * scale, 0.11 * scale);
    headGroup.add(eyeL, eyeR);

    neckGroup.add(headGroup);
    group.add(neckGroup);

    // --- Tail ---
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 0.52 * scale, -0.32 * scale);

    const tailMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.035 * scale, 0.015 * scale, 0.38 * scale, 8), furMat);
    tailMesh.position.set(0, 0.12 * scale, -0.12 * scale);
    tailMesh.rotation.x = -0.7;
    tailGroup.add(tailMesh);
    group.add(tailGroup);

    // --- 4 Articulated Quadruped Legs ---
    const createDogLeg = (name, posX, posZ) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(posX, 0.45 * scale, posZ);

      const hip = new THREE.Mesh(new THREE.SphereGeometry(0.08 * scale, 8, 8), furMat);
      legGroup.add(hip);

      const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.055 * scale, 0.04 * scale, 0.24 * scale, 8), furMat);
      upper.position.y = -0.11 * scale;
      legGroup.add(upper);

      const lowerGroup = new THREE.Group();
      lowerGroup.position.set(0, -0.22 * scale, 0);

      const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.038 * scale, 0.028 * scale, 0.22 * scale, 8), furMat);
      lower.position.y = -0.1 * scale;

      const paw = new THREE.Mesh(new THREE.BoxGeometry(0.06 * scale, 0.04 * scale, 0.09 * scale), snoutMat);
      paw.position.set(0, -0.2 * scale, 0.02 * scale);

      lowerGroup.add(lower, paw);
      legGroup.add(lowerGroup);

      return { main: legGroup, lower: lowerGroup };
    };

    const legs = {
      frontLeft: createDogLeg('frontLeft', -0.16 * scale, 0.22 * scale),
      frontRight: createDogLeg('frontRight', 0.16 * scale, 0.22 * scale),
      backLeft: createDogLeg('backLeft', -0.16 * scale, -0.22 * scale),
      backRight: createDogLeg('backRight', 0.16 * scale, -0.22 * scale)
    };

    Object.values(legs).forEach(l => group.add(l.main));

    // Shadows
    group.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return {
      mesh: group,
      joints: {
        frontLeft: legs.frontLeft.main,
        frontRight: legs.frontRight.main,
        backLeft: legs.backLeft.main,
        backRight: legs.backRight.main,
        head: headGroup,
        neck: neckGroup,
        tail: tailGroup
      }
    };
  }

  // --- INDIAN HOUSE GENERATOR ---
  static createIndianHouse(width = 8, height = 7, depth = 10, wallColor = 0xe0caab) {
    const group = new THREE.Group();

    const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.8 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0x8c3a27, roughness: 0.7 });
    const windowMat = new THREE.MeshStandardMaterial({ color: 0x1a2b3c, roughness: 0.3, metalness: 0.5 });
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.8 });

    const mainBuilding = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wallMat);
    mainBuilding.position.y = height / 2;
    group.add(mainBuilding);

    const parapet = new THREE.Mesh(new THREE.BoxGeometry(width + 0.3, 0.6, depth + 0.3), accentMat);
    parapet.position.y = height + 0.3;
    group.add(parapet);

    const door = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.4, 0.1), doorMat);
    door.position.set(0, 1.2, depth / 2 + 0.05);
    group.add(door);

    const windowGeo = new THREE.BoxGeometry(1.2, 1.4, 0.1);
    const winL = new THREE.Mesh(windowGeo, windowMat);
    winL.position.set(-width / 4, height * 0.65, depth / 2 + 0.05);
    const winR = new THREE.Mesh(windowGeo, windowMat);
    winR.position.set(width / 4, height * 0.65, depth / 2 + 0.05);
    group.add(winL, winR);

    const balcony = new THREE.Mesh(new THREE.BoxGeometry(width * 0.7, 0.25, 1.4), accentMat);
    balcony.position.set(0, height * 0.45, depth / 2 + 0.7);
    group.add(balcony);

    group.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return group;
  }

  // --- AUTO-RICKSHAW VEHICLE GENERATOR ---
  static createAutoRickshaw() {
    const group = new THREE.Group();
    group.name = 'AutoRickshaw';

    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfbc02d, roughness: 0.4 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.7 });
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xddffff, transmission: 0.8, transparent: true, opacity: 0.6 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });

    const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 2.6), blackMat);
    base.position.y = 0.6;
    group.add(base);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 1.8), yellowMat);
    roof.position.set(0, 1.45, -0.2);
    group.add(roof);

    const glass = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.7, 0.08), glassMat);
    glass.position.set(0, 1.25, 0.9);
    glass.rotation.x = -0.2;
    group.add(glass);

    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12);
    wheelGeo.rotateZ(Math.PI / 2);

    const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
    frontWheel.position.set(0, 0.3, 1.0);
    const backWheelL = new THREE.Mesh(wheelGeo, wheelMat);
    backWheelL.position.set(-0.75, 0.3, -0.8);
    const backWheelR = new THREE.Mesh(wheelGeo, wheelMat);
    backWheelR.position.set(0.75, 0.3, -0.8);
    group.add(frontWheel, backWheelL, backWheelR);

    group.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return group;
  }

  // --- MARKET VENDOR CART GENERATOR ---
  static createVendorCart() {
    const group = new THREE.Group();

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8d5524, roughness: 0.8 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x262626, roughness: 0.9 });
    const fruitMat1 = new THREE.MeshStandardMaterial({ color: 0xff9800 });
    const fruitMat2 = new THREE.MeshStandardMaterial({ color: 0x4caf50 });

    const bed = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 2.4), woodMat);
    bed.position.y = 0.85;
    group.add(bed);

    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 16);
    wheelGeo.rotateZ(Math.PI / 2);

    [[-0.85, 0.35, 0.8], [0.85, 0.35, 0.8], [-0.85, 0.35, -0.8], [0.85, 0.35, -0.8]].forEach(p => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(...p);
      group.add(w);
    });

    for (let i = 0; i < 6; i++) {
      const crate = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.4), i % 2 === 0 ? fruitMat1 : fruitMat2);
      crate.position.set(-0.5 + (i % 3) * 0.45, 1.05, -0.6 + Math.floor(i / 3) * 0.5);
      group.add(crate);
    }

    group.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return group;
  }

  // --- STREET LIGHT GENERATOR ---
  static createStreetLight() {
    const group = new THREE.Group();

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x37474f, metalness: 0.8, roughness: 0.3 });
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xffe082 });

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 5.0, 8), poleMat);
    pole.position.y = 2.5;
    group.add(pole);

    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8), poleMat);
    arm.position.set(0.4, 4.8, 0);
    arm.rotation.z = Math.PI / 3;
    group.add(arm);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), lampMat);
    bulb.position.set(0.8, 4.5, 0);
    group.add(bulb);

    group.traverse(child => {
      if (child.isMesh && child !== bulb) {
        child.castShadow = true;
      }
    });

    return group;
  }

  // --- TREE GENERATOR ---
  static createTree() {
    const group = new THREE.Group();

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 });
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.7 });

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 3.5, 8), trunkMat);
    trunk.position.y = 1.75;
    group.add(trunk);

    const f1 = new THREE.Mesh(new THREE.ConeGeometry(1.8, 2.5, 7), leavesMat);
    f1.position.y = 3.5;
    const f2 = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2.2, 7), leavesMat);
    f2.position.y = 4.6;
    const f3 = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.8, 7), leavesMat);
    f3.position.y = 5.6;
    group.add(f1, f2, f3);

    group.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return group;
  }
}
