import Phaser from 'phaser';

export type PetAssetMap = {
  idle: string;
  default: string;
  running: string;
  scared?: string;
  peeking?: string;
  flying?: string;
  thinking?: string;
  waving?: string;
  angry?: string;
};

type RuntimeLike = {
  mouseX?: number;
  mouseY?: number;
  isMouseInsideViewport?: boolean;
};

export class PetPenguin {
  public x = 0;
  public y = 0;
  public targetX = 0;
  public targetY = 0;
  public currentState = 'idle';
  public facingRight = true;
  public isMoving = false;
  public isDragging = false;
  public isWalkingAway = false;
  public isRanting = false;
  public isFishingActive = false;
  public isChasing = false;
  public aiLocked = false;
  public speed = 2.2;
  public visualScale = 1;
  public windTilt = 0;
  public stepQueue: Array<unknown> = [];
  public nextBehaviorTimeoutId: number | null = null;

  // Legacy compatibility: callers expect `element.style.animation`.
  public readonly element: { style: Record<string, string> } = { style: {} };

  private readonly runtime: RuntimeLike;
  private readonly size: number;
  private readonly halfSize: number;
  private readonly groundRatio: number;
  private readonly assets: PetAssetMap;

  private readonly container: Phaser.GameObjects.Container;
  private readonly sprite: Phaser.GameObjects.Sprite;
  private activeSpeech?: Phaser.GameObjects.Text;
  private speechTimeout?: Phaser.Time.TimerEvent;

  constructor(
    private readonly scene: Phaser.Scene,
    parentLayer: Phaser.GameObjects.Container,
    assets: PetAssetMap,
    config: { size: number; groundRatio: number },
  ) {
    this.assets = assets;
    this.size = Math.max(64, Math.round(config.size || 120));
    this.halfSize = this.size / 2;
    this.groundRatio = Phaser.Math.Clamp(config.groundRatio || 0.86, 0.55, 0.95);
    this.runtime = (window.PenguinPet?.runtime ?? window.PINGUIN_RUNTIME ?? {}) as RuntimeLike;

    this.sprite = scene.add.sprite(0, 0, assets.idle);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setDisplaySize(this.size, this.size);

    this.container = scene.add.container(0, 0, [this.sprite]);
    this.container.setDepth(10);
    this.container.setSize(this.size, this.size);
    parentLayer.add(this.container);

    this.x = scene.scale.width / 2 - this.halfSize;
    this.y = this.getGroundTopY();
    this.targetX = this.x;
    this.targetY = this.y;
    this.applyTransform();
  }

  get gameObject(): Phaser.GameObjects.Container {
    return this.container;
  }

  get displaySize(): number {
    return this.size;
  }

  get centerX(): number {
    return this.x + this.halfSize;
  }

  get centerY(): number {
    return this.y + this.halfSize;
  }

  getRuntime(): RuntimeLike {
    return this.runtime;
  }

  onMouseMove(mouseX: number, mouseY: number): void {
    this.runtime.mouseX = mouseX;
    this.runtime.mouseY = mouseY;
    this.runtime.isMouseInsideViewport = true;
  }

  showSpeech(text: string, durationMs = 1800): void {
    if (!text) return;
    this.activeSpeech?.destroy();
    this.speechTimeout?.destroy();

    this.activeSpeech = this.scene.add
      .text(this.centerX, this.y - 12, text, {
        color: '#1d2330',
        fontFamily: 'sans-serif',
        fontSize: '11px',
        backgroundColor: '#ffffff',
        padding: { x: 8, y: 5 },
      })
      .setOrigin(0.5, 1)
      .setDepth(this.container.depth + 2);

    this.speechTimeout = this.scene.time.delayedCall(durationMs, () => {
      this.activeSpeech?.destroy();
      this.activeSpeech = undefined;
    });
  }

  setState(state: string): void {
    this.currentState = state;
    const nextTexture = this.resolveTextureForState(state);
    if (this.sprite.texture.key !== nextTexture) {
      this.sprite.setTexture(nextTexture);
    }
  }

  setVisualState(state: string): void {
    this.setState(state === 'default' ? 'idle' : state);
  }

