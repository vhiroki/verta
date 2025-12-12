import * as THREE from 'three';
import { Enemy } from '../entities/Enemy';
import { AttackResult } from './Weapon';

export interface DamageEvent {
  enemy: Enemy;
  damage: number;
  killed: boolean;
}

export interface PulseState {
  active: boolean;
  origin: THREE.Vector3;
  previousRadius: number;
  currentRadius: number;
  damage: number;
}

/**
 * Handles combat interactions: hit detection, damage application, death effects.
 */
export class CombatSystem {
  private scene: THREE.Scene;
  private dyingEnemies: { enemy: Enemy; timer: number }[] = [];
  private readonly deathAnimationDuration = 0.3;
  
  // Track which enemies have been hit by the current pulse
  private hitByCurrentPulse: Set<Enemy> = new Set();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * Process hits from an expanding pulse - called every frame while pulse is active
   */
  public processPulseHits(pulseState: PulseState, enemies: Enemy[]): DamageEvent[] {
    if (!pulseState.active) {
      // Reset hit tracking when pulse ends
      this.hitByCurrentPulse.clear();
      return [];
    }

    const events: DamageEvent[] = [];

    enemies.forEach(enemy => {
      if (!enemy.isAlive) return;
      if (this.hitByCurrentPulse.has(enemy)) return; // Already hit by this pulse

      // Check if enemy is within the current ring radius
      const distance = enemy.position.distanceTo(pulseState.origin);
      
      // Hit if enemy is within current radius (ring has reached them)
      if (distance <= pulseState.currentRadius) {
        this.hitByCurrentPulse.add(enemy);
        const killed = this.applyDamage(enemy, pulseState.damage);
        events.push({ enemy, damage: pulseState.damage, killed });

        if (killed) {
          this.startDeathAnimation(enemy);
        } else {
          this.flashEnemy(enemy);
        }
      }
    });

    return events;
  }

  /**
   * Process an attack against all enemies (for instant-hit weapons)
   * @returns Array of damage events for XP calculation
   */
  public processAttack(attack: AttackResult, enemies: Enemy[]): DamageEvent[] {
    if (!attack.success || attack.radius === 0) return [];

    const events: DamageEvent[] = [];

    enemies.forEach(enemy => {
      if (!enemy.isAlive) return;

      const distance = enemy.position.distanceTo(attack.origin);
      
      if (distance <= attack.radius) {
        const killed = this.applyDamage(enemy, attack.damage);
        events.push({ enemy, damage: attack.damage, killed });

        if (killed) {
          this.startDeathAnimation(enemy);
        } else {
          this.flashEnemy(enemy);
        }
      }
    });

    return events;
  }

  /**
   * Check if player is touching any enemy (for player damage)
   */
  public checkPlayerCollision(playerPosition: THREE.Vector3, enemies: Enemy[], playerRadius: number = 0.8): boolean {
    for (const enemy of enemies) {
      if (!enemy.isAlive) continue;
      
      const distance = playerPosition.distanceTo(enemy.position);
      if (distance < playerRadius + 0.5) { // Enemy radius
        return true;
      }
    }
    return false;
  }

  private applyDamage(enemy: Enemy, damage: number): boolean {
    enemy.currentHealth -= damage;
    
    if (enemy.currentHealth <= 0) {
      enemy.currentHealth = 0;
      enemy.isAlive = false;
      return true; // Enemy died
    }
    
    return false; // Enemy survived
  }

  private flashEnemy(enemy: Enemy): void {
    const material = enemy.mesh.material as THREE.MeshStandardMaterial;
    const originalEmissive = material.emissive.getHex();
    
    // Flash white
    material.emissive.setHex(0xffffff);
    material.emissiveIntensity = 1;

    setTimeout(() => {
      material.emissive.setHex(originalEmissive);
      material.emissiveIntensity = 0.5;
    }, 100);
  }

  private startDeathAnimation(enemy: Enemy): void {
    this.dyingEnemies.push({ enemy, timer: this.deathAnimationDuration });
    
    // Flash bright on death
    const material = enemy.mesh.material as THREE.MeshStandardMaterial;
    material.emissive.setHex(0xffffff);
    material.emissiveIntensity = 2;
  }

  /**
   * Update death animations
   */
  public update(deltaTime: number): void {
    this.dyingEnemies = this.dyingEnemies.filter(({ enemy, timer }) => {
      const newTimer = timer - deltaTime;
      const progress = 1 - (newTimer / this.deathAnimationDuration);
      
      // Scale down and fade out
      const scale = 1 - progress;
      enemy.mesh.scale.setScalar(Math.max(0, scale));
      
      const material = enemy.mesh.material as THREE.MeshStandardMaterial;
      material.opacity = Math.max(0, scale);
      material.transparent = true;

      if (newTimer <= 0) {
        // Remove from scene
        this.scene.remove(enemy.mesh);
        return false;
      }

      return true;
    });

    // Update timer reference
    this.dyingEnemies.forEach(de => {
      de.timer -= deltaTime;
    });
  }

  /**
   * Remove dead enemies from array
   */
  public cleanupDeadEnemies(enemies: Enemy[]): Enemy[] {
    return enemies.filter(e => e.isAlive || this.dyingEnemies.some(de => de.enemy === e));
  }
}
