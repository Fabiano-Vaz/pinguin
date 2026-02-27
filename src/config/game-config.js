(() => {
  const pet = window.PenguinPet || {};
  const constants = pet.constants || {};
  const configuredConstants =
    window.PENGUIN_CONFIG && typeof window.PENGUIN_CONFIG.constants === "object"
      ? window.PENGUIN_CONFIG.constants
      : {};

  const configuredGame =
    configuredConstants && typeof configuredConstants.game === "object"
      ? configuredConstants.game
      : {};

  const mergeConfigSection = (defaults, overrides) => {
    if (!overrides || typeof overrides !== "object") return { ...defaults };
    return { ...defaults, ...overrides };
  };

  const runnerConfig = mergeConfigSection(
    {
      debug: false,
      storageBestScoreKey: "pinguinRunnerBestScore",
      penguinVisualOffsetYPx: 10,
      backgroundScrollSpeedPxPerSec: 8,
      groundDecorScrollSpeedPxPerSec: 180,
      playfieldHeightRatio: 0.78,
      groundOffsetYPx: 8,
      penguinCenterXRatio: 0.23,
      worldSpeedInitial: 220,
      worldSpeedMin: 220,
      worldSpeedMax: 960,
      worldSpeedGainPerSec: 9,
      gravityPxPerSec2: 2350,
      fallGravityMultiplier: 1.32,
      lowJumpGravityMultiplier: 1.7,
      jumpVelocityPxPerSec: -860,
      maxFallSpeedPxPerSec: 1650,
      jumpBufferMs: 140,
      coyoteTimeMs: 110,
      spawnGapMinMs: 980,
      spawnGapMaxMs: 1750,
      initialSpawnTimerMs: 860,
      scorePerSecond: 10,
      fishDropEveryScore: 100,
      difficultyScoreDivisor: 250,
      difficultyTimeDivisorMs: 16000,
      difficultyMaxLevel: 7,
      groundDecorCountWidthDivisorPx: 90,
      groundDecorCountMin: 8,
      groundDecorCountMax: 28,
      groundDecorWidthMinPx: 26,
      groundDecorWidthRangePx: 62,
      groundDecorHeightMinPx: 4,
      groundDecorHeightRangePx: 6,
      groundDecorXJitterPx: 40,
      groundDecorYBasePx: 8,
      groundDecorYJitterPx: 16,
      groundDecorOpacity: 0.28,
      penguinWidthPx: 68,
      penguinStandingHeightPx: 68,
      penguinCrouchingHeightPx: 68,
      transitionFadeInMs: 180,
      transitionHoldMs: 190,
      transitionFadeOutMs: 450,
      transitionOverlayMaxOpacity: 0.55,
      shakeDurationMs: 380,
      shakeResetMs: 390,
      debugCollisionHideMs: 160,
      debugCollisionThrottleMs: 80,
      penguinHitboxWidthInsetRatio: 0.12,
      penguinHitboxCrouchedWidthInsetRatio: 0.16,
      penguinHitboxTopInsetRatio: 0.18,
      penguinHitboxBottomInsetRatio: 0.1,
      penguinHitboxCrouchedTopInsetRatio: 0.22,
      penguinHitboxCrouchedBottomInsetRatio: 0.12,
      obstacleSpawnOffsetX: 48,
      obstacleDespawnX: -42,
      obstacleScoreDefault: 5,
      obstacleScoreCrouch: 7,
      obstacleGapBasePx: 220,
      obstacleGapDifficultyFactor: 24,
      obstacleGapDifficultyMaxBonusPx: 190,
      obstacleGapCrouchBonusPx: 42,
      obstacleAirplaneChanceMinLevel: 1.5,
      obstacleAirplaneChance: 0.2,
      obstacleSnowmanChanceAtHighLevel: 0.4,
      obstacleSnowmanChanceAtLowLevel: 0.4,
      obstacleIcebergTallChance: 0.6,
      obstacleIcebergJaggedChance: 0.8,
      obstacleSnowmanHitboxInsetXRatio: 0.22,
      obstacleSnowmanHitboxInsetYRatio: 0.18,
      obstacleHitboxWidthInsetRatio: 0.12,
      obstacleHitboxHeightInsetRatio: 0.08,
      obstacleHitboxCrouchWidthInsetRatio: 0.16,
      obstacleHitboxCrouchHeightInsetRatio: 0.12,
      helicopterFallbackHitboxRatios: {
        left: 0.28,
        right: 0.5,
        top: 0.22,
        bottom: 0.26,
      },
      obstacleTemplates: {
        icebergTall: {
          id: "icebergTall",
          minWidth: 34,
          maxWidth: 52,
          minHeight: 36,
          maxHeight: 60,
          topOffset: 9,
          requiresCrouch: false,
          color:
            "linear-gradient(180deg, rgba(244,252,255,0.97), rgba(145,214,236,0.86))",
        },
        snowman: {
          id: "snowman",
          minWidth: 56,
          maxWidth: 78,
          minHeight: 64,
          maxHeight: 94,
          topOffset: 9,
          requiresCrouch: false,
          color:
            "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(231,241,252,0.94))",
        },
        icebergJagged: {
          id: "icebergJagged",
          minWidth: 40,
          maxWidth: 60,
          minHeight: 30,
          maxHeight: 50,
          topOffset: 9,
          requiresCrouch: false,
          color:
            "linear-gradient(180deg, rgba(248,253,255,0.98), rgba(132,205,230,0.88))",
        },
        icebergSpire: {
          id: "icebergSpire",
          minWidth: 30,
          maxWidth: 44,
          minHeight: 42,
          maxHeight: 68,
          topOffset: 9,
          requiresCrouch: false,
          color:
            "linear-gradient(180deg, rgba(244,252,255,0.98), rgba(125,196,224,0.9))",
        },
        airplane: {
          id: "airplane",
          minWidth: 52,
          maxWidth: 72,
          minHeight: 18,
          maxHeight: 26,
          topOffset: -52,
          requiresCrouch: true,
          color: "transparent",
        },
      },
    },
    configuredGame.runner || configuredConstants.runner,
  );

  window.PenguinPet = {
    ...pet,
    constants: {
      ...constants,
      game: {
        ...(constants.game || {}),
        runner: runnerConfig,
      },
      runner: runnerConfig,
    },
  };
})();
