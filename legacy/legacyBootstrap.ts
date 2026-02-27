import type { RuntimeConfig } from '../runtime/types';

type LegacyModuleLoader = () => Promise<unknown>;

const LEGACY_BOOT_MODULES: LegacyModuleLoader[] = [
  () => import('./layers/orchestration/pet-shared'),
  () => import('./layers/orchestration/pet-config'),
  () => import('./layers/overlay/pet-content'),
  () => import('./layers/environment/pet-effects'),
  () => import('./layers/actor/pet-penguin-state'),
  () => import('./layers/actor/pet-penguin-speech'),
  () => import('./layers/actor/pet-penguin-motion'),
  () => import('./layers/actor/pet-penguin-ai'),
  () => import('./layers/actor/pet-penguin-interactions'),
  () => import('./layers/actor/pet-penguin'),
  () => import('./layers/orchestration/script'),
];

const ensureGlobalConfig = (runtime: RuntimeConfig): void => {
  const hostRuntime = window.PINGUIN_RUNTIME ?? {};

  if (!window.PENGUIN_CONFIG) {
    window.PENGUIN_CONFIG = {
      size: 120,
      groundRatio: 0.86,
      backgroundImage: 'assets/backgroung-dark.png',
    };
  }

  const resolvedAssets = runtime.penguinAssets ?? hostRuntime.penguinAssets;
  if (resolvedAssets) {
    window.PENGUIN_ASSETS = resolvedAssets;
  }

  const resolvedConfig = runtime.penguinConfig ?? hostRuntime.penguinConfig;
  if (resolvedConfig) {
    window.PENGUIN_CONFIG = resolvedConfig;
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
  loadCss(runtime.cssHref ?? window.PINGUIN_RUNTIME?.cssHref ?? '/css/style.css');

  for (const loadModule of LEGACY_BOOT_MODULES) {
    await loadModule();
  }
};
