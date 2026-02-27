import Phaser from 'phaser';
import { GameFramework } from './phaser/core/GameFramework';
import { ensureRuntimeBridge } from './runtime/eventBus';
import { installFishEconomy } from './runtime/fishEconomy';
import type { RuntimeConfig } from './runtime/types';
import './runtime/types';
import './styles/framework.css';
import './css/style.css';

window.Phaser = Phaser;

const runtime: RuntimeConfig = ensureRuntimeBridge(window.PINGUIN_RUNTIME ?? {});
runtime.manageRunnerInLegacy = false;
runtime.manageHudInPhaser = true;
runtime.isRunnerActive = false;
installFishEconomy(runtime);

const ensureFrameworkRoots = (): void => {
  const app = document.getElementById('app') ?? document.body.appendChild(document.createElement('div'));
  app.id = 'app';

  if (!document.getElementById('phaser-root')) {
    const phaserRoot = document.createElement('div');
    phaserRoot.id = 'phaser-root';
    app.appendChild(phaserRoot);
  }
};

const waitForPhaserPenguin = async (timeoutMs = 5000): Promise<void> => {
  const startedAt = performance.now();
  while (performance.now() - startedAt < timeoutMs) {
    const pet = window.PenguinPet;
    if (pet?.penguin && pet?.constants && pet?.actionStates) {
      return;
    }
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }
  console.warn('[pinguin] Phaser pet bootstrap timeout.');
};

const start = async (): Promise<void> => {
  ensureFrameworkRoots();

  const framework = new GameFramework();
  framework.start('phaser-root');
  await waitForPhaserPenguin();
};

void start();
