(() => {
  const DEFAULTS = {
    initialFishStock: 5,
    noFishTantrumMinMs: 8000,
    noFishTantrumMaxMs: 16000,
    noFishAutoFishDelayMs: 10000,
    naturalConsumeMinMs: 45000,
    naturalConsumeMaxMs: 100000,
    naturalConsumeEnabled: true,
  };

  const hasUneatenFishOnGround = () =>
    Boolean(document.querySelector(".food-fish-drop:not(.eaten)"));

  const getPhraseList = (phrases, key, fallbackKey = "idle") => {
    const candidate = phrases && phrases[key];
    if (Array.isArray(candidate) && candidate.length > 0) return candidate;
    const fallback = phrases && phrases[fallbackKey];
    return Array.isArray(fallback) ? fallback : [];
  };

  const pickRandomLine = (lines) => {
    if (!Array.isArray(lines) || lines.length === 0) return "";
    return lines[Math.floor(Math.random() * lines.length)];
  };

  const getCurrentPenguin = () =>
    window.PenguinPet && window.PenguinPet.penguin
      ? window.PenguinPet.penguin
      : null;

  const createFishEconomy = (deps) => {
    const phrases = deps && deps.phrases ? deps.phrases : {};
    const runtime = deps && deps.runtime ? deps.runtime : {};

    const settings = {
      ...DEFAULTS,
      ...(deps && deps.settings ? deps.settings : {}),
    };

    let remainingFish = settings.initialFishStock;
    let fishStockCountEl = null;
    let lastFishWarningLevel = null;
    let noFishTantrumTimeoutId = null;
    let noFishAutoFishingTimeoutId = null;
    let naturalConsumeTimeoutId = null;

    const speakFishStatus = (text) => {
      if (!text) return;
      const penguin = getCurrentPenguin();
      if (!penguin || typeof penguin.showSpeech !== "function") return;
      penguin.showSpeech(text, 2600, false);
    };

    const announceFishIfNeeded = () => {
      if (remainingFish === lastFishWarningLevel) return;

      if (remainingFish === 0) {
        lastFishWarningLevel = 0;
        speakFishStatus(pickRandomLine(getPhraseList(phrases, "fishEmpty")));
        return;
      }

      if (remainingFish === 1) {
        lastFishWarningLevel = 1;
        speakFishStatus(pickRandomLine(getPhraseList(phrases, "fishLast")));
        return;
      }

      if (remainingFish <= 3) {
        lastFishWarningLevel = remainingFish;
        speakFishStatus(pickRandomLine(getPhraseList(phrases, "fishLow")));
      }
    };

    const clearNoFishTantrum = () => {
      if (!noFishTantrumTimeoutId) return;
      clearTimeout(noFishTantrumTimeoutId);
      noFishTantrumTimeoutId = null;
    };

    const clearNoFishAutoFishing = () => {
      if (!noFishAutoFishingTimeoutId) return;
      clearTimeout(noFishAutoFishingTimeoutId);
      noFishAutoFishingTimeoutId = null;
    };

    const clearNaturalConsume = () => {
      if (!naturalConsumeTimeoutId) return;
      clearTimeout(naturalConsumeTimeoutId);
      naturalConsumeTimeoutId = null;
    };

    const getNoFishTantrumDelay = () =>
      Math.round(
        settings.noFishTantrumMinMs +
          Math.random() *
            (settings.noFishTantrumMaxMs - settings.noFishTantrumMinMs),
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

        const penguin = getCurrentPenguin();
        if (!penguin || !penguin.element) {
          scheduleNoFishTantrum();
          return;
        }

        if (
          penguin.isDragging ||
          penguin.isWalkingAway ||
          penguin.isRanting ||
          penguin.isFishingActive ||
          penguin.currentState === "fishing" ||
          penguin.isEatingFood ||
          penguin.currentFoodTarget ||
          hasUneatenFishOnGround()
        ) {
          scheduleNoFishTantrum();
          return;
        }

        if (typeof penguin.showSpeech === "function") {
          penguin.showSpeech(
            pickRandomLine(getPhraseList(phrases, "fishRage", "angry")),
            2200,
            false,
          );
        }

        if (typeof penguin.setState === "function") {
          penguin.setState("angry");
        }

        penguin.element.style.animation = "bounce 0.45s ease 2";
        setTimeout(() => {
          if (penguin.element) {
            penguin.element.style.animation = "";
          }
          if (typeof penguin.setState === "function" && !penguin.isMoving) {
            penguin.setState("idle");
          }
        }, 980);

        scheduleNoFishTantrum();
      }, getNoFishTantrumDelay());
    };

    const scheduleNoFishAutoFishing = () => {
      clearNoFishAutoFishing();
      if (remainingFish > 0) return;

      noFishAutoFishingTimeoutId = setTimeout(() => {
        noFishAutoFishingTimeoutId = null;

        if (remainingFish > 0) return;
        if (document.body && document.body.classList.contains("runner-mode")) {
          scheduleNoFishAutoFishing();
          return;
        }

        const penguin = getCurrentPenguin();
        if (
          !penguin ||
          typeof penguin.runNextStep !== "function" ||
          penguin.isDragging ||
          penguin.isWalkingAway ||
          penguin.isRanting ||
          penguin.isEatingFood ||
          penguin.currentFoodTarget
        ) {
          scheduleNoFishAutoFishing();
          return;
        }

        penguin.aiLocked = true;
        penguin.stepQueue = [{ type: "act", state: "fishing", duration: 15000 }];
        penguin.runNextStep();
      }, settings.noFishAutoFishDelayMs);
    };

    const getNaturalConsumeDelay = () =>
      Math.round(
        settings.naturalConsumeMinMs +
          Math.random() *
            (settings.naturalConsumeMaxMs - settings.naturalConsumeMinMs),
      );

    const scheduleNaturalConsume = () => {
      clearNaturalConsume();
      if (!settings.naturalConsumeEnabled || remainingFish <= 0) return;

      naturalConsumeTimeoutId = setTimeout(() => {
        naturalConsumeTimeoutId = null;

        if (remainingFish <= 0) return;
        if (document.body && document.body.classList.contains("runner-mode")) {
          scheduleNaturalConsume();
          return;
        }

        const penguin = getCurrentPenguin();
        if (
          !penguin ||
          penguin.isDragging ||
          penguin.isWalkingAway ||
          penguin.isRanting ||
          penguin.isFishingActive ||
          penguin.currentState === "fishing" ||
          penguin.isEatingFood ||
          penguin.currentFoodTarget ||
          penguin.isMoving ||
          hasUneatenFishOnGround()
        ) {
          scheduleNaturalConsume();
          return;
        }

        const consumed = consumeFishStock(1);
        if (!consumed) {
          scheduleNaturalConsume();
          return;
        }

        if (typeof penguin.setState === "function") {
          penguin.setState("eating");
          setTimeout(() => {
            if (
              typeof penguin.setState === "function" &&
              !penguin.isMoving &&
              !penguin.currentFoodTarget &&
              !penguin.isFishingActive
            ) {
              penguin.setState("idle");
            }
          }, 900);
        }

        if (typeof penguin.showSpeech === "function") {
          penguin.showSpeech(
            pickRandomLine(getPhraseList(phrases, "eating", "idle")),
            1500,
            false,
          );
        }

        scheduleNaturalConsume();
      }, getNaturalConsumeDelay());
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
      hud.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const penguin = getCurrentPenguin();
        if (!penguin) return;

        if (typeof penguin.showSpeech === "function") {
          penguin.showSpeech("Ta me mandando ir pescar éh!?", 2600, false);
        }

        if (penguin.isDragging || penguin.isWalkingAway || penguin.isRanting) {
          return;
        }

        if (penguin.currentState === "fishing" || penguin.isFishingActive) {
          return;
        }

        if (penguin.nextBehaviorTimeoutId) {
          clearTimeout(penguin.nextBehaviorTimeoutId);
          penguin.nextBehaviorTimeoutId = null;
        }

        penguin.aiLocked = true;
        penguin.stepQueue = [{ type: "act", state: "fishing", duration: 15000 }];

        if (typeof penguin.runNextStep === "function") {
          penguin.runNextStep();
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

    const setFishCursorEnabled = (enabled) => {
      const wantsEnabled = Boolean(enabled);
      runtime.isFishCursorEnabled = wantsEnabled && remainingFish > 0;
      applyFishCursorState();
    };

    const consumeFishStock = (amount = 1) => {
      const safeAmount = Math.max(1, Math.round(Number(amount) || 1));
      if (remainingFish < safeAmount) return false;

      remainingFish -= safeAmount;
      runtime.fishStock = remainingFish;
      updateFishStockHud();
      announceFishIfNeeded();

      if (remainingFish <= 0) {
        setFishCursorEnabled(false);
        scheduleNoFishTantrum();
        scheduleNoFishAutoFishing();
        clearNaturalConsume();
      } else {
        scheduleNaturalConsume();
      }

      return true;
    };

    const addFishStock = (amount = 1) => {
      const safeAmount = Math.max(1, Math.round(Number(amount) || 1));
      remainingFish += safeAmount;
      runtime.fishStock = remainingFish;
      updateFishStockHud();

      clearNoFishTantrum();
      clearNoFishAutoFishing();

      if (runtime.isFishCursorEnabled === false && remainingFish > 0) {
        setFishCursorEnabled(true);
      }

      scheduleNaturalConsume();

      return remainingFish;
    };

    const complainNoFishOnClick = () => {
      if (hasUneatenFishOnGround()) return;
      const penguin = getCurrentPenguin();
      if (!penguin || typeof penguin.showSpeech !== "function") return;

      penguin.showSpeech(
        pickRandomLine(getPhraseList(phrases, "fishRage", "angry")),
        2200,
        false,
      );

      if (typeof penguin.setState === "function") {
        penguin.setState("angry");
        setTimeout(() => {
          if (typeof penguin.setState === "function") {
            penguin.setState("idle");
          }
        }, 900);
      }
    };

    const initialize = () => {
      setFishCursorEnabled(runtime.isFishCursorEnabled !== false);
      mountFishStockHud();
      runtime.fishStock = remainingFish;

      if (remainingFish <= 0) {
        scheduleNoFishTantrum();
        scheduleNoFishAutoFishing();
      } else {
        scheduleNaturalConsume();
      }
    };

    const dispose = () => {
      clearNoFishTantrum();
      clearNoFishAutoFishing();
      clearNaturalConsume();
    };

    runtime.setFishCursorEnabled = setFishCursorEnabled;
    runtime.consumeFishStock = consumeFishStock;
    runtime.addFishStock = addFishStock;
    runtime.getFishStock = () => remainingFish;

    return {
      initialize,
      dispose,
      complainNoFishOnClick,
      consumeFishStock,
      addFishStock,
      getFishStock: () => remainingFish,
    };
  };

  window.PenguinPetModules = {
    ...(window.PenguinPetModules || {}),
    createFishEconomy,
  };
})();
