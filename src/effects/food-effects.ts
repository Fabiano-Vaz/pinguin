(() => {
  const effects = (window.PenguinPetEffects = window.PenguinPetEffects || {});

  function createFoodDrops(x, y, count = 6) {
    const constants = effects.getConstants ? effects.getConstants() : {};
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
      const margin = (constants.penguinSize || 120) * 1.2;
      const landedX = Math.max(
        margin,
        Math.min(
          startX + (Math.random() - 0.5) * 120,
          window.innerWidth - margin,
        ),
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

      targets.push({
        element: fish,
        x: landedX,
        y: targetCenterY,
      });

      setTimeout(() => {
        if (!fish.isConnected) return;
        if (fish.classList.contains("eaten")) return;
        fish.classList.add("eaten");
        setTimeout(() => {
          if (fish.isConnected) fish.remove();
        }, 240);
      }, 40000);
    }

    return targets;
  }

  effects.createFoodDrops = createFoodDrops;
})();
