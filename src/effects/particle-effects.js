(() => {
  const effects = (window.PenguinPetEffects = window.PenguinPetEffects || {});

  function createParticle(x, y) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.textContent = ["❄️"][Math.floor(Math.random() * 3)];
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

  function createBackgroundParticles() {
    const flake = document.createElement("div");
    flake.className = "snowflake";
    const size = Math.random() * 4 + 2;
    const durationSec = Math.random() * 6 + 6;
    const startX = Math.random() * (window.innerWidth + 80) - 40;
    const driftMid = (Math.random() * 110 - 55).toFixed(1);
    const driftEnd = (Math.random() * 190 - 95).toFixed(1);
    const blur = Math.random() < 0.2 ? 1.2 : 0;

    flake.style.left = `${startX}px`;
    flake.style.top = "-16px";
    flake.style.width = `${size}px`;
    flake.style.height = `${size}px`;
    flake.style.opacity = (Math.random() * 0.32 + 0.24).toFixed(2);
    flake.style.filter = `blur(${blur}px)`;
    flake.style.setProperty("--snow-drift-mid", `${driftMid}px`);
    flake.style.setProperty("--snow-drift-end", `${driftEnd}px`);
    flake.style.animationDuration = `${durationSec.toFixed(2)}s`;
    document.body.appendChild(flake);

    const totalMs = durationSec * 1000;
    const vanishEarly = Math.random() < 0.1;
    if (vanishEarly) {
      const fadeAt = totalMs * (0.64 + Math.random() * 0.22);
      setTimeout(() => {
        if (flake.isConnected) flake.classList.add("fade-early");
      }, fadeAt);
    }

    const removeAfter = vanishEarly
      ? totalMs * (0.78 + Math.random() * 0.18)
      : totalMs + 180;
    setTimeout(() => {
      if (flake.isConnected) flake.remove();
    }, removeAfter);
  }

  function spawnExtraSnow(x, y) {
    const count = Math.floor(Math.random() * 5) + 8;
    for (let i = 0; i < count; i += 1) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.textContent = ["❄️", "❄️"][Math.floor(Math.random() * 2)];
      particle.style.left = x + (Math.random() - 0.5) * 120 + "px";
      particle.style.top = y + (Math.random() - 0.5) * 60 + "px";
      particle.style.fontSize = Math.random() * 18 + 10 + "px";
      particle.style.animation = `particleFall ${Math.random() * 2 + 1}s ease-out`;
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 3500);
    }
  }

  Object.assign(effects, {
    createParticle,
    createClickEffect,
    createBackgroundParticles,
    spawnExtraSnow,
  });
})();
