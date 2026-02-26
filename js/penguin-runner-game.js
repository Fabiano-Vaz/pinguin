(() => {
  const pet = window.PenguinPet || {};
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
  };
  const configuredBackgroundImage =
    window.PENGUIN_CONFIG &&
    typeof window.PENGUIN_CONFIG.backgroundImage === "string"
      ? window.PENGUIN_CONFIG.backgroundImage
      : "";
  const runnerBackgroundImage = resolveSprite(
    "runnerBackground",
    "assets/backgroung.png",
  );
  const helicopterVariants = [
    {
      src: resolveSprite("helicopterA", "assets/helicopterA.gif"),
      scale: 5,
    },
    {
      src: resolveSprite("helicopterB", "assets/helicopterB.gif"),
      scale: 8,
    },
  ];

  const STORAGE_KEY_BEST_SCORE = "pinguinRunnerBestScore";

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
    worldSpeed: 220,
    minWorldSpeed: 220,
    maxWorldSpeed: 960,
    speedGainPerSecond: 9,
    gravity: 2350,
    fallGravityMultiplier: 1.32,
    lowJumpGravityMultiplier: 1.7,
    jumpVelocity: -860,
    maxFallSpeed: 1650,
    jumpBufferMs: 140,
    coyoteTimeMs: 110,
    spawnTimerMs: 0,
    spawnGapMinMs: 980,
    spawnGapMaxMs: 1750,
    lastFrameAt: 0,
    worldTimeMs: 0,
    obstacles: [],
    groundDecor: [],
    fishRain: [],
    nextHelicopterIndex: 0,
    nextFishDropScore: 100,
    fishCursorWasEnabledClass: false,
    fishCursorWasEnabledRuntime: null,
    penguin: {
      x: 0,
      y: 0,
      width: 68,
      standingHeight: 68,
      crouchingHeight: 68,
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

  stage.appendChild(hud);
  stage.appendChild(hint);
  stage.appendChild(message);
  stage.appendChild(penguinEl);
  stage.appendChild(ground);
  stage.appendChild(transitionOverlay);
  document.body.appendChild(stage);

  const getPlayfieldHeight = () => Math.floor(window.innerHeight * 0.78);
  const getGroundY = () =>
    Math.max(0, getPlayfieldHeight() - game.penguin.standingHeight + 8);
  const getGroundLineY = () => getGroundY() + game.penguin.standingHeight;

  const setPenguinSprite = (state) => {
    const source = sprites[state] || sprites.running;
    if (penguinEl.src.endsWith(source)) return;
    penguinEl.src = source;
  };

  const getPenguinHeight = () =>
    game.penguin.isCrouching && !game.penguin.isJumping
      ? game.penguin.crouchingHeight
      : game.penguin.standingHeight;

  const getPenguinTopY = () => {
    const currentHeight = getPenguinHeight();
    return game.penguin.y + (game.penguin.standingHeight - currentHeight);
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
    // No runner sway: keep CSS transform animation disabled so the SVG's
    // own internal animation (<animate>/<animateTransform>) can play cleanly.
    penguinEl.style.animation = "";
    penguinEl.style.transform = "none";
  };

  const centerPenguin = () => {
    game.penguin.x = Math.round(window.innerWidth * 0.23);
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
      transitionOverlay.style.transition = "opacity 180ms ease-out";
      transitionOverlay.style.opacity = "0.55";
      setTimeout(() => {
        transitionOverlay.style.transition = "opacity 450ms ease-in";
        transitionOverlay.style.opacity = "0";
      }, 190);
    });
  };

  const shakeStage = () => {
    stage.style.animation = "none";
    void stage.offsetWidth;
    stage.style.animation = "runnerGameShake 380ms ease-in-out";
    setTimeout(() => {
      stage.style.animation = "";
    }, 390);
  };

  const clearObstacles = () => {
    game.obstacles.forEach((obstacle) => obstacle.el.remove());
    game.obstacles = [];
  };

  const clearGroundDecor = () => {
    game.groundDecor.forEach((piece) => piece.remove());
    game.groundDecor = [];
  };

  const updateGroundPresentation = () => {
    const groundLineY = getGroundLineY();
    ground.style.top = `${groundLineY}px`;

    const webviewRunnerBackground =
      configuredBackgroundImage.indexOf("backgroung-dark.png") !== -1
        ? configuredBackgroundImage.replace(
            "backgroung-dark.png",
            "backgroung.png",
          )
        : runnerBackgroundImage;

    stage.style.backgroundImage = `url("${webviewRunnerBackground}")`;
    stage.style.backgroundColor = "#1c2b56";
    stage.style.backgroundSize = "cover";
    stage.style.backgroundPosition = "center bottom";
    stage.style.backgroundRepeat = "no-repeat";
  };

  const createGroundDecor = () => {
    clearGroundDecor();
    const baseline = getGroundLineY();
    const width = window.innerWidth;
    const count = clamp(Math.round(width / 90), 8, 28);

    for (let i = 0; i < count; i += 1) {
      const piece = document.createElement("div");
      piece.className = "runner-obstacle";
      const w = 26 + Math.round(Math.random() * 62);
      const h = 4 + Math.round(Math.random() * 6);
      const x = Math.round((i / count) * width + Math.random() * 40);
      piece.style.opacity = "0.28";
      piece.style.border = "none";
      piece.style.borderRadius = "999px";
      piece.style.background = "rgba(232,245,255,0.55)";
      piece.style.width = `${w}px`;
      piece.style.height = `${h}px`;
      piece.style.left = `${x}px`;
      piece.style.top = `${baseline + 8 + Math.random() * 16}px`;
      stage.appendChild(piece);
      game.groundDecor.push(piece);
    }
  };

  const difficultyLevel = () => {
    const byScore = game.score / 250;
    const byTime = game.worldTimeMs / 16000;
    return clamp(1 + Math.min(byScore, byTime), 1, 7);
  };

  const obstacleTemplates = {
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
    icebergWide: {
      id: "icebergWide",
      minWidth: 54,
      maxWidth: 88,
      minHeight: 14,
      maxHeight: 26,
      topOffset: 9,
      requiresCrouch: false,
      color:
        "linear-gradient(180deg, rgba(243,252,255,0.98), rgba(161,220,241,0.84))",
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
    icebergFlat: {
      id: "icebergFlat",
      minWidth: 62,
      maxWidth: 96,
      minHeight: 18,
      maxHeight: 30,
      topOffset: 9,
      requiresCrouch: false,
      color:
        "linear-gradient(180deg, rgba(241,251,255,0.98), rgba(167,224,243,0.84))",
    },
    airplane: {
      id: "airplane",
      minWidth: 52,
      maxWidth: 72,
      minHeight: 18,
      maxHeight: 26,
      topOffset: -52,
      requiresCrouch: true,
      color:
        "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(167,220,255,0.82))",
    },
  };

  const chooseObstacleTemplate = () => {
    const level = difficultyLevel();
    const roll = Math.random();

    if (level >= 1.5 && roll > 0.8) return obstacleTemplates.airplane;
    if (roll > 0.78) return obstacleTemplates.icebergSpire;
    if (roll > 0.62) return obstacleTemplates.icebergJagged;
    if (roll > 0.42) return obstacleTemplates.icebergTall;
    if (roll > 0.2) return obstacleTemplates.icebergWide;
    return obstacleTemplates.icebergFlat;
  };

  const createObstacleVisual = (el, template, width, height) => {
    el.style.border = "none";
    el.style.boxShadow = "0 7px 14px rgba(0,0,0,0.2)";
    el.style.background = template.color;
    el.style.overflow = "hidden";

    if (template.id === "airplane") {
      el.style.background = "transparent";
      el.style.boxShadow = "none";
      el.style.overflow = "visible";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.filter = "drop-shadow(0 3px 5px rgba(0, 0, 0, 0.28))";
      const heliImg = document.createElement("img");
      const firstIndex = game.nextHelicopterIndex % helicopterVariants.length;
      game.nextHelicopterIndex =
        (game.nextHelicopterIndex + 1) % helicopterVariants.length;
      const selectedVariant = helicopterVariants[firstIndex];
      const fallbackVariant =
        helicopterVariants[(firstIndex + 1) % helicopterVariants.length];
      heliImg.src = selectedVariant.src;
      heliImg.alt = "helicopter";
      heliImg.draggable = false;
      heliImg.style.width = "100%";
      heliImg.style.height = "100%";
      heliImg.style.objectFit = "contain";
      heliImg.style.transform = `scale(${selectedVariant.scale})`;
      heliImg.style.transformOrigin = "center";
      heliImg.style.pointerEvents = "none";
      heliImg.addEventListener(
        "error",
        () => {
          if (heliImg.dataset.fallbackTried === "1") {
            heliImg.remove();
            return;
          }
          heliImg.dataset.fallbackTried = "1";
          heliImg.src = fallbackVariant.src;
          heliImg.style.transform = `scale(${fallbackVariant.scale})`;
        },
      );
      el.appendChild(heliImg);
      return;
    }

    if (template.id === "icebergTall") {
      el.style.clipPath =
        "polygon(14% 100%, 0% 62%, 12% 48%, 28% 22%, 47% 0%, 74% 10%, 100% 42%, 92% 100%)";
      el.style.borderRadius = "10px";
      return;
    }

    if (template.id === "icebergJagged") {
      el.style.clipPath =
        "polygon(0% 100%, 6% 68%, 20% 44%, 33% 54%, 47% 26%, 62% 46%, 75% 24%, 88% 50%, 100% 72%, 100% 100%)";
      el.style.borderRadius = "9px";
      return;
    }

    if (template.id === "icebergSpire") {
      el.style.clipPath =
        "polygon(18% 100%, 10% 70%, 25% 40%, 42% 12%, 54% 0%, 70% 26%, 85% 62%, 78% 100%)";
      el.style.borderRadius = "8px";
      return;
    }

    if (template.id === "icebergFlat") {
      el.style.clipPath =
        "polygon(0% 100%, 4% 70%, 20% 48%, 43% 40%, 66% 44%, 88% 60%, 100% 76%, 100% 100%)";
      el.style.borderRadius = "10px";
      return;
    }

    el.style.clipPath =
      "polygon(0% 100%, 8% 54%, 24% 38%, 48% 28%, 70% 36%, 90% 56%, 100% 100%)";
    el.style.borderRadius = "10px";
  };

  const spawnObstacle = () => {
    const template = chooseObstacleTemplate();
    const obstacle = document.createElement("div");
    obstacle.className = "runner-obstacle";

    const width = Math.round(
      template.minWidth +
        Math.random() * (template.maxWidth - template.minWidth),
    );
    const height = Math.round(
      template.minHeight +
        Math.random() * (template.maxHeight - template.minHeight),
    );

    const spawnX = window.innerWidth + 48;
    const groundLineY = getGroundLineY();
    const y = groundLineY - height + template.topOffset;

    obstacle.style.width = `${width}px`;
    obstacle.style.height = `${height}px`;
    obstacle.style.left = `${spawnX}px`;
    obstacle.style.top = `${y}px`;
    createObstacleVisual(obstacle, template, width, height);

    stage.appendChild(obstacle);

    game.obstacles.push({
      id: template.id,
      el: obstacle,
      x: spawnX,
      y,
      width,
      height,
      requiresCrouch: template.requiresCrouch,
      passed: false,
    });
  };

  const getPenguinBox = () => {
    const crouched = game.penguin.isCrouching && !game.penguin.isJumping;
    const widthInset = Math.round(
      game.penguin.width * (crouched ? 0.16 : 0.12),
    );
    const currentHeight = getPenguinHeight();
    const top = getPenguinTopY();

    const topInset = Math.round(currentHeight * (crouched ? 0.22 : 0.18));
    const bottomInset = Math.round(currentHeight * (crouched ? 0.12 : 0.1));

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

  const getObstacleHitbox = (obstacle) => {
    const horizontalInsetRatio = obstacle.requiresCrouch ? 0.16 : 0.12;
    const verticalInsetRatio = obstacle.requiresCrouch ? 0.12 : 0.08;

    const insetX = Math.round(obstacle.width * horizontalInsetRatio);
    const insetY = Math.round(obstacle.height * verticalInsetRatio);

    return {
      x: obstacle.x + insetX,
      y: obstacle.y + insetY,
      width: Math.max(8, obstacle.width - insetX * 2),
      height: Math.max(8, obstacle.height - insetY * 2),
    };
  };

  const clearFishRain = () => {
    game.fishRain.forEach((entry) => {
      if (entry.timeoutId) clearTimeout(entry.timeoutId);
      if (entry.el && entry.el.isConnected) entry.el.remove();
    });
    game.fishRain = [];
  };

  const spawnScoreFishDrop = () => {
    const fish = document.createElement("div");
    const startX = Math.round(
      window.innerWidth * (0.12 + Math.random() * 0.76),
    );
    const startY = -28;
    const endY = getGroundLineY() - 20;

    fish.textContent = "🐟";
    fish.style.position = "fixed";
    fish.style.left = `${startX}px`;
    fish.style.top = `${startY}px`;
    fish.style.transform = "translate(-50%, -50%) rotate(-12deg)";
    fish.style.fontSize = "24px";
    fish.style.zIndex = "3";
    fish.style.pointerEvents = "none";
    fish.style.transition =
      "top 0.95s ease-in, transform 0.95s ease-in, opacity 0.24s ease";
    fish.style.opacity = "0.95";
    stage.appendChild(fish);

    requestAnimationFrame(() => {
      fish.style.top = `${endY}px`;
      fish.style.transform = "translate(-50%, -50%) rotate(10deg)";
    });

    const timeoutId = setTimeout(() => {
      fish.style.opacity = "0";
      setTimeout(() => {
        if (fish.isConnected) fish.remove();
      }, 240);
    }, 980);

    game.fishRain.push({ el: fish, timeoutId });
  };

  const endGame = () => {
    game.isGameOver = true;
    shakeStage();
    setPenguinSprite("front");

    const scoreInt = Math.floor(game.score);
    if (scoreInt > game.bestScore) {
      game.bestScore = scoreInt;
      trySaveBestScore(game.bestScore);
    }

    setTimeout(() => {
      if (!game.isGameOver) return;
      setPenguinSprite("crying");
    }, 260);

    message.textContent = `Fim de jogo | Pontos ${scoreInt} | Recorde ${game.bestScore} | Space para reiniciar`;
    hint.textContent = "";
  };

  const requestJump = () => {
    game.penguin.jumpQueuedMs = game.jumpBufferMs;
  };

  const performJump = () => {
    game.penguin.isJumping = true;
    game.penguin.velocityY = game.jumpVelocity;
    game.penguin.coyoteTimerMs = 0;
    game.penguin.jumpQueuedMs = 0;
  };

  const updatePenguin = (deltaMs) => {
    const dt = Math.max(0.001, deltaMs / 1000);
    const penguin = game.penguin;
    const groundY = getGroundY();

    penguin.jumpQueuedMs = Math.max(0, penguin.jumpQueuedMs - deltaMs);

    const onGround = penguin.y >= groundY - 0.01;
    if (onGround) {
      penguin.y = groundY;
      penguin.velocityY = Math.max(0, penguin.velocityY);
      penguin.isJumping = false;
      penguin.coyoteTimerMs = game.coyoteTimeMs;
    } else {
      penguin.coyoteTimerMs = Math.max(0, penguin.coyoteTimerMs - deltaMs);
    }

    if (penguin.jumpQueuedMs > 0 && (onGround || penguin.coyoteTimerMs > 0)) {
      performJump();
    }

    if (penguin.isJumping) {
      let gravityMultiplier = 1;

      if (penguin.velocityY > 0) {
        gravityMultiplier = game.fallGravityMultiplier;
      } else if (!penguin.isJumpPressed) {
        gravityMultiplier = game.lowJumpGravityMultiplier;
      }

      penguin.velocityY += game.gravity * gravityMultiplier * dt;
      penguin.velocityY = Math.min(penguin.velocityY, game.maxFallSpeed);
      penguin.y += penguin.velocityY * dt;

      if (penguin.y >= groundY) {
        penguin.y = groundY;
        penguin.velocityY = 0;
        penguin.isJumping = false;
        penguin.coyoteTimerMs = game.coyoteTimeMs;
      }
    }

    if (game.isGameOver) {
      applyPenguinMotionVisual();
      applyPenguinPosition();
      return;
    }

    if (penguin.isJumping) {
      setPenguinSprite("jumping");
    } else if (penguin.isCrouching) {
      setPenguinSprite("crouching");
    } else {
      setPenguinSprite("running");
    }

    applyPenguinMotionVisual();
    applyPenguinPosition();
  };

  const ensureSafeSpawnGap = () => {
    if (game.obstacles.length === 0) return true;

    const last = game.obstacles[game.obstacles.length - 1];
    const minimumGapPx =
      220 +
      Math.min(190, difficultyLevel() * 24) +
      (last.requiresCrouch ? 42 : 0);

    return last.x < window.innerWidth - minimumGapPx;
  };

  const updateObstacles = (deltaMs) => {
    const dt = deltaMs / 1000;
    const penguinBox = getPenguinBox();

    for (let i = game.obstacles.length - 1; i >= 0; i -= 1) {
      const obstacle = game.obstacles[i];
      obstacle.x -= game.worldSpeed * dt;
      obstacle.el.style.left = `${Math.round(obstacle.x)}px`;

      if (!obstacle.passed && obstacle.x + obstacle.width < penguinBox.x) {
        obstacle.passed = true;
        game.score += obstacle.requiresCrouch ? 7 : 5;
      }

      if (
        !game.isGameOver &&
        hasCollision(penguinBox, getObstacleHitbox(obstacle))
      ) {
        endGame();
        return;
      }

      if (obstacle.x + obstacle.width < -42) {
        obstacle.el.remove();
        game.obstacles.splice(i, 1);
      }
    }
  };

  const updateDifficultyAndSpawns = (deltaMs) => {
    game.worldTimeMs += deltaMs;
    game.score += (deltaMs / 1000) * 10;
    while (game.score >= game.nextFishDropScore) {
      spawnScoreFishDrop();
      game.nextFishDropScore += 100;
    }

    game.worldSpeed = clamp(
      game.worldSpeed + game.speedGainPerSecond * (deltaMs / 1000),
      game.minWorldSpeed,
      game.maxWorldSpeed,
    );

    const level = difficultyLevel();
    const spawnRateFactor = clamp(1 - level * 0.08, 0.58, 1);

    game.spawnTimerMs -= deltaMs;
    if (game.spawnTimerMs <= 0 && ensureSafeSpawnGap()) {
      spawnObstacle();
      const baseGap =
        game.spawnGapMinMs +
        Math.random() * (game.spawnGapMaxMs - game.spawnGapMinMs);
      game.spawnTimerMs = baseGap * spawnRateFactor;
    }
  };

  const renderHud = () => {
    const scoreInt = Math.floor(game.score);
    hud.textContent = `Pontos: ${scoreInt}   Recorde: ${game.bestScore}`;
  };

  const frame = (now) => {
    if (!game.active) return;

    if (!game.lastFrameAt) game.lastFrameAt = now;
    const deltaMs = Math.min(40, Math.max(8, now - game.lastFrameAt || 16));
    game.lastFrameAt = now;

    if (!game.isGameOver) {
      updateDifficultyAndSpawns(deltaMs);
    }

    updatePenguin(deltaMs);
    updateObstacles(deltaMs);
    renderHud();

    requestAnimationFrame(frame);
  };

  const resetRound = () => {
    clearObstacles();
    clearFishRain();
    updateGroundPresentation();
    createGroundDecor();

    game.isGameOver = false;
    game.score = 0;
    game.worldSpeed = game.minWorldSpeed;
    game.spawnTimerMs = 860;
    game.lastFrameAt = 0;
    game.worldTimeMs = 0;
    game.nextFishDropScore = 100;
    game.nextHelicopterIndex = 0;

    game.penguin.velocityY = 0;
    game.penguin.isJumping = false;
    game.penguin.isCrouching = false;
    game.penguin.jumpQueuedMs = 0;
    game.penguin.coyoteTimerMs = 0;
    game.penguin.isJumpPressed = false;

    centerPenguin();
    setPenguinSprite("running");

    message.textContent = "";
    hint.textContent = "Space/↑/W pular | ↓/S abaixar | Esc sair";
    renderHud();
  };

  const stopGame = () => {
    clearObstacles();
    clearFishRain();
    game.isGameOver = false;
    game.penguin.isJumpPressed = false;
    game.penguin.isCrouching = false;
    setRunnerMode(false);
    penguinEl.style.animation = "";
    message.textContent = "";
  };

  const startGame = () => {
    setRunnerMode(true);
    resetRound();
    playEnterTransition();
    requestAnimationFrame(frame);
  };

  const isJumpKey = (event) =>
    event.code === "ArrowUp" ||
    event.code === "KeyW" ||
    event.code === "Space" ||
    event.key === " " ||
    event.key === "Spacebar";

  const isCrouchKey = (code) => code === "ArrowDown" || code === "KeyS";

  document.addEventListener("keydown", (event) => {
    if (event.code === "Escape" && game.active) {
      event.preventDefault();
      stopGame();
      return;
    }

    if (isJumpKey(event)) {
      event.preventDefault();

      if (!game.active) {
        startGame();
        return;
      }

      if (game.isGameOver) {
        resetRound();
        return;
      }

      if (!game.penguin.isJumpPressed) {
        game.penguin.isJumpPressed = true;
        requestJump();
      }
      return;
    }

    if (!game.active || game.isGameOver) return;

    if (isCrouchKey(event.code)) {
      event.preventDefault();
      game.penguin.isCrouching = true;
    }
  });

  document.addEventListener("keyup", (event) => {
    if (!game.active || game.isGameOver) return;

    if (isJumpKey(event)) {
      game.penguin.isJumpPressed = false;
      return;
    }

    if (isCrouchKey(event.code)) {
      game.penguin.isCrouching = false;
    }
  });

  window.addEventListener("resize", () => {
    if (!game.active) return;

    centerPenguin();
    updateGroundPresentation();
    createGroundDecor();

    const groundLineY = getGroundLineY();
    game.obstacles.forEach((obstacle) => {
      const template = obstacleTemplates[obstacle.id];
      const topOffset = template ? template.topOffset : 0;
      obstacle.y = groundLineY - obstacle.height + topOffset;
      obstacle.el.style.top = `${obstacle.y}px`;
    });
  });
})();
