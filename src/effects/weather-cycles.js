(() => {
  const effects = (window.PenguinPetEffects = window.PenguinPetEffects || {});

  function isSnowing() {
    const state = effects.state || {};
    return state.snowSpawnIntervalId !== null;
  }

  function isRaining() {
    const state = effects.state || {};
    return state.rainSpawnIntervalId !== null;
  }

  function clearSnowmanEncounter() {
    const state = effects.state || {};
    if (state.snowmanDespawnTimeoutId !== null) {
      clearTimeout(state.snowmanDespawnTimeoutId);
      state.snowmanDespawnTimeoutId = null;
    }
    if (state.snowmanApproachPollIntervalId !== null) {
      clearInterval(state.snowmanApproachPollIntervalId);
      state.snowmanApproachPollIntervalId = null;
    }
    if (state.snowmanFlirtIntervalId !== null) {
      clearInterval(state.snowmanFlirtIntervalId);
      state.snowmanFlirtIntervalId = null;
    }
    if (state.activeSnowmanEl && state.activeSnowmanEl.isConnected) {
      const elToExit = state.activeSnowmanEl;
      elToExit.classList.remove("visible");
      const penguinForExit = window.PenguinPet && window.PenguinPet.penguin;
      const rect = elToExit.getBoundingClientRect();
      const snowmanCenterX = rect.left + rect.width / 2;
      const penguinCenterX =
        penguinForExit && Number.isFinite(penguinForExit.x)
          ? penguinForExit.x +
            (window.PenguinPet &&
            window.PenguinPet.constants &&
            Number.isFinite(window.PenguinPet.constants.halfPenguinSize)
              ? window.PenguinPet.constants.halfPenguinSize
              : 60)
          : window.innerWidth / 2;
      const runDir = snowmanCenterX >= penguinCenterX ? 1 : -1;
      const travelX = runDir * Math.round(window.innerWidth * (0.18 + Math.random() * 0.14));
      const turnDeg = runDir > 0 ? 8 : -8;
      elToExit.style.setProperty("--snowman-exit-x", `${travelX}px`);
      elToExit.style.setProperty("--snowman-exit-turn", `${turnDeg}deg`);
      elToExit.style.setProperty("--snowman-exit-scale", `${(0.94 + Math.random() * 0.08).toFixed(2)}`);
      elToExit.classList.add("exiting-hop");
      const elToRemove = state.activeSnowmanEl;
      setTimeout(() => {
        if (elToRemove.isConnected) elToRemove.remove();
      }, 2100);
    }
    state.activeSnowmanEl = null;
    state.isSnowmanEncounterActive = false;

    const penguin = window.PenguinPet && window.PenguinPet.penguin;
    if (penguin && penguin.snowmanEncounterActive) {
      penguin.snowmanEncounterActive = false;
      if (
        typeof penguin.enforceFoodPriority === "function" &&
        penguin.enforceFoodPriority()
      ) {
        return;
      }
      penguin.aiLocked = false;
      if (
        !penguin.isMoving &&
        !penguin.isDragging &&
        typeof penguin.setState === "function"
      ) {
        penguin.setState("idle");
      }
      if (typeof penguin.scheduleNextBehavior === "function") {
        penguin.scheduleNextBehavior();
      }
    }
  }

  function beginSnowmanEncounter() {
    const constants = effects.getConstants ? effects.getConstants() : {};
    const phrases = effects.getPhrases ? effects.getPhrases() : {};
    const state = effects.state || {};

    if (state.isSnowmanEncounterActive || !isSnowing()) return;
    if (state.snowmanSpawnedThisCycle) return;
    if (isRaining()) return;

    const penguin = window.PenguinPet && window.PenguinPet.penguin;
    if (penguin && (penguin.isFishingActive || penguin.isDragging || penguin.isRanting)) {
      return;
    }

    const snowmanImgSrc =
      (window.PenguinPet &&
        window.PenguinPet.actionStates &&
        window.PenguinPet.actionStates.snowman) ||
      "assets/snowman.svg";
    const snowman = document.createElement("img");
    snowman.className = "snow-event-snowman";
    snowman.src = snowmanImgSrc;
    snowman.alt = "boneco de neve";
    snowman.draggable = false;

    const width = Math.round(68 + Math.random() * 20);
    const floorY = window.innerHeight * (constants.snowTopRatio || 0.86);
    const top = Math.round(floorY - width * 0.95);
    const margin = Math.round((constants.penguinSize || 120) * 0.9);
    const availableWidth = Math.max(40, window.innerWidth - margin * 2);
    let x = Math.round(margin + Math.random() * availableWidth);
    if (penguin && Number.isFinite(penguin.x)) {
      const penguinCenterX = penguin.x + (constants.halfPenguinSize || 60);
      const minGapFromPenguin = Math.round((constants.penguinSize || 120) * 1.25);
      for (let i = 0; i < 8; i += 1) {
        const candidate = Math.round(margin + Math.random() * availableWidth);
        const candidateCenterX = candidate + width / 2;
        if (Math.abs(candidateCenterX - penguinCenterX) >= minGapFromPenguin) {
          x = candidate;
          break;
        }
      }
    }

    snowman.style.width = `${width}px`;
    snowman.style.left = `${x}px`;
    snowman.style.top = `${Math.max(0, top)}px`;
    document.body.appendChild(snowman);
    void snowman.offsetWidth;
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (snowman.isConnected) snowman.classList.add("visible");
      }, 40);
    });

    state.activeSnowmanEl = snowman;
    state.isSnowmanEncounterActive = true;
    state.snowmanSpawnedThisCycle = true;

    if (!penguin) {
      state.snowmanDespawnTimeoutId = setTimeout(clearSnowmanEncounter, 10000);
      return;
    }

    const targetCenterX = x + width / 2;
    const half = constants.halfPenguinSize || 60;
    const sideDirection = targetCenterX < window.innerWidth / 2 ? 1 : -1;
    const sideDistance = width * 0.55 + half * 0.95;
    const standCenterX = Math.max(
      half + 12,
      Math.min(
        window.innerWidth - half - 12,
        targetCenterX + sideDirection * sideDistance,
      ),
    );
    penguin.snowmanEncounterActive = true;
    penguin.aiLocked = true;
    penguin.stepQueue = [];
    penguin.isChasing = false;
    penguin.element.style.animation = "";

    const walkY =
      typeof penguin.getWalkMinY === "function"
        ? penguin.getWalkMinY() + half
        : penguin.y + half;
    if (typeof penguin.moveToPosition === "function") {
      penguin.moveToPosition(standCenterX, walkY, constants.SPEED_WALK || 1.5);
    }

    const startedAt = Date.now();
    const engageWhenClose = () => {
      if (!penguin.snowmanEncounterActive) return;
      if (!state.activeSnowmanEl || !state.activeSnowmanEl.isConnected) {
        clearSnowmanEncounter();
        return;
      }

      const centerX = (penguin.x || 0) + (constants.halfPenguinSize || 60);
      const closeEnough = Math.abs(centerX - standCenterX) <= 18;
      const timedOut = Date.now() - startedAt > 6500;
      if (!closeEnough && !timedOut) return;

      if (state.snowmanApproachPollIntervalId !== null) {
        clearInterval(state.snowmanApproachPollIntervalId);
        state.snowmanApproachPollIntervalId = null;
      }

      penguin.targetX = penguin.x;
      penguin.targetY = penguin.y;
      penguin.isMoving = false;
      const shouldFaceRight = targetCenterX >= centerX;
      if (penguin.facingRight !== shouldFaceRight) {
        penguin.facingRight = shouldFaceRight;
        if (typeof penguin.applyTransform === "function") penguin.applyTransform();
      }

      if (typeof penguin.setState === "function") penguin.setState("peeking");

      const flirtList =
        Array.isArray(phrases.snowmanFlirt) && phrases.snowmanFlirt.length > 0
          ? phrases.snowmanFlirt
          : ["Que boneco lindo..."];

      const phraseCount = Math.random() < 0.5 ? 1 : 2;
      let phraseIndex = 0;
      const speakFlirt = () => {
        if (!penguin.snowmanEncounterActive) return;
        if (phraseIndex >= phraseCount) return;
        phraseIndex += 1;
        if (typeof penguin.setState === "function") penguin.setState("thinking");
        if (typeof penguin.showSpeech === "function") {
          penguin.showSpeech(
            flirtList[Math.floor(Math.random() * flirtList.length)],
            4000,
            false,
          );
        }
      };

      setTimeout(() => {
        speakFlirt();
      }, 900);

      state.snowmanFlirtIntervalId = setInterval(() => {
        if (phraseIndex >= phraseCount) {
          clearInterval(state.snowmanFlirtIntervalId);
          state.snowmanFlirtIntervalId = null;
          return;
        }
        speakFlirt();
      }, 8000);

      state.snowmanDespawnTimeoutId = setTimeout(clearSnowmanEncounter, 12500);
    };

    state.snowmanApproachPollIntervalId = setInterval(engageWhenClose, 120);
    state.snowmanDespawnTimeoutId = setTimeout(clearSnowmanEncounter, 12500);
  }

  function clearRainLightningCycle() {
    const state = effects.state || {};
    if (state.rainLightningTimeoutId !== null) {
      clearTimeout(state.rainLightningTimeoutId);
      state.rainLightningTimeoutId = null;
    }
  }

  function stopShootingStarCycle() {
    const state = effects.state || {};
    if (state.shootingStarTimeoutId !== null) {
      clearTimeout(state.shootingStarTimeoutId);
      state.shootingStarTimeoutId = null;
    }
    if (state.shootingStarReactionTimeoutId !== null) {
      clearTimeout(state.shootingStarReactionTimeoutId);
      state.shootingStarReactionTimeoutId = null;
    }
  }

  function triggerShootingStarEvent() {
    const state = effects.state || {};
    if (typeof effects.createShootingStar === "function") {
      effects.createShootingStar();
    }

    const penguin = window.PenguinPet && window.PenguinPet.penguin;
    const canReact =
      penguin &&
      !penguin.isDragging &&
      !penguin.isWalkingAway &&
      !penguin.isFishingActive &&
      !penguin.isRanting &&
      !penguin.isCaveirinhaMode &&
      !penguin.isFullBellySequenceActive;

    if (!canReact) return;

    penguin.aiLocked = true;
    penguin.stepQueue = [];
    penguin.isChasing = false;
    penguin.isMoving = false;
    penguin.targetX = penguin.x;
    penguin.targetY = penguin.y;
    penguin.element.style.animation = "";

    if (typeof penguin.setState === "function") {
      penguin.setState("turningBack");
    }
    if (typeof penguin.lockVisualSprite === "function") {
      const assets = window.PenguinPet && window.PenguinPet.actionStates
        ? window.PenguinPet.actionStates
        : {};
      const turningBackSrc = assets.turningBack || "assets/pinguin de costas.svg";
      penguin.lockVisualSprite(turningBackSrc, 2000);
    }
    if (typeof penguin.showSpeech === "function") {
      penguin.showSpeech("Vamos fazer um pedido!", 2200, false);
    }
    if (state.shootingStarReactionTimeoutId !== null) {
      clearTimeout(state.shootingStarReactionTimeoutId);
      state.shootingStarReactionTimeoutId = null;
    }
    state.shootingStarReactionTimeoutId = setTimeout(() => {
      state.shootingStarReactionTimeoutId = null;
      if (!penguin || penguin.isDragging || penguin.isWalkingAway) return;
      if (typeof penguin.unlockVisualSprite === "function") {
        penguin.unlockVisualSprite();
      }
      penguin.aiLocked = false;
      if (typeof penguin.setState === "function" && !penguin.isMoving) {
        penguin.setState("idle");
      }
      if (typeof penguin.scheduleNextBehavior === "function") {
        penguin.scheduleNextBehavior();
      }
    }, 2000);
  }

  function startShootingStarCycle() {
    const state = effects.state || {};
    if (state.shootingStarTimeoutId !== null) return;

    const scheduleNext = () => {
      const minDelayMs = 28000;
      const maxDelayMs = 76000;
      const nextDelayMs =
        minDelayMs + Math.random() * Math.max(0, maxDelayMs - minDelayMs);

      state.shootingStarTimeoutId = setTimeout(() => {
        state.shootingStarTimeoutId = null;

        const shouldSkip =
          typeof document !== "undefined" &&
          document.visibilityState === "hidden";
        if (!shouldSkip && !isRaining() && !isSnowing()) {
          triggerShootingStarEvent();
        }

        scheduleNext();
      }, nextDelayMs);
    };

    scheduleNext();
  }

  function scheduleRainLightningCycle() {
    const constants = effects.getConstants ? effects.getConstants() : {};
    const state = effects.state || {};
    clearRainLightningCycle();
    if (!isRaining()) return;

    const minDelay = Number.isFinite(constants.RAIN_LIGHTNING_MIN_DELAY_MS)
      ? constants.RAIN_LIGHTNING_MIN_DELAY_MS
      : 2600;
    const maxDelay = Number.isFinite(constants.RAIN_LIGHTNING_MAX_DELAY_MS)
      ? constants.RAIN_LIGHTNING_MAX_DELAY_MS
      : 6800;
    const delay = Math.round(
      minDelay + Math.random() * Math.max(0, maxDelay - minDelay),
    );

    state.rainLightningTimeoutId = setTimeout(() => {
      state.rainLightningTimeoutId = null;
      if (!isRaining()) return;

      if (typeof effects.createLightningFlash === "function") {
        effects.createLightningFlash();
      }

      const penguin = window.PenguinPet && window.PenguinPet.penguin;
      const penguinCenterX =
        penguin &&
        Number.isFinite(penguin.x) &&
        Number.isFinite(constants.halfPenguinSize)
          ? penguin.x + constants.halfPenguinSize
          : null;
      const minGapFromPenguin = Number.isFinite(constants.penguinSize)
        ? constants.penguinSize * 1.4
        : 120;
      const margin = 40;
      let strikeX =
        margin + Math.random() * Math.max(1, window.innerWidth - margin * 2);

      if (Number.isFinite(penguinCenterX)) {
        for (let i = 0; i < 8; i += 1) {
          if (Math.abs(strikeX - penguinCenterX) >= minGapFromPenguin) break;
          strikeX =
            margin + Math.random() * Math.max(1, window.innerWidth - margin * 2);
        }
      }

      const boltChance = Number.isFinite(constants.RAIN_LIGHTNING_BOLT_CHANCE)
        ? Math.max(0, Math.min(1, constants.RAIN_LIGHTNING_BOLT_CHANCE))
        : 0.35;
      if (
        typeof effects.createLightningBolt === "function" &&
        Math.random() < boltChance
      ) {
        effects.createLightningBolt(strikeX);
      }

      scheduleRainLightningCycle();
    }, delay);
  }

  function stopSnowCycle(clearVisuals = false, preserveManualMode = false) {
    const state = effects.state || {};
    if (state.snowSpawnIntervalId !== null) {
      clearInterval(state.snowSpawnIntervalId);
      state.snowSpawnIntervalId = null;
    }
    if (state.snowCooldownTimeoutId !== null) {
      clearTimeout(state.snowCooldownTimeoutId);
      state.snowCooldownTimeoutId = null;
    }
    if (state.snowActiveTimeoutId !== null) {
      clearTimeout(state.snowActiveTimeoutId);
      state.snowActiveTimeoutId = null;
    }
    if (state.snowmanSpawnIntervalId !== null) {
      clearInterval(state.snowmanSpawnIntervalId);
      state.snowmanSpawnIntervalId = null;
    }
    state.snowmanSpawnedThisCycle = false;
    clearSnowmanEncounter();
    if (clearVisuals) {
      document.querySelectorAll(".particle").forEach((el) => el.remove());
      document.querySelectorAll(".snowflake").forEach((el) => el.remove());
      document.querySelectorAll(".snow-event-snowman").forEach((el) => el.remove());
    }
    if (!preserveManualMode) state.snowManualMode = false;
  }

  function stopRainCycle(clearVisuals = false, preserveManualMode = false) {
    const state = effects.state || {};
    if (state.rainSpawnIntervalId !== null) {
      clearInterval(state.rainSpawnIntervalId);
      state.rainSpawnIntervalId = null;
    }
    if (state.rainCooldownTimeoutId !== null) {
      clearTimeout(state.rainCooldownTimeoutId);
      state.rainCooldownTimeoutId = null;
    }
    if (state.rainActiveTimeoutId !== null) {
      clearTimeout(state.rainActiveTimeoutId);
      state.rainActiveTimeoutId = null;
    }
    clearRainLightningCycle();
    if (clearVisuals) {
      document.querySelectorAll(".rain-drop").forEach((el) => el.remove());
    }
    const penguin = window.PenguinPet && window.PenguinPet.penguin;
    if (penguin && typeof penguin.hideUmbrella === "function") {
      penguin.hideUmbrella();
    }
    if (!preserveManualMode) state.rainManualMode = false;
  }

  function startRainCycle(manual = false) {
    const constants = effects.getConstants ? effects.getConstants() : {};
    const state = effects.state || {};
    if (state.rainSpawnIntervalId !== null) return;
    state.rainManualMode = manual;
    if (state.snowSpawnIntervalId !== null) stopSnowCycle(true, true);

    const penguin = window.PenguinPet && window.PenguinPet.penguin;
    if (penguin && typeof penguin.showUmbrella === "function") {
      penguin.showUmbrella();
    }

    const rainDropsPerTick = Number.isFinite(constants.RAIN_DROPS_PER_TICK)
      ? Math.max(1, Math.round(constants.RAIN_DROPS_PER_TICK))
      : 3;
    state.rainSpawnIntervalId = setInterval(() => {
      for (let i = 0; i < rainDropsPerTick; i += 1) {
        if (typeof effects.createRainDrop === "function") {
          effects.createRainDrop();
        }
      }
    }, constants.RAIN_SPAWN_INTERVAL_MS);
    scheduleRainLightningCycle();

    state.rainActiveTimeoutId = setTimeout(() => {
      state.rainActiveTimeoutId = null;
      if (state.rainSpawnIntervalId !== null) {
        clearInterval(state.rainSpawnIntervalId);
        state.rainSpawnIntervalId = null;
      }
      clearRainLightningCycle();
      const currentPenguin = window.PenguinPet && window.PenguinPet.penguin;
      if (currentPenguin && typeof currentPenguin.hideUmbrella === "function") {
        currentPenguin.hideUmbrella();
      }
      if (state.rainManualMode) return;
      if (state.rainCooldownTimeoutId !== null) clearTimeout(state.rainCooldownTimeoutId);
      state.rainCooldownTimeoutId = setTimeout(
        () => startRainCycle(false),
        constants.RAIN_COOLDOWN_DURATION_MS,
      );
    }, constants.RAIN_ACTIVE_DURATION_MS);
  }

  function startSnowCycle(manual = false) {
    const constants = effects.getConstants ? effects.getConstants() : {};
    const state = effects.state || {};
    if (state.snowSpawnIntervalId !== null) return;
    state.snowManualMode = manual;
    state.snowmanSpawnedThisCycle = false;
    if (state.rainSpawnIntervalId !== null) stopRainCycle(true, true);

    state.snowSpawnIntervalId = setInterval(
      () => {
        if (typeof effects.createBackgroundParticles === "function") {
          effects.createBackgroundParticles();
        }
      },
      constants.SNOW_SPAWN_INTERVAL_MS,
    );

    state.snowmanSpawnIntervalId = setInterval(() => {
      if (!isSnowing() || state.isSnowmanEncounterActive) return;
      if (Math.random() < 0.98) {
        beginSnowmanEncounter();
      }
    }, 6500);

    state.snowActiveTimeoutId = setTimeout(() => {
      state.snowActiveTimeoutId = null;
      if (state.snowSpawnIntervalId !== null) {
        clearInterval(state.snowSpawnIntervalId);
        state.snowSpawnIntervalId = null;
      }
      if (state.snowmanSpawnIntervalId !== null) {
        clearInterval(state.snowmanSpawnIntervalId);
        state.snowmanSpawnIntervalId = null;
      }

      if (state.snowManualMode) return;
      if (state.snowCooldownTimeoutId !== null) clearTimeout(state.snowCooldownTimeoutId);
      state.snowCooldownTimeoutId = setTimeout(
        () => startSnowCycle(false),
        constants.SNOW_COOLDOWN_DURATION_MS,
      );
    }, constants.SNOW_ACTIVE_DURATION_MS);
  }

  Object.assign(effects, {
    beginSnowmanEncounter,
    clearSnowmanEncounter,
    clearRainLightningCycle,
    scheduleRainLightningCycle,
    triggerShootingStarEvent,
    startShootingStarCycle,
    stopShootingStarCycle,
    startSnowCycle,
    startRainCycle,
    stopSnowCycle,
    stopRainCycle,
    isSnowing,
    isRaining,
  });
})();
