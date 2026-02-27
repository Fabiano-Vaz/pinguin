import Phaser from 'phaser';

export class PetBridgeSystem {
  constructor(private readonly scene: Phaser.Scene) {}

  update(): void {
    // Bridge passiva: preserva o comportamento legacy e abre espaço para migracao gradual.
    const runtime = window.PenguinPet?.runtime;
    if (!runtime) return;

    const canvas = this.scene.game.canvas;
    canvas.style.opacity = runtime.isRunnerActive ? '1' : '0';
  }
}
