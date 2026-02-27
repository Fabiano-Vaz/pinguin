// @ts-nocheck
(() => {
  const hostRuntime = window.PINGUIN_RUNTIME || {};
  const runtimeAssets =
    hostRuntime && typeof hostRuntime === "object" && hostRuntime.penguinAssets
      ? hostRuntime.penguinAssets
      : {};
  const runtimeConfig =
    hostRuntime && typeof hostRuntime === "object" && hostRuntime.penguinConfig
      ? hostRuntime.penguinConfig
      : {};
  const assetOverrides = window.PENGUIN_ASSETS || runtimeAssets || {};
  const configOverrides = window.PENGUIN_CONFIG || runtimeConfig || {};

  const shared =
    typeof window !== "undefined" && window.PenguinPetShared
      ? window.PenguinPetShared
      : null;

  const actionStates =
    shared && typeof shared.getActionStates === "function"
      ? shared.getActionStates(
          assetOverrides,
          (fileName) => `assets/${fileName}`,
        )
      : shared && typeof shared.buildAssetPaths === "function"
        ? {
            ...shared.buildAssetPaths((fileName) => `assets/${fileName}`),
            ...assetOverrides,
          }
        : assetOverrides;

  const mergedConfig =
    shared && typeof shared.getMergedConfig === "function"
      ? shared.getMergedConfig(configOverrides)
      : {
          size: Number.isFinite(configOverrides.size) && configOverrides.size > 0
            ? configOverrides.size
            : 120,
          groundRatio: Number.isFinite(configOverrides.groundRatio) &&
            configOverrides.groundRatio > 0 &&
            configOverrides.groundRatio <= 1
              ? configOverrides.groundRatio
              : 0.86,
          backgroundImage:
            typeof configOverrides.backgroundImage === "string" &&
            configOverrides.backgroundImage.length > 0
              ? configOverrides.backgroundImage
              : "assets/backgroung-dark.png",
        };

  const penguinSize = mergedConfig.size;
  const snowTopRatio = mergedConfig.groundRatio;
  const backgroundImage = mergedConfig.backgroundImage;

  window.PenguinPet = {
    ...(window.PenguinPet || {}),
    actionStates,
    constants: {
      penguinSize,
      halfPenguinSize: penguinSize / 2,
      snowTopRatio,
      backgroundImage,
      BUBBLE_BASE_INTERVAL_MS: 30000,
      BUBBLE_INTERVAL_JITTER_MS: 15000,
      BUBBLE_SHOW_CHANCE: 0.45,
      EMOTION_DURATION_MULTIPLIER: 1.0,
      PRELUDE_EMOTIONS: ["shy"],
      PRELUDE_EMOTION_DURATION_MS: 1600,
      PRELUDE_IDLE_DURATION_MS: 350,
      PRELUDE_CHANCE: 0.06,
      BEHAVIOR_DELAY_MIN_MS: 5000,
      BEHAVIOR_DELAY_VARIATION_MS: 7000,
      STEP_TRANSITION_DELAY_MS: 600,
      STEP_TRANSITION_DELAY_VARIATION_MS: 600,
      SPEED_WALK: 1.5,
      SPEED_WALK_FAST: 2.2,
      SPEED_CHASE: 2.2,
      SPEED_FLEE: 2.8,
      MOUSE_IDLE_TRIGGER_MS: 5000,
      MOUSE_IDLE_REACTION_COOLDOWN_MS: 12000,
      SNOW_ACTIVE_DURATION_MS: 15000,
      SNOW_COOLDOWN_DURATION_MS: 1800000,
      SNOW_SPAWN_INTERVAL_MS: 400,
      RAIN_ACTIVE_DURATION_MS: 40000,
      RAIN_COOLDOWN_DURATION_MS: 600000,
      RAIN_SPAWN_INTERVAL_MS: 60,
    },
    runtime: {
      mouseX: window.innerWidth / 2,
      mouseY: window.innerHeight / 2,
      isMouseInsideViewport: true,
      isFishCursorEnabled: true,
      isRunnerActive: Boolean(hostRuntime.isRunnerActive),
      onEvent:
        typeof hostRuntime.onEvent === "function" ? hostRuntime.onEvent : undefined,
      offEvent:
        typeof hostRuntime.offEvent === "function" ? hostRuntime.offEvent : undefined,
      emitEvent:
        typeof hostRuntime.emitEvent === "function"
          ? hostRuntime.emitEvent
          : undefined,
    },
  };
})();

export {};
