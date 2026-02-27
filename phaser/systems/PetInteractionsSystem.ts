import Phaser from 'phaser';
import { PetPenguin } from '../entities/PetPenguin';
import { PetMotionSystem } from './PetMotionSystem';
import { PetStateSystem } from './PetStateSystem';
import type { RuntimeConfig } from '../../runtime/types';

export class PetInteractionsSystem {
  private pointerMoveHandler?: (pointer: Phaser.Input.Pointer) => void;
  private pointerDownHandler?: (pointer: Phaser.Input.Pointer) => void;
  private dragStartHandler?: (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => void;
  private dragHandler?: (
    pointer: Phaser.Input.Pointer,
    gameObject: Phaser.GameObjects.GameObject,
    dragX: number,
    dragY: number,
  ) => void;
  private dragEndHandler?: (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => void;
  private lastRainClickAt = 0;
  private readonly rainDoubleClickMs = 600;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly pet: PetPenguin,
    private readonly motionSystem: PetMotionSystem,
    private readonly stateSystem: PetStateSystem,
  ) {}

  init(): void {
    const hitArea = new Phaser.Geom.Rectangle(
      -this.pet.displaySize / 2,
      -this.pet.displaySize,
      this.pet.displaySize,
      this.pet.displaySize,
    );
    this.pet.gameObject.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    this.scene.input.setDraggable(this.pet.gameObject, true);

    this.pointerMoveHandler = (pointer: Phaser.Input.Pointer) => {
      this.pet.onMouseMove(pointer.worldX, pointer.worldY);
      if (!this.pet.isDragging && !this.pet.isMoving) {
        this.stateSystem.faceTo(pointer.worldX);
      }
    };
    this.scene.input.on('pointermove', this.pointerMoveHandler);

    this.pointerDownHandler = (pointer: Phaser.Input.Pointer) => {
      if (this.pet.isDragging) return;

      if (pointer.rightButtonDown()) {
        this.pet.showSpeech('oi');
        return;
      }

      if (this.handleWeatherClick(pointer)) {
        return;
      }

      this.feedFish(pointer.worldX, pointer.worldY);
    };
    this.scene.input.on('pointerdown', this.pointerDownHandler);

    this.dragStartHandler = (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
      if (gameObject !== this.pet.gameObject) return;
      this.pet.isDragging = true;
      this.pet.isMoving = false;
      this.stateSystem.setVisualState('flying');
    };
    this.scene.input.on('dragstart', this.dragStartHandler);

    this.dragHandler = (
      _pointer: Phaser.Input.Pointer,
      gameObject: Phaser.GameObjects.GameObject,
      dragX: number,
      dragY: number,
    ) => {
      if (gameObject !== this.pet.gameObject) return;
      this.pet.x = Phaser.Math.Clamp(
        dragX - this.pet.displaySize / 2,
        0,
        Math.max(0, this.scene.scale.width - this.pet.displaySize),
      );
      this.pet.y = this.pet.clampY(dragY - this.pet.displaySize, true);
    };
    this.scene.input.on('drag', this.dragHandler);

    this.dragEndHandler = (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
      if (gameObject !== this.pet.gameObject) return;
      this.pet.isDragging = false;
      this.stateSystem.setVisualState('idle');
    };
    this.scene.input.on('dragend', this.dragEndHandler);
  }

  destroy(): void {
    if (this.pointerMoveHandler) this.scene.input.off('pointermove', this.pointerMoveHandler);
    if (this.pointerDownHandler) this.scene.input.off('pointerdown', this.pointerDownHandler);
    if (this.dragStartHandler) this.scene.input.off('dragstart', this.dragStartHandler);
    if (this.dragHandler) this.scene.input.off('drag', this.dragHandler);
    if (this.dragEndHandler) this.scene.input.off('dragend', this.dragEndHandler);
  }

  private getRuntime(): RuntimeConfig {
    return (window.PINGUIN_RUNTIME ?? window.PenguinPet?.runtime ?? {}) as RuntimeConfig;
  }

  private handleWeatherClick(pointer: Phaser.Input.Pointer): boolean {
    const runtime = this.getRuntime();

    if ((runtime as RuntimeConfig & { isSnowing?: boolean }).isSnowing) {
      runtime.emitEvent?.('effects:snow:burst', {
        x: pointer.worldX,
        y: pointer.worldY,
        count: 12,
        source: 'phaser',
      });
      return true;
    }

    if ((runtime as RuntimeConfig & { isRaining?: boolean }).isRaining) {
      const now = Date.now();
      const isDoubleClick = now - this.lastRainClickAt <= this.rainDoubleClickMs;
      this.lastRainClickAt = now;

      runtime.emitEvent?.('effects:lightning:flash', { source: 'phaser' });
      this.pet.setState('scared');
      this.scene.time.delayedCall(900, () => {
        if (this.pet.currentState === 'scared') {
          this.pet.setState('idle');
        }
      });

      if (isDoubleClick) {
        runtime.emitEvent?.('effects:lightning:bolt', {
          x: this.pet.centerX,
          source: 'phaser',
        });
        this.pet.umbrellaLiftOffset = 38;
        this.scene.time.delayedCall(4000, () => {
          this.pet.umbrellaLiftOffset = 0;
        });
      }
      return true;
    }

    return false;
  }

  private feedFish(x: number, y: number): void {
    const runtime = this.getRuntime();
    if (typeof runtime.consumeFishStock !== 'function') return;

    const consumed = runtime.consumeFishStock(1);
    if (!consumed) {
      this.pet.showSpeech('QUERO PEIXEEE!!!!', 1800);
      this.pet.setState('angry');
      this.scene.time.delayedCall(800, () => {
        if (this.pet.currentState === 'angry') {
          this.pet.setState('idle');
        }
      });
      return;
    }

    runtime.emitEvent?.('effects:click', { x, y, source: 'phaser' });
    const targets = this.createFoodDrops(x, y, 1);
    this.pet.enqueueFoodTargets(targets);
  }

  private createFoodDrops(x: number, y: number, count = 1): Array<{ element: HTMLElement; x: number; y: number }> {
    const constants = (window.PenguinPet?.constants ?? {}) as {
      penguinSize?: number;
      halfPenguinSize?: number;
      snowTopRatio?: number;
    };
    const penguinSize = Number(constants.penguinSize) || 120;
    const halfPenguinSize = Number(constants.halfPenguinSize) || penguinSize / 2;
    const snowTopRatio = Number(constants.snowTopRatio) || 0.86;

    const safeCount = Math.max(1, Math.min(12, Math.round(count)));
    const groundTopY = Math.max(
      0,
      Math.min(window.innerHeight * snowTopRatio - penguinSize, window.innerHeight - penguinSize),
    );
    const targetCenterY = groundTopY + halfPenguinSize;
    const targets: Array<{ element: HTMLElement; x: number; y: number }> = [];

    for (let i = 0; i < safeCount; i += 1) {
      const fish = document.createElement('div');
      fish.className = 'food-fish-drop';
      fish.textContent = '🐟';

      const startX = x + (Math.random() - 0.5) * 70;
      const startY = Math.max(0, y - 30 - Math.random() * 50);
      const margin = penguinSize * 1.2;
      const landedX = Math.max(margin, Math.min(startX + (Math.random() - 0.5) * 120, window.innerWidth - margin));
      const landedY = Math.min(window.innerHeight - 20, groundTopY + penguinSize - 14 + Math.random() * 10);

      fish.style.left = `${startX}px`;
      fish.style.top = `${startY}px`;
      document.body.appendChild(fish);

      requestAnimationFrame(() => {
        fish.style.left = `${landedX}px`;
        fish.style.top = `${landedY}px`;
      });

      targets.push({
        element: fish,
        x: landedX,
        y: targetCenterY,
      });
    }

    return targets;
  }
}
