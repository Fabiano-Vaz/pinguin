export {};

  const effects = (window.PenguinPetEffects = window.PenguinPetEffects || {});

  function createWindGust(direction) {
    const constants = effects.getConstants ? effects.getConstants() : {};
    const dir = direction >= 0 ? 1 : -1;
    const count = Math.floor(Math.random() * 6) + 7;
    const travel = window.innerWidth * 1.1;

    for (let i = 0; i < count; i += 1) {
      const streak = document.createElement("div");
      streak.className = "wind-streak";
      const w = Math.random() * 100 + 60;
      const duration = Math.random() * 0.25 + 0.3;
      const delay = Math.random() * 0.35;
      streak.style.top = Math.random() * window.innerHeight * 0.9 + "px";
      streak.style.width = w + "px";
      streak.style.setProperty("--wind-travel", dir * travel + "px");
      streak.style.animationDuration = duration + "s";
      streak.style.animationDelay = delay + "s";
      if (dir > 0) {
        streak.style.left = -w + "px";
      } else {
        streak.style.right = -w + "px";
        streak.style.left = "auto";
        streak.style.background =
          "linear-gradient(to left, transparent, rgba(200,230,255,0.7), transparent)";
      }
      document.body.appendChild(streak);
      setTimeout(() => streak.remove(), (duration + delay + 0.1) * 1000);
    }

    const penguin = window.PenguinPet && window.PenguinPet.penguin;
    if (penguin && penguin.element) {
      if (penguin.windTiltPhaseATimeoutId) clearTimeout(penguin.windTiltPhaseATimeoutId);
      if (penguin.windTiltPhaseBTimeoutId) clearTimeout(penguin.windTiltPhaseBTimeoutId);
      penguin.windTilt = dir * 8;
      penguin.windTiltPhaseATimeoutId = setTimeout(() => {
        penguin.windTilt = dir * -4;
      }, 220);
      penguin.windTiltPhaseBTimeoutId = setTimeout(() => {
        penguin.windTilt = 0;
      }, 560);

      const push = (Math.random() * 40 + 30) * dir;
      const maxX = window.innerWidth - (constants.penguinSize || 86);
      penguin.x = Math.max(0, Math.min(maxX, (penguin.x || 0) + push));
      penguin.targetX = Math.max(
        0,
        Math.min(maxX, (penguin.targetX || penguin.x) + push * 0.6),
      );

      if (typeof penguin.blowAwayUmbrella === "function") {
        penguin.blowAwayUmbrella(dir);
      }
    }

    const whirlCount = Math.random() < 0.5 ? 2 : 1;
    for (let i = 0; i < whirlCount; i += 1) {
      const container = document.createElement("div");
      container.className = "wind-whirl";

      const startX =
        Math.random() * window.innerWidth * 0.75 + window.innerWidth * 0.1;
      const startY = window.innerHeight * (0.58 + Math.random() * 0.25);
      const dx = dir * (window.innerWidth * (0.28 + Math.random() * 0.4));
      const dy = -(window.innerHeight * (0.12 + Math.random() * 0.22));
      const duration = Math.random() * 0.6 + 1.0;
      const delay = Math.random() * 0.2;
      const baseSize = Math.round(96 + Math.random() * 20);

      container.style.left = startX + "px";
      container.style.top = startY + "px";
      container.style.width = `${baseSize}px`;
      container.style.height = `${baseSize}px`;
      container.style.transitionDuration = duration + "s";

      const inner = document.createElement("div");
      inner.className = "wind-whirl-inner";
      inner.style.animationDuration = duration + "s";
      inner.style.animationDelay = delay + "s";

      const rings = 5;
      const center = baseSize / 2;
      for (let ringIndex = 0; ringIndex < rings; ringIndex += 1) {
        const size = 14 + ringIndex * ((baseSize - 22) / rings);
        const rotation = ringIndex * (40 + Math.random() * 9);
        const alpha = Math.max(0.2, 0.64 - ringIndex * 0.09);

        const ring = document.createElement("div");
        ring.className = "wind-ring";
        ring.style.width = size + "px";
        ring.style.height = size + "px";
        ring.style.left = center - size / 2 + "px";
        ring.style.top = center - size / 2 + "px";
        ring.style.transform = `rotate(${rotation.toFixed(1)}deg)`;
        ring.style.setProperty("--ring-start", `${Math.round(rotation * 1.3)}deg`);
        ring.style.setProperty("--ring-alpha", alpha.toFixed(2));
        ring.style.setProperty(
          "--ring-thickness",
          `${Math.max(2, 3.3 - ringIndex * 0.28).toFixed(2)}px`,
        );
        ring.style.setProperty(
          "--ring-blur",
          `${Math.max(0, ringIndex * 0.16 - 0.08).toFixed(2)}px`,
        );
        inner.appendChild(ring);
      }

      const core = document.createElement("div");
      core.className = "wind-whirl-core";
      core.style.width = `${Math.round(baseSize * 0.16)}px`;
      core.style.height = `${Math.round(baseSize * 0.16)}px`;
      inner.appendChild(core);

      const dustCount = 3 + Math.floor(Math.random() * 2);
      for (let d = 0; d < dustCount; d += 1) {
        const dust = document.createElement("div");
        dust.className = "wind-whirl-dust";
        dust.style.setProperty(
          "--dust-radius",
          `${Math.round(baseSize * (0.2 + Math.random() * 0.18))}px`,
        );
        dust.style.animationDuration = `${(0.9 + Math.random() * 0.35).toFixed(2)}s`;
        dust.style.animationDelay = `${(Math.random() * 0.24).toFixed(2)}s`;
        dust.style.width = `${(2 + Math.random() * 1.5).toFixed(2)}px`;
        dust.style.height = dust.style.width;
        inner.appendChild(dust);
      }

      container.appendChild(inner);
      document.body.appendChild(container);

      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          container.style.opacity = "1";
          container.style.transform = `translate(${dx.toFixed(0)}px, ${dy.toFixed(0)}px)`;
        }),
      );

      setTimeout(() => container.remove(), (duration + delay + 0.2) * 1000);
    }
  }

  effects.createWindGust = createWindGust;
