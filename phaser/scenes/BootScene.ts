import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('framework:boot');
  }

  create(): void {
    this.scene.start('framework:main');
  }
}
