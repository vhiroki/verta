import * as THREE from 'three';

export interface ArenaBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

/**
 * Arena - A rectangular combat platform representing VERTA's containment zone.
 * Features a tiled floor grid and containment barrier edges.
 */
export class Arena {
  public group: THREE.Group;
  public bounds: ArenaBounds;

  private readonly width: number;
  private readonly depth: number;
  private readonly gridDivisions: number = 20;
  
  // Transition effects
  private barrierSegments: THREE.Mesh[] = [];
  private barrierMaterial!: THREE.MeshStandardMaterial;
  private transitionTime: number = 0;
  private isTransitioning: boolean = false;
  private gridLines: THREE.Mesh[] = [];
  private gridLineMaterial!: THREE.MeshStandardMaterial;
  
  // Floor tiles for ripple effect
  private floorTiles: THREE.Mesh[] = [];
  private tileBaseY: number = 0;

  constructor(width: number = 24, depth: number = 24) {
    this.width = width;
    this.depth = depth;
    this.group = new THREE.Group();

    // Calculate bounds with small padding
    const padding = 1;
    this.bounds = {
      minX: -width / 2 + padding,
      maxX: width / 2 - padding,
      minZ: -depth / 2 + padding,
      maxZ: depth / 2 - padding,
    };

    this.createFloor();
    this.createGrid();
    this.createEdges();
  }

