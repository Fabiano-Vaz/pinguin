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
        penguin.isTemporaryDead ||
        penguin.isRanting ||
        penguin.currentState === "sleeping" ||
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
        penguin.isTemporaryDead ||
        penguin.isRanting ||
        penguin.currentState === "sleeping" ||
        penguin.isFishingActive ||
        penguin.currentState === "fishing" ||
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
        penguin.isTemporaryDead ||
        penguin.isRanting ||
        penguin.currentState === "sleeping" ||
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

  const triggerFishing = () => {
    const penguin = getCurrentPenguin();
    if (!penguin) return;
    if (penguin.isTemporaryDead) return;

    if (typeof penguin.showSpeech === "function") {
      penguin.showSpeech(
        pickRandomLine(
          getPhraseList(phrases, "fishHudFishingPrompt", "fishEmpty"),
        ),
        2600,
        false,
      );
    }

    if (penguin.isDragging || penguin.isWalkingAway || penguin.isRanting)
      return;
    if (penguin.currentState === "fishing" || penguin.isFishingActive) return;

    if (penguin.nextBehaviorTimeoutId) {
      clearTimeout(penguin.nextBehaviorTimeoutId);
      penguin.nextBehaviorTimeoutId = null;
    }

    penguin.aiLocked = true;
    penguin.stepQueue = [{ type: "act", state: "fishing", duration: 15000 }];

    if (typeof penguin.runNextStep === "function") {
      penguin.runNextStep();
    }
  };

  const triggerEat = () => {
    const penguin = getCurrentPenguin();
    if (!penguin) return;
    if (penguin.isTemporaryDead) return;

    // Cancel ongoing fishing so the penguin can pick up the food
    if (
      penguin.isFishingActive &&
      typeof penguin.cancelFishing === "function"
    ) {
      penguin.cancelFishing();
    }

    const effects =
      window.PenguinPet && window.PenguinPet.effects
        ? window.PenguinPet.effects
        : null;
    if (!effects || typeof effects.createFoodDrops !== "function") return;
    if (typeof penguin.enqueueFoodTargets !== "function") return;

    if (!consumeFishStock(1)) {
      complainNoFishOnClick();
      return;
    }

    const halfSize = Number.isFinite(
      window.PenguinPet &&
        window.PenguinPet.constants &&
        window.PenguinPet.constants.halfPenguinSize,
    )
      ? window.PenguinPet.constants.halfPenguinSize
      : 43;
    const dropX = Number.isFinite(penguin.x)
      ? penguin.x + halfSize + (Math.random() * 60 - 30)
      : window.innerWidth / 2;
    const dropY = Number.isFinite(penguin.y)
      ? penguin.y - 30
      : window.innerHeight * 0.5;

    // Spawn the fish visually now, but only tell the penguin to chase it
    // after the CSS landing transition (0.55s) finishes.
    const targets = effects.createFoodDrops(dropX, dropY, 1);
    if (!targets || targets.length === 0) return;

    // Trigger a small jump immediately so the penguin leaps to catch the fish.
    if (
      !penguin.isJumpLocked &&
      !penguin.isDragging &&
      !penguin.isWalkingAway &&
      !penguin.isCaveirinhaMode &&
      !penguin.isTemporaryDead &&
      typeof penguin.startJumpArc === "function" &&
      typeof penguin.getWalkMinY === "function"
    ) {
      penguin.startJumpArc(penguin.x, penguin.getWalkMinY());
    }

    setTimeout(() => {
      const currentPenguin = getCurrentPenguin();
      if (!currentPenguin) return;
      currentPenguin.enqueueFoodTargets(targets);
    }, 600);
  };

  const mountFishStockHud = () => {
    if (!document.body) return;

    const hud = document.createElement("div");
    hud.className = "fish-stock-hud";

    const top = document.createElement("div");
    top.className = "fish-hud-top";

    const icon = document.createElement("span");
    icon.className = "fish-stock-icon";
    icon.textContent = "🐟";

    const count = document.createElement("span");
    count.className = "fish-stock-count";

    top.appendChild(icon);
    top.appendChild(count);
    hud.appendChild(top);

    const actions = document.createElement("div");
    actions.className = "fish-hud-actions";

    const btnEat = document.createElement("button");
    btnEat.className = "fish-hud-btn";
    btnEat.textContent = "Comer";
    btnEat.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      triggerEat();
    });

    const btnFish = document.createElement("button");
    btnFish.className = "fish-hud-btn";
    btnFish.textContent = "Pescar";
    btnFish.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      triggerFishing();
    });

    actions.appendChild(btnEat);
    actions.appendChild(btnFish);
    hud.appendChild(actions);

    document.body.appendChild(hud);
    fishStockCountEl = count;
    updateFishStockHud();
  };

  // Fish cursor removed — keep setFishCursorEnabled as a no-op stub
  // so ai/core.ts and weather-cycles.ts callers don't break.
  const setFishCursorEnabled = (_enabled?: boolean) => {
    runtime.isFishCursorEnabled = false;
    if (document.body) {
      document.body.classList.remove("fish-cursor-enabled");
    }
  };

  const consumeFishStock = (amount = 1) => {
    const safeAmount = Math.max(1, Math.round(Number(amount) || 1));
    if (remainingFish < safeAmount) return false;

    remainingFish -= safeAmount;
    runtime.fishStock = remainingFish;
    updateFishStockHud();
    announceFishIfNeeded();

    if (remainingFish <= 0) {
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
    scheduleNaturalConsume();

    return remainingFish;
  };

  const complainNoFishOnClick = () => {
    if (hasUneatenFishOnGround()) return;
    const penguin = getCurrentPenguin();
    if (!penguin || typeof penguin.showSpeech !== "function") return;
    if (penguin.currentState === "sleeping") return;

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
    setFishCursorEnabled(false);
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
