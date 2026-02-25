(() => {
  const pet = window.PenguinPet || {};
  const constants = pet.constants || {};

  function createParticle(x, y) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.textContent = ["❄️", "🧊", "❄️", "🐟"][
      Math.floor(Math.random() * 8)
    ];
    particle.style.left = x + (Math.random() - 0.5) * 100 + "px";
    particle.style.top = y + (Math.random() - 0.5) * 100 + "px";
    particle.style.fontSize = Math.random() * 20 + 12 + "px";
    particle.style.animation = `particleFall ${Math.random() * 2 + 1}s ease-out`;
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 3000);
  }

  function createClickEffect(x, y) {
    const effect = document.createElement("div");
    effect.className = "clickEffect";
    effect.style.left = x - 50 + "px";
    effect.style.top = y - 50 + "px";
    document.body.appendChild(effect);

    for (let i = 0; i < 10; i += 1) {
      createParticle(x, y);
    }

    setTimeout(() => effect.remove(), 600);
  }

  function createFoodDrops(x, y, count = 6) {
    const safeCount = Math.max(1, Math.min(12, Math.round(count)));
    const groundTopY = Math.max(
      0,
      Math.min(
        window.innerHeight * constants.snowTopRatio - constants.penguinSize,
        window.innerHeight - constants.penguinSize,
      ),
    );
    const targetCenterY = groundTopY + constants.halfPenguinSize;
    const targets = [];

    for (let i = 0; i < safeCount; i += 1) {
      const fish = document.createElement("div");
      fish.className = "food-fish-drop";
      fish.textContent = "🐟";

      const startX = x + (Math.random() - 0.5) * 70;
      const startY = Math.max(0, y - 30 - Math.random() * 50);
      const landedX = Math.max(
        16,
        Math.min(startX + (Math.random() - 0.5) * 120, window.innerWidth - 16),
      );
      const landedY = Math.min(
        window.innerHeight - 20,
        groundTopY + constants.penguinSize - 14 + Math.random() * 10,
      );

      fish.style.left = `${startX}px`;
      fish.style.top = `${startY}px`;
      document.body.appendChild(fish);

      requestAnimationFrame(() => {
        fish.style.left = `${landedX}px`;
        fish.style.top = `${landedY}px`;
      });

      setTimeout(() => {
        if (fish.isConnected) fish.remove();
      }, 14000);

      targets.push({
        element: fish,
        x: landedX,
        y: targetCenterY,
      });
    }

    return targets;
  }

  function createBackgroundParticles() {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.textContent = "❄️";
    particle.style.left = Math.random() * window.innerWidth + "px";
    particle.style.top = "-20px";
    particle.style.fontSize = Math.random() * 15 + 8 + "px";
    particle.style.animation = `particleFall ${Math.random() * 3 + 2}s linear`;
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 5000);
  }

  let snowSpawnIntervalId = null;

  function startSnowCycle() {
    if (snowSpawnIntervalId !== null) return;

    snowSpawnIntervalId = setInterval(
      createBackgroundParticles,
      constants.SNOW_SPAWN_INTERVAL_MS,
    );

    setTimeout(() => {
      if (snowSpawnIntervalId !== null) {
        clearInterval(snowSpawnIntervalId);
        snowSpawnIntervalId = null;
      }

      setTimeout(startSnowCycle, constants.SNOW_COOLDOWN_DURATION_MS);
    }, constants.SNOW_ACTIVE_DURATION_MS);
  }

  window.PenguinPet = {
    ...pet,
    effects: {
      createClickEffect,
      createFoodDrops,
      createBackgroundParticles,
      startSnowCycle,
    },
  };
})();
