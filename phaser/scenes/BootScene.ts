import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('framework:boot');
  }

  create(): void {
    this.scene.launch('framework:ui');
    this.scene.start('framework:main');
  }
}
