import * as THREE from 'three';
import { InputManager } from '../input/InputManager';
import { ArenaBounds } from '../levels/Arena';

/**
 * Player entity - a glowing octahedron controlled by WASD.
 * Movement is screen-relative for isometric camera.
 */
export class Player {
  public mesh: THREE.Mesh;
  
  private readonly baseSpeed: number = 8;
  private speedMultiplier: number = 1.0;
  private inputManager: InputManager;

  // Vectors for converting screen-relative input to world movement
  // For isometric camera at 45°, we rotate input by 45° to align with world axes
  private readonly forwardDir: THREE.Vector3;
  private readonly rightDir: THREE.Vector3;

  constructor(inputManager: InputManager) {
    this.inputManager = inputManager;

    // Create octahedron geometry (8-faced polyhedron)
    const geometry = new THREE.OctahedronGeometry(0.8);
    
    // Emissive cyan material for glow effect
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.6,
      flatShading: true,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(0, 0.8, 0); // Slightly above ground
    this.mesh.castShadow = true;

    // Add wireframe edges for better shape visibility
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ 
      color: 0x004444,
      linewidth: 2,
    });
    const wireframe = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    this.mesh.add(wireframe);

    // Calculate screen-to-world direction vectors for isometric view
    // Screen "up" (W key) maps to moving diagonally in world space
    // At 45° isometric: forward = (-1, 0, -1) normalized, right = (1, 0, -1) normalized
    this.forwardDir = new THREE.Vector3(-1, 0, -1).normalize();
    this.rightDir = new THREE.Vector3(1, 0, -1).normalize();
  }

  /**
   * Update player position based on input
   * @param deltaTime Time since last frame in seconds
   * @param bounds Optional arena bounds to constrain movement
   */
  public update(deltaTime: number, bounds?: ArenaBounds): void {
    const input = this.inputManager.getMovementInput();
    
    if (input.x === 0 && input.y === 0) return;

    // Convert screen-relative input to world movement
    const movement = new THREE.Vector3();
    movement.addScaledVector(this.rightDir, input.x);
    movement.addScaledVector(this.forwardDir, input.y);
    movement.normalize();
    movement.multiplyScalar(this.baseSpeed * this.speedMultiplier * deltaTime);

    this.mesh.position.add(movement);

    // Clamp position to arena bounds if provided
    if (bounds) {
      this.mesh.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, this.mesh.position.x));
      this.mesh.position.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, this.mesh.position.z));
    }

    // Add subtle rotation based on movement for visual feedback
    this.mesh.rotation.y += deltaTime * 2;
    this.mesh.rotation.x = Math.sin(Date.now() * 0.003) * 0.1;
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
