import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export class Renderer {
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private camera: THREE.Camera;
  private renderPass: RenderPass;
  private bloomPass: UnrealBloomPass;

  constructor(container: HTMLElement, camera: THREE.Camera) {
    this.camera = camera;

    // Create WebGL renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    container.appendChild(this.renderer.domElement);

    // Create effect composer for post-processing
    this.composer = new EffectComposer(this.renderer);

    // Render pass (renders the scene normally)
    this.renderPass = new RenderPass(new THREE.Scene(), camera);
    this.composer.addPass(this.renderPass);

    // Bloom pass for glow effects
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.8,  // strength
      0.4,  // radius
      0.85  // threshold
    );
    this.composer.addPass(this.bloomPass);
  }

  public render(scene: THREE.Scene): void {
    this.renderPass.scene = scene;
    this.composer.render();
  }

  public onResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
    this.bloomPass.resolution.set(width, height);
  }

  public get domElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }
}
