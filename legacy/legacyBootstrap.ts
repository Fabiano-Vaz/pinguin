import type { RuntimeConfig } from '../runtime/types';

type LegacyModuleLoader = () => Promise<unknown>;

type LegacyLayer = 'background' | 'environment' | 'actor' | 'overlay' | 'orchestration';

type LegacyStep = {
  layer: LegacyLayer;
  load: LegacyModuleLoader;
};

const LEGACY_BOOT_SEQUENCE: LegacyStep[] = [
  { layer: 'orchestration', load: () => import('./layers/orchestration/pet-shared') },
  { layer: 'orchestration', load: () => import('./layers/orchestration/pet-config') },
  { layer: 'overlay', load: () => import('./layers/overlay/pet-content') },
  { layer: 'environment', load: () => import('./layers/environment/pet-effects') },
  { layer: 'actor', load: () => import('./layers/actor/pet-penguin-state') },
  { layer: 'actor', load: () => import('./layers/actor/pet-penguin-speech') },
  { layer: 'actor', load: () => import('./layers/actor/pet-penguin-motion') },
  { layer: 'actor', load: () => import('./layers/actor/pet-penguin-ai') },
  { layer: 'actor', load: () => import('./layers/actor/pet-penguin-interactions') },
  { layer: 'actor', load: () => import('./layers/actor/pet-penguin') },
  { layer: 'orchestration', load: () => import('./layers/orchestration/script') },
  { layer: 'environment', load: () => import('./layers/environment/penguin-runner-game') },
  { layer: 'background', load: async () => undefined },
];

const ensureGlobalConfig = (runtime: RuntimeConfig): void => {
  if (!window.PENGUIN_CONFIG) {
    window.PENGUIN_CONFIG = {
      size: 120,
      groundRatio: 0.86,
      backgroundImage: 'assets/backgroung-dark.png',
    };
  }

  if (runtime.penguinAssets) {
    window.PENGUIN_ASSETS = runtime.penguinAssets;
  }

  if (runtime.penguinConfig) {
    window.PENGUIN_CONFIG = runtime.penguinConfig;
  }
};

const loadCss = (href: string): void => {
  if (document.querySelector(`link[data-pinguin-css=\"${href}\"]`)) {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.setAttribute('data-pinguin-css', href);
  document.head.appendChild(link);
};

export const bootstrapLegacyRuntime = async (runtime: RuntimeConfig): Promise<void> => {
  ensureGlobalConfig(runtime);
  loadCss(runtime.cssHref ?? '/css/style.css');

  for (const step of LEGACY_BOOT_SEQUENCE) {
    await step.load();
  }
};
