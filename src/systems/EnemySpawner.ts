import * as THREE from 'three';
import { Enemy, EnemyType } from '../entities/Enemy';
import { ArenaBounds } from '../levels/Arena';

/**
 * Handles spawning enemies within the arena.
 */
export class EnemySpawner {
  private bounds: ArenaBounds;

  constructor(bounds: ArenaBounds) {
    this.bounds = bounds;
  }

  /**
   * Spawn a wave of enemies
   * @param count Number of enemies to spawn
   * @param playerPosition Position to avoid spawning near
   * @param wave Current wave number for enemy scaling
   */
  public spawnWave(count: number, playerPosition: THREE.Vector3, wave: number = 1): Enemy[] {
    const enemies: Enemy[] = [];
    const minDistanceFromPlayer = 5;

    for (let i = 0; i < count; i++) {
      let position: THREE.Vector3;
      let attempts = 0;
      
      // Find valid spawn position away from player
      do {
        position = this.getRandomPosition();
        attempts++;
      } while (
        position.distanceTo(playerPosition) < minDistanceFromPlayer &&
        attempts < 20
      );

      // Alternate between chasers and wanderers
      const type: EnemyType = i % 2 === 0 ? 'chaser' : 'wanderer';
      enemies.push(new Enemy(type, position, wave));
    }

    return enemies;
  }

  /**
   * Spawn a single enemy of specified type
   */
  public spawnEnemy(type: EnemyType, playerPosition: THREE.Vector3, wave: number = 1): Enemy {
    let position: THREE.Vector3;
    let attempts = 0;
    const minDistanceFromPlayer = 5;

    do {
      position = this.getRandomPosition();
      attempts++;
    } while (
      position.distanceTo(playerPosition) < minDistanceFromPlayer &&
      attempts < 20
    );

    return new Enemy(type, position, wave);
  }

  private getRandomPosition(): THREE.Vector3 {
    const margin = 2;
    const x = this.bounds.minX + margin + Math.random() * (this.bounds.maxX - this.bounds.minX - margin * 2);
    const z = this.bounds.minZ + margin + Math.random() * (this.bounds.maxZ - this.bounds.minZ - margin * 2);
    
    return new THREE.Vector3(x, 0, z);
  }
}