  applyTransform(flipOverride?: number): void {
    const flip = typeof flipOverride === 'number' ? flipOverride : this.facingRight ? 1 : -1;
    const depth = this.getDepthScale();
    this.container.setPosition(this.centerX, this.y + this.size);
    this.container.setScale(this.visualScale * depth, this.visualScale * depth);
    this.container.setRotation(Phaser.Math.DegToRad(this.windTilt));
    this.sprite.setFlipX(flip < 0);
    this.container.setDepth(Math.round(10 + ((depth - 0.65) / 0.35) * 8));

    if (this.activeSpeech) {
      this.activeSpeech.setPosition(this.centerX, this.y - 10);
    }
  }

  moveToPosition(tx: number, ty: number, speed?: number, allowAir = false): void {
    this.targetX = Phaser.Math.Clamp(tx - this.halfSize, 0, Math.max(0, this.scene.scale.width - this.size));
    this.targetY = this.clampY(ty - this.halfSize, allowAir);
    if (Number.isFinite(speed)) {
      this.speed = Number(speed);
    }
    this.isMoving = true;
  }

  randomTarget(nearEdge = false): { x: number; y: number } {
    const w = Math.max(0, this.scene.scale.width - this.size);
    const inset = Math.min(70, Math.max(18, Math.round(w * 0.12)));
    const safeMin = Math.min(inset, w);
    const safeMax = Math.max(safeMin, w - inset);
    const y = this.randomWalkY();
    if (nearEdge) {
      const jitter = (Math.random() - 0.5) * 24;
      const x = (Math.random() < 0.5 ? safeMin : safeMax) + jitter;
      return { x: Phaser.Math.Clamp(x, 0, w), y };
    }
    return { x: Phaser.Math.Between(Math.round(safeMin), Math.round(safeMax)), y };
  }

  updateWalk(deltaMs: number): void {
    if (!this.isMoving || this.isDragging) return;
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= 2) {
      this.isMoving = false;
      this.setState('idle');
      return;
    }

    const px = this.speed * (deltaMs / 16.6667);
    this.x += (dx / distance) * px;
    this.y += (dy / distance) * px;
    this.x = Phaser.Math.Clamp(this.x, 0, Math.max(0, this.scene.scale.width - this.size));
    this.y = this.clampY(this.y);
    this.facingRight = dx >= 0;
    this.setState('running');
  }

  clampY(y: number, allowAir = false): number {
    const minY = allowAir ? this.getFlyMinY() : this.getWalkMinY();
    return Phaser.Math.Clamp(y, minY, this.getWalkMaxY());
  }

  getWalkMinY(): number {
    return this.getGroundTopY();
  }

  getWalkMaxY(): number {
    return this.getWalkMinY() + Math.round(this.scene.scale.height * 0.13);
  }

  getFlyMinY(): number {
    return Math.max(0, this.getWalkMinY() - 90);
  }

  randomWalkY(): number {
    return Phaser.Math.Between(Math.round(this.getWalkMinY()), Math.round(this.getWalkMaxY()));
  }

  scheduleNextBehavior(): void {
    // Placeholder for legacy compatibility.
  }

  startNextBehavior(): void {
    // Placeholder for legacy compatibility.
  }

  runNextStep(): void {
    // Placeholder for legacy compatibility.
  }

  showUmbrella(): void {
    // Placeholder for legacy compatibility with effects module.
  }

  hideUmbrella(): void {
    // Placeholder for legacy compatibility with effects module.
  }

  private resolveTextureForState(state: string): string {
    if (state === 'running' || state === 'runningCrouched') return this.assets.running;
    if (state === 'idle' || state === 'default') return this.assets.idle;
    if (state === 'flying' && this.assets.flying) return this.assets.flying;
    if (state === 'thinking' && this.assets.thinking) return this.assets.thinking;
    if (state === 'waving' && this.assets.waving) return this.assets.waving;
    if (state === 'peeking' && this.assets.peeking) return this.assets.peeking;
    if (state === 'angry' && this.assets.angry) return this.assets.angry;
    if (state === 'scared' && this.assets.scared) return this.assets.scared;
    return this.assets.default || this.assets.idle;
  }

  private getDepthScale(): number {
    const ratio = Phaser.Math.Clamp(this.y / Math.max(1, this.getWalkMaxY()), 0, 1);
    return 0.65 + ratio * 0.35;
  }

  private getGroundTopY(): number {
    return Phaser.Math.Clamp(
      this.scene.scale.height * this.groundRatio - this.size,
      0,
      this.scene.scale.height - this.size,
    );
  }
}
