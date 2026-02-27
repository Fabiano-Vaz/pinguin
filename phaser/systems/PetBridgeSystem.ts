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
  private fishHudElement?: HTMLDivElement;
  private fishHudCountElement?: HTMLSpanElement;
  private fishHudClickHandler?: (event: MouseEvent) => void;

  private readonly eventHandlers: Partial<{
    [K in RuntimeEventName]: RuntimeEventHandler<K>;
  }> = {};

  constructor(private readonly scene: Phaser.Scene) {}

  init(): void {
    this.mountFishHud();

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
    this.unmountFishHud();

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
    const runtime = this.getRuntime();
    const hasRunnerScene = Boolean((this.scene.game.scene as unknown as { keys?: Record<string, unknown> }).keys?.['framework:runner']);
    const isLegacyRunnerManaged = runtime?.manageRunnerInLegacy !== false;
    // Keep Phaser canvas visible so UIScene effects (snow/rain/wind/lightning) remain rendered.
    // Only toggle pointer interaction with runner mode.
    canvas.style.opacity = '1';
    canvas.style.pointerEvents = !hasRunnerScene || isLegacyRunnerManaged ? 'none' : isActive ? 'auto' : 'none';

    if (isLegacyRunnerManaged) {
      if (scenePlugin.isActive('framework:runner')) {
        scenePlugin.stop('framework:runner');
      }
      this.lastRunnerState = isActive;
      this.scene.registry.set('runner.active', isActive);
      return;
    }

    if (!hasRunnerScene) {
      if (runtime) runtime.isRunnerActive = false;
      this.lastRunnerState = false;
      this.scene.registry.set('runner.active', false);
      return;
    }

    if (isActive && !scenePlugin.isActive('framework:runner')) {
      scenePlugin.launch('framework:runner', { active: true });
    }

    if (this.lastRunnerState === isActive) return;
    this.lastRunnerState = isActive;

    if (scenePlugin.isActive('framework:runner')) {
      scenePlugin.setVisible(isActive, 'framework:runner');
    }
    this.scene.registry.set('runner.active', isActive);
  }

  private applyFishStock(nextFishStock: number): void {
    const normalized = Math.max(0, Math.round(nextFishStock));
    if (normalized === this.lastFishStock) return;
    this.lastFishStock = normalized;
    this.scene.registry.set('hud.fishStock', normalized);
    if (this.fishHudCountElement) {
      this.fishHudCountElement.textContent = String(normalized);
    }
  }

  private applyFishCursor(enabled: boolean): void {
    document.body.classList.toggle('fish-cursor-enabled', enabled);
    if (enabled === this.lastFishCursorEnabled) return;
    this.lastFishCursorEnabled = enabled;
    this.scene.registry.set('cursor.fishEnabled', enabled);
  }

  private mountFishHud(): void {
    if (!document.body || this.fishHudElement) return;

    const hud = document.createElement('div');
    hud.className = 'fish-stock-hud';

    const icon = document.createElement('span');
    icon.className = 'fish-stock-icon';
    icon.textContent = '🐟';

    const count = document.createElement('span');
    count.className = 'fish-stock-count';
    count.textContent = String(this.lastFishStock);

    hud.appendChild(icon);
    hud.appendChild(count);

    this.fishHudClickHandler = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      this.handleFishHudClick();
    };

    hud.addEventListener('click', this.fishHudClickHandler);
    document.body.appendChild(hud);

    this.fishHudElement = hud;
    this.fishHudCountElement = count;
  }

  private unmountFishHud(): void {
    if (this.fishHudElement && this.fishHudClickHandler) {
      this.fishHudElement.removeEventListener('click', this.fishHudClickHandler);
    }
    this.fishHudElement?.remove();
    this.fishHudElement = undefined;
    this.fishHudCountElement = undefined;
    this.fishHudClickHandler = undefined;
  }

  private handleFishHudClick(): void {
    this.emit('pet:fishing:request', {
      source: 'phaser',
      reason: 'hud',
    });
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
