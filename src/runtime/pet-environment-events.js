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
      shakeSamples = shakeSamples.filter((sample) => now - sample.t <= shakeWindowMs);

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

      if (typeof penguin.onScreenClick === "function") {
        penguin.onScreenClick();
      }

      if (typeof effects.isSnowing === "function" && effects.isSnowing()) {
        if (typeof effects.spawnExtraSnow === "function") {
          effects.spawnExtraSnow(event.clientX, event.clientY);
        }
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

            if (typeof currentPenguin.lockVisualSprite === "function") {
              currentPenguin.lockVisualSprite(caveirinhaSrc, 4000);
            } else {
              currentPenguin.img.src = caveirinhaSrc;
            }

            if (typeof currentPenguin.setState === "function") {
              currentPenguin.setState("scared");
            }

            currentPenguin.caveirinhaTimeoutId = setTimeout(() => {
              if (typeof currentPenguin.unlockVisualSprite === "function") {
                currentPenguin.unlockVisualSprite();
              }
              if (typeof currentPenguin.setState === "function") {
                currentPenguin.setState("idle");
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
    };

    const attach = () => {
      document.addEventListener("dblclick", handlers.dblclick);
      document.addEventListener("mousemove", handlers.mousemove);
      document.addEventListener("mouseenter", handlers.mouseenter);
      document.addEventListener("mouseleave", handlers.mouseleave);
      document.addEventListener("click", handlers.click);
    };

    const detach = () => {
      document.removeEventListener("dblclick", handlers.dblclick);
      document.removeEventListener("mousemove", handlers.mousemove);
      document.removeEventListener("mouseenter", handlers.mouseenter);
      document.removeEventListener("mouseleave", handlers.mouseleave);
      document.removeEventListener("click", handlers.click);
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
