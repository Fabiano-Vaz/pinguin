import Phaser from 'phaser';
import type {
  RuntimeConfig,
  RuntimeEventApi,
  RuntimeEventHandler,
  RuntimeEventName,
  RuntimeEventPayloadMap,
} from '../../runtime/types';

type ConnectedRuntime = RuntimeConfig & {
  isRunnerActive?: boolean;
  fishStock?: number;
  isFishCursorEnabled?: boolean;
};

export class PetBridgeSystem {
  private lastRunnerState: boolean | null = null;
  private lastFishStock = 0;
  private lastFishCursorEnabled = true;

  private readonly eventHandlers: Partial<{
    [K in RuntimeEventName]: RuntimeEventHandler<K>;
  }> = {};

  constructor(private readonly scene: Phaser.Scene) {}

  init(): void {
    const runtime = this.getRuntime();
    if (!runtime || typeof runtime.onEvent !== 'function') return;

    this.eventHandlers['runner:mode-changed'] = (payload) => {
      this.applyRunnerState(Boolean(payload.active));
    };

    this.eventHandlers['runner:start-request'] = () => {
      this.setRunnerMode(true, 'system');
    };

    this.eventHandlers['runner:stop-request'] = () => {
      this.setRunnerMode(false, 'system');
    };

    this.eventHandlers['hud:fish-stock-changed'] = (payload) => {
      this.applyFishStock(Number(payload.count) || 0);
    };

    this.eventHandlers['cursor:fish-mode-changed'] = (payload) => {
      this.applyFishCursor(Boolean(payload.enabled));
    };

    this.bind('runner:mode-changed');
    this.bind('runner:start-request');
    this.bind('runner:stop-request');
    this.bind('hud:fish-stock-changed');
    this.bind('cursor:fish-mode-changed');
  }

  destroy(): void {
    const runtime = this.getRuntime();
    if (!runtime || typeof runtime.offEvent !== 'function') return;

    this.unbind('runner:mode-changed');
    this.unbind('runner:start-request');
    this.unbind('runner:stop-request');
    this.unbind('hud:fish-stock-changed');
    this.unbind('cursor:fish-mode-changed');
  }

  update(): void {
    const runtime = this.getRuntime();
    if (!runtime) return;

    this.applyRunnerState(Boolean(runtime.isRunnerActive));
    this.applyFishStock(Number(runtime.fishStock) || 0);
    this.applyFishCursor(runtime.isFishCursorEnabled !== false);
  }

  startRunner(): void {
    this.requestRunnerMode(true);
  }

  stopRunner(): void {
    this.requestRunnerMode(false);
  }

  private requestRunnerMode(active: boolean): void {
    this.emit(active ? 'runner:start-request' : 'runner:stop-request', {
      source: 'phaser',
    });
  }

  private setRunnerMode(active: boolean, source: RuntimeEventPayloadMap['runner:mode-changed']['source']): void {
    const runtime = this.getRuntime();
    if (runtime) {
      runtime.isRunnerActive = active;
    }

    this.emit('runner:mode-changed', {
      active,
      source,
    });
  }

  private applyRunnerState(isActive: boolean): void {
    const scenePlugin = this.scene.scene;
    const canvas = this.scene.game.canvas;
    // Keep Phaser canvas visible so UIScene effects (snow/rain/wind/lightning) remain rendered.
    // Only toggle pointer interaction with runner mode.
    canvas.style.opacity = '1';
    canvas.style.pointerEvents = isActive ? 'auto' : 'none';

    if (this.lastRunnerState === isActive) return;
    this.lastRunnerState = isActive;

    scenePlugin.setVisible(isActive, 'framework:runner');
    this.scene.registry.set('runner.active', isActive);
  }

  private applyFishStock(nextFishStock: number): void {
    const normalized = Math.max(0, Math.round(nextFishStock));
    if (normalized === this.lastFishStock) return;
    this.lastFishStock = normalized;
    this.scene.registry.set('hud.fishStock', normalized);
  }

  private applyFishCursor(enabled: boolean): void {
    if (enabled === this.lastFishCursorEnabled) return;
    this.lastFishCursorEnabled = enabled;
    this.scene.registry.set('cursor.fishEnabled', enabled);
  }

  private bind(eventName: RuntimeEventName): void {
    const runtime = this.getRuntime();
    const handler = this.eventHandlers[eventName];
    if (!runtime || !handler || typeof runtime.onEvent !== 'function') return;
    runtime.onEvent(eventName, handler as never);
  }

  private unbind(eventName: RuntimeEventName): void {
    const runtime = this.getRuntime();
    const handler = this.eventHandlers[eventName];
    if (!runtime || !handler || typeof runtime.offEvent !== 'function') return;
    runtime.offEvent(eventName, handler as never);
  }

  private emit<K extends RuntimeEventName>(eventName: K, payload: RuntimeEventPayloadMap[K]): void {
    const runtime = this.getRuntime();
    if (!runtime || typeof runtime.emitEvent !== 'function') return;
    runtime.emitEvent(eventName, payload);
  }

  private getRuntime(): (ConnectedRuntime & RuntimeEventApi) | undefined {
    return (window.PenguinPet?.runtime ?? window.PINGUIN_RUNTIME) as
      | (ConnectedRuntime & RuntimeEventApi)
      | undefined;
  }
}
