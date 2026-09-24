/**
 * Minimap.js
 * Renders a top-corner 2D minimap radar canvas showing player position,
 * camera orientation, safe house objective marker, and active dog threat blips in real time.
 */

export class Minimap {
  constructor() {
    this.canvas = document.getElementById('minimap-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.size = 140; // 140x140 px canvas
    this.zoom = 1.2; // Meters to pixels ratio
  }

  update(player, dogManager, safeZones, camera) {
    if (!this.ctx || !player) return;

    const ctx = this.ctx;
    const center = this.size / 2;
    const playerPos = player.position;

    ctx.clearRect(0, 0, this.size, this.size);

    // Background circle
    ctx.fillStyle = 'rgba(8, 12, 20, 0.85)';
    ctx.beginPath();
    ctx.arc(center, center, center - 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Concentric radar rings
    ctx.strokeStyle = 'rgba(0, 230, 118, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(center, center, center * 0.4, 0, Math.PI * 2);
    ctx.arc(center, center, center * 0.75, 0, Math.PI * 2);
    ctx.stroke();

    // 1. Draw Safe Zone Markers (Green Glowing Ring)
    if (safeZones && safeZones.zones) {
      safeZones.zones.forEach(z => {
        const dx = (z.position.x - playerPos.x) * this.zoom;
        const dz = (z.position.z - playerPos.z) * this.zoom;

        const mapX = center + dx;
        const mapY = center + dz;

        if (mapX > 10 && mapX < this.size - 10 && mapY > 10 && mapY < this.size - 10) {
          ctx.fillStyle = '#00e676';
          ctx.beginPath();
          ctx.arc(mapX, mapY, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(0, 230, 118, 0.6)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    }

    // 2. Draw Active Dog Blips (Red Dots)
    if (dogManager && dogManager.dogs) {
      dogManager.dogs.forEach(dog => {
        if (dog.fsm.currentState !== 'DEAD') {
          const dx = (dog.position.x - playerPos.x) * this.zoom;
          const dz = (dog.position.z - playerPos.z) * this.zoom;

          const mapX = center + dx;
          const mapY = center + dz;

          if (mapX > 6 && mapX < this.size - 6 && mapY > 6 && mapY < this.size - 6) {
            ctx.fillStyle = dog.config.isLeader ? '#ff0000' : '#ff4b2b';
            ctx.beginPath();
            ctx.arc(mapX, mapY, dog.config.isLeader ? 4.5 : 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
    }

    // 3. Draw Player Position & Camera Direction Cone (Cyan Triangle)
    let angle = 0;
    if (camera) {
      const camDir = camera.getWorldDirection(new THREE.Vector3());
      angle = Math.atan2(camDir.x, camDir.z);
    } else {
      angle = player.rotationAngle;
    }

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(-angle);

    // Player Vision Cone
    ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 28, -Math.PI * 0.75, -Math.PI * 0.25);
    ctx.closePath();
    ctx.fill();

    // Player Direction Arrow
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(-5, 5);
    ctx.lineTo(0, 3);
    ctx.lineTo(5, 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // 4. North Compass Indicator
    ctx.fillStyle = '#ff3344';
    ctx.font = 'bold 9px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('N', center, 14);
  }
}
