(() => {
  const shared =
    typeof window !== "undefined" && window.PenguinPetShared
      ? window.PenguinPetShared
      : null;

  const actionStates =
    shared && typeof shared.getActionStates === "function"
      ? shared.getActionStates(window.PENGUIN_ASSETS || {}, (fileName) =>
          `assets/${fileName}`,
        )
      : shared && typeof shared.buildAssetPaths === "function"
        ? {
            ...shared.buildAssetPaths((fileName) => `assets/${fileName}`),
            ...(window.PENGUIN_ASSETS || {}),
          }
        : window.PENGUIN_ASSETS || {};

  const mergedConfig =
    shared && typeof shared.getMergedConfig === "function"
      ? shared.getMergedConfig(window.PENGUIN_CONFIG || {})
      : {
          size:
            window.PENGUIN_CONFIG &&
            Number.isFinite(window.PENGUIN_CONFIG.size) &&
            window.PENGUIN_CONFIG.size > 0
              ? window.PENGUIN_CONFIG.size
              : 120,
          groundRatio:
            window.PENGUIN_CONFIG &&
            Number.isFinite(window.PENGUIN_CONFIG.groundRatio) &&
            window.PENGUIN_CONFIG.groundRatio > 0 &&
            window.PENGUIN_CONFIG.groundRatio <= 1
              ? window.PENGUIN_CONFIG.groundRatio
              : 0.86,
          backgroundImage:
            window.PENGUIN_CONFIG &&
            typeof window.PENGUIN_CONFIG.backgroundImage === "string" &&
            window.PENGUIN_CONFIG.backgroundImage.length > 0
              ? window.PENGUIN_CONFIG.backgroundImage
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
      BUBBLE_BASE_INTERVAL_MS: 60000,
      BUBBLE_INTERVAL_JITTER_MS: 0,
      BUBBLE_SHOW_CHANCE: 0.6,
      EMOTION_DURATION_MULTIPLIER: 1.35,
      PRELUDE_EMOTIONS: ["crying", "shy", "angry"],
      PRELUDE_EMOTION_DURATION_MS: 2200,
      PRELUDE_IDLE_DURATION_MS: 900,
      PRELUDE_CHANCE: 0.35,
      BEHAVIOR_DELAY_MIN_MS: 2400,
      BEHAVIOR_DELAY_VARIATION_MS: 2600,
      STEP_TRANSITION_DELAY_MS: 700,
      STEP_TRANSITION_DELAY_VARIATION_MS: 450,
      SPEED_WALK: 1.5,
      SPEED_WALK_FAST: 2.2,
      SPEED_CHASE: 2.2,
      SPEED_FLEE: 2.8,
      SNOW_ACTIVE_DURATION_MS: 15000,
      SNOW_COOLDOWN_DURATION_MS: 3600000,
      SNOW_SPAWN_INTERVAL_MS: 400,
    },
    runtime: {
      mouseX: window.innerWidth / 2,
      mouseY: window.innerHeight / 2,
      isMouseInsideViewport: true,
      isFishCursorEnabled: true,
    },
  };
})();
