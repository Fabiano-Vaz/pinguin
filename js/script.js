(() => {
  const pet = window.PenguinPet || {};
  const constants = pet.constants || {};
  const runtime = pet.runtime || {};
  const Penguin = pet.Penguin;
  const effects = pet.effects || {};
  const FISH_THROW_STREAK_LIMIT = 7;
  const FISH_THROW_STREAK_GAP_MS = 900;
  const FISH_THROW_COOLDOWN_MS = 3 * 60 * 1000;
  let fishThrowStreak = 0;
  let lastFishThrowClickAt = 0;
  let fishThrowBlockedUntil = 0;

  const applyFishCursorState = () => {
    if (!document.body) return;
    document.body.classList.toggle(
      "fish-cursor-enabled",
      runtime.isFishCursorEnabled !== false,
    );
  };

  runtime.setFishCursorEnabled = (enabled) => {
    runtime.isFishCursorEnabled = Boolean(enabled);
    applyFishCursorState();
  };

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

  const penguin = new Penguin();
  window.PenguinPet = {
    ...pet,
    runtime,
    penguin,
  };

  document.addEventListener("mousemove", (e) => {
    runtime.isMouseInsideViewport = true;
    runtime.mouseX = e.clientX;
    runtime.mouseY = e.clientY;
    if (typeof penguin.onMouseMove === "function") {
      penguin.onMouseMove(e.clientX, e.clientY);
    }
  });

  document.addEventListener("mouseenter", (e) => {
    runtime.isMouseInsideViewport = true;
    runtime.mouseX = e.clientX;
    runtime.mouseY = e.clientY;
  });

  document.addEventListener("mouseleave", () => {
    runtime.isMouseInsideViewport = false;
  });

  document.addEventListener("click", (e) => {
    if (typeof penguin.onScreenClick === "function") {
      penguin.onScreenClick();
    }

    if (typeof effects.createFoodDrops !== "function") return;
    if (typeof penguin.enqueueFoodTargets !== "function") return;
    const now = Date.now();
    if (now < fishThrowBlockedUntil) return;

    if (now - lastFishThrowClickAt <= FISH_THROW_STREAK_GAP_MS) {
      fishThrowStreak += 1;
    } else {
      fishThrowStreak = 1;
    }
    lastFishThrowClickAt = now;

    const targets = effects.createFoodDrops(e.clientX, e.clientY, 2);
    penguin.enqueueFoodTargets(targets);

    if (fishThrowStreak >= FISH_THROW_STREAK_LIMIT) {
      fishThrowBlockedUntil = now + FISH_THROW_COOLDOWN_MS;
      fishThrowStreak = 0;
      lastFishThrowClickAt = 0;
    }
  });

  if (typeof effects.startSnowCycle === "function") {
    effects.startSnowCycle();
  }
})();
