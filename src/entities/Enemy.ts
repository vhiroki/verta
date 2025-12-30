import * as THREE from 'three';
import { ArenaBounds } from '../levels/Arena';

export type EnemyType = 'seeker' | 'enforcer';

/**
 * Enemy entity - hostile geometric shapes that pursue the player.
 */
export class Enemy {
  public mesh: THREE.Mesh;
  public isAlive: boolean = true;
  
  private readonly speed: number;
  private readonly type: EnemyType;
  private edgeLines: THREE.LineSegments;
  
  // Health system
  public maxHealth: number;
  public currentHealth: number;

  constructor(type: EnemyType = 'seeker', position: THREE.Vector3, wave: number = 1) {
    this.type = type;
    
    // Different geometry and color based on type
    let geometry: THREE.BufferGeometry;
    let color: number;
    
    if (type === 'seeker') {
      geometry = new THREE.TetrahedronGeometry(0.6);
      color = 0xff3366; // Red-pink for aggressive seekers
      this.speed = 3;
      // Seekers have lower health (1 hit at wave 1, scales up)
      this.maxHealth = 20 + (wave - 1) * 15;
    } else {
      geometry = new THREE.BoxGeometry(0.7, 0.7, 0.7);
      color = 0xff9900; // Orange for enforcers
      this.speed = 2;
      // Enforcers are tougher (2-3 hits at wave 1, scales up)
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
    const edgeColor = type === 'seeker' ? 0x990022 : 0x994400;
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

    // All enemies chase the player
    this.chasePlayer(deltaTime, playerPosition, bounds);

    // Visual rotation for all enemies
    this.mesh.rotation.y += deltaTime * (this.type === 'seeker' ? 3 : 1);
    this.mesh.rotation.x += deltaTime * 0.5;
  }

  private chasePlayer(deltaTime: number, playerPosition: THREE.Vector3, bounds: ArenaBounds): void {
    // Move toward player
    const direction = new THREE.Vector3()
      .subVectors(playerPosition, this.mesh.position)
      .setY(0)
      .normalize();

    this.mesh.position.addScaledVector(direction, this.speed * deltaTime);
    this.clampToBounds(bounds);
  }

  private clampToBounds(bounds: ArenaBounds): void {
    this.mesh.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, this.mesh.position.x));
    this.mesh.position.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, this.mesh.position.z));
  }

  public get position(): THREE.Vector3 {
    return this.mesh.position;
  }
}
