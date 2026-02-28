(() => {
  const runner = window.PenguinRunnerGame;
  if (!runner) return;

  const runnerConfig = runner.runnerConfig || {};
  const { pet, game, elements } = runner;
  const { stage, hint, message, penguinEl, debugCollisionDot } = elements;

  const clearFishRain = () => {
    game.fishRain.forEach((entry) => {
      if (entry.timeoutId) clearTimeout(entry.timeoutId);
      if (entry.el && entry.el.isConnected) entry.el.remove();
    });
    game.fishRain = [];
  };

  const spawnScoreFishDrop = () => {
    const fish = document.createElement("div");
    const startX = Math.round(window.innerWidth * (0.12 + Math.random() * 0.76));
    const startY = -28;
    const endY = runner.getGroundLineY() - 20;

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
    runner.shakeStage();
    runner.setPenguinSprite("front");

    const scoreInt = Math.floor(game.score);
    if (scoreInt > game.bestScore) {
      game.bestScore = scoreInt;
      runner.trySaveBestScore(game.bestScore);
    }

    setTimeout(() => {
      if (!game.isGameOver) return;
      const randomReaction =
        runner.LOSS_REACTION_STATES[
          Math.floor(Math.random() * runner.LOSS_REACTION_STATES.length)
        ];
      runner.setPenguinSprite(randomReaction);
    }, 260);

    message.textContent = `Fim de jogo | Pontos ${scoreInt} | Recorde ${game.bestScore} | Space para reiniciar`;
    hint.textContent = "";
  };

  runner.actions.endGame = endGame;

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
    const groundY = runner.getGroundY();

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
      if (penguin.isCrouching) {
        gravityMultiplier = Math.max(gravityMultiplier, game.diveGravityMultiplier);
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
      runner.applyPenguinMotionVisual();
      runner.applyPenguinPosition();
      return;
    }

    if (penguin.isJumping) {
      runner.setPenguinSprite("jumping");
    } else if (penguin.isCrouching) {
      runner.setPenguinSprite("crouching");
    } else {
      runner.setPenguinSprite("running");
    }

    runner.applyPenguinMotionVisual();
    runner.applyPenguinPosition();
  };

  const updateDifficultyAndSpawns = (deltaMs) => {
    game.worldTimeMs += deltaMs;
    game.score += (deltaMs / 1000) * (runnerConfig.scorePerSecond || 10);

    while (game.score >= game.nextFishDropScore) {
      spawnScoreFishDrop();
      const runtime = (window.PenguinPet && window.PenguinPet.runtime) || pet.runtime;
      if (runtime && typeof runtime.addFishStock === "function") {
        runtime.addFishStock(1);
      }
      game.nextFishDropScore += runnerConfig.fishDropEveryScore || 100;
    }

    game.worldSpeed = runner.clamp(
      game.worldSpeed + game.speedGainPerSecond * (deltaMs / 1000),
      game.minWorldSpeed,
      game.maxWorldSpeed,
    );

    const level = runner.difficultyLevel();
    const spawnRateFactor = runner.clamp(
      1 - level * 0.08,
      runnerConfig.spawnRateFactorFloor || 0.15,
      1,
    );

    game.spawnTimerMs -= deltaMs;
    if (game.spawnTimerMs <= 0 && runner.ensureSafeSpawnGap()) {
      runner.spawnObstacle();
      const baseGap =
        game.spawnGapMinMs + Math.random() * (game.spawnGapMaxMs - game.spawnGapMinMs);
      game.spawnTimerMs = baseGap * spawnRateFactor;
    }
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
    runner.updateObstacles(deltaMs);
    if (runner.DEBUG) {
      const penguinBox = runner.getPenguinBox();
      const obstacleBoxes = game.obstacles.map((obstacle) =>
        runner.getObstacleHitbox(obstacle),
      );
      runner.renderDebugHitboxes(penguinBox, obstacleBoxes);
    } else {
      runner.clearDebugHitboxes();
    }
    runner.updateRunnerBackgroundMotion(deltaMs);
    runner.updateGroundDecorMotion(deltaMs);
    runner.renderHud();

    requestAnimationFrame(frame);
  };

  const resetRound = () => {
    runner.clearObstacles();
    clearFishRain();
    game.backgroundScrollX = 0;
    runner.updateGroundPresentation();
    runner.createGroundDecor();

    game.isGameOver = false;
    game.score = 0;
    game.worldSpeed = game.minWorldSpeed;
    game.spawnTimerMs = runnerConfig.initialSpawnTimerMs || 860;
    game.lastFrameAt = 0;
    game.worldTimeMs = 0;
    game.nextHelicopterIndex = 0;
    game.nextFishDropScore = runnerConfig.fishDropEveryScore || 100;
    game.debugLastCollisionAt = 0;

    if (game.debugCollisionHideTimeoutId) {
      clearTimeout(game.debugCollisionHideTimeoutId);
      game.debugCollisionHideTimeoutId = 0;
    }
    debugCollisionDot.classList.remove("is-visible");
    runner.clearDebugHitboxes();

    game.penguin.velocityY = 0;
    game.penguin.isJumping = false;
    game.penguin.isCrouching = false;
    game.penguin.jumpQueuedMs = 0;
    game.penguin.coyoteTimerMs = 0;
    game.penguin.isJumpPressed = false;

    runner.centerPenguin();
    runner.setPenguinSprite("running");

    message.textContent = "";
    hint.textContent = "Space/↑/W pular | ↓/S abaixar | Esc sair";
    runner.renderHud();
  };

  const stopGame = () => {
    runner.clearObstacles();
    clearFishRain();
    game.isGameOver = false;
    game.penguin.isJumpPressed = false;
    game.penguin.isCrouching = false;

    if (game.debugCollisionHideTimeoutId) {
      clearTimeout(game.debugCollisionHideTimeoutId);
      game.debugCollisionHideTimeoutId = 0;
    }

    debugCollisionDot.classList.remove("is-visible");
    runner.clearDebugHitboxes();
    runner.setRunnerMode(false);
    penguinEl.style.animation = "";
    message.textContent = "";
  };

  const startGame = () => {
    runner.setRunnerMode(true);
    resetRound();
    runner.playEnterTransition();
    requestAnimationFrame(frame);
  };

  const isJumpKey = (event) =>
    event.code === "ArrowUp" ||
    event.code === "KeyW" ||
    event.code === "Space" ||
    event.key === " " ||
    event.key === "Spacebar";

  const isStartKey = (event) =>
    event.code === "Space" || event.key === " " || event.key === "Spacebar";

  const isCrouchKey = (code) => code === "ArrowDown" || code === "KeyS";

  document.addEventListener("keydown", (event) => {
    if (event.code === "Escape" && game.active) {
      event.preventDefault();
      stopGame();
      return;
    }

    if (!game.active) {
      if (isStartKey(event)) {
        event.preventDefault();
        startGame();
      }
      return;
    }

    if (isJumpKey(event)) {
      event.preventDefault();

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

    runner.centerPenguin();
    runner.updateGroundPresentation();
    runner.createGroundDecor();
    runner.realignObstacleY();
  });
})();
