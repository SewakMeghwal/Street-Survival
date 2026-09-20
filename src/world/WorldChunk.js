/**
 * WorldChunk.js
 * Scalable world chunk partitioning system.
 * Keeps nearby chunks fully active while culling/simplifying distant sectors.
 */

export class WorldChunk {
  constructor(chunkX, chunkZ, chunkSize = 50) {
    this.chunkX = chunkX;
    this.chunkZ = chunkZ;
    this.chunkSize = chunkSize;

    this.objects = [];
    this.isActive = true;
  }

  addObject(obj) {
    this.objects.push(obj);
  }

  setActive(active) {
    if (this.isActive === active) return;
    this.isActive = active;
    this.objects.forEach(obj => {
      if (obj.visible !== undefined) obj.visible = active;
    });
  }
}
