import Phaser from 'phaser';
import { PetPenguin } from '../entities/PetPenguin';

export class PetStateSystem {
  constructor(private readonly scene: Phaser.Scene, private readonly pet: PetPenguin) {}

  setState(state: string): void {
    this.pet.setState(state);
    this.pet.applyTransform();
  }

  setVisualState(state: string): void {
    this.pet.setVisualState(state);
    this.pet.applyTransform();
  }

  faceTo(x: number): void {
    this.pet.facingRight = x >= this.pet.centerX;
    this.pet.applyTransform();
  }

  update(): void {
    this.pet.applyTransform();
  }
}
