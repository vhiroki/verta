import * as THREE from 'three';
import { ArenaBounds } from '../levels/Arena';

export type EnemyType = 'chaser' | 'wanderer';

/**
 * Enemy entity - hostile geometric shapes that pursue the player.
 */
export class Enemy {
  public mesh: THREE.Mesh;
  public isAlive: boolean = true;
  
  private readonly speed: number;
  private readonly type: EnemyType;
  private targetPosition: THREE.Vector3 | null = null;
  private edgeLines: THREE.LineSegments;
  
  // Health system
  public maxHealth: number;
  public currentHealth: number;
  
  // Wanderer behavior
  private wanderTimer: number = 0;
  private wanderDirection: THREE.Vector3 = new THREE.Vector3();

  constructor(type: EnemyType = 'chaser', position: THREE.Vector3, wave: number = 1) {
    this.type = type;
    
    // Different geometry and color based on type
    let geometry: THREE.BufferGeometry;
    let color: number;
    
    if (type === 'chaser') {
      geometry = new THREE.TetrahedronGeometry(0.6);
      color = 0xff3366; // Red-pink for aggressive chasers
      this.speed = 3;
      // Chasers have lower health (1 hit at wave 1, scales up)
      this.maxHealth = 20 + (wave - 1) * 15;
    } else {
      geometry = new THREE.BoxGeometry(0.7, 0.7, 0.7);
      color = 0xff9900; // Orange for wanderers
      this.speed = 2;
      // Wanderers are tougher (2-3 hits at wave 1, scales up)
      this.maxHealth = 50 + (wave - 1) * 25;
    }
    this.currentHealth = this.maxHealth;

    const material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.5,
      flatShading: true,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);
    this.mesh.position.y = 0.6; // Float slightly above ground
    this.mesh.castShadow = true;

    // Add glowing edge lines for visibility
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    // Use darker edge color for better contrast with bloom
    const edgeColor = type === 'chaser' ? 0x990022 : 0x994400;
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: edgeColor,
      linewidth: 2,
      transparent: true,
      opacity: 1.0,
    });
    this.edgeLines = new THREE.LineSegments(edgesGeometry, edgeMaterial);
    this.mesh.add(this.edgeLines);
  }

  /**
   * Update enemy behavior
   */
  public update(deltaTime: number, playerPosition: THREE.Vector3, bounds: ArenaBounds): void {
    if (!this.isAlive) return;

    if (this.type === 'chaser') {
      this.updateChaser(deltaTime, playerPosition, bounds);
    } else {
      this.updateWanderer(deltaTime, playerPosition, bounds);
    }

    // Visual rotation for all enemies
    this.mesh.rotation.y += deltaTime * (this.type === 'chaser' ? 3 : 1);
    this.mesh.rotation.x += deltaTime * 0.5;
  }

  private updateChaser(deltaTime: number, playerPosition: THREE.Vector3, bounds: ArenaBounds): void {
    // Move toward player
    const direction = new THREE.Vector3()
      .subVectors(playerPosition, this.mesh.position)
      .setY(0)
      .normalize();

    this.mesh.position.addScaledVector(direction, this.speed * deltaTime);
    this.clampToBounds(bounds);
  }

  private updateWanderer(deltaTime: number, playerPosition: THREE.Vector3, bounds: ArenaBounds): void {
    this.wanderTimer -= deltaTime;

    // Change direction periodically or when reaching bounds
    if (this.wanderTimer <= 0 || !this.isInBounds(bounds)) {
      this.wanderTimer = 1 + Math.random() * 2;
      
      // Bias slightly toward player for some threat
      const toPlayer = new THREE.Vector3()
        .subVectors(playerPosition, this.mesh.position)
        .setY(0)
        .normalize();
      
      const randomDir = new THREE.Vector3(
        Math.random() * 2 - 1,
        0,
        Math.random() * 2 - 1
      ).normalize();

      // 30% player bias, 70% random
      this.wanderDirection.lerpVectors(randomDir, toPlayer, 0.3).normalize();
    }

    this.mesh.position.addScaledVector(this.wanderDirection, this.speed * deltaTime);
    this.clampToBounds(bounds);
  }

  private clampToBounds(bounds: ArenaBounds): void {
    this.mesh.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, this.mesh.position.x));
    this.mesh.position.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, this.mesh.position.z));
  }

  private isInBounds(bounds: ArenaBounds): boolean {
    const margin = 0.5;
    return (
      this.mesh.position.x > bounds.minX + margin &&
      this.mesh.position.x < bounds.maxX - margin &&
      this.mesh.position.z > bounds.minZ + margin &&
      this.mesh.position.z < bounds.maxZ - margin
    );
  }

  public get position(): THREE.Vector3 {
    return this.mesh.position;
  }
}
