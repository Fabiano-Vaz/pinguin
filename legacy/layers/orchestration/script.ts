// @ts-nocheck
(() => {
  const pet = window.PenguinPet || {};
  const constants = pet.constants || {};
  const phrases = pet.phrases || {};
  const runtime = pet.runtime || {};
  const Penguin = pet.Penguin;
  const effects = pet.effects || {};
  const INITIAL_FISH_STOCK = 5;
  const NO_FISH_TANTRUM_MIN_MS = 8000;
  const NO_FISH_TANTRUM_MAX_MS = 16000;
  const NO_FISH_AUTO_FISH_DELAY_MS = 10000;
  let remainingFish = INITIAL_FISH_STOCK;
  let fishStockCountEl = null;
  let lastFishWarningLevel = null;
  let noFishTantrumTimeoutId = null;
  let noFishAutoFishingTimeoutId = null;

  const hasUneatenFishOnGround = () =>
    Boolean(document.querySelector(".food-fish-drop:not(.eaten)"));

  const getPhraseList = (key, fallbackKey = "idle") => {
    const candidate = phrases && phrases[key];
    if (Array.isArray(candidate) && candidate.length > 0) return candidate;
    const fallback = phrases && phrases[fallbackKey];
    return Array.isArray(fallback) ? fallback : [];
  };

  const pickRandomLine = (lines) => {
    if (!Array.isArray(lines) || lines.length === 0) return "";
    return lines[Math.floor(Math.random() * lines.length)];
  };

  const speakFishStatus = (text) => {
    if (!text) return;
    const currentPenguin =
      window.PenguinPet && window.PenguinPet.penguin
        ? window.PenguinPet.penguin
        : null;
    if (!currentPenguin || typeof currentPenguin.showSpeech !== "function") {
      return;
    }
    currentPenguin.showSpeech(text, 2600, false);
  };

  const announceFishIfNeeded = () => {
    if (remainingFish === lastFishWarningLevel) return;

    if (remainingFish === 0) {
      lastFishWarningLevel = 0;
      speakFishStatus(pickRandomLine(getPhraseList("fishEmpty")));
      return;
    }

    if (remainingFish === 1) {
      lastFishWarningLevel = 1;
      speakFishStatus(pickRandomLine(getPhraseList("fishLast")));
      return;
    }

    if (remainingFish <= 3) {
      lastFishWarningLevel = remainingFish;
      speakFishStatus(pickRandomLine(getPhraseList("fishLow")));
    }
  };

  const complainNoFishOnClick = () => {
    if (hasUneatenFishOnGround()) return;
    const currentPenguin =
      window.PenguinPet && window.PenguinPet.penguin
        ? window.PenguinPet.penguin
        : null;
    if (!currentPenguin || typeof currentPenguin.showSpeech !== "function") {
      return;
    }
    currentPenguin.showSpeech(
      pickRandomLine(getPhraseList("fishRage", "angry")),
      2200,
      false,
    );
    if (typeof currentPenguin.setState === "function") {
      currentPenguin.setState("angry");
      setTimeout(() => {
        if (typeof currentPenguin.setState === "function") {
          currentPenguin.setState("idle");
        }
      }, 900);
    }
  };

  const clearNoFishTantrum = () => {
    if (noFishTantrumTimeoutId) {
      clearTimeout(noFishTantrumTimeoutId);
      noFishTantrumTimeoutId = null;
    }
  };

  const clearNoFishAutoFishing = () => {
    if (noFishAutoFishingTimeoutId) {
      clearTimeout(noFishAutoFishingTimeoutId);
      noFishAutoFishingTimeoutId = null;
    }
  };

  const getNoFishTantrumDelay = () =>
    Math.round(
      NO_FISH_TANTRUM_MIN_MS +
        Math.random() * (NO_FISH_TANTRUM_MAX_MS - NO_FISH_TANTRUM_MIN_MS),
    );

  const scheduleNoFishTantrum = () => {
    clearNoFishTantrum();
    if (remainingFish > 0) return;

    noFishTantrumTimeoutId = setTimeout(() => {
      noFishTantrumTimeoutId = null;

      if (remainingFish > 0) return;
      if (document.body && document.body.classList.contains("runner-mode")) {
        scheduleNoFishTantrum();
        return;
      }

      const currentPenguin =
        window.PenguinPet && window.PenguinPet.penguin
          ? window.PenguinPet.penguin
          : null;
      if (!currentPenguin || !currentPenguin.element) {
        scheduleNoFishTantrum();
        return;
      }
      if (
        currentPenguin.isDragging ||
        currentPenguin.isWalkingAway ||
        currentPenguin.isRanting ||
        currentPenguin.isFishingActive ||
        currentPenguin.currentState === "fishing" ||
        currentPenguin.isEatingFood ||
        currentPenguin.currentFoodTarget
      ) {
        scheduleNoFishTantrum();
        return;
      }
      if (hasUneatenFishOnGround()) {
        scheduleNoFishTantrum();
        return;
      }

      if (typeof currentPenguin.showSpeech === "function") {
        currentPenguin.showSpeech(
          pickRandomLine(getPhraseList("fishRage", "angry")),
          2200,
          false,
        );
      }
      if (typeof currentPenguin.setState === "function") {
        currentPenguin.setState("angry");
      }
      currentPenguin.element.style.animation = "bounce 0.45s ease 2";
      setTimeout(() => {
        if (currentPenguin.element) {
          currentPenguin.element.style.animation = "";
        }
        if (
          typeof currentPenguin.setState === "function" &&
          !currentPenguin.isMoving
        ) {
          currentPenguin.setState("idle");
        }
      }, 980);

      scheduleNoFishTantrum();
    }, getNoFishTantrumDelay());
  };

  const tryStartNoFishAutoFishing = () => {
    noFishAutoFishingTimeoutId = null;
    if (remainingFish > 0) return;
    if (document.body && document.body.classList.contains("runner-mode")) {
      scheduleNoFishAutoFishing();
      return;
    }

    const currentPenguin =
      window.PenguinPet && window.PenguinPet.penguin
        ? window.PenguinPet.penguin
        : null;
    if (
      !currentPenguin ||
      typeof currentPenguin.runNextStep !== "function" ||
      currentPenguin.isDragging ||
      currentPenguin.isWalkingAway ||
      currentPenguin.isRanting ||
      currentPenguin.isEatingFood ||
      currentPenguin.currentFoodTarget
    ) {
      scheduleNoFishAutoFishing();
      return;
    }

    currentPenguin.aiLocked = true;
    currentPenguin.stepQueue = [{ type: "act", state: "fishing", duration: 15000 }];
    currentPenguin.runNextStep();
  };

  const scheduleNoFishAutoFishing = () => {
    clearNoFishAutoFishing();
    if (remainingFish > 0) return;
    noFishAutoFishingTimeoutId = setTimeout(
      tryStartNoFishAutoFishing,
      NO_FISH_AUTO_FISH_DELAY_MS,
    );
  };

  const updateFishStockHud = () => {
    if (!fishStockCountEl) return;
    fishStockCountEl.textContent = String(Math.max(0, remainingFish));
  };

  const mountFishStockHud = () => {
    if (!document.body) return;
    const hud = document.createElement("div");
    hud.className = "fish-stock-hud";

    const icon = document.createElement("span");
    icon.className = "fish-stock-icon";
    icon.textContent = "🐟";

    const count = document.createElement("span");
    count.className = "fish-stock-count";

    hud.appendChild(icon);
    hud.appendChild(count);
    hud.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const currentPenguin =
        window.PenguinPet && window.PenguinPet.penguin
          ? window.PenguinPet.penguin
          : null;
      if (!currentPenguin) return;

      if (typeof currentPenguin.showSpeech === "function") {
        currentPenguin.showSpeech("Ta me mandando ir pescar éh!?", 2600, false);
      }

      if (
        currentPenguin.isDragging ||
        currentPenguin.isWalkingAway ||
        currentPenguin.isRanting
      ) {
        return;
      }

      if (currentPenguin.currentState === "fishing" || currentPenguin.isFishingActive) {
        return;
      }

      if (currentPenguin.nextBehaviorTimeoutId) {
        clearTimeout(currentPenguin.nextBehaviorTimeoutId);
        currentPenguin.nextBehaviorTimeoutId = null;
      }

      currentPenguin.aiLocked = true;
      currentPenguin.stepQueue = [{ type: "act", state: "fishing", duration: 15000 }];
      if (typeof currentPenguin.runNextStep === "function") {
        currentPenguin.runNextStep();
      }
    });
    document.body.appendChild(hud);
    fishStockCountEl = count;
    updateFishStockHud();
  };

  const applyFishCursorState = () => {
    if (!document.body) return;
    document.body.classList.toggle(
      "fish-cursor-enabled",
      runtime.isFishCursorEnabled !== false,
    );
  };

  runtime.setFishCursorEnabled = (enabled) => {
    const wantsEnabled = Boolean(enabled);
    runtime.isFishCursorEnabled = wantsEnabled && remainingFish > 0;
    applyFishCursorState();
  };

  runtime.consumeFishStock = (amount = 1) => {
    const safeAmount = Math.max(1, Math.round(Number(amount) || 1));
    if (remainingFish < safeAmount) return false;
    remainingFish -= safeAmount;
    runtime.fishStock = remainingFish;
    updateFishStockHud();
    announceFishIfNeeded();
    if (remainingFish <= 0) {
      runtime.setFishCursorEnabled(false);
      scheduleNoFishTantrum();
      scheduleNoFishAutoFishing();
    }
    return true;
  };

  runtime.addFishStock = (amount = 1) => {
    const safeAmount = Math.max(1, Math.round(Number(amount) || 1));
    remainingFish += safeAmount;
    runtime.fishStock = remainingFish;
    updateFishStockHud();
    clearNoFishTantrum();
    clearNoFishAutoFishing();
    if (runtime.isFishCursorEnabled === false && remainingFish > 0) {
      runtime.setFishCursorEnabled(true);
    }
    return remainingFish;
  };

  runtime.getFishStock = () => remainingFish;

  if (typeof document !== "undefined" && document.body) {
    const backgroundTargetElements = [document.documentElement, document.body];
    if (Number.isFinite(constants.penguinSize)) {
      document.body.style.setProperty(
        "--penguin-size",
        `${constants.penguinSize}px`,
      );
    }
    backgroundTargetElements.forEach((element) => {
      if (!element) return;
      element.style.backgroundImage = `url("${constants.backgroundImage}")`;
      element.style.backgroundSize = "cover";
      element.style.backgroundPosition = "center bottom";
      element.style.backgroundRepeat = "no-repeat";
    });
  }

  if (typeof Penguin !== "function") {
    return;
  }

  applyFishCursorState();
  mountFishStockHud();
  runtime.fishStock = remainingFish;
  if (remainingFish <= 0) {
    scheduleNoFishTantrum();
    scheduleNoFishAutoFishing();
  }

  const penguin = new Penguin();
  window.PenguinPet = {
    ...pet,
    runtime,
    penguin,
  };

  document.addEventListener("dblclick", (e) => {
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    runtime.isMouseInsideViewport = true;
    runtime.mouseX = e.clientX;
    runtime.mouseY = e.clientY;
    if (typeof penguin.onMouseMove === "function") {
      penguin.onMouseMove(e.clientX, e.clientY);
    }
    detectMouseShake(e.clientX, e.clientY);
  });

  document.addEventListener("mouseenter", (e) => {
    runtime.isMouseInsideViewport = true;
    runtime.mouseX = e.clientX;
    runtime.mouseY = e.clientY;
  });

  document.addEventListener("mouseleave", () => {
    runtime.isMouseInsideViewport = false;
  });

  let lastRainClickAt = 0;
  const RAIN_DOUBLE_CLICK_MS = 600;

  // Detecção de agitação do mouse
  const SHAKE_WINDOW_MS = 200;
  const SHAKE_SPEED_THRESHOLD = 4000; // px/s
  const SHAKE_COOLDOWN_MS = 1200;
  let shakeSamples = [];
  let lastWindAt = 0;

  function detectMouseShake(x, y) {
    const currentPenguin =
      window.PenguinPet && window.PenguinPet.penguin
        ? window.PenguinPet.penguin
        : null;
    if (currentPenguin && currentPenguin.isFishingActive) return;

    const now = Date.now();
    shakeSamples.push({ x, y, t: now });
    // Manter apenas amostras dentro da janela
    shakeSamples = shakeSamples.filter((s) => now - s.t <= SHAKE_WINDOW_MS);
    if (shakeSamples.length < 3) return;
    if (now - lastWindAt < SHAKE_COOLDOWN_MS) return;

    // Calcular distância total percorrida na janela
    let totalDist = 0;
    for (let i = 1; i < shakeSamples.length; i += 1) {
      const dx = shakeSamples[i].x - shakeSamples[i - 1].x;
      const dy = shakeSamples[i].y - shakeSamples[i - 1].y;
      totalDist += Math.sqrt(dx * dx + dy * dy);
    }
    const elapsed = Math.max(1, now - shakeSamples[0].t) / 1000;
    const speed = totalDist / elapsed;

    if (speed >= SHAKE_SPEED_THRESHOLD) {
      lastWindAt = now;
      // Direção dominante horizontal (antes de limpar)
      const first = shakeSamples[0];
      const dir = first && x >= first.x ? 1 : -1;
      shakeSamples = [];
      const eff = window.PenguinPet && window.PenguinPet.effects;
      if (eff && typeof eff.createWindGust === "function") {
        eff.createWindGust(dir);
      }
    }
  }

  document.addEventListener("click", (e) => {
    if (penguin && penguin.isFishingActive) return;

    if (typeof penguin.onScreenClick === "function") {
      penguin.onScreenClick();
    }

    // --- Comportamento durante NEVE: cai mais neve em vez de peixe ---
    if (typeof effects.isSnowing === "function" && effects.isSnowing()) {
      if (typeof effects.spawnExtraSnow === "function") {
        effects.spawnExtraSnow(e.clientX, e.clientY);
      }
      return;
    }

    // --- Comportamento durante CHUVA: relâmpago / raio ---
    if (typeof effects.isRaining === "function" && effects.isRaining()) {
      const now = Date.now();
      const isDoubleClick = now - lastRainClickAt <= RAIN_DOUBLE_CLICK_MS;
      lastRainClickAt = now;

      if (typeof effects.createLightningFlash === "function") {
        effects.createLightningFlash();
      }

      // Relâmpago simples → pinguim se assusta
      const pFlash = window.PenguinPet && window.PenguinPet.penguin;
      if (pFlash && typeof pFlash.setState === "function") {
        pFlash.setState("scared");
        setTimeout(() => {
          if (typeof pFlash.setState === "function") pFlash.setState("idle");
        }, 900);
      }

      if (isDoubleClick) {
        // Raio cai + pinguim vira caveirinha
        const p = window.PenguinPet && window.PenguinPet.penguin;
        const penguinCenterX =
          p && Number.isFinite(p.x) && Number.isFinite(constants.halfPenguinSize)
            ? p.x + constants.halfPenguinSize
            : e.clientX;
        if (typeof effects.createLightningBolt === "function") {
          effects.createLightningBolt(penguinCenterX);
        }
        // Levantar o guarda-chuva durante o susto
        if (p) {
          p.umbrellaLiftOffset = 38;
          setTimeout(() => {
            p.umbrellaLiftOffset = 0;
          }, 4000);
        }
        if (p && p.img) {
          // Trocar imagem para caveirinha
          const assets = window.PenguinPet && window.PenguinPet.actionStates;
          const caveirinhaSrc =
            (assets && assets.caveirinha) || "assets/pinguin caveirinha.svg";
          if (p.caveirinhaTimeoutId) {
            clearTimeout(p.caveirinhaTimeoutId);
          }
          if (typeof p.lockVisualSprite === "function") {
            p.lockVisualSprite(caveirinhaSrc, 4000);
          } else {
            p.img.src = caveirinhaSrc;
          }
          if (typeof p.setState === "function") p.setState("scared");
          p.caveirinhaTimeoutId = setTimeout(() => {
            if (typeof p.unlockVisualSprite === "function") {
              p.unlockVisualSprite();
            }
            if (typeof p.setState === "function") p.setState("idle");
          }, 4000);
        }
      }
      return;
    }

    // --- Comportamento padrão: joga peixe ---
    if (typeof effects.createFoodDrops !== "function") return;
    if (typeof penguin.enqueueFoodTargets !== "function") return;
    if (typeof runtime.consumeFishStock !== "function") return;
    if (!runtime.consumeFishStock(1)) {
      complainNoFishOnClick();
      return;
    }

    const targets = effects.createFoodDrops(e.clientX, e.clientY, 1);
    penguin.enqueueFoodTargets(targets);
  });

  if (typeof effects.startSnowCycle === "function") {
    effects.startSnowCycle();
  }

  if (typeof effects.startRainCycle === "function") {
    effects.startRainCycle();
  }
})();

export {};
