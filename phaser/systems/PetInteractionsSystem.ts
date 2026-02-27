import Phaser from 'phaser';
import { PetPenguin } from '../entities/PetPenguin';
import { PetMotionSystem } from './PetMotionSystem';
import { PetStateSystem } from './PetStateSystem';

export class PetInteractionsSystem {
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

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.pet.onMouseMove(pointer.worldX, pointer.worldY);
      if (!this.pet.isDragging && !this.pet.isMoving) {
        this.stateSystem.faceTo(pointer.worldX);
      }
    });

    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.pet.isDragging) return;
      if (pointer.rightButtonDown()) {
        this.pet.showSpeech('oi');
        return;
      }
      if (Math.random() < 0.35) {
        this.motionSystem.startJumpArc(pointer.worldX, pointer.worldY);
        return;
      }
      this.motionSystem.moveToPosition(pointer.worldX, pointer.worldY, 2.3);
    });

    this.scene.input.on(
      'dragstart',
      (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
        if (gameObject !== this.pet.gameObject) return;
        this.pet.isDragging = true;
        this.pet.isMoving = false;
        this.stateSystem.setVisualState('flying');
      },
    );

    this.scene.input.on(
      'drag',
      (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number, dragY: number) => {
        if (gameObject !== this.pet.gameObject) return;
        this.pet.x = Phaser.Math.Clamp(
          dragX - this.pet.displaySize / 2,
          0,
          Math.max(0, this.scene.scale.width - this.pet.displaySize),
        );
        this.pet.y = this.pet.clampY(dragY - this.pet.displaySize, true);
      },
    );

    this.scene.input.on(
      'dragend',
      (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
        if (gameObject !== this.pet.gameObject) return;
        this.pet.isDragging = false;
        this.stateSystem.setVisualState('idle');
      },
    );
  }
}
