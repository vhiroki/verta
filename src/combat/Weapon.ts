import * as THREE from 'three';

/**
 * Abstract weapon interface for future weapon variety.
 * All weapons auto-attack based on cooldown timers.
 */
export interface Weapon {
  /** Unique identifier for the weapon type */
  readonly type: string;
  
  /** Base damage dealt per hit */
  baseDamage: number;
  
  /** Base cooldown between attacks in seconds */
  baseCooldown: number;
  
  /** Current cooldown remaining */
  currentCooldown: number;
  
  /** Check if weapon can attack (cooldown ready) */
  canAttack(): boolean;
  
  /** Execute attack with player's attack rate modifier */
  attack(origin: THREE.Vector3, damageMultiplier: number): AttackResult;
  
  /** Update weapon state (cooldowns, animations) */
  update(deltaTime: number, attackRateMultiplier: number): void;
  
  /** Get visual representation of attack (for rendering) */
  getVisualEffect(): THREE.Object3D | null;
  
  /** Get effective cooldown considering player's attack rate */
  getEffectiveCooldown(attackRateMultiplier: number): number;
}

export interface AttackResult {
  /** Center point of the attack */
  origin: THREE.Vector3;
  
  /** Radius of effect (for area attacks) */
  radius: number;
  
  /** Damage to apply */
  damage: number;
  
  /** Whether attack was successfully executed */
  success: boolean;
}
