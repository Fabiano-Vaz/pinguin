(() => {
  const shared =
    typeof window !== "undefined" && window.PenguinPetShared
      ? window.PenguinPetShared
      : null;

  const actionStates =
    shared && typeof shared.getActionStates === "function"
      ? shared.getActionStates(
          window.PENGUIN_ASSETS || {},
          (fileName) => `assets/${fileName}`,
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
  const configuredConstants =
    window.PENGUIN_CONFIG && typeof window.PENGUIN_CONFIG.constants === "object"
      ? window.PENGUIN_CONFIG.constants
      : {};
  const configuredPet =
    configuredConstants && typeof configuredConstants.pet === "object"
      ? configuredConstants.pet
      : {};

  const mergeConfigSection = (defaults, overrides) => {
    if (!overrides || typeof overrides !== "object") return { ...defaults };
    return { ...defaults, ...overrides };
  };

  const speechConfig = mergeConfigSection(
    {
      baseIntervalMs: 30000,
      intervalJitterMs: 15000,
      showChance: 0.45,
      emotionDurationMultiplier: 1.0,
      emotionMinDurationMs: 300,
      laughMinDurationMs: 900,
      laughFallbackDurationMs: 2000,
      laughFirstRatio: 0.4,
      laughNeutralRatio: 0.2,
      bubbleDefaultDurationMs: 3000,
      bubbleViewportMarginPx: 8,
      bubbleTopOffsetPx: 24,
      bubbleBelowOffsetPx: 16,
      bubbleContentFallbackHeightPx: 47,
      bubbleDotSpecs: [
        { size: 10, gap: 10 },
        { size: 7, gap: 19 },
        { size: 4, gap: 27 },
      ],
    },
    configuredPet.speech || configuredConstants.speech,
  );

  const motionConfig = mergeConfigSection(
    {
      jumpArcDistanceCapPx: 70,
      jumpArcApexMinPx: 10,
      jumpArcApexMaxPx: 28,
      jumpArcApexBasePx: 12,
      jumpArcApexDistanceFactor: 0.12,
      jumpArcDurationMinMs: 380,
      jumpArcDurationMaxMs: 620,
      jumpArcDurationBaseMs: 420,
      jumpArcDurationDistanceFactor: 2.1,
      fallGravityPxPerSec2: 1900,
      fallMaxVelocityPxPerSec: 1400,
      walkAwayReturnDurationMs: 2200,
      walkAwayReturnDelayMs: 700,
      walkAwayFinalSpeechDurationMs: 3200,
      walkAwayAiUnlockDelayMs: 3300,
      walkAwayOffscreenPaddingPx: 12,
      walkAwayExitMinVisualScale: 0.22,
      walkAwayExitScaleReductionFactor: 0.78,
      walkAwayReturnStartVisualScale: 0.55,
      walkMaxYOffsetRatio: 0.13,
      flyMinYOffsetPx: 90,
      flyRandomYOffsetPx: 20,
      randomTargetInsetMinPx: 18,
      randomTargetInsetMaxPx: 70,
      randomTargetInsetRatio: 0.12,
      randomTargetEdgeJitterPx: 24,
      randomShortWalkMaxOffsetPx: 120,
      randomShortWalkSideInsetPx: 16,
    },
    configuredPet.motion || configuredConstants.motion,
  );

  const petConfig = {
    speech: speechConfig,
    motion: motionConfig,
    prelude: {
      emotions: ["shy"],
      emotionDurationMs: 1600,
      idleDurationMs: 350,
      chance: 0.06,
    },
    behavior: {
      delayMinMs: 5000,
      delayVariationMs: 7000,
      stepTransitionDelayMs: 600,
      stepTransitionDelayVariationMs: 600,
    },
    speed: {
      walk: 1.5,
      walkFast: 2.2,
      chase: 2.2,
      flee: 2.8,
    },
    mouse: {
      idleTriggerMs: 5000,
      idleReactionCooldownMs: 12000,
    },
    environment: {
      snowActiveDurationMs: 15000,
      snowCooldownDurationMs: 1800000,
      snowSpawnIntervalMs: 400,
      rainActiveDurationMs: 40000,
      rainCooldownDurationMs: 600000,
      rainSpawnIntervalMs: 60,
    },
  };

  window.PenguinPet = {
    ...(window.PenguinPet || {}),
    actionStates,
    constants: {
      penguinSize,
      halfPenguinSize: penguinSize / 2,
      snowTopRatio,
      backgroundImage,
      pet: petConfig,
      speech: speechConfig,
      motion: motionConfig,
      BUBBLE_BASE_INTERVAL_MS: speechConfig.baseIntervalMs,
      BUBBLE_INTERVAL_JITTER_MS: speechConfig.intervalJitterMs,
      BUBBLE_SHOW_CHANCE: speechConfig.showChance,
      EMOTION_DURATION_MULTIPLIER: speechConfig.emotionDurationMultiplier,
      PRELUDE_EMOTIONS: petConfig.prelude.emotions,
      PRELUDE_EMOTION_DURATION_MS: petConfig.prelude.emotionDurationMs,
      PRELUDE_IDLE_DURATION_MS: petConfig.prelude.idleDurationMs,
      PRELUDE_CHANCE: petConfig.prelude.chance,
      BEHAVIOR_DELAY_MIN_MS: petConfig.behavior.delayMinMs,
      BEHAVIOR_DELAY_VARIATION_MS: petConfig.behavior.delayVariationMs,
      STEP_TRANSITION_DELAY_MS: petConfig.behavior.stepTransitionDelayMs,
      STEP_TRANSITION_DELAY_VARIATION_MS:
        petConfig.behavior.stepTransitionDelayVariationMs,
      SPEED_WALK: petConfig.speed.walk,
      SPEED_WALK_FAST: petConfig.speed.walkFast,
      SPEED_CHASE: petConfig.speed.chase,
      SPEED_FLEE: petConfig.speed.flee,
      MOUSE_IDLE_TRIGGER_MS: petConfig.mouse.idleTriggerMs,
      MOUSE_IDLE_REACTION_COOLDOWN_MS: petConfig.mouse.idleReactionCooldownMs,
      SNOW_ACTIVE_DURATION_MS: petConfig.environment.snowActiveDurationMs,
      SNOW_COOLDOWN_DURATION_MS: petConfig.environment.snowCooldownDurationMs,
      SNOW_SPAWN_INTERVAL_MS: petConfig.environment.snowSpawnIntervalMs,
      RAIN_ACTIVE_DURATION_MS: petConfig.environment.rainActiveDurationMs,
      RAIN_COOLDOWN_DURATION_MS: petConfig.environment.rainCooldownDurationMs,
      RAIN_SPAWN_INTERVAL_MS: petConfig.environment.rainSpawnIntervalMs,
    },
    runtime: {
      mouseX: window.innerWidth / 2,
      mouseY: window.innerHeight / 2,
      isMouseInsideViewport: true,
      isFishCursorEnabled: true,
    },
  };
})();
