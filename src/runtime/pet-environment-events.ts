  const createEnvironmentEvents = (deps) => {
    const penguin = deps && deps.penguin ? deps.penguin : null;
    const effects = deps && deps.effects ? deps.effects : {};
    const runtime = deps && deps.runtime ? deps.runtime : {};
    const fishEconomy = deps && deps.fishEconomy ? deps.fishEconomy : {};

    const shakeWindowMs = 200;
    const shakeSpeedThreshold = 4000;
    const shakeCooldownMs = 1200;
    const rainClickDelayMs = 220;
    let shakeSamples = [];
    let lastWindAt = 0;
    let pendingRainFlashTimeoutId = null;

    const detectMouseShake = (x, y) => {
      const currentPenguin =
        window.PenguinPet && window.PenguinPet.penguin
          ? window.PenguinPet.penguin
          : null;
      if (currentPenguin && currentPenguin.isFishingActive) return;

      const now = Date.now();
      shakeSamples.push({ x, y, t: now });
      shakeSamples = shakeSamples.filter(
        (sample) => now - sample.t <= shakeWindowMs,
      );

      if (shakeSamples.length < 3) return;
      if (now - lastWindAt < shakeCooldownMs) return;

      let totalDist = 0;
      for (let i = 1; i < shakeSamples.length; i += 1) {
        const dx = shakeSamples[i].x - shakeSamples[i - 1].x;
        const dy = shakeSamples[i].y - shakeSamples[i - 1].y;
        totalDist += Math.sqrt(dx * dx + dy * dy);
      }

      const elapsed = Math.max(1, now - shakeSamples[0].t) / 1000;
      const speed = totalDist / elapsed;

      if (speed >= shakeSpeedThreshold) {
        lastWindAt = now;
        const first = shakeSamples[0];
        const direction = first && x >= first.x ? 1 : -1;
        shakeSamples = [];

        const fx = window.PenguinPet && window.PenguinPet.effects;
        if (fx && typeof fx.createWindGust === "function") {
          fx.createWindGust(direction);
        }
      }
    };

    const onClick = (event) => {
      if (!penguin) return;
      if (penguin.isTemporaryDead) return;
      if (penguin.isFishingActive) return;
      if (penguin.isCaveirinhaMode) return;
      if (penguin.isDragging || penguin.isWalkingAway) return;
      const recentPenguinInteraction =
        Number.isFinite(runtime.lastPenguinInteractionAt) &&
        Date.now() - runtime.lastPenguinInteractionAt <= 900;
      if (recentPenguinInteraction) return;
      const clickTarget =
        event && event.target && typeof event.target.closest === "function"
          ? event.target
          : null;
      if (clickTarget && (clickTarget.closest(".penguin") || clickTarget.closest(".penguin-umbrella"))) {
        return;
      }
      const eventPath =
        event && typeof event.composedPath === "function" ? event.composedPath() : [];
      if (
        Array.isArray(eventPath) &&
        eventPath.some((node) => {
          if (!node || !node.classList) return false;
          return (
            node.classList.contains("penguin") ||
            node.classList.contains("penguin-umbrella")
          );
        })
      ) {
        return;
      }
      const penguinEl = penguin && penguin.element ? penguin.element : null;
      const clickedInsidePenguinRect =
        penguinEl &&
        typeof penguinEl.getBoundingClientRect === "function" &&
        Number.isFinite(event?.clientX) &&
        Number.isFinite(event?.clientY)
          ? (() => {
              const rect = penguinEl.getBoundingClientRect();
              return (
                event.clientX >= rect.left &&
                event.clientX <= rect.right &&
                event.clientY >= rect.top &&
                event.clientY <= rect.bottom
              );
            })()
          : false;
      if (clickedInsidePenguinRect) return;

      const isRaining =
        typeof effects.isRaining === "function" && effects.isRaining();
      if (isRaining) {
        if (pendingRainFlashTimeoutId !== null) {
          clearTimeout(pendingRainFlashTimeoutId);
          pendingRainFlashTimeoutId = null;
        }

        if (typeof effects.createLightningFlash === "function") {
          pendingRainFlashTimeoutId = setTimeout(() => {
            pendingRainFlashTimeoutId = null;
            effects.createLightningFlash();
          }, rainClickDelayMs);
        }
        return;
      }
      const isSnowing =
        typeof effects.isSnowing === "function" && effects.isSnowing();
      if (isSnowing) {
        return;
      }

      if (typeof effects.createFoodDrops !== "function") return;
      if (typeof penguin.enqueueFoodTargets !== "function") return;
      if (
        !fishEconomy ||
        typeof fishEconomy.consumeFishStock !== "function" ||
        typeof fishEconomy.complainNoFishOnClick !== "function"
      ) {
        return;
      }

      if (!fishEconomy.consumeFishStock(1)) {
        fishEconomy.complainNoFishOnClick();
        return;
      }

      const targets = effects.createFoodDrops(event.clientX, event.clientY, 1);
      penguin.enqueueFoodTargets(targets);
    };

    const handlers = {
      dblclick: (event) => {
        event.preventDefault();
        const isRaining =
          typeof effects.isRaining === "function" && effects.isRaining();
        if (!isRaining) return;

        if (pendingRainFlashTimeoutId !== null) {
          clearTimeout(pendingRainFlashTimeoutId);
          pendingRainFlashTimeoutId = null;
        }

        if (typeof effects.createLightningFlash === "function") {
          effects.createLightningFlash();
        }
        const currentPenguin =
          window.PenguinPet && window.PenguinPet.penguin
            ? window.PenguinPet.penguin
            : penguin;
        const halfSize = Number.isFinite(
          window.PenguinPet &&
            window.PenguinPet.constants &&
            window.PenguinPet.constants.halfPenguinSize,
        )
          ? window.PenguinPet.constants.halfPenguinSize
          : 43;
        const strikeX =
          currentPenguin && Number.isFinite(currentPenguin.x)
            ? currentPenguin.x + halfSize
            : Number.isFinite(event?.clientX)
              ? event.clientX
              : window.innerWidth / 2;
        if (typeof effects.createLightningBolt === "function") {
          effects.createLightningBolt(strikeX);
        }
        if (
          currentPenguin &&
          !currentPenguin.isTemporaryDead &&
          typeof currentPenguin.triggerLightningCaveirinha === "function"
        ) {
          currentPenguin.triggerLightningCaveirinha(2200);
        }
      },
      mousemove: (event) => {
        runtime.isMouseInsideViewport = true;
        runtime.mouseX = event.clientX;
        runtime.mouseY = event.clientY;

        if (penguin && penguin.isCaveirinhaMode) return;

        if (typeof penguin.onMouseMove === "function") {
          penguin.onMouseMove(event.clientX, event.clientY);
        }

        detectMouseShake(event.clientX, event.clientY);
      },
      mouseenter: (event) => {
        runtime.isMouseInsideViewport = true;
        runtime.mouseX = event.clientX;
        runtime.mouseY = event.clientY;
      },
      mouseleave: () => {
        runtime.isMouseInsideViewport = false;
      },
      click: onClick,
      keydown: (event) => {
        if (!effects) return;
        if (event.defaultPrevented) return;

        const target = event.target;
        const isTypingTarget =
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable ||
            (typeof target.closest === "function" &&
              target.closest("[contenteditable='true']")));
        if (isTypingTarget) return;

        const key =
          typeof event.key === "string" ? event.key.toLowerCase() : "";
        const currentPenguin =
          window.PenguinPet && window.PenguinPet.penguin
            ? window.PenguinPet.penguin
            : penguin;
        if (currentPenguin && currentPenguin.isTemporaryDead) return;

        if (key === "arrowright") {
          if (!currentPenguin || !currentPenguin.debugEnabled) return;
          if (typeof currentPenguin.debugAdvanceState !== "function") return;
          event.preventDefault();
          currentPenguin.debugAdvanceState();
          return;
        }

        if (key === "v") {
          const runnerGame =
            window.PenguinRunnerGame && window.PenguinRunnerGame.game
              ? window.PenguinRunnerGame.game
              : null;
          if (runnerGame && runnerGame.active) return;

          if (!currentPenguin) return;
          if (currentPenguin.isFishingActive || currentPenguin.isCaveirinhaMode)
            return;
          if (currentPenguin.isDragging || currentPenguin.isWalkingAway) return;
          if (
            typeof currentPenguin.startJumpArc !== "function" ||
            typeof currentPenguin.getWalkMinY !== "function"
          ) {
            return;
          }

          event.preventDefault();
          if (typeof currentPenguin.boostJumpArc === "function") {
            const boosted = currentPenguin.boostJumpArc();
            if (boosted) return;
          }
          if (currentPenguin.isJumpLocked) return;
          currentPenguin.startJumpArc(
            currentPenguin.x,
            currentPenguin.getWalkMinY(),
          );
          return;
        }

        if (key === "n") {
          event.preventDefault();
          if (
            typeof effects.isSnowing === "function" &&
            effects.isSnowing() &&
            typeof effects.stopSnowCycle === "function"
          ) {
            effects.stopSnowCycle(true);
            return;
          }

          if (typeof effects.startSnowCycle === "function") {
            effects.startSnowCycle(true);
          }
          return;
        }

        if (key === "c") {
          event.preventDefault();
          if (
            typeof effects.isRaining === "function" &&
            effects.isRaining() &&
            typeof effects.stopRainCycle === "function"
          ) {
            effects.stopRainCycle(true);
            return;
          }

          if (typeof effects.startRainCycle === "function") {
            effects.startRainCycle(true);
          }
          return;
        }

        if (key === "e") {
          event.preventDefault();
          if (typeof effects.triggerShootingStarEvent === "function") {
            effects.triggerShootingStarEvent();
          } else if (typeof effects.createShootingStar === "function") {
            effects.createShootingStar();
          }
        }
      },
    };

    const attach = () => {
      document.addEventListener("dblclick", handlers.dblclick);
      document.addEventListener("mousemove", handlers.mousemove);
      document.addEventListener("mouseenter", handlers.mouseenter);
      document.addEventListener("mouseleave", handlers.mouseleave);
      document.addEventListener("click", handlers.click);
      document.addEventListener("keydown", handlers.keydown);
    };

    const detach = () => {
      if (pendingRainFlashTimeoutId !== null) {
        clearTimeout(pendingRainFlashTimeoutId);
        pendingRainFlashTimeoutId = null;
      }
      document.removeEventListener("dblclick", handlers.dblclick);
      document.removeEventListener("mousemove", handlers.mousemove);
      document.removeEventListener("mouseenter", handlers.mouseenter);
      document.removeEventListener("mouseleave", handlers.mouseleave);
      document.removeEventListener("click", handlers.click);
      document.removeEventListener("keydown", handlers.keydown);
    };

    return {
      attach,
      detach,
    };
  };

  window.PenguinPetModules = {
    ...(window.PenguinPetModules || {}),
    createEnvironmentEvents,
  };
