((globalScope) => {
  const ASSET_FILES = {
    idle: "pinguin sentado balançando os pezinhos.svg",
    default: "pinguin.svg",
    running: "pinguin correndo.svg",
    runningCrouched: "pinguin correndo abaixado.svg",
    jumping: "pinguin pulando feliz.svg",
    dancing: "pinguin dançando.svg",
    sleeping: "pinguin dormindo.svg",
    scared: "pinguin assustado.svg",
    crying: "pinguin chorando.svg",
    angry: "pinguin com raiva.svg",
    scratching: "pinguin coçando a cabecinha.svg",
    waving: "pinguin dando tchau.svg",
    shy: "pinguin envergonhado.svg",
    peeking: "pinguin espiando curioso.svg",
    laughing: "pinguin gargalhando.svg",
    thinking: "pinguin-apaixonado.svg",
    eating: "pinguin comendo peixe.svg",
    fishing: "pinguin pescando no gelo.svg",
    flying: "pinguin voando.svg",
    turningBack: "pinguin de costas.svg",
    umbrella: "umbrella.svg",
    caveirinha: "pinguin caveirinha.svg",
    trace: "trace.svg",
    runnerBackground: "backgroung.png",
    runnerBackgroundDark: "backgroung-dark.png",
    runnerBackgroundDarkB: "backgroung-darkB.png",
    helicopterA: "helicopterA.gif",
    helicopterB: "helicopterB.gif",
    snowman: "snowman.svg",
  };

  const DEFAULT_CONFIG = {
    size: 120,
    groundRatio: 0.86,
    backgroundImage: "assets/backgroung-dark.png",
  };

  const resolveNumber = (value, fallback, min, max) => {
    if (!Number.isFinite(value)) return fallback;
    if (typeof min === "number" && value < min) return fallback;
    if (typeof max === "number" && value > max) return fallback;
    return value;
  };

  const resolveString = (value, fallback) => {
    if (typeof value !== "string") return fallback;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  };

  const buildAssetPaths = (assetResolver) => {
    const resolve =
      typeof assetResolver === "function"
        ? assetResolver
        : (fileName) => `assets/${fileName}`;

    const assets = {};
    for (const [state, fileName] of Object.entries(ASSET_FILES)) {
      assets[state] = resolve(fileName, state);
    }
    return assets;
  };

  const getActionStates = (assetOverrides = {}, assetResolver) => {
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

  const getMergedConfig = (overrides = {}) => ({
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

  if (typeof module !== "undefined" && module.exports) {
    module.exports = shared;
  }

  globalScope.PenguinPetShared = shared;
})(typeof globalThis !== "undefined" ? globalThis : window);
