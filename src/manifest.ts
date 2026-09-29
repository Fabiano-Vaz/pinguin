type AssetMap = Record<string, string>;

export const ASSET_FILES: AssetMap = {
  idle: "css:idle",
  default: "css:default",
  running: "css:running",
  runningCrouched: "css:runningCrouched",
  jumping: "css:flying",
  dancing: "css:dancing",
  sleeping: "css:sleeping",
  scared: "css:scared",
  crying: "css:crying",
  beaten: "css:beaten",
  angry: "css:angry",
  scratching: "css:scratching",
  waving: "css:waving",
  shy: "css:shy",
  peeking: "css:peeking",
  laughing: "css:laughing",
  thinking: "css:thinking",
  eating: "css:eating",
  full: "css:full",
  fishing: "css:fishing",
  flying: "css:flying",
  turningBack: "css:turningBack",
  umbrella: "css:umbrella",
  caveirinha: "css:caveirinha",
  deadLying: "css:deadLying",
  trace: "css:trace",
  runnerBackground: "backgroung.png",
  runnerBackgroundDark: "backgroung-dark.png",
  runnerBackgroundDarkB: "backgroung-darkB.png",
  moon: "lua.png",
  plane: "plane.gif",
  helicopterB: "helicopterB.gif",
  snowman: "css:snowman",
  cruzeiro: "css:cruzeiro",
  pondering: "css:pondering",
  happyJump: "css:happyJump",
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

export const buildAssetPaths = (
  assetResolver?: (fileName: string, state: string) => string,
) => {
  const resolve =
    typeof assetResolver === "function"
      ? assetResolver
      : (fileName: string) => `assets/${fileName}`;

  const assets: AssetMap = {};
  for (const [state, fileName] of Object.entries(ASSET_FILES)) {
    assets[state] = fileName.startsWith("css:") ? fileName : resolve(fileName, state);
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
  groundRatio: resolveNumber(
    overrides.groundRatio,
    DEFAULT_CONFIG.groundRatio,
    0.01,
    1,
  ),
  backgroundImage: resolveString(
    overrides.backgroundImage,
    DEFAULT_CONFIG.backgroundImage,
  ),
});

const shared = {
  ASSET_FILES,
  DEFAULT_CONFIG,
  buildAssetPaths,
  getActionStates,
  getMergedConfig,
};

if (typeof globalThis !== "undefined") {
  (
    globalThis as typeof globalThis & { PenguinPetShared?: typeof shared }
  ).PenguinPetShared = shared;
}
