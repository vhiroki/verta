import * as THREE from 'three';

export interface ArenaBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

/**
 * Arena - A rectangular combat platform with grid floor and glowing edges.
 */
export class Arena {
  public group: THREE.Group;
  public bounds: ArenaBounds;

  private readonly width: number;
  private readonly depth: number;
  private readonly gridDivisions: number = 20;

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
    const geometry = new THREE.PlaneGeometry(this.width, this.depth);
    const material = new THREE.MeshStandardMaterial({
      color: 0x12121a,
      emissive: 0x08080f,
      emissiveIntensity: 0.3,
      side: THREE.DoubleSide,
    });

    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;

    this.group.add(floor);
  }

  private createGrid(): void {
    const gridHelper = new THREE.GridHelper(
      Math.max(this.width, this.depth),
      this.gridDivisions,
      0x2a2a3a, // center line color
      0x1a1a2a  // grid color
    );
    gridHelper.position.y = 0.01; // Slightly above floor to prevent z-fighting

    this.group.add(gridHelper);
  }

  private createEdges(): void {
    const edgeHeight = 0.3;
    const edgeThickness = 0.15;

    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.9,
    });

    // Create 4 edge bars
    const edges = [
      // Front edge (positive Z)
      { pos: [0, edgeHeight / 2, this.depth / 2], size: [this.width, edgeHeight, edgeThickness] },
      // Back edge (negative Z)
      { pos: [0, edgeHeight / 2, -this.depth / 2], size: [this.width, edgeHeight, edgeThickness] },
      // Right edge (positive X)
      { pos: [this.width / 2, edgeHeight / 2, 0], size: [edgeThickness, edgeHeight, this.depth] },
      // Left edge (negative X)
      { pos: [-this.width / 2, edgeHeight / 2, 0], size: [edgeThickness, edgeHeight, this.depth] },
    ];

    edges.forEach(({ pos, size }) => {
      const geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
      const edge = new THREE.Mesh(geometry, edgeMaterial);
      edge.position.set(pos[0], pos[1], pos[2]);
      this.group.add(edge);
    });

    // Add corner accents
    this.createCornerAccents(edgeMaterial);
  }

  private createCornerAccents(material: THREE.Material): void {
    const cornerSize = 0.5;
    const geometry = new THREE.OctahedronGeometry(cornerSize);

    const corners = [
      [this.width / 2, cornerSize, this.depth / 2],
      [this.width / 2, cornerSize, -this.depth / 2],
      [-this.width / 2, cornerSize, this.depth / 2],
      [-this.width / 2, cornerSize, -this.depth / 2],
    ];

    corners.forEach(([x, y, z]) => {
      const corner = new THREE.Mesh(geometry, material);
      corner.position.set(x, y, z);
      this.group.add(corner);
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
}
