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

      if (isDoubleClick) {
        // Raio cai + pinguim se assusta
        if (typeof effects.createLightningBolt === "function") {
          effects.createLightningBolt(e.clientX);
        }
        const p = window.PenguinPet && window.PenguinPet.penguin;
        if (p && typeof p.setState === "function") {
          p.setState("scared");
          setTimeout(() => {
            if (typeof p.setState === "function") p.setState("idle");
          }, 1800);
        }
      }
      return;
    }

    // --- Comportamento padrão: joga peixe ---
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

  if (typeof effects.startRainCycle === "function") {
    effects.startRainCycle();
  }
})();
