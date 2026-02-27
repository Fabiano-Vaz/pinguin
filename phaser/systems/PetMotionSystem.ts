import Phaser from 'phaser';
import { PetPenguin } from '../entities/PetPenguin';
import { PetStateSystem } from './PetStateSystem';

export class PetMotionSystem {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly pet: PetPenguin,
    private readonly stateSystem: PetStateSystem,
  ) {}

  update(deltaMs: number): void {
    this.pet.updateWalk(deltaMs);
    if (this.pet.isMoving) {
      this.stateSystem.setVisualState('running');
    } else {
      this.stateSystem.setVisualState('idle');
    }
  }

  moveToPosition(x: number, y: number, speed = 2.2, allowAir = false): void {
    this.pet.moveToPosition(x, y, speed, allowAir);
  }

  randomTarget(nearEdge = false): { x: number; y: number } {
    return this.pet.randomTarget(nearEdge);
  }

  startJumpArc(targetX: number, targetY: number): void {
    const startX = this.pet.x;
    const startY = this.pet.y;
    const clampedX = Phaser.Math.Clamp(
      targetX - this.pet.displaySize / 2,
      0,
      Math.max(0, this.scene.scale.width - this.pet.displaySize),
    );
    const clampedY = this.pet.clampY(targetY - this.pet.displaySize / 2, true);
    const duration = 450;
    const apex = 18;

    this.pet.isMoving = false;
    this.stateSystem.setVisualState('flying');

    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration,
      ease: 'Sine.easeInOut',
      onUpdate: (tween) => {
        const t = tween.getValue() ?? 0;
        const arc = 4 * apex * t * (1 - t);
        this.pet.x = startX + (clampedX - startX) * t;
        this.pet.y = startY + (clampedY - startY) * t - arc;
      },
      onComplete: () => {
        this.pet.x = clampedX;
        this.pet.y = clampedY;
        this.pet.isMoving = false;
        this.stateSystem.setVisualState('idle');
      },
    });
  }
}
