import * as THREE from 'three';
import { InputManager } from '../input/InputManager';
import { ArenaBounds } from '../levels/Arena';

/**
 * Player entity - The Anomaly
 * 
 * Visual Design: Core Orb with Orbital Ring
 * - Inner Core: Glowing energy sphere (the anomaly's essence)
 * - Core Glow: Atmospheric halo
 * - Orbital Ring: Single ring orbiting the core
 * 
 * Movement is screen-relative for isometric camera.
 */
export class Player {
  public mesh: THREE.Group;
  
  private readonly baseSpeed: number = 8;
  private speedMultiplier: number = 1.0;
  private inputManager: InputManager;
  
  // Core orb components
  private coreOrb: THREE.Mesh;
  private coreMaterial: THREE.MeshStandardMaterial;
  private coreGlow: THREE.Mesh;
  private primaryRing: THREE.Mesh;
  
  // Animation state
  private pulsePhase: number = 0;

  // Damage flash effect
  private isFlashing: boolean = false;
  private flashTimer: number = 0;
  private readonly flashDuration: number = 0.15;

  // Vectors for converting screen-relative input to world movement
  private readonly forwardDir: THREE.Vector3;
  private readonly rightDir: THREE.Vector3;

  constructor(inputManager: InputManager) {
    this.inputManager = inputManager;
    
    // Main container for all player visuals
    this.mesh = new THREE.Group();
    this.mesh.position.set(0, 0.8, 0);

    // Create the core structure
    this.coreOrb = this.createCoreOrb();
    this.coreMaterial = this.coreOrb.material as THREE.MeshStandardMaterial;
    this.coreGlow = this.createCoreGlow();
    this.primaryRing = this.createPrimaryRing();
    
    // Add all components to main group
    this.mesh.add(this.coreOrb);
    this.mesh.add(this.coreGlow);
    this.mesh.add(this.primaryRing);

    // Calculate screen-to-world direction vectors for isometric view
    this.forwardDir = new THREE.Vector3(-1, 0, -1).normalize();
    this.rightDir = new THREE.Vector3(1, 0, -1).normalize();
  }

  /**
   * Inner Core: The anomaly's essence - a pulsing energy sphere
   */
  private createCoreOrb(): THREE.Mesh {
    const geometry = new THREE.IcosahedronGeometry(0.25, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 1.2,
      flatShading: true,
    });
    
    const orb = new THREE.Mesh(geometry, material);
    orb.castShadow = true;
    return orb;
  }
  
  /**
   * Core Glow: Outer atmospheric glow around the core
   */
  private createCoreGlow(): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(0.35, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    return new THREE.Mesh(geometry, material);
  }
  
  /**
   * Primary Ring: Horizontal orbit ring around the core
   */
  private createPrimaryRing(): THREE.Mesh {
    const geometry = new THREE.TorusGeometry(0.5, 0.03, 8, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00aaaa,
      emissiveIntensity: 0.8,
      flatShading: true,
    });
    
    const ring = new THREE.Mesh(geometry, material);
    ring.rotation.x = Math.PI / 2; // Horizontal
    return ring;
  }

  /**
   * Update player position and animate core
   */
  public update(deltaTime: number, bounds?: ArenaBounds): void {
    // Handle movement
    const input = this.inputManager.getMovementInput();
    const isMoving = input.x !== 0 || input.y !== 0;
    
    if (isMoving) {
      const movement = new THREE.Vector3();
      movement.addScaledVector(this.rightDir, input.x);
      movement.addScaledVector(this.forwardDir, input.y);
      movement.normalize();
      movement.multiplyScalar(this.baseSpeed * this.speedMultiplier * deltaTime);
      this.mesh.position.add(movement);

      if (bounds) {
        this.mesh.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, this.mesh.position.x));
        this.mesh.position.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, this.mesh.position.z));
      }
    }

    // Animate core
    this.animateCore(deltaTime, isMoving);

    // Update damage flash effect
    if (this.isFlashing) {
      this.flashTimer -= deltaTime;
      if (this.flashTimer <= 0) {
        this.isFlashing = false;
        this.restoreColors();
      }
    }
  }
  
  /**
   * Animate core components
   */
  private animateCore(deltaTime: number, isMoving: boolean): void {
    // Pulse phase for breathing effect
    this.pulsePhase += deltaTime * 3;
    const pulse = Math.sin(this.pulsePhase) * 0.5 + 0.5; // 0 to 1
    
    // Core orb: gentle pulse and rotation
    const coreScale = 1 + pulse * 0.1;
    this.coreOrb.scale.set(coreScale, coreScale, coreScale);
    this.coreOrb.rotation.y += deltaTime * 0.5;
    this.coreOrb.rotation.x = Math.sin(this.pulsePhase * 0.5) * 0.2;
    
    // Core glow: inverse pulse for breathing
    const glowScale = 1 + (1 - pulse) * 0.15;
    this.coreGlow.scale.set(glowScale, glowScale, glowScale);
    
    // Core emissive intensity pulses
    if (!this.isFlashing) {
      this.coreMaterial.emissiveIntensity = 1.0 + pulse * 0.4;
    }
    
    // Primary ring: steady rotation, faster when moving
    const primarySpeed = isMoving ? 2.5 : 1.0;
    this.primaryRing.rotation.z += deltaTime * primarySpeed;
    
    // Slight tilt when moving (shows momentum)
    if (isMoving) {
      const input = this.inputManager.getMovementInput();
      const tiltAmount = 0.15;
      this.mesh.rotation.x = THREE.MathUtils.lerp(this.mesh.rotation.x, -input.y * tiltAmount, deltaTime * 5);
      this.mesh.rotation.z = THREE.MathUtils.lerp(this.mesh.rotation.z, input.x * tiltAmount, deltaTime * 5);
    } else {
      // Return to neutral
      this.mesh.rotation.x = THREE.MathUtils.lerp(this.mesh.rotation.x, 0, deltaTime * 3);
      this.mesh.rotation.z = THREE.MathUtils.lerp(this.mesh.rotation.z, 0, deltaTime * 3);
    }
  }

  /**
   * Flash all components red when taking damage
   */
  public flashDamage(): void {
    this.isFlashing = true;
    this.flashTimer = this.flashDuration;
    
    // Flash core
    this.coreMaterial.color.setHex(0xff3333);
    this.coreMaterial.emissive.setHex(0xff0000);
    this.coreMaterial.emissiveIntensity = 2.0;
    
    // Flash glow
    (this.coreGlow.material as THREE.MeshBasicMaterial).color.setHex(0xff3333);
    
    // Flash primary ring
    const ringMat = this.primaryRing.material as THREE.MeshStandardMaterial;
    ringMat.color.setHex(0xff3333);
    ringMat.emissive.setHex(0xff0000);
  }
  
  /**
   * Restore original colors after flash
   */
  private restoreColors(): void {
    // Core
    this.coreMaterial.color.setHex(0x00ffff);
    this.coreMaterial.emissive.setHex(0x00ffff);
    this.coreMaterial.emissiveIntensity = 1.2;
    
    // Glow
    (this.coreGlow.material as THREE.MeshBasicMaterial).color.setHex(0x00ffff);
    
    // Primary ring
    const ringMat = this.primaryRing.material as THREE.MeshStandardMaterial;
    ringMat.color.setHex(0x00ffff);
    ringMat.emissive.setHex(0x00aaaa);
  }

  /**
   * Set the speed multiplier (from player stats)
   */
  public setSpeedMultiplier(multiplier: number): void {
    this.speedMultiplier = multiplier;
  }

  public get position(): THREE.Vector3 {
    return this.mesh.position;
  }
}
