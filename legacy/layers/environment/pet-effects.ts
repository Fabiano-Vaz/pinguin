// @ts-nocheck
(() => {
  const pet = window.PenguinPet || {};
  const constants = pet.constants || {};

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
  let snowCooldownTimeoutId = null;
  let snowActiveTimeoutId = null;

  function createRainDrop() {
    const drop = document.createElement("div");
    drop.className = "rain-drop";
    const height = Math.random() * 16 + 12;
    const duration = Math.random() * 0.15 + 0.22;
    const startX = Math.random() * (window.innerWidth + 100) - 50;
    drop.style.left = startX + "px";
    drop.style.top = "-" + (height + 4) + "px";
    drop.style.height = height + "px";
    drop.style.animationDuration = duration + "s";
    document.body.appendChild(drop);
    setTimeout(() => drop.remove(), (duration + 0.1) * 1000);
  }

  let rainSpawnIntervalId = null;
  let rainCooldownTimeoutId = null;
  let rainActiveTimeoutId = null;
  const WEATHER_RETRY_DELAY_MS = 5000;

  function stopSnowCycle(clearVisuals = false) {
    if (snowSpawnIntervalId !== null) {
      clearInterval(snowSpawnIntervalId);
      snowSpawnIntervalId = null;
    }
    if (snowCooldownTimeoutId !== null) {
      clearTimeout(snowCooldownTimeoutId);
      snowCooldownTimeoutId = null;
    }
    if (snowActiveTimeoutId !== null) {
      clearTimeout(snowActiveTimeoutId);
      snowActiveTimeoutId = null;
    }
    if (clearVisuals) {
      document.querySelectorAll(".particle").forEach((el) => el.remove());
    }
  }

  function stopRainCycle(clearVisuals = false) {
    if (rainSpawnIntervalId !== null) {
      clearInterval(rainSpawnIntervalId);
      rainSpawnIntervalId = null;
    }
    if (rainCooldownTimeoutId !== null) {
      clearTimeout(rainCooldownTimeoutId);
      rainCooldownTimeoutId = null;
    }
    if (rainActiveTimeoutId !== null) {
      clearTimeout(rainActiveTimeoutId);
      rainActiveTimeoutId = null;
    }
    if (clearVisuals) {
      document.querySelectorAll(".rain-drop").forEach((el) => el.remove());
    }
    const p = window.PenguinPet && window.PenguinPet.penguin;
    if (p && typeof p.hideUmbrella === "function") {
      p.hideUmbrella();
    }
  }

  function startRainCycle() {
    if (rainSpawnIntervalId !== null) return;
    if (snowSpawnIntervalId !== null) stopSnowCycle(true);

    const penguin = window.PenguinPet && window.PenguinPet.penguin;
    if (penguin && typeof penguin.showUmbrella === "function") {
      penguin.showUmbrella();
    }

    rainSpawnIntervalId = setInterval(
      createRainDrop,
      constants.RAIN_SPAWN_INTERVAL_MS,
    );

    rainActiveTimeoutId = setTimeout(() => {
      rainActiveTimeoutId = null;
      if (rainSpawnIntervalId !== null) {
        clearInterval(rainSpawnIntervalId);
        rainSpawnIntervalId = null;
      }
      const p = window.PenguinPet && window.PenguinPet.penguin;
      if (p && typeof p.hideUmbrella === "function") {
        p.hideUmbrella();
      }
      if (rainCooldownTimeoutId !== null) clearTimeout(rainCooldownTimeoutId);
      rainCooldownTimeoutId = setTimeout(
        startRainCycle,
        constants.RAIN_COOLDOWN_DURATION_MS,
      );
    }, constants.RAIN_ACTIVE_DURATION_MS);
  }

  function startSnowCycle() {
    if (snowSpawnIntervalId !== null) return;
    if (rainSpawnIntervalId !== null) stopRainCycle(true);

    snowSpawnIntervalId = setInterval(
      createBackgroundParticles,
      constants.SNOW_SPAWN_INTERVAL_MS,
    );

    snowActiveTimeoutId = setTimeout(() => {
      snowActiveTimeoutId = null;
      if (snowSpawnIntervalId !== null) {
        clearInterval(snowSpawnIntervalId);
        snowSpawnIntervalId = null;
      }

      if (snowCooldownTimeoutId !== null) clearTimeout(snowCooldownTimeoutId);
      snowCooldownTimeoutId = setTimeout(
        startSnowCycle,
        constants.SNOW_COOLDOWN_DURATION_MS,
      );
    }, constants.SNOW_ACTIVE_DURATION_MS);
  }

  function isSnowing() {
    return snowSpawnIntervalId !== null;
  }

  function isRaining() {
    return rainSpawnIntervalId !== null;
  }

  // Estouro de neve extra ao clicar durante neve
  function spawnExtraSnow(x, y) {
    const count = Math.floor(Math.random() * 5) + 8;
    for (let i = 0; i < count; i += 1) {
      const p = document.createElement("div");
      p.className = "particle";
      p.textContent = ["❄️", "❄️"][Math.floor(Math.random() * 2)];
      p.style.left = x + (Math.random() - 0.5) * 120 + "px";
      p.style.top = y + (Math.random() - 0.5) * 60 + "px";
      p.style.fontSize = Math.random() * 18 + 10 + "px";
      p.style.animation = `particleFall ${Math.random() * 2 + 1}s ease-out`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 3500);
    }
  }

  // Flash de relâmpago (cobre toda a tela)
  function createLightningFlash() {
    const overlay = document.createElement("div");
    overlay.className = "lightning-flash";
    document.body.appendChild(overlay);
    overlay.addEventListener("animationend", () => overlay.remove(), {
      once: true,
    });
  }

  // Raio visual que cai da posição X clicada (SVG zigzag animado)
  function createLightningBolt(x) {
    const uid = "bg" + Date.now();
    const svgNS = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 60 400");
    svg.style.cssText =
      "position:fixed;top:0;left:" +
      (x - 30) +
      "px;width:60px;height:90vh;" +
      "pointer-events:none;z-index:9998;overflow:visible;" +
      "filter:drop-shadow(0 0 6px #fff) drop-shadow(0 0 14px #ffeb3b) drop-shadow(0 0 28px #ff9800);";

    // Gradiente do topo (branco) até a base (laranja)
    const defs = document.createElementNS(svgNS, "defs");
    const grad = document.createElementNS(svgNS, "linearGradient");
    grad.setAttribute("id", uid);
    grad.setAttribute("x1", "0");
    grad.setAttribute("y1", "0");
    grad.setAttribute("x2", "0");
    grad.setAttribute("y2", "1");
    [
      ["0%", "#ffffff"],
      ["30%", "#fff176"],
      ["70%", "#ffeb3b"],
      ["100%", "#ff6f00"],
    ].forEach(function (s) {
      const stop = document.createElementNS(svgNS, "stop");
      stop.setAttribute("offset", s[0]);
      stop.setAttribute("stop-color", s[1]);
      grad.appendChild(stop);
    });
    defs.appendChild(grad);
    svg.appendChild(defs);

    // Polyline em zigzag clássico: topo-centro → baixo-direita → recuo-esquerda → ponta-direita
    // (0 0 60 400 viewport) — dois segmentos com "retorno" no meio
    const POINTS = "30,0 52,165 34,165 58,400";
    const PATH_LEN = 520; // comprimento estimado da polyline

    // Halo externo (mais espesso, semitransparente)
    const halo = document.createElementNS(svgNS, "polyline");
    halo.setAttribute("points", POINTS);
    halo.setAttribute("fill", "none");
    halo.setAttribute("stroke", "url(#" + uid + ")");
    halo.setAttribute("stroke-width", "9");
    halo.setAttribute("stroke-linecap", "round");
    halo.setAttribute("stroke-linejoin", "round");
    halo.setAttribute("stroke-opacity", "0.45");
    halo.style.strokeDasharray = PATH_LEN;
    halo.style.strokeDashoffset = PATH_LEN;
    halo.classList.add("bolt-path");
    svg.appendChild(halo);

    // Núcleo (fino e brilhante)
    const core = document.createElementNS(svgNS, "polyline");
    core.setAttribute("points", POINTS);
    core.setAttribute("fill", "none");
    core.setAttribute("stroke", "url(#" + uid + ")");
    core.setAttribute("stroke-width", "3.5");
    core.setAttribute("stroke-linecap", "round");
    core.setAttribute("stroke-linejoin", "round");
    core.style.strokeDasharray = PATH_LEN;
    core.style.strokeDashoffset = PATH_LEN;
    core.classList.add("bolt-path");
    svg.appendChild(core);

    document.body.appendChild(svg);
    setTimeout(function () {
      svg.remove();
    }, 700);
  }

  // Rajada de vento: streaks horizontais + balanço no pinguim
  // direction: 1 = esquerda→direita, -1 = direita→esquerda
  function createWindGust(direction) {
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

    // Balança e empurra o pinguim
    const p = window.PenguinPet && window.PenguinPet.penguin;
    if (p && p.element) {
      // Inclinação visual sem conflitar com o transform principal do pinguim
      if (p.windTiltPhaseATimeoutId) clearTimeout(p.windTiltPhaseATimeoutId);
      if (p.windTiltPhaseBTimeoutId) clearTimeout(p.windTiltPhaseBTimeoutId);
      p.windTilt = dir * 8;
      p.windTiltPhaseATimeoutId = setTimeout(() => {
        p.windTilt = dir * -4;
      }, 220);
      p.windTiltPhaseBTimeoutId = setTimeout(() => {
        p.windTilt = 0;
      }, 560);

      // Desloca fisicamente o pinguim na direção do vento
      const push = (Math.random() * 40 + 30) * dir;
      const maxX = window.innerWidth - (constants.penguinSize || 86);
      p.x = Math.max(0, Math.min(maxX, (p.x || 0) + push));
      p.targetX = Math.max(0, Math.min(maxX, (p.targetX || p.x) + push * 0.6));
    }

    // Cria 1–2 redemoinhos (anéis circulares em espiral)
    const whirlCount = Math.random() < 0.55 ? 2 : 1;
    for (let w = 0; w < whirlCount; w += 1) {
      const container = document.createElement("div");
      container.className = "wind-whirl";

      const startX =
        Math.random() * window.innerWidth * 0.75 + window.innerWidth * 0.1;
      const startY = window.innerHeight * (0.58 + Math.random() * 0.25);
      const dx = dir * (window.innerWidth * (0.28 + Math.random() * 0.4));
      const dy = -(window.innerHeight * (0.12 + Math.random() * 0.22));
      const dur = Math.random() * 0.6 + 1.0;
      const delay = Math.random() * 0.2;

      container.style.left = startX + "px";
      container.style.top = startY + "px";
      container.style.transitionDuration = dur + "s";

      const inner = document.createElement("div");
      inner.className = "wind-whirl-inner";
      inner.style.animationDuration = dur + "s";
      inner.style.animationDelay = delay + "s";

      // 6 anéis de tamanho crescente, cada um com um arco de ~200° visível,
      // rotacionados progressivamente para aparentar uma espiral
      const rings = 6;
      const c = 60; // centro do container (120/2)
      for (let i = 0; i < rings; i += 1) {
        const size = 16 + i * 16; // 16, 32, 48, 64, 80, 96 px
        const rot = i * 42; // offset angular progressivo
        const alpha = 0.9 - i * 0.1; // mais opaco no centro

        const ring = document.createElement("div");
        ring.className = "wind-ring";
        ring.style.width = size + "px";
        ring.style.height = size + "px";
        ring.style.left = c - size / 2 + "px";
        ring.style.top = c - size / 2 + "px";
        ring.style.transform = `rotate(${rot}deg)`;
        // Mostrar ~200°: borda top + right visíveis, left + bottom transparentes
        const col = `rgba(200,230,255,${alpha.toFixed(2)})`;
        ring.style.borderTopColor = col;
        ring.style.borderRightColor = col;
        ring.style.borderBottomColor = "transparent";
        ring.style.borderLeftColor = "transparent";
        inner.appendChild(ring);
      }

      container.appendChild(inner);
      document.body.appendChild(container);

      // Disparar translate após 2 frames para a transition funcionar
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          container.style.opacity = "1";
          container.style.transform = `translate(${dx.toFixed(0)}px, ${dy.toFixed(0)}px)`;
        }),
      );

      setTimeout(() => container.remove(), (dur + delay + 0.2) * 1000);
    }
  }

  window.PenguinPet = {
    ...pet,
    effects: {
      createClickEffect,
      createFoodDrops,
      createBackgroundParticles,
      startSnowCycle,
      startRainCycle,
      isSnowing,
      isRaining,
      spawnExtraSnow,
      createLightningFlash,
      createLightningBolt,
      createWindGust,
    },
  };
})();

export {};
