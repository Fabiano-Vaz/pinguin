import type { RuntimeConfig } from '../../runtime/types';

const ASSET_FILES = {
  idle: 'pinguin sentado balançando os pezinhos.svg',
  default: 'pinguin.svg',
  running: 'pinguin correndo.svg',
  runningCrouched: 'pinguin correndo abaixado.svg',
  jumping: 'pinguin pulando feliz.svg',
  dancing: 'pinguin dançando.svg',
  sleeping: 'pinguin dormindo.svg',
  scared: 'pinguin assustado.svg',
  crying: 'pinguin chorando.svg',
  angry: 'pinguin com raiva.svg',
  scratching: 'pinguin coçando a cabecinha.svg',
  waving: 'pinguin dando tchau.svg',
  shy: 'pinguin envergonhado.svg',
  peeking: 'pinguin espiando curioso.svg',
  laughing: 'pinguin gargalhando.svg',
  thinking: 'pinguin-apaixonado.svg',
  eating: 'pinguin comendo peixe.svg',
  fishing: 'pinguin pescando no gelo.svg',
  flying: 'pinguin voando.svg',
  turningBack: 'pinguin de costas.svg',
  umbrella: 'umbrella.svg',
  caveirinha: 'pinguin caveirinha.svg',
  trace: 'trace.svg',
  runnerBackground: 'backgroung.png',
  runnerBackgroundDark: 'backgroung-dark.png',
  runnerBackgroundDarkB: 'backgroung-darkB.png',
  helicopterA: 'helicopterA.gif',
  helicopterB: 'helicopterB.gif',
  snowman: 'snowman.svg',
} as const;

type AssetKey = keyof typeof ASSET_FILES;
type AssetMap = Record<AssetKey, string>;

export type PenguinConfig = {
  size: number;
  groundRatio: number;
  backgroundImage: string;
};

export type PenguinConstants = {
  penguinSize: number;
  halfPenguinSize: number;
  snowTopRatio: number;
  backgroundImage: string;
  SNOW_ACTIVE_DURATION_MS: number;
  SNOW_COOLDOWN_DURATION_MS: number;
  SNOW_SPAWN_INTERVAL_MS: number;
  RAIN_ACTIVE_DURATION_MS: number;
  RAIN_COOLDOWN_DURATION_MS: number;
  RAIN_SPAWN_INTERVAL_MS: number;
};

const DEFAULT_CONFIG: PenguinConfig = {
  size: 120,
  groundRatio: 0.86,
  backgroundImage: 'assets/backgroung-dark.png',
};

const resolveAssetUrl = (assetPath: string): string => {
  if (!assetPath) return assetPath;
  if (/^(?:[a-z]+:)?\/\//i.test(assetPath)) return assetPath;
  if (assetPath.startsWith('data:') || assetPath.startsWith('blob:')) return assetPath;
  try {
    return new URL(assetPath, window.location.href).toString();
  } catch {
    return assetPath;
  }
};

export const resolvePenguinAssets = (runtime: RuntimeConfig): AssetMap => {
  const overrides = runtime.penguinAssets ?? {};
  const result = {} as AssetMap;

  for (const [assetKey, fileName] of Object.entries(ASSET_FILES) as [AssetKey, string][]) {
    const override = overrides[assetKey];
    const rawPath = typeof override === 'string' && override.length > 0 ? override : `assets/${fileName}`;
    result[assetKey] = resolveAssetUrl(rawPath);
  }

  return result;
};

export const resolvePenguinConfig = (runtime: RuntimeConfig): PenguinConfig => {
  const overrides = runtime.penguinConfig ?? {};

  return {
    size: Number.isFinite(overrides.size) && Number(overrides.size) > 0 ? Number(overrides.size) : DEFAULT_CONFIG.size,
    groundRatio:
      Number.isFinite(overrides.groundRatio) &&
      Number(overrides.groundRatio) > 0 &&
      Number(overrides.groundRatio) <= 1
        ? Number(overrides.groundRatio)
        : DEFAULT_CONFIG.groundRatio,
    backgroundImage:
      typeof overrides.backgroundImage === 'string' && overrides.backgroundImage.length > 0
        ? resolveAssetUrl(overrides.backgroundImage)
        : resolveAssetUrl(DEFAULT_CONFIG.backgroundImage),
  };
};

export const resolvePenguinConstants = (config: PenguinConfig): PenguinConstants => ({
  penguinSize: config.size,
  halfPenguinSize: config.size / 2,
  snowTopRatio: config.groundRatio,
  backgroundImage: config.backgroundImage,
  SNOW_ACTIVE_DURATION_MS: 15000,
  SNOW_COOLDOWN_DURATION_MS: 1800000,
  SNOW_SPAWN_INTERVAL_MS: 400,
  RAIN_ACTIVE_DURATION_MS: 40000,
  RAIN_COOLDOWN_DURATION_MS: 600000,
  RAIN_SPAWN_INTERVAL_MS: 60,
});
