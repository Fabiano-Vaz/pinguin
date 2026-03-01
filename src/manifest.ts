type AssetMap = Record<string, string>;

export const ASSET_FILES: AssetMap = {
  idle: "pinguin sentado balançando os pezinhos.svg",
  default: "pinguin.svg",
  running: "pinguin correndo.svg",
  runningCrouched: "pinguin correndo abaixado.svg",
  jumping: "pinguin voando.svg",
  dancing: "pinguin dançando.svg",
  sleeping: "pinguin dormindo.svg",
  scared: "pinguin assustado.svg",
  crying: "pinguin chorando.svg",
  beaten: "pinguin apanhando.svg",
  angry: "pinguin com raiva.svg",
  scratching: "pinguin coçando a cabecinha.svg",
  waving: "pinguin dando tchau.svg",
  shy: "pinguin envergonhado.svg",
  peeking: "pinguin espiando curioso.svg",
  laughing: "pinguin gargalhando.svg",
  thinking: "pinguin-apaixonado.svg",
  eating: "pinguin comendo peixe.svg",
  full: "pinguim cheio.svg",
  fishing: "pinguin pescando no gelo.svg",
  flying: "pinguin voando.svg",
  turningBack: "pinguin de costas.svg",
  umbrella: "umbrella.svg",
  caveirinha: "pinguin caveirinha.svg",
  deadLying: "pinguin mortinho deitado no chão.svg",
  trace: "trace.svg",
  runnerBackground: "backgroung.png",
  runnerBackgroundDark: "backgroung-dark.png",
  runnerBackgroundDarkB: "backgroung-darkB.png",
  moon: "lua.png",
  helicopterA: "helicopterA.gif",
  helicopterB: "helicopterB.gif",
  snowman: "snowman.svg",
};

export const DEFAULT_CONFIG = {
  size: 68,
  groundRatio: 0.86,
  backgroundImage: "assets/backgroung-dark.png",
};

const resolveNumber = (
  value: unknown,
  fallback: number,
  min?: number,
  max?: number,
) => {
  if (!Number.isFinite(value)) return fallback;
  if (typeof min === "number" && (value as number) < min) return fallback;
  if (typeof max === "number" && (value as number) > max) return fallback;
  return value as number;
};

const resolveString = (value: unknown, fallback: string) => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

export const buildAssetPaths = (assetResolver?: (fileName: string, state: string) => string) => {
  const resolve =
    typeof assetResolver === "function"
      ? assetResolver
      : (fileName: string) => `assets/${fileName}`;

  const assets: AssetMap = {};
  for (const [state, fileName] of Object.entries(ASSET_FILES)) {
    assets[state] = resolve(fileName, state);
  }
  return assets;
};

export const getActionStates = (
  assetOverrides: Record<string, string> = {},
  assetResolver?: (fileName: string, state: string) => string,
) => {
  const defaults = buildAssetPaths(assetResolver);
  if (!assetOverrides || typeof assetOverrides !== "object") {
    return defaults;
  }

  const merged = { ...defaults };
  for (const state of Object.keys(ASSET_FILES)) {
    const candidate = assetOverrides[state];
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      merged[state] = candidate;
    }
  }

  return merged;
};

export const getMergedConfig = (overrides: Record<string, unknown> = {}) => ({
  size: resolveNumber(overrides.size, DEFAULT_CONFIG.size, 1),
  groundRatio: resolveNumber(overrides.groundRatio, DEFAULT_CONFIG.groundRatio, 0.01, 1),
  backgroundImage: resolveString(overrides.backgroundImage, DEFAULT_CONFIG.backgroundImage),
});

const shared = {
  ASSET_FILES,
  DEFAULT_CONFIG,
  buildAssetPaths,
  getActionStates,
  getMergedConfig,
};

if (typeof globalThis !== "undefined") {
  (globalThis as typeof globalThis & { PenguinPetShared?: typeof shared }).PenguinPetShared =
    shared;
}
