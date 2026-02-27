import type { RuntimeConfig } from '../runtime/types';

type LegacyModuleLoader = () => Promise<unknown>;

const LEGACY_MODULE_LOADERS: LegacyModuleLoader[] = [
  () => import('./modules/pet-shared'),
  () => import('./modules/pet-config'),
  () => import('./modules/pet-content'),
  () => import('./modules/pet-effects'),
  () => import('./modules/pet-penguin-state'),
  () => import('./modules/pet-penguin-speech'),
  () => import('./modules/pet-penguin-motion'),
  () => import('./modules/pet-penguin-ai'),
  () => import('./modules/pet-penguin-interactions'),
  () => import('./modules/pet-penguin'),
  () => import('./modules/script'),
  () => import('./modules/penguin-runner-game'),
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

  for (const loadModule of LEGACY_MODULE_LOADERS) {
    await loadModule();
  }
};
