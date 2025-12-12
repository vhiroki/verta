import * as THREE from 'three';
import { Weapon, AttackResult } from './Weapon';
import { PulseState } from './CombatSystem';

/**
 * Area Pulse weapon - emits a circular shockwave around the player.
 * Auto-attacks when cooldown is ready.
 * Damage is synced with the visual effect - enemies are hit when the ring reaches them.
 */
export class AreaPulse implements Weapon {
  public readonly type = 'area-pulse';
  public baseDamage: number = 25;
  public baseCooldown: number = 1.0; // 1 second base cooldown
  public currentCooldown: number = 0;
  
  private readonly baseRadius: number = 3;
  private pulseEffect: THREE.Mesh | null = null;
  private pulseAnimation: number = 0;
  private isPulsing: boolean = false;
  
  // For synced hit detection
  private previousPulseRadius: number = 0;
  private currentPulseRadius: number = 0;
  private pulseOrigin: THREE.Vector3 = new THREE.Vector3();
  private pendingDamage: number = 0;

  constructor(baseDamage: number = 25, baseCooldown: number = 1.0) {
    this.baseDamage = baseDamage;
    this.baseCooldown = baseCooldown;
    this.createPulseEffect();
  }

  private createPulseEffect(): void {
    // Create a simple ring - we'll scale it to match baseRadius
    // Using radius 1 so scaling directly equals world units
    const geometry = new THREE.RingGeometry(0.8, 1, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    
    this.pulseEffect = new THREE.Mesh(geometry, material);
    this.pulseEffect.rotation.x = -Math.PI / 2; // Lay flat
    this.pulseEffect.visible = false;
  }

  public canAttack(): boolean {
    return this.currentCooldown <= 0;
  }

  public getEffectiveCooldown(attackRateMultiplier: number): number {
    // Higher attack rate = lower cooldown
    return this.baseCooldown / attackRateMultiplier;
  }

  public attack(origin: THREE.Vector3, damageMultiplier: number = 1): AttackResult {
    if (!this.canAttack()) {
      return { origin, radius: 0, damage: 0, success: false };
    }

    // Reset cooldown (will be set properly in update based on attack rate)
    this.currentCooldown = this.baseCooldown;
    this.isPulsing = true;
    this.pulseAnimation = 0;
    this.previousPulseRadius = 0;
    this.currentPulseRadius = 0;
    this.pulseOrigin.copy(origin);
    this.pendingDamage = this.baseDamage * damageMultiplier;

    // Position effect at player
    if (this.pulseEffect) {
      this.pulseEffect.position.copy(origin);
      this.pulseEffect.position.y = 0.1;
      this.pulseEffect.visible = true;
      this.pulseEffect.scale.set(0.1, 0.1, 0.1);
      (this.pulseEffect.material as THREE.MeshBasicMaterial).opacity = 0.8;
    }

    // Return success but with radius 0 - actual hits happen in update() as ring expands
    return {
      origin: origin.clone(),
      radius: 0, // Hits will be checked progressively via getPulseState()
      damage: this.baseDamage * damageMultiplier,
      success: true,
    };
  }

  /**
   * Get current pulse state for progressive hit detection.
   * CombatSystem uses this to damage enemies as the ring expands.
   */
  public getPulseState(): PulseState {
    return {
      active: this.isPulsing,
      origin: this.pulseOrigin.clone(),
      previousRadius: this.previousPulseRadius,
      currentRadius: this.currentPulseRadius,
      damage: this.pendingDamage,
    };
  }

  /**
   * Update cooldown and animate the pulse effect.
   * The visual radius is tracked so damage is applied when the ring reaches enemies.
   */
  public update(deltaTime: number, attackRateMultiplier: number = 1): void {
    // Update cooldown based on attack rate
    if (this.currentCooldown > 0) {
      this.currentCooldown -= deltaTime;
    }

    // Animate pulse effect
    if (this.isPulsing && this.pulseEffect) {
      this.pulseAnimation += deltaTime * 3; // Animation speed
      
      // Store previous radius for ring-based hit detection
      this.previousPulseRadius = this.currentPulseRadius;
      
      // Scale from 0 to baseRadius over the animation (reach full size at 0.3s)
      const progress = Math.min(this.pulseAnimation / 0.3, 1);
      this.currentPulseRadius = progress * this.baseRadius;
      
      // Fade out after reaching full size
      const opacity = Math.max(0, 0.8 - this.pulseAnimation * 2);
      
      // Update visual
      this.pulseEffect.scale.set(
        this.currentPulseRadius,
        this.currentPulseRadius,
        this.currentPulseRadius
      );
      (this.pulseEffect.material as THREE.MeshBasicMaterial).opacity = opacity;

      // End pulse when fully faded
      if (opacity <= 0) {
        this.isPulsing = false;
        this.pulseEffect.visible = false;
        this.pendingDamage = 0;
        this.previousPulseRadius = 0;
        this.currentPulseRadius = 0;
      }
    }
  }

  public getVisualEffect(): THREE.Object3D | null {
    return this.pulseEffect;
  }

  public getRadius(): number {
    return this.baseRadius;
  }
}
