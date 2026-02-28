(() => {
  const effectModules =
    (window.PenguinPetEffectModules = window.PenguinPetEffectModules || {});

  effectModules.weatherSpaceEvents = ({ effects, isRaining, isSnowing }) => ({
    clearRainLightningCycle() {
      const state = effects.state || {};
      if (state.rainLightningTimeoutId !== null) {
        clearTimeout(state.rainLightningTimeoutId);
        state.rainLightningTimeoutId = null;
      }
    },

    stopShootingStarCycle() {
      const state = effects.state || {};
      if (state.shootingStarTimeoutId !== null) {
        clearTimeout(state.shootingStarTimeoutId);
        state.shootingStarTimeoutId = null;
      }
      if (state.shootingStarReactionTimeoutId !== null) {
        clearTimeout(state.shootingStarReactionTimeoutId);
        state.shootingStarReactionTimeoutId = null;
      }
    },

    triggerShootingStarEvent() {
      const state = effects.state || {};
      const phrases = effects.getPhrases ? effects.getPhrases() : {};
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
        const starWishLines =
          Array.isArray(phrases.shootingStarWish) && phrases.shootingStarWish.length > 0
            ? phrases.shootingStarWish
            : Array.isArray(phrases.idle)
              ? phrases.idle
              : [];
        const starWish =
          starWishLines[Math.floor(Math.random() * Math.max(1, starWishLines.length))] ||
          "";
        penguin.showSpeech(starWish, 2200, false);
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
    },

    startShootingStarCycle() {
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
            typeof document !== "undefined" && document.visibilityState === "hidden";
          if (!shouldSkip && !isRaining() && !isSnowing()) {
            this.triggerShootingStarEvent();
          }

          scheduleNext();
        }, nextDelayMs);
      };

      scheduleNext();
    },

    scheduleRainLightningCycle() {
      const constants = effects.getConstants ? effects.getConstants() : {};
      const state = effects.state || {};
      this.clearRainLightningCycle();
      if (!isRaining()) return;

      const minDelay = Number.isFinite(constants.RAIN_LIGHTNING_MIN_DELAY_MS)
        ? constants.RAIN_LIGHTNING_MIN_DELAY_MS
        : 2600;
      const maxDelay = Number.isFinite(constants.RAIN_LIGHTNING_MAX_DELAY_MS)
        ? constants.RAIN_LIGHTNING_MAX_DELAY_MS
        : 6800;
      const delay = Math.round(minDelay + Math.random() * Math.max(0, maxDelay - minDelay));

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
        let strikeX = margin + Math.random() * Math.max(1, window.innerWidth - margin * 2);

        if (Number.isFinite(penguinCenterX)) {
          for (let i = 0; i < 8; i += 1) {
            if (Math.abs(strikeX - penguinCenterX) >= minGapFromPenguin) break;
            strikeX = margin + Math.random() * Math.max(1, window.innerWidth - margin * 2);
          }
        }

        const boltChance = Number.isFinite(constants.RAIN_LIGHTNING_BOLT_CHANCE)
          ? Math.max(0, Math.min(1, constants.RAIN_LIGHTNING_BOLT_CHANCE))
          : 0.35;
        if (typeof effects.createLightningBolt === "function" && Math.random() < boltChance) {
          effects.createLightningBolt(strikeX);
        }

        this.scheduleRainLightningCycle();
      }, delay);
    },
  });
})();