  private createFloor(): void {
    // Create a base floor underneath the blocks
    const baseGeometry = new THREE.PlaneGeometry(this.width + 2, this.depth + 2);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x08080c,
      emissive: 0x040408,
      emissiveIntensity: 0.2,
      side: THREE.DoubleSide,
    });
    const baseFloor = new THREE.Mesh(baseGeometry, baseMaterial);
    baseFloor.rotation.x = -Math.PI / 2;
    baseFloor.position.y = -0.02;
    this.group.add(baseFloor);

    // Create individual floor tiles/blocks for cyber aesthetic
    const tileCount = this.gridDivisions;
    const tileSize = this.width / tileCount;
    const gap = 0.12; // Wider gap between tiles for visible grid
    const actualTileSize = tileSize - gap;
    const tileHeight = 0.03; // Thin tiles

    // Single tile material
    const tileMaterial = new THREE.MeshStandardMaterial({
      color: 0x0c0c14,
      emissive: 0x04040a,
      emissiveIntensity: 0.2,
    });

    // Shared geometry for all tiles (more efficient)
    const tileGeometry = new THREE.BoxGeometry(actualTileSize, tileHeight, actualTileSize);
    this.tileBaseY = tileHeight / 2;

    for (let i = 0; i < tileCount; i++) {
      for (let j = 0; j < tileCount; j++) {
        const tile = new THREE.Mesh(tileGeometry, tileMaterial);

        // Position tile in grid
        const x = -this.width / 2 + tileSize / 2 + i * tileSize;
        const z = -this.depth / 2 + tileSize / 2 + j * tileSize;
        tile.position.set(x, this.tileBaseY, z);

        this.group.add(tile);
        this.floorTiles.push(tile);
      }
    }
  }

  private createGrid(): void {
    // Create glowing grid lines using thin box meshes (no aliasing)
    const lineThickness = 0.04;
    const lineHeight = 0.01;
    const tileSize = this.width / this.gridDivisions;

    this.gridLineMaterial = new THREE.MeshStandardMaterial({
      color: 0x6a6a6a,
      emissive: 0x4a4a4a,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.9,
    });

    // Create lines along X axis (horizontal)
    for (let i = 0; i <= this.gridDivisions; i++) {
      const z = -this.depth / 2 + i * tileSize;
      const lineGeometry = new THREE.BoxGeometry(this.width, lineHeight, lineThickness);
      const line = new THREE.Mesh(lineGeometry, this.gridLineMaterial);
      line.position.set(0, lineHeight / 2 + 0.001, z);
      this.group.add(line);
      this.gridLines.push(line);
    }

    // Create lines along Z axis (vertical)
    for (let j = 0; j <= this.gridDivisions; j++) {
      const x = -this.width / 2 + j * tileSize;
      const lineGeometry = new THREE.BoxGeometry(lineThickness, lineHeight, this.depth);
      const line = new THREE.Mesh(lineGeometry, this.gridLineMaterial);
      line.position.set(x, lineHeight / 2 + 0.001, 0);
      this.group.add(line);
      this.gridLines.push(line);
    }
  }

  private createEdges(): void {
    // Create segmented containment barrier - VERTA's defensive perimeter
    const segmentCount = 12; // Segments per side
    const segmentGap = 0.1;
    const barrierHeight = 0.4;
    const barrierThickness = 0.08;

    this.barrierMaterial = new THREE.MeshStandardMaterial({
      color: 0x00cccc,
      emissive: 0x008888,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.85,
    });

    // Inner glow material for accent
    const innerGlowMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.3,
    });

    // Create segments for each side
    const sides = [
      { axis: 'x', pos: [0, 0, this.depth / 2], length: this.width },
      { axis: 'x', pos: [0, 0, -this.depth / 2], length: this.width },
      { axis: 'z', pos: [this.width / 2, 0, 0], length: this.depth },
      { axis: 'z', pos: [-this.width / 2, 0, 0], length: this.depth },
    ];

    sides.forEach(({ axis, pos, length }) => {
      const segmentLength = (length - (segmentCount - 1) * segmentGap) / segmentCount;

      for (let i = 0; i < segmentCount; i++) {
        const offset = -length / 2 + segmentLength / 2 + i * (segmentLength + segmentGap);
        
        // Main barrier segment
        const geometry = axis === 'x'
          ? new THREE.BoxGeometry(segmentLength, barrierHeight, barrierThickness)
          : new THREE.BoxGeometry(barrierThickness, barrierHeight, segmentLength);
        
        const segment = new THREE.Mesh(geometry, this.barrierMaterial);
        segment.position.set(
          axis === 'x' ? offset : pos[0],
          barrierHeight / 2,
          axis === 'z' ? offset : pos[2]
        );
        this.group.add(segment);
        this.barrierSegments.push(segment);

        // Inner glow line (thinner, brighter)
        const glowGeometry = axis === 'x'
          ? new THREE.BoxGeometry(segmentLength * 0.9, barrierHeight * 0.3, barrierThickness * 0.3)
          : new THREE.BoxGeometry(barrierThickness * 0.3, barrierHeight * 0.3, segmentLength * 0.9);
        
        const glow = new THREE.Mesh(glowGeometry, innerGlowMaterial);
        glow.position.copy(segment.position);
        glow.position.y = barrierHeight * 0.6;
        this.group.add(glow);
      }
    });

    // Corner pylons - tall markers at each corner
    this.createCornerPylons();
  }

  private createCornerPylons(): void {
    const pylonHeight = 1.2;
    const pylonRadius = 0.15;

    const pylonMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00aaaa,
      emissiveIntensity: 0.7,
    });

    const topMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 1.2,
    });

    const corners = [
      [this.width / 2, 0, this.depth / 2],
      [this.width / 2, 0, -this.depth / 2],
      [-this.width / 2, 0, this.depth / 2],
      [-this.width / 2, 0, -this.depth / 2],
    ];

    corners.forEach(([x, _, z]) => {
      // Main pylon body
      const pylonGeometry = new THREE.CylinderGeometry(pylonRadius, pylonRadius * 1.3, pylonHeight, 6);
      const pylon = new THREE.Mesh(pylonGeometry, pylonMaterial);
      pylon.position.set(x, pylonHeight / 2, z);
      this.group.add(pylon);

      // Top emitter (bright point)
      const topGeometry = new THREE.OctahedronGeometry(pylonRadius * 0.8);
      const top = new THREE.Mesh(topGeometry, topMaterial);
      top.position.set(x, pylonHeight + pylonRadius * 0.4, z);
      this.group.add(top);

      // Base ring
      const ringGeometry = new THREE.TorusGeometry(pylonRadius * 1.5, 0.03, 8, 6);
      const ring = new THREE.Mesh(ringGeometry, this.barrierMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(x, 0.05, z);
      this.group.add(ring);
    });
  }

  /**
   * Clamp a position to stay within arena bounds
   */
  public clampPosition(position: THREE.Vector3): THREE.Vector3 {
    return new THREE.Vector3(
      Math.max(this.bounds.minX, Math.min(this.bounds.maxX, position.x)),
      position.y,
      Math.max(this.bounds.minZ, Math.min(this.bounds.maxZ, position.z))
    );
  }

  /**
   * Check if a position is within arena bounds
   */
  public isInBounds(position: THREE.Vector3): boolean {
    return (
      position.x >= this.bounds.minX &&
      position.x <= this.bounds.maxX &&
      position.z >= this.bounds.minZ &&
      position.z <= this.bounds.maxZ
    );
  }

  /**
   * Trigger wave transition effect - DEFENSE ESCALATION
   * Visual feedback when VERTA escalates its response
   */
  public triggerWaveTransition(): void {
    this.isTransitioning = true;
    this.transitionTime = 0;
  }

  /**
   * Update arena visuals (call each frame)
   */
  public update(deltaTime: number): void {
    if (!this.isTransitioning) return;

    this.transitionTime += deltaTime;
    const transitionDuration = 1.5;
    const progress = Math.min(this.transitionTime / transitionDuration, 1);

    // Phase 1: Barrier pulse (0-0.3)
    if (progress < 0.3) {
      const pulseProgress = progress / 0.3;
      const pulseIntensity = Math.sin(pulseProgress * Math.PI);
      
      this.barrierMaterial.emissiveIntensity = 0.5 + pulseIntensity * 1.5;
      this.barrierMaterial.opacity = 0.85 + pulseIntensity * 0.15;
    }

    // Phase 2: Grid flicker (0.2-0.7)
    if (progress > 0.2 && progress < 0.7) {
      const flickerProgress = (progress - 0.2) / 0.5;
      const flickerFreq = 20;
      const flicker = Math.sin(flickerProgress * flickerFreq * Math.PI) > 0 ? 1 : 0.3;
      
      this.gridLineMaterial.emissiveIntensity = 0.6 * flicker;
      this.gridLineMaterial.opacity = 0.9 * (0.5 + flicker * 0.5);
      
      // Stagger barrier segment visibility for "reconfiguration" effect
      this.barrierSegments.forEach((segment, i) => {
        const segmentPhase = (flickerProgress * 3 + i * 0.1) % 1;
        segment.visible = segmentPhase > 0.15;
      });
    }

    // Floor tile ripple effect - wave emanates from center outward
    this.updateFloorRipple(progress);

    // Phase 3: Stabilize with elevated intensity (0.6-1.0)
    if (progress > 0.6) {
      const stabilizeProgress = (progress - 0.6) / 0.4;
      
      // Return grid to normal
      this.gridLineMaterial.emissiveIntensity = 0.6 + (1 - stabilizeProgress) * 0.4;
      this.gridLineMaterial.opacity = 0.9;
      
      // Make all segments visible
      this.barrierSegments.forEach(segment => {
        segment.visible = true;
      });
      
      // Barrier settles to slightly higher intensity
      this.barrierMaterial.emissiveIntensity = 0.5 + (1 - stabilizeProgress) * 0.5;
      this.barrierMaterial.opacity = 0.85;
    }

    // End transition
    if (progress >= 1) {
      this.isTransitioning = false;
      this.resetMaterials();
    }
  }

  /**
   * Animate floor tiles in a ripple pattern from center outward
   */
  private updateFloorRipple(progress: number): void {
    const maxDistance = Math.sqrt((this.width / 2) ** 2 + (this.depth / 2) ** 2);
    const rippleSpeed = 2.5; // How fast the ripple expands
    const rippleWidth = 0.25; // Width of the ripple wave (0-1 of maxDistance)
    const maxHeight = 0.15; // Maximum height tiles rise
    
    // Ripple travels from center to edge over the transition
    const ripplePosition = progress * rippleSpeed;

    this.floorTiles.forEach(tile => {
      // Calculate distance from center (normalized 0-1)
      const distFromCenter = Math.sqrt(tile.position.x ** 2 + tile.position.z ** 2) / maxDistance;
      
      // Calculate how much this tile is affected by the ripple
      const rippleDelta = Math.abs(distFromCenter - ripplePosition);
      
      if (rippleDelta < rippleWidth) {
        // Tile is within the ripple wave
        const rippleIntensity = 1 - (rippleDelta / rippleWidth);
        const waveShape = Math.sin(rippleIntensity * Math.PI); // Smooth rise and fall
        tile.position.y = this.tileBaseY + waveShape * maxHeight;
      } else {
        // Tile is outside ripple - return to base
        tile.position.y = this.tileBaseY;
      }
    });
  }

  private resetMaterials(): void {
    this.barrierMaterial.emissiveIntensity = 0.5;
    this.barrierMaterial.opacity = 0.85;
    this.gridLineMaterial.emissiveIntensity = 0.6;
    this.gridLineMaterial.opacity = 0.9;
    this.barrierSegments.forEach(segment => {
      segment.visible = true;
    });
    // Reset all floor tiles to base height
    this.floorTiles.forEach(tile => {
      tile.position.y = this.tileBaseY;
    });
  }
}
