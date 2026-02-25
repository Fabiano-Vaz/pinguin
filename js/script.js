(() => {
  const pet = window.PenguinPet || {};
  const constants = pet.constants || {};
  const runtime = pet.runtime || {};
  const Penguin = pet.Penguin;
  const effects = pet.effects || {};

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

    const targets = effects.createFoodDrops(e.clientX, e.clientY, 2);
    penguin.enqueueFoodTargets(targets);
  });

  if (typeof effects.startSnowCycle === "function") {
    effects.startSnowCycle();
  }
})();
