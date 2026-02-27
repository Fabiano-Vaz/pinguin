(() => {
  const pet = window.PenguinPet || {};
  const constants = pet.constants || {};
  const runnerConfig =
    (constants.game && constants.game.runner) || constants.runner || {};
  const actionStates = pet.actionStates || window.PENGUIN_ASSETS || {};

  const resolveSprite = (assetKey, fallbackPath) => {
    const byKey = actionStates[assetKey];
    if (typeof byKey === "string" && byKey.length > 0) return byKey;
    return fallbackPath;
  };

  const sprites = {
    running: resolveSprite("running", "assets/pinguin correndo.svg"),
    crouching: resolveSprite(
      "runningCrouched",
      "assets/pinguin correndo abaixado.svg",
    ),
    jumping: resolveSprite("trace", "assets/trace.svg"),
    front: resolveSprite("default", "assets/pinguin.svg"),
    crying: resolveSprite("crying", "assets/pinguin chorando.svg"),
    angry: resolveSprite("angry", "assets/pinguin com raiva.svg"),
    flying: resolveSprite("flying", "assets/pinguin voando.svg"),
    caveirinha: resolveSprite("caveirinha", "assets/pinguin caveirinha.svg"),
  };

  const runnerBackgroundDarkBImage = resolveSprite(
    "runnerBackgroundDarkB",
    "assets/backgroung-darkB.png",
  );
  const snowmanObstacleImage = resolveSprite("snowman", "assets/snowman.svg");

  const helicopterVariants = [
    {
      key: "A",
      src: resolveSprite("helicopterA", "assets/helicopterA.gif"),
      scale: 4,
      hitboxInsetRatios: {
        left: 0.28,
        right: 0.5,
        top: 0.22,
        bottom: 0.26,
      },
    },
    {
      key: "B",
      src: resolveSprite("helicopterB", "assets/helicopterB.gif"),
      scale: 8,
      hitboxInsetRatios: {
        left: 0.39,
        right: 0.61,
        top: 0.31,
        bottom: 0.37,
      },
    },
  ];

  const RUNNER_PENGUIN_VISUAL_OFFSET_Y = runnerConfig.penguinVisualOffsetYPx || 10;
  const DEBUG = Boolean(runnerConfig.debug);
  const RUNNER_BACKGROUND_SCROLL_SPEED_PX_PER_SEC =
    runnerConfig.backgroundScrollSpeedPxPerSec || 8;
  const RUNNER_GROUND_DECOR_SCROLL_SPEED_PX_PER_SEC =
    runnerConfig.groundDecorScrollSpeedPxPerSec || 180;

  const STORAGE_KEY_BEST_SCORE =
    runnerConfig.storageBestScoreKey || "pinguinRunnerBestScore";

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const tryLoadBestScore = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_BEST_SCORE);
      const value = Number(raw);
      return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
    } catch {
      return 0;
    }
  };

  const trySaveBestScore = (value) => {
    try {
      localStorage.setItem(STORAGE_KEY_BEST_SCORE, String(Math.floor(value)));
    } catch {
      // Ignore storage failures (private modes or restricted environments).
    }
  };

  const game = {
    active: false,
    isGameOver: false,
    score: 0,
    bestScore: tryLoadBestScore(),
    worldSpeed: runnerConfig.worldSpeedInitial || 220,
    minWorldSpeed: runnerConfig.worldSpeedMin || 220,
    maxWorldSpeed: runnerConfig.worldSpeedMax || 960,
    speedGainPerSecond: runnerConfig.worldSpeedGainPerSec || 9,
    gravity: runnerConfig.gravityPxPerSec2 || 2350,
    fallGravityMultiplier: runnerConfig.fallGravityMultiplier || 1.32,
    lowJumpGravityMultiplier: runnerConfig.lowJumpGravityMultiplier || 1.7,
    jumpVelocity: runnerConfig.jumpVelocityPxPerSec || -860,
    maxFallSpeed: runnerConfig.maxFallSpeedPxPerSec || 1650,
    jumpBufferMs: runnerConfig.jumpBufferMs || 140,
    coyoteTimeMs: runnerConfig.coyoteTimeMs || 110,
    spawnTimerMs: 0,
    spawnGapMinMs: runnerConfig.spawnGapMinMs || 980,
    spawnGapMaxMs: runnerConfig.spawnGapMaxMs || 1750,
    lastFrameAt: 0,
    worldTimeMs: 0,
    obstacles: [],
    groundDecor: [],
    fishRain: [],
    nextHelicopterIndex: 0,
    nextFishDropScore: runnerConfig.fishDropEveryScore || 100,
    backgroundScrollX: 0,
    fishCursorWasEnabledClass: false,
    fishCursorWasEnabledRuntime: null,
    debugLastCollisionAt: 0,
    debugCollisionHideTimeoutId: 0,
    penguin: {
      x: 0,
      y: 0,
      width: runnerConfig.penguinWidthPx || 68,
      standingHeight: runnerConfig.penguinStandingHeightPx || 68,
      crouchingHeight: runnerConfig.penguinCrouchingHeightPx || 68,
      velocityY: 0,
      isJumping: false,
      isCrouching: false,
      jumpQueuedMs: 0,
      coyoteTimerMs: 0,
      isJumpPressed: false,
    },
  };

  const stage = document.createElement("div");
  stage.className = "runner-game";

  const hud = document.createElement("div");
  hud.className = "runner-hud";

  const hint = document.createElement("div");
  hint.className = "runner-hint";
  hint.textContent = "Space/↑/W pular | ↓/S abaixar | Esc sair";

  const message = document.createElement("div");
  message.className = "runner-message";

  const penguinEl = document.createElement("img");
  penguinEl.className = "runner-penguin";
  penguinEl.src = sprites.running;
  penguinEl.draggable = false;
  let currentPenguinSpriteState = "running";

  const ground = document.createElement("div");
  ground.className = "runner-ground";

  const runnerAnimationStyle = document.createElement("style");
  runnerAnimationStyle.textContent = `
    @keyframes runnerGameShake {
      0%, 100% { transform: translateX(0) translateY(0); }
      12% { transform: translateX(-7px) translateY(-2px); }
      25% { transform: translateX(7px) translateY(1px); }
      38% { transform: translateX(-6px) translateY(-1px); }
      50% { transform: translateX(6px) translateY(2px); }
      62% { transform: translateX(-5px) translateY(0); }
      75% { transform: translateX(5px) translateY(-1px); }
      88% { transform: translateX(-3px) translateY(1px); }
    }
  `;
  document.head.appendChild(runnerAnimationStyle);

  const transitionOverlay = document.createElement("div");
  transitionOverlay.style.position = "fixed";
  transitionOverlay.style.inset = "0";
  transitionOverlay.style.zIndex = "4";
  transitionOverlay.style.pointerEvents = "none";
  transitionOverlay.style.background = "#000000";
  transitionOverlay.style.opacity = "0";

  const debugCollisionDot = document.createElement("div");
  debugCollisionDot.className = "runner-debug-collision-dot";

  stage.appendChild(hud);
  stage.appendChild(hint);
  stage.appendChild(message);
  stage.appendChild(penguinEl);
  stage.appendChild(ground);
  stage.appendChild(transitionOverlay);
  stage.appendChild(debugCollisionDot);
  document.body.appendChild(stage);

  const getPlayfieldHeight = () =>
    Math.floor(window.innerHeight * (runnerConfig.playfieldHeightRatio || 0.78));
  const getGroundY = () =>
    Math.max(
      0,
      getPlayfieldHeight() -
        game.penguin.standingHeight +
        (runnerConfig.groundOffsetYPx || 8),
    );
  const getGroundLineY = () => getGroundY() + game.penguin.standingHeight;

  const LOSS_REACTION_STATES = ["crying", "angry", "flying", "caveirinha"];

  const setPenguinSprite = (state) => {
    const nextState = sprites[state] ? state : "running";
    if (currentPenguinSpriteState === nextState) return;
    penguinEl.src = sprites[nextState];
    currentPenguinSpriteState = nextState;
  };

  const getPenguinHeight = () =>
    game.penguin.isCrouching && !game.penguin.isJumping
      ? game.penguin.crouchingHeight
      : game.penguin.standingHeight;

  const getPenguinTopY = () => {
    const currentHeight = getPenguinHeight();
    return (
      game.penguin.y +
      (game.penguin.standingHeight - currentHeight) +
      RUNNER_PENGUIN_VISUAL_OFFSET_Y
    );
  };

  const applyPenguinPosition = () => {
    const drawHeight = getPenguinHeight();
    const drawTop = getPenguinTopY();

    penguinEl.style.left = `${game.penguin.x}px`;
    penguinEl.style.top = `${drawTop}px`;
    penguinEl.style.width = `${game.penguin.width}px`;
    penguinEl.style.height = `${drawHeight}px`;
  };

  const applyPenguinMotionVisual = () => {
    // Keep transform animation disabled so the SVG internal animation stays smooth.
    penguinEl.style.animation = "";
    penguinEl.style.transform = "none";
  };

  const centerPenguin = () => {
    game.penguin.x = Math.round(window.innerWidth * (runnerConfig.penguinCenterXRatio || 0.23));
    game.penguin.y = getGroundY();
    applyPenguinPosition();
  };

  const setRunnerMode = (enabled) => {
    game.active = enabled;
    const runtime =
      pet.runtime || (window.PenguinPet && window.PenguinPet.runtime);

    if (enabled) {
      game.fishCursorWasEnabledClass = document.body.classList.contains(
        "fish-cursor-enabled",
      );
      game.fishCursorWasEnabledRuntime =
        runtime && typeof runtime.isFishCursorEnabled === "boolean"
          ? runtime.isFishCursorEnabled
          : null;
      document.body.classList.remove("fish-cursor-enabled");
      if (runtime && typeof runtime.setFishCursorEnabled === "function") {
        runtime.setFishCursorEnabled(false);
      } else if (runtime) {
        runtime.isFishCursorEnabled = false;
      }
    } else {
      if (game.fishCursorWasEnabledClass) {
        document.body.classList.add("fish-cursor-enabled");
      }
      if (runtime && game.fishCursorWasEnabledRuntime !== null) {
        if (typeof runtime.setFishCursorEnabled === "function") {
          runtime.setFishCursorEnabled(game.fishCursorWasEnabledRuntime);
        } else {
          runtime.isFishCursorEnabled = game.fishCursorWasEnabledRuntime;
        }
      }
    }

    document.body.classList.toggle("runner-mode", enabled);
    stage.classList.toggle("active", enabled);
  };

  const playEnterTransition = () => {
    transitionOverlay.style.transition = "none";
    transitionOverlay.style.opacity = "0";
    requestAnimationFrame(() => {
      transitionOverlay.style.transition = `opacity ${runnerConfig.transitionFadeInMs || 180}ms ease-out`;
      transitionOverlay.style.opacity = String(runnerConfig.transitionOverlayMaxOpacity || 0.55);
      setTimeout(() => {
        transitionOverlay.style.transition = `opacity ${runnerConfig.transitionFadeOutMs || 450}ms ease-in`;
        transitionOverlay.style.opacity = "0";
      }, runnerConfig.transitionHoldMs || 190);
    });
  };

  const shakeStage = () => {
    stage.style.animation = "none";
    void stage.offsetWidth;
    stage.style.animation = `runnerGameShake ${runnerConfig.shakeDurationMs || 380}ms ease-in-out`;
    setTimeout(() => {
      stage.style.animation = "";
    }, runnerConfig.shakeResetMs || 390);
  };

  const clearObstacles = () => {
    game.obstacles.forEach((obstacle) => obstacle.el.remove());
    game.obstacles = [];
  };

  const clearGroundDecor = () => {
    game.groundDecor.forEach((piece) => piece.el.remove());
    game.groundDecor = [];
  };

  const updateRunnerBackgroundMotion = (deltaMs = 0) => {
    if (deltaMs > 0 && !game.isGameOver) {
      game.backgroundScrollX +=
        RUNNER_BACKGROUND_SCROLL_SPEED_PX_PER_SEC * (deltaMs / 1000);
    }
    stage.style.backgroundPosition = `${(-game.backgroundScrollX).toFixed(1)}px bottom`;
  };

  const updateGroundPresentation = () => {
    const groundLineY = getGroundLineY();
    ground.style.top = `${groundLineY}px`;

    stage.style.backgroundImage = `url("${runnerBackgroundDarkBImage}")`;
    stage.style.backgroundColor = "#1c2b56";
    stage.style.backgroundSize = "auto 100%";
    updateRunnerBackgroundMotion();
    stage.style.backgroundRepeat = "repeat-x";
  };

  const createGroundDecor = () => {
    clearGroundDecor();
    const baseline = getGroundLineY();
    const width = window.innerWidth;
    const count = clamp(
      Math.round(width / (runnerConfig.groundDecorCountWidthDivisorPx || 90)),
      runnerConfig.groundDecorCountMin || 8,
      runnerConfig.groundDecorCountMax || 28,
    );

    for (let i = 0; i < count; i += 1) {
      const piece = document.createElement("div");
      piece.className = "runner-obstacle";
      const w =
        (runnerConfig.groundDecorWidthMinPx || 26) +
        Math.round(Math.random() * (runnerConfig.groundDecorWidthRangePx || 62));
      const h =
        (runnerConfig.groundDecorHeightMinPx || 4) +
        Math.round(Math.random() * (runnerConfig.groundDecorHeightRangePx || 6));
      const x = Math.round(
        (i / count) * width + Math.random() * (runnerConfig.groundDecorXJitterPx || 40),
      );
      piece.style.opacity = String(runnerConfig.groundDecorOpacity || 0.28);
      piece.style.border = "none";
      piece.style.borderRadius = "999px";
      piece.style.background = "rgba(232,245,255,0.55)";
      piece.style.width = `${w}px`;
      piece.style.height = `${h}px`;
      piece.style.left = `${x}px`;
      const y =
        baseline +
        (runnerConfig.groundDecorYBasePx || 8) +
        Math.random() * (runnerConfig.groundDecorYJitterPx || 16);
      piece.style.top = `${y}px`;
      stage.appendChild(piece);
      game.groundDecor.push({ el: piece, x, y, width: w });
    }
  };

  const updateGroundDecorMotion = (deltaMs) => {
    if (!game.groundDecor.length) return;
    const dt = deltaMs / 1000;
    const width = window.innerWidth;

    game.groundDecor.forEach((piece) => {
      piece.x -= RUNNER_GROUND_DECOR_SCROLL_SPEED_PX_PER_SEC * dt;

      if (piece.x + piece.width < -8) {
        piece.x = width + Math.random() * 80;
      }

      piece.el.style.left = `${Math.round(piece.x)}px`;
    });
  };

  const difficultyLevel = () => {
    const byScore = game.score / (runnerConfig.difficultyScoreDivisor || 250);
    const byTime = game.worldTimeMs / (runnerConfig.difficultyTimeDivisorMs || 16000);
    return clamp(1 + Math.min(byScore, byTime), 1, runnerConfig.difficultyMaxLevel || 7);
  };

  const getPenguinBox = () => {
    const crouched = game.penguin.isCrouching && !game.penguin.isJumping;
    const widthInset = Math.round(
      game.penguin.width *
        (crouched
          ? runnerConfig.penguinHitboxCrouchedWidthInsetRatio || 0.16
          : runnerConfig.penguinHitboxWidthInsetRatio || 0.12),
    );
    const currentHeight = getPenguinHeight();
    const top = getPenguinTopY();

    const topInset = Math.round(
      currentHeight *
        (crouched
          ? runnerConfig.penguinHitboxCrouchedTopInsetRatio || 0.22
          : runnerConfig.penguinHitboxTopInsetRatio || 0.18),
    );
    const bottomInset = Math.round(
      currentHeight *
        (crouched
          ? runnerConfig.penguinHitboxCrouchedBottomInsetRatio || 0.12
          : runnerConfig.penguinHitboxBottomInsetRatio || 0.1),
    );

    return {
      x: game.penguin.x + widthInset,
      y: top + topInset,
      width: game.penguin.width - widthInset * 2,
      height: currentHeight - topInset - bottomInset,
    };
  };

  const hasCollision = (a, b) => {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  };

  const showDebugCollisionDot = (a, b) => {
    if (!DEBUG) return;

    const overlapLeft = Math.max(a.x, b.x);
    const overlapTop = Math.max(a.y, b.y);
    const overlapRight = Math.min(a.x + a.width, b.x + b.width);
    const overlapBottom = Math.min(a.y + a.height, b.y + b.height);
    const hasOverlap = overlapRight > overlapLeft && overlapBottom > overlapTop;

    const centerX = hasOverlap
      ? overlapLeft + (overlapRight - overlapLeft) / 2
      : b.x + b.width / 2;
    const centerY = hasOverlap
      ? overlapTop + (overlapBottom - overlapTop) / 2
      : b.y + b.height / 2;

    debugCollisionDot.style.left = `${Math.round(centerX)}px`;
    debugCollisionDot.style.top = `${Math.round(centerY)}px`;
    debugCollisionDot.classList.add("is-visible");

    if (game.debugCollisionHideTimeoutId) {
      clearTimeout(game.debugCollisionHideTimeoutId);
    }

    game.debugCollisionHideTimeoutId = setTimeout(() => {
      debugCollisionDot.classList.remove("is-visible");
      game.debugCollisionHideTimeoutId = 0;
    }, runnerConfig.debugCollisionHideMs || 160);
  };

  const renderHud = () => {
    const scoreInt = Math.floor(game.score);
    hud.textContent = `Pontos: ${scoreInt}   Recorde: ${game.bestScore}`;
  };

  window.PenguinRunnerGame = {
    pet,
    runnerConfig,
    game,
    sprites,
    snowmanObstacleImage,
    helicopterVariants,
    clamp,
    trySaveBestScore,
    DEBUG,
    LOSS_REACTION_STATES,
    elements: {
      stage,
      hud,
      hint,
      message,
      penguinEl,
      ground,
      debugCollisionDot,
    },
    actions: {
      endGame: null,
    },
    obstacleTemplates: {},
    setPenguinSprite,
    getPenguinHeight,
    getPenguinTopY,
    applyPenguinPosition,
    applyPenguinMotionVisual,
    centerPenguin,
    setRunnerMode,
    playEnterTransition,
    shakeStage,
    clearObstacles,
    clearGroundDecor,
    updateRunnerBackgroundMotion,
    updateGroundPresentation,
    createGroundDecor,
    updateGroundDecorMotion,
    difficultyLevel,
    getPlayfieldHeight,
    getGroundY,
    getGroundLineY,
    getPenguinBox,
    hasCollision,
    showDebugCollisionDot,
    renderHud,
  };
})();
