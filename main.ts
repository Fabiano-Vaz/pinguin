import Phaser from 'phaser';
import { bootstrapLegacyRuntime } from './legacy/legacyBootstrap';
import { GameFramework } from './phaser/core/GameFramework';
import type { RuntimeConfig } from './runtime/types';
import './runtime/types';
import './styles/framework.css';

window.Phaser = Phaser;

const runtime: RuntimeConfig = window.PINGUIN_RUNTIME ?? {};

const ensureFrameworkRoots = (): void => {
  const app = document.getElementById('app') ?? document.body.appendChild(document.createElement('div'));
  app.id = 'app';

  if (!document.getElementById('phaser-root')) {
    const phaserRoot = document.createElement('div');
    phaserRoot.id = 'phaser-root';
    app.appendChild(phaserRoot);
  }
};

const start = async (): Promise<void> => {
  ensureFrameworkRoots();

  const framework = new GameFramework();
  framework.start('phaser-root');

  await bootstrapLegacyRuntime(runtime);
};

void start();
