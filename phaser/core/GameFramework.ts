import Phaser from 'phaser';
import { createFrameworkGameConfig } from '../config/gameConfig';

export class GameFramework {
  private game: Phaser.Game | null = null;

  start(parent = 'phaser-root'): void {
    if (this.game) return;
    this.game = new Phaser.Game(createFrameworkGameConfig(parent));

    const canvas = this.game.canvas;
    canvas.setAttribute('data-pinguin-phaser', '1');
    canvas.style.pointerEvents = 'none';
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.zIndex = '0';
    canvas.style.opacity = '1';
  }

  stop(): void {
    if (!this.game) return;
    this.game.destroy(true);
    this.game = null;
  }
}
