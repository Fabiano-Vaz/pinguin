(() => {
  const createEnvironmentEvents = (deps) => {
    const penguin = deps && deps.penguin ? deps.penguin : null;
    const effects = deps && deps.effects ? deps.effects : {};
    const runtime = deps && deps.runtime ? deps.runtime : {};
    const constants = deps && deps.constants ? deps.constants : {};
    const fishEconomy = deps && deps.fishEconomy ? deps.fishEconomy : {};

    let lastRainClickAt = 0;
    const rainDoubleClickMs = 600;

    const shakeWindowMs = 200;
    const shakeSpeedThreshold = 4000;
    const shakeCooldownMs = 1200;
    let shakeSamples = [];
    let lastWindAt = 0;

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
      if (penguin.isFishingActive) return;
      if (penguin.isCaveirinhaMode) return;
      if (penguin.isDragging || penguin.isWalkingAway) return;

      if (typeof penguin.onScreenClick === "function") {
        penguin.onScreenClick();
      }

      if (typeof effects.isSnowing === "function" && effects.isSnowing()) {
        if (typeof penguin.setVisualState === "function") {
          penguin.setVisualState("default");
        } else if (typeof penguin.setState === "function") {
          penguin.setState("idle");
        }
        if (penguin.element && penguin.element.style) {
          penguin.element.style.animation = "shiver 0.12s linear infinite";
        }
        if (typeof penguin.showSpeech === "function") {
          penguin.showSpeech("que friooooo", 1400, false);
        }
        setTimeout(() => {
          if (!penguin || penguin.isDragging || penguin.isWalkingAway) return;
          if (penguin.element && penguin.element.style) {
            penguin.element.style.animation = "";
          }
          if (
            (typeof penguin.setVisualState === "function" ||
              typeof penguin.setState === "function") &&
            !penguin.isMoving
          ) {
            if (typeof penguin.setVisualState === "function") {
              penguin.setVisualState("default");
            } else {
              penguin.setState("idle");
            }
          }
        }, 900);
        return;
      }

      if (typeof effects.isRaining === "function" && effects.isRaining()) {
        const now = Date.now();
        const isDoubleClick = now - lastRainClickAt <= rainDoubleClickMs;
        lastRainClickAt = now;

        if (typeof effects.createLightningFlash === "function") {
          effects.createLightningFlash();
        }

        const penguinFlash =
          window.PenguinPet && window.PenguinPet.penguin
            ? window.PenguinPet.penguin
            : null;
        if (penguinFlash && typeof penguinFlash.setState === "function") {
          penguinFlash.setState("scared");
          setTimeout(() => {
            if (typeof penguinFlash.setState === "function") {
              penguinFlash.setState("idle");
            }
          }, 900);
        }

        if (isDoubleClick) {
          const currentPenguin =
            window.PenguinPet && window.PenguinPet.penguin
              ? window.PenguinPet.penguin
              : null;
          if (
            currentPenguin &&
            (currentPenguin.isDragging || currentPenguin.isWalkingAway)
          ) {
            return;
          }

          const penguinCenterX =
            currentPenguin &&
            Number.isFinite(currentPenguin.x) &&
            Number.isFinite(constants.halfPenguinSize)
              ? currentPenguin.x + constants.halfPenguinSize
              : event.clientX;

          if (typeof effects.createLightningBolt === "function") {
            effects.createLightningBolt(penguinCenterX);
          }

          if (currentPenguin) {
            currentPenguin.umbrellaLiftOffset = 38;
            setTimeout(() => {
              currentPenguin.umbrellaLiftOffset = 0;
            }, 4000);
          }

          if (currentPenguin && currentPenguin.img) {
            const assets =
              window.PenguinPet && window.PenguinPet.actionStates
                ? window.PenguinPet.actionStates
                : {};
            const caveirinhaSrc =
              assets.caveirinha || "assets/pinguin caveirinha.svg";

            if (currentPenguin.caveirinhaTimeoutId) {
              clearTimeout(currentPenguin.caveirinhaTimeoutId);
            }

            currentPenguin.isCaveirinhaMode = true;
            if (typeof currentPenguin.setActivityMode === "function") {
              currentPenguin.setActivityMode(
                "caveirinha",
                "weather:lightning-double-click",
                {
                  force: true,
                },
              );
            }
            currentPenguin.aiLocked = true;
            currentPenguin.stepQueue = [];
            currentPenguin.isChasing = false;
            currentPenguin.isMoving = false;
            currentPenguin.isDragging = false;
            currentPenguin.currentFoodTarget = null;
            currentPenguin.isEatingFood = false;
            currentPenguin.foodTargets = [];
            currentPenguin.customMotion = null;
            currentPenguin.targetX = currentPenguin.x;
            currentPenguin.targetY = currentPenguin.y;

            if (typeof currentPenguin.lockVisualSprite === "function") {
              currentPenguin.lockVisualSprite(caveirinhaSrc, 4000);
            } else {
              currentPenguin.img.src = caveirinhaSrc;
            }

            if (typeof currentPenguin.setState === "function") {
              currentPenguin.setState("scared");
            }

            currentPenguin.caveirinhaTimeoutId = setTimeout(() => {
              currentPenguin.isCaveirinhaMode = false;
              if (typeof currentPenguin.setActivityMode === "function") {
                currentPenguin.setActivityMode(
                  "idle",
                  "weather:caveirinha-finished",
                  {
                    force: true,
                  },
                );
              }
              if (typeof currentPenguin.unlockVisualSprite === "function") {
                currentPenguin.unlockVisualSprite();
              }
              if (typeof currentPenguin.setState === "function") {
                currentPenguin.setState("idle");
              }
              if (typeof currentPenguin.scheduleNextBehavior === "function") {
                currentPenguin.scheduleNextBehavior();
              }
            }, 4000);
          }
        }

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

        if (key === "v") {
          const runnerGame =
            window.PenguinRunnerGame && window.PenguinRunnerGame.game
              ? window.PenguinRunnerGame.game
              : null;
          if (runnerGame && runnerGame.active) return;

          const currentPenguin =
            window.PenguinPet && window.PenguinPet.penguin
              ? window.PenguinPet.penguin
              : penguin;
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
})();
