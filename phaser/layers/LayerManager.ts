import Phaser from 'phaser';
import type { LayerId } from './LayerIds';
import { LayerIds } from './LayerIds';

export class LayerManager {
  private readonly layers = new Map<LayerId, Phaser.GameObjects.Container>();

  constructor(private readonly scene: Phaser.Scene) {
    const order: LayerId[] = [
      LayerIds.Background,
      LayerIds.Environment,
      LayerIds.Actor,
      LayerIds.Overlay,
    ];

    for (const [index, id] of order.entries()) {
      const layer = this.scene.add.container(0, 0);
      layer.setDepth(index);
      this.layers.set(id, layer);
    }
  }

  get(id: LayerId): Phaser.GameObjects.Container {
    const layer = this.layers.get(id);
    if (!layer) {
      throw new Error(`Layer nao encontrada: ${id}`);
    }
    return layer;
  }
}
