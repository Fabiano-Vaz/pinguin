(() => {
  const runner = window.PenguinRunnerGame;
  if (!runner) return;

  const runnerConfig = runner.runnerConfig || {};
  const { game, helicopterVariants, snowmanObstacleImage, elements } = runner;
  const { stage } = elements;
  const obstacleTemplates = runnerConfig.obstacleTemplates || {};

  const chooseObstacleTemplate = () => {
    const level = runner.difficultyLevel();
    const roll = Math.random();

    const airplaneMinLevel = runnerConfig.obstacleAirplaneChanceMinLevel || 1.5;
    const airplaneChance = runnerConfig.obstacleAirplaneChance || 0.2;
    const snowmanHighLevelChance =
      runnerConfig.obstacleSnowmanChanceAtHighLevel || 0.4;
    const snowmanLowLevelChance = runnerConfig.obstacleSnowmanChanceAtLowLevel || 0.4;
    const icebergTallChance = runnerConfig.obstacleIcebergTallChance || 0.6;
    const icebergJaggedChance = runnerConfig.obstacleIcebergJaggedChance || 0.8;

    if (level >= airplaneMinLevel && roll < airplaneChance) {
      return obstacleTemplates.airplane || obstacleTemplates.icebergTall;
    }
    if (level >= airplaneMinLevel && roll < snowmanHighLevelChance) {
      return obstacleTemplates.snowman || obstacleTemplates.icebergTall;
    }
    if (level < airplaneMinLevel && roll < snowmanLowLevelChance) {
      return obstacleTemplates.snowman || obstacleTemplates.icebergTall;
    }
    if (roll < icebergTallChance) {
      return obstacleTemplates.icebergTall || obstacleTemplates.icebergJagged;
    }
    if (roll < icebergJaggedChance) {
      return obstacleTemplates.icebergJagged || obstacleTemplates.icebergSpire;
    }
    return (
      obstacleTemplates.icebergSpire ||
      obstacleTemplates.icebergTall ||
      obstacleTemplates.icebergJagged
    );
  };

  const createObstacleVisual = (el, template) => {
    el.style.border = "none";
    el.style.boxShadow = "0 7px 14px rgba(0,0,0,0.2)";
    el.style.background = template.color;
    el.style.overflow = "hidden";

    if (template.id === "airplane") {
      el.classList.add("runner-obstacle--airplane");
      el.style.background = "transparent";
      el.style.border = "none";
      el.style.boxShadow = "none";
      el.style.overflow = "visible";

      const heliImg = document.createElement("img");
      const firstIndex = game.nextHelicopterIndex % helicopterVariants.length;
      game.nextHelicopterIndex =
        (game.nextHelicopterIndex + 1) % helicopterVariants.length;
      const selectedVariant = helicopterVariants[firstIndex];
      const fallbackVariant =
        helicopterVariants[(firstIndex + 1) % helicopterVariants.length];

      el.dataset.heliVariantKey = selectedVariant.key;
      el.dataset.heliHitboxLeft = String(selectedVariant.hitboxInsetRatios.left);
      el.dataset.heliHitboxRight = String(selectedVariant.hitboxInsetRatios.right);
      el.dataset.heliHitboxTop = String(selectedVariant.hitboxInsetRatios.top);
      el.dataset.heliHitboxBottom = String(selectedVariant.hitboxInsetRatios.bottom);

      heliImg.src = selectedVariant.src;
      heliImg.className = "runner-helicopter";
      heliImg.alt = "helicopter";
      heliImg.draggable = false;
      heliImg.style.setProperty("--heli-scale", selectedVariant.scale);

      heliImg.addEventListener("error", () => {
        if (heliImg.dataset.fallbackTried === "1") {
          heliImg.remove();
          return;
        }

        heliImg.dataset.fallbackTried = "1";
        el.dataset.heliVariantKey = fallbackVariant.key;
        el.dataset.heliHitboxLeft = String(fallbackVariant.hitboxInsetRatios.left);
        el.dataset.heliHitboxRight = String(fallbackVariant.hitboxInsetRatios.right);
        el.dataset.heliHitboxTop = String(fallbackVariant.hitboxInsetRatios.top);
        el.dataset.heliHitboxBottom = String(fallbackVariant.hitboxInsetRatios.bottom);
        heliImg.src = fallbackVariant.src;
        heliImg.style.setProperty("--heli-scale", fallbackVariant.scale);
      });

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

    if (template.id === "snowman") {
      el.classList.add("runner-obstacle--snowman");
      el.style.background = "transparent";
      el.style.border = "none";
      el.style.boxShadow = "none";

      const snowmanImg = document.createElement("img");
      snowmanImg.className = "runner-snowman";
      snowmanImg.src = snowmanObstacleImage;
      snowmanImg.alt = "snowman";
      snowmanImg.draggable = false;
      el.appendChild(snowmanImg);
      return;
    }

    el.style.clipPath =
      "polygon(0% 100%, 8% 54%, 24% 38%, 48% 28%, 70% 36%, 90% 56%, 100% 100%)";
    el.style.borderRadius = "10px";
  };

  const spawnObstacle = () => {
    const template = chooseObstacleTemplate();
    if (!template) return;
    const obstacle = document.createElement("div");
    obstacle.className = "runner-obstacle";

    const width = Math.round(
      template.minWidth + Math.random() * (template.maxWidth - template.minWidth),
    );
    const height = Math.round(
      template.minHeight + Math.random() * (template.maxHeight - template.minHeight),
    );

    const spawnX = window.innerWidth + (runnerConfig.obstacleSpawnOffsetX || 48);
    const groundLineY = runner.getGroundLineY();
    const y = groundLineY - height + template.topOffset;

    obstacle.style.width = `${width}px`;
    obstacle.style.height = `${height}px`;
    obstacle.style.left = `${spawnX}px`;
    obstacle.style.top = `${y}px`;
    createObstacleVisual(obstacle, template);

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

  const getObstacleHitbox = (obstacle) => {
    if (obstacle.id === "airplane") {
      const helicopterEl = obstacle.el.querySelector(".runner-helicopter");
      if (helicopterEl) {
        const rect = helicopterEl.getBoundingClientRect();
        const heliFallback = runnerConfig.helicopterFallbackHitboxRatios || {};
        const leftRatio =
          Number(obstacle.el.dataset.heliHitboxLeft) || heliFallback.left || 0.28;
        const rightRatio =
          Number(obstacle.el.dataset.heliHitboxRight) || heliFallback.right || 0.5;
        const topRatio =
          Number(obstacle.el.dataset.heliHitboxTop) || heliFallback.top || 0.22;
        const bottomRatio =
          Number(obstacle.el.dataset.heliHitboxBottom) || heliFallback.bottom || 0.26;
        const insetLeft = Math.round(rect.width * leftRatio);
        const insetRight = Math.round(rect.width * rightRatio);
        const insetTop = Math.round(rect.height * topRatio);
        const insetBottom = Math.round(rect.height * bottomRatio);
        return {
          x: rect.left + insetLeft,
          y: rect.top + insetTop,
          width: Math.max(8, rect.width - insetLeft - insetRight),
          height: Math.max(8, rect.height - insetTop - insetBottom),
        };
      }
    }

    if (obstacle.id === "snowman") {
      const insetX = Math.round(
        obstacle.width * (runnerConfig.obstacleSnowmanHitboxInsetXRatio || 0.22),
      );
      const insetY = Math.round(
        obstacle.height * (runnerConfig.obstacleSnowmanHitboxInsetYRatio || 0.18),
      );
      return {
        x: obstacle.x + insetX,
        y: obstacle.y + insetY,
        width: Math.max(8, obstacle.width - insetX * 2),
        height: Math.max(8, obstacle.height - insetY * 2),
      };
    }

    const horizontalInsetRatio = obstacle.requiresCrouch
      ? runnerConfig.obstacleHitboxCrouchWidthInsetRatio || 0.16
      : runnerConfig.obstacleHitboxWidthInsetRatio || 0.12;
    const verticalInsetRatio = obstacle.requiresCrouch
      ? runnerConfig.obstacleHitboxCrouchHeightInsetRatio || 0.12
      : runnerConfig.obstacleHitboxHeightInsetRatio || 0.08;

    const insetX = Math.round(obstacle.width * horizontalInsetRatio);
    const insetY = Math.round(obstacle.height * verticalInsetRatio);

    return {
      x: obstacle.x + insetX,
      y: obstacle.y + insetY,
      width: Math.max(8, obstacle.width - insetX * 2),
      height: Math.max(8, obstacle.height - insetY * 2),
    };
  };

  const ensureSafeSpawnGap = () => {
    if (game.obstacles.length === 0) return true;

    const last = game.obstacles[game.obstacles.length - 1];
    const minimumGapPx =
      (runnerConfig.obstacleGapBasePx || 220) +
      Math.min(
        runnerConfig.obstacleGapDifficultyMaxBonusPx || 190,
        runner.difficultyLevel() * (runnerConfig.obstacleGapDifficultyFactor || 24),
      ) +
      (last.requiresCrouch ? runnerConfig.obstacleGapCrouchBonusPx || 42 : 0);

    return last.x < window.innerWidth - minimumGapPx;
  };

  const updateObstacles = (deltaMs) => {
    const dt = deltaMs / 1000;
    const penguinBox = runner.getPenguinBox();

    for (let i = game.obstacles.length - 1; i >= 0; i -= 1) {
      const obstacle = game.obstacles[i];
      obstacle.x -= game.worldSpeed * dt;
      obstacle.el.style.left = `${Math.round(obstacle.x)}px`;

      if (!obstacle.passed && obstacle.x + obstacle.width < penguinBox.x) {
        obstacle.passed = true;
        game.score += obstacle.requiresCrouch
          ? runnerConfig.obstacleScoreCrouch || 7
          : runnerConfig.obstacleScoreDefault || 5;
      }

      const obstacleHitbox = getObstacleHitbox(obstacle);
      if (!game.isGameOver && runner.hasCollision(penguinBox, obstacleHitbox)) {
        if (runner.DEBUG) {
          const now = performance.now();
          if (now - game.debugLastCollisionAt > (runnerConfig.debugCollisionThrottleMs || 80)) {
            runner.showDebugCollisionDot(penguinBox, obstacleHitbox);
            game.debugLastCollisionAt = now;
          }
          continue;
        }

        if (runner.actions && typeof runner.actions.endGame === "function") {
          runner.actions.endGame();
        }
        return;
      }

      if (obstacle.x + obstacle.width < (runnerConfig.obstacleDespawnX || -42)) {
        obstacle.el.remove();
        game.obstacles.splice(i, 1);
      }
    }
  };

  const realignObstacleY = () => {
    const groundLineY = runner.getGroundLineY();
    game.obstacles.forEach((obstacle) => {
      const template = obstacleTemplates[obstacle.id];
      const topOffset = template ? template.topOffset : 0;
      obstacle.y = groundLineY - obstacle.height + topOffset;
      obstacle.el.style.top = `${obstacle.y}px`;
    });
  };

  runner.obstacleTemplates = obstacleTemplates;
  runner.chooseObstacleTemplate = chooseObstacleTemplate;
  runner.spawnObstacle = spawnObstacle;
  runner.getObstacleHitbox = getObstacleHitbox;
  runner.ensureSafeSpawnGap = ensureSafeSpawnGap;
  runner.updateObstacles = updateObstacles;
  runner.realignObstacleY = realignObstacleY;
})();
