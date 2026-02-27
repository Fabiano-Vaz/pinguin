import Phaser from 'phaser';
import { PetPenguin } from '../entities/PetPenguin';
import { PetMotionSystem } from './PetMotionSystem';
import { PetStateSystem } from './PetStateSystem';

export class PetAISystem {
  private behaviorEvent?: Phaser.Time.TimerEvent;
  private cooldownUntil = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly pet: PetPenguin,
    private readonly motionSystem: PetMotionSystem,
    private readonly stateSystem: PetStateSystem,
  ) {}

  init(): void {
    this.behaviorEvent = this.scene.time.addEvent({
      delay: 1200,
      loop: true,
      callback: () => this.tickBehavior(),
    });
  }

  destroy(): void {
    this.behaviorEvent?.destroy();
    this.behaviorEvent = undefined;
  }

  update(): void {
    const runtime = this.pet.getRuntime();
    if (runtime.isMouseInsideViewport && Number.isFinite(runtime.mouseX)) {
      this.stateSystem.faceTo(Number(runtime.mouseX));
    }
  }

  private tickBehavior(): void {
    if (this.pet.isDragging || this.pet.isFishingActive) return;
    if (this.scene.time.now < this.cooldownUntil) return;
    if (this.pet.isMoving) return;

    const runtime = this.pet.getRuntime();
    const mx = Number(runtime.mouseX);
    const my = Number(runtime.mouseY);
    if (runtime.isMouseInsideViewport && Number.isFinite(mx) && Number.isFinite(my)) {
      const dx = mx - this.pet.centerX;
      const dy = my - this.pet.centerY;
      const dist = Math.hypot(dx, dy);

      if (dist < 70 && Math.random() < 0.45) {
        this.stateSystem.setVisualState('peeking');
        this.pet.showSpeech('opa');
        this.cooldownUntil = this.scene.time.now + 2200;
        this.scene.time.delayedCall(900, () => this.stateSystem.setVisualState('idle'));
        return;
      }

      if (dist > 180 && dist < 320 && Math.random() < 0.35) {
        this.pet.isChasing = true;
        this.motionSystem.moveToPosition(mx, my, 2.5);
        this.cooldownUntil = this.scene.time.now + 3200;
        this.scene.time.delayedCall(1400, () => {
          this.pet.isChasing = false;
        });
        return;
      }

      if (dist < 45 && Math.random() < 0.4) {
        const fleeX = this.pet.centerX + (dx >= 0 ? -130 : 130);
        const fleeY = this.pet.centerY;
        this.stateSystem.setVisualState('scared');
        this.motionSystem.moveToPosition(fleeX, fleeY, 2.8);
        this.cooldownUntil = this.scene.time.now + 2600;
        return;
      }
    }

    if (Math.random() < 0.55) {
      const target = this.motionSystem.randomTarget(Math.random() < 0.35);
      this.motionSystem.moveToPosition(target.x + this.pet.displaySize / 2, target.y + this.pet.displaySize / 2, 2.1);
      this.cooldownUntil = this.scene.time.now + 1400;
    }
  }
}
