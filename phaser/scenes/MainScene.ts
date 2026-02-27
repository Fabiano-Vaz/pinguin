import Phaser from 'phaser';
import { LayerManager } from '../layers/LayerManager';
import { LayerIds } from '../layers/LayerIds';
import { PetBridgeSystem } from '../systems/PetBridgeSystem';

export class MainScene extends Phaser.Scene {
  private layerManager!: LayerManager;
  private petBridgeSystem!: PetBridgeSystem;

  constructor() {
    super('framework:main');
  }

  create(): void {
    this.layerManager = new LayerManager(this);
    this.petBridgeSystem = new PetBridgeSystem(this);

    const overlayLayer = this.layerManager.get(LayerIds.Overlay);
    overlayLayer.setName('phaser-framework-overlay');
  }

  update(): void {
    this.petBridgeSystem.update();
  }
}
