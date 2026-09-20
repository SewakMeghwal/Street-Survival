import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * AssetLoader.js
 * Centralized asset loader supporting GLTF/GLB models, textures, and audio files
 * with progress tracking, caching, and fallback handling.
 */

export class AssetLoader {
  constructor() {
    this.gltfLoader = new GLTFLoader();
    this.textureLoader = new THREE.TextureLoader();
    this.audioLoader = new THREE.AudioLoader();

    this.cache = {
      models: new Map(),
      textures: new Map(),
      audio: new Map()
    };
  }

  /**
   * Load GLTF/GLB Model with fallback handling
   */
  async loadModel(url) {
    if (this.cache.models.has(url)) {
      return this.cache.models.get(url).clone();
    }

    return new Promise((resolve) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          this.cache.models.set(url, gltf.scene);
          resolve(gltf.scene.clone());
        },
        undefined,
        (err) => {
          console.warn(`[AssetLoader] Could not load GLB from ${url}. Using procedural fallback.`, err);
          resolve(null);
        }
      );
    });
  }

  /**
   * Load Texture with caching
   */
  loadTexture(url) {
    if (this.cache.textures.has(url)) {
      return this.cache.textures.get(url);
    }
    const texture = this.textureLoader.load(url);
    this.cache.textures.set(url, texture);
    return texture;
  }
}
