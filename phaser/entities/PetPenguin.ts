import Phaser from 'phaser';

export type PetAssetMap = {
  idle: string;
  default: string;
  running: string;
  eating?: string;
  fishing?: string;
  umbrella?: string;
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
  public umbrellaLiftOffset = 0;
  public stepQueue: Array<unknown> = [];
  public nextBehaviorTimeoutId: number | null = null;
  public currentFoodTarget?: {
    element?: HTMLElement | null;
    x: number;
    y: number;
  } | null;
  public isEatingFood = false;

  public readonly element: HTMLDivElement;
  public readonly img: HTMLImageElement;
  private currentAssetSrc = '';

  private readonly runtime: RuntimeLike;
  private readonly size: number;
  private readonly halfSize: number;
  private readonly groundRatio: number;
  private readonly assets: PetAssetMap;
  private readonly hitZone: Phaser.GameObjects.Zone;
  private readonly umbrellaImg?: HTMLImageElement;
  private readonly foodTargets: Array<{
    element?: HTMLElement | null;
    x: number;
    y: number;
  }> = [];
  private activeSpeech?: Phaser.GameObjects.Text;
  private speechTimeout?: Phaser.Time.TimerEvent;
  private fishingTimeoutId: number | null = null;
  private fishingTickIntervalId: number | null = null;
  private fishCursorEnabledBeforeFishing: boolean | null = null;
  private umbrellaHideTimeoutId: number | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    parentLayer: Phaser.GameObjects.Container,
    assets: PetAssetMap,
    config: { size: number; groundRatio: number },
  ) {
    document.querySelectorAll('[data-pinguin-pet="1"], [data-pinguin-umbrella="1"]').forEach((node) => {
      node.remove();
    });

    this.assets = assets;
    this.size = Math.max(64, Math.round(config.size || 120));
    this.halfSize = this.size / 2;
    this.groundRatio = Phaser.Math.Clamp(config.groundRatio || 0.86, 0.55, 0.95);
    this.runtime = (window.PenguinPet?.runtime ?? window.PINGUIN_RUNTIME ?? {}) as RuntimeLike;

    this.element = document.createElement('div');
    this.element.className = 'penguin';
    this.element.setAttribute('data-pinguin-pet', '1');
    this.element.style.pointerEvents = 'none';
    this.element.style.width = `${this.size}px`;
    this.element.style.height = `${this.size}px`;
    this.element.style.zIndex = '10';

    this.img = document.createElement('img');
    this.img.src = this.assets.idle;
    this.img.draggable = false;
    this.element.appendChild(this.img);

    if (this.assets.umbrella) {
      this.umbrellaImg = document.createElement('img');
      this.umbrellaImg.src = this.assets.umbrella;
      this.umbrellaImg.className = 'penguin-umbrella';
      this.umbrellaImg.setAttribute('data-pinguin-umbrella', '1');
      this.umbrellaImg.draggable = false;
      document.body.appendChild(this.umbrellaImg);
    }

    document.body.appendChild(this.element);

    this.hitZone = scene.add.zone(0, 0, this.size, this.size);
    this.hitZone.setDepth(10);
    parentLayer.add(this.hitZone);

    this.x = scene.scale.width / 2 - this.halfSize;
    this.y = this.getWalkMaxY();
    this.targetX = this.x;
    this.targetY = this.y;
    this.applyTransform();
  }

  get gameObject(): Phaser.GameObjects.Zone {
    return this.hitZone;
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

  destroy(): void {
    this.speechTimeout?.destroy();
    this.activeSpeech?.destroy();
    this.hitZone.destroy();
    this.element.remove();
    this.umbrellaImg?.remove();
    if (this.fishingTickIntervalId !== null) {
      window.clearInterval(this.fishingTickIntervalId);
      this.fishingTickIntervalId = null;
    }
    if (this.fishingTimeoutId !== null) {
      window.clearTimeout(this.fishingTimeoutId);
      this.fishingTimeoutId = null;
    }
    if (this.umbrellaHideTimeoutId !== null) {
      window.clearTimeout(this.umbrellaHideTimeoutId);
      this.umbrellaHideTimeoutId = null;
    }
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
      .setDepth(999);

    this.speechTimeout = this.scene.time.delayedCall(durationMs, () => {
      this.activeSpeech?.destroy();
      this.activeSpeech = undefined;
    });
  }

  setState(state: string): void {
    this.currentState = state;
    const nextSrc = this.resolveAssetForState(state);
    if (nextSrc === this.currentAssetSrc) return;
    this.currentAssetSrc = nextSrc;
    this.img.src = nextSrc;
  }

  setVisualState(state: string): void {
    this.setState(state === 'default' ? 'idle' : state);
  }

  applyTransform(flipOverride?: number): void {
    const allowAir =
      this.isDragging || this.isFishingActive || this.currentState === 'flying' || this.currentState === 'jumping';
    this.y = this.clampY(this.y, allowAir);
    this.targetY = this.clampY(this.targetY, allowAir);

    if (!allowAir && !this.isMoving && !this.currentFoodTarget && !this.isEatingFood) {
      this.y = this.getWalkMaxY();
      this.targetY = this.y;
    }

    const flip = typeof flipOverride === 'number' ? flipOverride : this.facingRight ? 1 : -1;
    const depth = this.getDepthScale();
    const scale = this.visualScale * depth;

    this.element.style.left = `${Math.round(this.x)}px`;
    this.element.style.top = `${Math.round(this.y)}px`;
    this.element.style.transform = `scaleX(${flip < 0 ? -scale : scale}) scaleY(${scale}) rotate(${this.windTilt}deg)`;
    this.element.style.transformOrigin = 'center 85%';
    this.element.style.zIndex = String(Math.round(10 + ((depth - 0.65) / 0.35) * 8));

    if (this.umbrellaImg) {
      this.updateUmbrellaPosition();
    }

    this.hitZone.setPosition(this.centerX, this.y + this.size);
    this.hitZone.setSize(this.size, this.size);
    this.hitZone.setDepth(Math.round(10 + ((depth - 0.65) / 0.35) * 8));

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
      if (this.currentFoodTarget && !this.isEatingFood) {
        this.eatCurrentFoodTarget();
      } else {
        this.setState('idle');
        this.tryConsumeNextFoodTarget();
      }
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

  scheduleNextBehavior(): void {}

  startNextBehavior(): void {}

  runNextStep(): void {
    if (this.isFishingActive) return;
    const step = this.stepQueue.shift() as
      | {
          type?: string;
          state?: string;
          duration?: number;
        }
      | undefined;
    if (!step) return;

    if (step.type === 'act' && step.state === 'fishing') {
      this.startFishing(step.duration);
    }
  }

  enqueueFoodTargets(targets: Array<{ element?: HTMLElement; x: number; y: number }>): void {
    for (const target of targets) {
      if (!target || !Number.isFinite(target.x) || !Number.isFinite(target.y)) continue;
      this.foodTargets.push({
        element: target.element ?? null,
        x: Number(target.x),
        y: Number(target.y),
      });
    }
    this.tryConsumeNextFoodTarget();
  }

  showUmbrella(): void {
    if (!this.umbrellaImg) return;
    if (this.umbrellaHideTimeoutId !== null) {
      window.clearTimeout(this.umbrellaHideTimeoutId);
      this.umbrellaHideTimeoutId = null;
    }
    this.umbrellaImg.classList.remove('closing');
    this.umbrellaImg.classList.add('open');
  }

  hideUmbrella(): void {
    if (!this.umbrellaImg) return;
    this.umbrellaImg.classList.remove('open');
    this.umbrellaImg.classList.add('closing');
    if (this.umbrellaHideTimeoutId !== null) {
      window.clearTimeout(this.umbrellaHideTimeoutId);
    }
    this.umbrellaHideTimeoutId = window.setTimeout(() => {
      this.umbrellaImg?.classList.remove('closing');
      this.umbrellaHideTimeoutId = null;
    }, 360);
  }

  private resolveAssetForState(state: string): string {
    if (state === 'running' || state === 'runningCrouched') return this.assets.running;
    if (state === 'idle' || state === 'default') return this.assets.idle;
    if (state === 'eating' && this.assets.eating) return this.assets.eating;
    if (state === 'fishing' && this.assets.fishing) return this.assets.fishing;
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

  private eatCurrentFoodTarget(): void {
    const target = this.currentFoodTarget;
    if (!target) return;

    this.isEatingFood = true;
    this.setState('eating');

    if (target.element) {
      target.element.classList.add('eaten');
      window.setTimeout(() => {
        target.element?.remove();
      }, 280);
    }

    window.setTimeout(() => {
      this.currentFoodTarget = null;
      this.isEatingFood = false;
      this.setState('idle');
      this.tryConsumeNextFoodTarget();
    }, 720);
  }

  private tryConsumeNextFoodTarget(): void {
    if (this.currentFoodTarget || this.isEatingFood || this.isFishingActive) return;
    while (this.foodTargets.length > 0) {
      const next = this.foodTargets.shift();
      if (!next) continue;
      if (next.element && !next.element.isConnected) continue;
      this.currentFoodTarget = next;
      this.moveToPosition(next.x, next.y, 2.4);
      return;
    }
  }

  private startFishing(durationMs?: number): void {
    const runtime = this.runtime as RuntimeLike & {
      setFishCursorEnabled?: (enabled: boolean) => void;
      isFishCursorEnabled?: boolean;
      addFishStock?: (amount?: number) => number;
      getFishStock?: () => number;
    };

    this.isFishingActive = true;
    this.aiLocked = true;
    this.isMoving = false;
    this.foodTargets.length = 0;
    this.currentFoodTarget = null;
    this.setState('fishing');

    this.fishCursorEnabledBeforeFishing = runtime.isFishCursorEnabled !== false;
    runtime.setFishCursorEnabled?.(false);

    const safeDuration = Math.max(1000, Math.round(Number(durationMs) || 15000));
    this.fishingTickIntervalId = window.setInterval(() => {
      runtime.addFishStock?.(1);
    }, 5000);

    this.fishingTimeoutId = window.setTimeout(() => {
      this.isFishingActive = false;
      this.aiLocked = false;
      this.setState('idle');

      if (
        this.fishCursorEnabledBeforeFishing &&
        (typeof runtime.getFishStock !== 'function' || runtime.getFishStock() > 0)
      ) {
        runtime.setFishCursorEnabled?.(true);
      }

      if (this.fishingTickIntervalId !== null) {
        window.clearInterval(this.fishingTickIntervalId);
        this.fishingTickIntervalId = null;
      }
      this.fishingTimeoutId = null;
      this.fishCursorEnabledBeforeFishing = null;
      this.tryConsumeNextFoodTarget();
    }, safeDuration);
  }

  private updateUmbrellaPosition(): void {
    if (!this.umbrellaImg) return;
    const depthScale = this.getDepthScale();
    const umbrellaSize = this.size * 0.85 * depthScale;
    const sideOffsetRatio = this.facingRight ? 0.25 : 0.16;
    const sideOffset = umbrellaSize * sideOffsetRatio * (this.facingRight ? 1 : -1);
    const left = this.x + this.halfSize - umbrellaSize / 2 + sideOffset;
    const liftOffset = this.umbrellaLiftOffset || 0;
    const top = this.y - umbrellaSize * 0.3 - liftOffset;

    this.umbrellaImg.style.width = `${umbrellaSize}px`;
    this.umbrellaImg.style.left = `${left}px`;
    this.umbrellaImg.style.top = `${top}px`;
    this.umbrellaImg.style.zIndex = String(Math.round(11 + ((depthScale - 0.65) / 0.35) * 8));

    const centerX = this.scene.scale.width / 2;
    const mouseX = Number(this.runtime.mouseX ?? centerX);
    const tiltMax = 10;
    const rawTilt = ((mouseX - centerX) / Math.max(1, centerX)) * tiltMax;
    const tilt = Math.max(-tiltMax, Math.min(tiltMax, rawTilt));
    this.umbrellaImg.style.setProperty('--umbrella-tilt', `${tilt.toFixed(2)}deg`);
  }
}
