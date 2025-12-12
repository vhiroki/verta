import * as THREE from 'three';

export class Camera {
  public instance: THREE.OrthographicCamera;
  
  // Isometric camera settings
  // Frustum size needs to be larger to fit the 24x24 arena from isometric view
  private readonly frustumSize: number = 25;
  private readonly angle: number = Math.PI / 4; // 45 degrees

  constructor() {
    const aspect = window.innerWidth / window.innerHeight;
    
    this.instance = new THREE.OrthographicCamera(
      -this.frustumSize * aspect / 2,
      this.frustumSize * aspect / 2,
      this.frustumSize / 2,
      -this.frustumSize / 2,
      0.1,
      1000
    );

    this.setupIsometricView();
  }

  private setupIsometricView(): void {
    // Position camera for isometric view
    // True isometric: rotate 45° around Y, then ~35.264° down (arctan(1/√2))
    const distance = 50;
    const isoAngle = Math.atan(1 / Math.sqrt(2)); // ~35.264 degrees
    
    // Calculate camera position
    const y = distance * Math.sin(isoAngle);
    const horizontalDistance = distance * Math.cos(isoAngle);
    const x = horizontalDistance * Math.sin(this.angle);
    const z = horizontalDistance * Math.cos(this.angle);

    this.instance.position.set(x, y, z);
    this.instance.lookAt(0, 0, 0);
    this.instance.updateProjectionMatrix();
  }

  public onResize(): void {
    const aspect = window.innerWidth / window.innerHeight;
    
    this.instance.left = -this.frustumSize * aspect / 2;
    this.instance.right = this.frustumSize * aspect / 2;
    this.instance.top = this.frustumSize / 2;
    this.instance.bottom = -this.frustumSize / 2;
    this.instance.updateProjectionMatrix();
  }

  public get position(): THREE.Vector3 {
    return this.instance.position;
  }
}
