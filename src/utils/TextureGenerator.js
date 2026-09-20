import * as THREE from 'three';

/**
 * TextureGenerator.js
 * Generates high-detail procedural Canvas PBR texture maps (Skin, Fabric, Dog Fur, Eyes, Denim)
 * so 3D models have realistic surface detail, shading, and depth instead of plain flat colors.
 */

export class TextureGenerator {

  // --- MALE / FEMALE FACE TEXTURE MAP ---
  static createFaceTexture(gender = 'male') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base skin tone
    ctx.fillStyle = gender === 'male' ? '#d99b73' : '#e5aa85';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle skin shading & blush
    const grad = ctx.createRadialGradient(256, 256, 50, 256, 256, 256);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    grad.addColorStop(1, 'rgba(120, 60, 30, 0.25)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Eyes
    const eyeY = 220;
    const eyeL = 170;
    const eyeR = 342;

    [eyeL, eyeR].forEach(x => {
      // Sclera (White)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(x, eyeY, 32, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      // Iris (Brown)
      ctx.fillStyle = '#3d2314';
      ctx.beginPath();
      ctx.arc(x, eyeY, 16, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath();
      ctx.arc(x, eyeY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Catchlight reflection
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x - 5, eyeY - 5, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Eyebrows
    ctx.strokeStyle = '#1a1412';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(130, eyeY - 35);
    ctx.quadraticCurveTo(170, eyeY - 50, 210, eyeY - 35);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(302, eyeY - 35);
    ctx.quadraticCurveTo(342, eyeY - 50, 382, eyeY - 35);
    ctx.stroke();

    // Nose bridge shadow
    ctx.strokeStyle = 'rgba(100, 50, 20, 0.3)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(256, 220);
    ctx.lineTo(250, 290);
    ctx.lineTo(262, 300);
    ctx.stroke();

    // Mouth / Lips
    ctx.fillStyle = gender === 'male' ? '#b56d53' : '#c45a64';
    ctx.beginPath();
    ctx.ellipse(256, 360, 40, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // --- CLOTH FABRIC / DENIM TEXTURE ---
  static createFabricTexture(primaryColor = '#1e50a2', isDenim = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = primaryColor;
    ctx.fillRect(0, 0, 256, 256);

    // Weave pattern noise
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    for (let x = 0; x < 256; x += 4) {
      for (let y = 0; y < 256; y += 4) {
        if ((x + y) % 8 === 0) {
          ctx.fillRect(x, y, 2, 2);
        }
      }
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let x = 2; x < 256; x += 4) {
      for (let y = 2; y < 256; y += 4) {
        if ((x + y) % 8 === 0) {
          ctx.fillRect(x, y, 2, 2);
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }

  // --- DOG FUR TEXTURE MAP ---
  static createDogFurTexture(baseColor = '#8b5a2b', accentColor = '#3d2817') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);

    // Organic fur strands noise
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3;

    for (let i = 0; i < 1500; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const len = 10 + Math.random() * 20;
      const angle = (Math.random() - 0.5) * 0.5;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.sin(angle) * len, y + Math.cos(angle) * len);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }
}
