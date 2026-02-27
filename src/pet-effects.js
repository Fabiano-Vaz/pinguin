(() => {
  const pet = window.PenguinPet || {};
  const constants = pet.constants || {};
  const phrases = pet.phrases || {};

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

  let snowSpawnIntervalId = null;
  let snowCooldownTimeoutId = null;
  let snowActiveTimeoutId = null;
  let snowManualMode = false;
  let snowmanSpawnIntervalId = null;
  let snowmanDespawnTimeoutId = null;
  let snowmanApproachPollIntervalId = null;
  let snowmanFlirtIntervalId = null;
  let activeSnowmanEl = null;
  let isSnowmanEncounterActive = false;

  const clearSnowmanEncounter = () => {
    if (snowmanDespawnTimeoutId !== null) {
      clearTimeout(snowmanDespawnTimeoutId);
      snowmanDespawnTimeoutId = null;
    }
    if (snowmanApproachPollIntervalId !== null) {
      clearInterval(snowmanApproachPollIntervalId);
      snowmanApproachPollIntervalId = null;
    }
    if (snowmanFlirtIntervalId !== null) {
      clearInterval(snowmanFlirtIntervalId);
      snowmanFlirtIntervalId = null;
    }
    if (activeSnowmanEl && activeSnowmanEl.isConnected) {
      activeSnowmanEl.classList.remove("visible");
      activeSnowmanEl.classList.add("exiting");
      const elToRemove = activeSnowmanEl;
      setTimeout(() => {
        if (elToRemove.isConnected) elToRemove.remove();
      }, 2200);
    }
    activeSnowmanEl = null;
    isSnowmanEncounterActive = false;

    const p = window.PenguinPet && window.PenguinPet.penguin;
    if (p && p.snowmanEncounterActive) {
      p.snowmanEncounterActive = false;
      if (
        typeof p.enforceFoodPriority === "function" &&
        p.enforceFoodPriority()
      ) {
        return;
      }
      p.aiLocked = false;
      if (!p.isMoving && !p.isDragging && typeof p.setState === "function") {
        p.setState("idle");
      }
      if (typeof p.scheduleNextBehavior === "function") {
        p.scheduleNextBehavior();
      }
    }
  };

  const beginSnowmanEncounter = () => {
    if (isSnowmanEncounterActive || !isSnowing()) return;
    if (isRaining()) return;

    const p = window.PenguinPet && window.PenguinPet.penguin;
    if (p && (p.isFishingActive || p.isDragging || p.isRanting)) return;

    const snowmanImgSrc =
      (window.PenguinPet &&
        window.PenguinPet.actionStates &&
        window.PenguinPet.actionStates.snowman) ||
      "assets/snowman.svg";
    const snowman = document.createElement("img");
    snowman.className = "snow-event-snowman";
    snowman.src = snowmanImgSrc;
    snowman.alt = "boneco de neve";
    snowman.draggable = false;

    const width = Math.round(68 + Math.random() * 20);
    const floorY = window.innerHeight * (constants.snowTopRatio || 0.86);
    const top = Math.round(floorY - width * 0.95);
    const margin = Math.round((constants.penguinSize || 120) * 0.9);
    const availableWidth = Math.max(40, window.innerWidth - margin * 2);
    let x = Math.round(margin + Math.random() * availableWidth);
    if (p && Number.isFinite(p.x)) {
      const penguinCenterX = p.x + (constants.halfPenguinSize || 60);
      const minGapFromPenguin = Math.round((constants.penguinSize || 120) * 1.25);
      for (let i = 0; i < 8; i += 1) {
        const candidate = Math.round(margin + Math.random() * availableWidth);
        const candidateCenterX = candidate + width / 2;
        if (Math.abs(candidateCenterX - penguinCenterX) >= minGapFromPenguin) {
          x = candidate;
          break;
        }
      }
    }

    snowman.style.width = `${width}px`;
    snowman.style.left = `${x}px`;
    snowman.style.top = `${Math.max(0, top)}px`;
    document.body.appendChild(snowman);
    // Force initial collapsed frame before growing to full size.
    void snowman.offsetWidth;
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (snowman.isConnected) snowman.classList.add("visible");
      }, 40);
    });

    activeSnowmanEl = snowman;
    isSnowmanEncounterActive = true;

    if (!p) {
      snowmanDespawnTimeoutId = setTimeout(clearSnowmanEncounter, 10000);
      return;
    }

    const targetCenterX = x + width / 2;
    const half = constants.halfPenguinSize || 60;
    const sideDirection = targetCenterX < window.innerWidth / 2 ? 1 : -1;
    const sideDistance = width * 0.55 + half * 0.95;
    const standCenterX = Math.max(
      half + 12,
      Math.min(
        window.innerWidth - half - 12,
        targetCenterX + sideDirection * sideDistance,
      ),
    );
    p.snowmanEncounterActive = true;
    p.aiLocked = true;
    p.stepQueue = [];
    p.isChasing = false;
    p.element.style.animation = "";

    const walkY =
      typeof p.getWalkMinY === "function"
        ? p.getWalkMinY() + half
        : p.y + half;
    if (typeof p.moveToPosition === "function") {
      p.moveToPosition(standCenterX, walkY, constants.SPEED_WALK || 1.5);
    }

    const startedAt = Date.now();
    const engageWhenClose = () => {
      if (!p.snowmanEncounterActive) return;
      if (!activeSnowmanEl || !activeSnowmanEl.isConnected) {
        clearSnowmanEncounter();
        return;
      }

      const centerX = (p.x || 0) + (constants.halfPenguinSize || 60);
      const closeEnough = Math.abs(centerX - standCenterX) <= 18;
      const timedOut = Date.now() - startedAt > 6500;
      if (!closeEnough && !timedOut) return;

      if (snowmanApproachPollIntervalId !== null) {
        clearInterval(snowmanApproachPollIntervalId);
        snowmanApproachPollIntervalId = null;
      }

      p.targetX = p.x;
      p.targetY = p.y;
      p.isMoving = false;
      const shouldFaceRight = targetCenterX >= centerX;
      if (p.facingRight !== shouldFaceRight) {
        p.facingRight = shouldFaceRight;
        if (typeof p.applyTransform === "function") p.applyTransform();
      }

      if (typeof p.setState === "function") p.setState("peeking");

      const flirtList =
        Array.isArray(phrases.snowmanFlirt) && phrases.snowmanFlirt.length > 0
          ? phrases.snowmanFlirt
          : ["Que boneco lindo..."];

      const phraseCount = Math.random() < 0.5 ? 1 : 2;
      let phraseIndex = 0;
      const speakFlirt = () => {
        if (!p.snowmanEncounterActive) return;
        if (phraseIndex >= phraseCount) return;
        phraseIndex += 1;
        if (typeof p.setState === "function") p.setState("thinking");
        if (typeof p.showSpeech === "function") {
          p.showSpeech(
            flirtList[Math.floor(Math.random() * flirtList.length)],
            4000,
            false,
          );
        }
      };

      setTimeout(() => {
        speakFlirt();
      }, 900);

      snowmanFlirtIntervalId = setInterval(() => {
        if (phraseIndex >= phraseCount) {
          clearInterval(snowmanFlirtIntervalId);
          snowmanFlirtIntervalId = null;
          return;
        }
        speakFlirt();
      }, 8000);

      snowmanDespawnTimeoutId = setTimeout(clearSnowmanEncounter, 12500);
    };

    snowmanApproachPollIntervalId = setInterval(engageWhenClose, 120);
    snowmanDespawnTimeoutId = setTimeout(clearSnowmanEncounter, 12500);
  };

  function createRainSplash(x, y, travelX, durationSec, isFarLayer) {
    const splash = document.createElement("div");
    splash.className = "rain-splash";
    if (isFarLayer) splash.classList.add("rain-splash--far");
    splash.style.left = `${x}px`;
    splash.style.top = `${y}px`;
    splash.style.setProperty("--splash-travel-x", `${travelX.toFixed(1)}px`);
    splash.style.animationDuration = `${Math.max(0.16, durationSec * 0.38).toFixed(3)}s`;
    document.body.appendChild(splash);
    setTimeout(() => splash.remove(), Math.max(260, durationSec * 420));
  }

  function createRainDrop() {
    const drop = document.createElement("div");
    drop.className = "rain-drop";

    const depthRoll = Math.random();
    const isFarLayer = depthRoll < 0.45;
    const isHeavyLayer = depthRoll > 0.96;
    if (isFarLayer) drop.classList.add("rain-drop--far");
    if (isHeavyLayer) drop.classList.add("rain-drop--heavy");

    const baseAngleDeg = Number.isFinite(constants.rainAngleDeg)
      ? constants.rainAngleDeg
      : 8;
    const angleJitterDeg = Number.isFinite(constants.rainAngleJitterDeg)
      ? constants.rainAngleJitterDeg
      : 2;
    const angleDeg = baseAngleDeg + (Math.random() * 2 - 1) * angleJitterDeg;

    const height = isFarLayer
      ? Math.random() * 5 + 9
      : isHeavyLayer
        ? Math.random() * 6 + 16
        : Math.random() * 6 + 11;
    const width = isFarLayer ? 0.9 : isHeavyLayer ? 1.6 : 1.2;
    const duration = isFarLayer
      ? Math.random() * 0.2 + 0.42
      : isHeavyLayer
        ? Math.random() * 0.13 + 0.32
        : Math.random() * 0.18 + 0.36;
    const startX = Math.random() * (window.innerWidth + 140) - 70;
    const startY = -(height + 6);
    const fallDistance = window.innerHeight * 1.05;
    const driftX = Math.tan((angleDeg * Math.PI) / 180) * fallDistance;
    const resolvedAngleDeg = (Math.atan2(driftX, fallDistance) * 180) / Math.PI;

    drop.style.left = `${startX}px`;
    drop.style.top = `${startY}px`;
    drop.style.height = `${height}px`;
    drop.style.width = `${width}px`;
    drop.style.animationDuration = `${duration.toFixed(3)}s`;
    drop.style.setProperty("--rain-angle", `${resolvedAngleDeg.toFixed(2)}deg`);
    drop.style.setProperty("--rain-drift-x", `${driftX.toFixed(1)}px`);
    drop.style.setProperty(
      "--rain-alpha",
      isFarLayer ? "0.26" : isHeavyLayer ? "0.42" : "0.34",
    );
    document.body.appendChild(drop);

    const splashChance = isFarLayer ? 0.06 : isHeavyLayer ? 0.18 : 0.1;
    if (Math.random() < splashChance) {
      const endX = startX + driftX;
      const endY = window.innerHeight * (0.9 + Math.random() * 0.09);
      setTimeout(() => {
        if (!drop.isConnected) return;
        createRainSplash(endX, endY, driftX, duration, isFarLayer);
      }, Math.max(40, duration * 760));
    }

    setTimeout(() => drop.remove(), Math.max(320, (duration + 0.12) * 1000));
  }

  let rainSpawnIntervalId = null;
  let rainCooldownTimeoutId = null;
  let rainActiveTimeoutId = null;
  let rainManualMode = false;
  let rainLightningTimeoutId = null;
  let lastLightningScareAt = 0;

  function scarePenguinFromLightning() {
    const now = Date.now();
    const scareCooldownMs = Number.isFinite(constants.RAIN_LIGHTNING_SCARE_COOLDOWN_MS)
      ? constants.RAIN_LIGHTNING_SCARE_COOLDOWN_MS
      : 2200;
    if (now - lastLightningScareAt < scareCooldownMs) return;
    lastLightningScareAt = now;

    const penguin = window.PenguinPet && window.PenguinPet.penguin;
    if (!penguin || penguin.isFishingActive || penguin.isDragging) return;
    if (typeof penguin.setState !== "function") return;

    penguin.setState("scared");
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

  function clearRainLightningCycle() {
    if (rainLightningTimeoutId !== null) {
      clearTimeout(rainLightningTimeoutId);
      rainLightningTimeoutId = null;
    }
  }

  function scheduleRainLightningCycle() {
    clearRainLightningCycle();
    if (!isRaining()) return;

    const minDelay =
      Number.isFinite(constants.RAIN_LIGHTNING_MIN_DELAY_MS)
        ? constants.RAIN_LIGHTNING_MIN_DELAY_MS
        : 2600;
    const maxDelay =
      Number.isFinite(constants.RAIN_LIGHTNING_MAX_DELAY_MS)
        ? constants.RAIN_LIGHTNING_MAX_DELAY_MS
        : 6800;
    const delay = Math.round(
      minDelay + Math.random() * Math.max(0, maxDelay - minDelay),
    );

    rainLightningTimeoutId = setTimeout(() => {
      rainLightningTimeoutId = null;
      if (!isRaining()) return;

      if (typeof createLightningFlash === "function") {
        createLightningFlash();
      }

      const penguin = window.PenguinPet && window.PenguinPet.penguin;
      const penguinCenterX =
        penguin &&
        Number.isFinite(penguin.x) &&
        Number.isFinite(constants.halfPenguinSize)
          ? penguin.x + constants.halfPenguinSize
          : null;
      const minGapFromPenguin = Number.isFinite(constants.penguinSize)
        ? constants.penguinSize * 1.4
        : 120;
      const margin = 40;
      let strikeX = margin + Math.random() * Math.max(1, window.innerWidth - margin * 2);

      if (Number.isFinite(penguinCenterX)) {
        for (let i = 0; i < 8; i += 1) {
          if (Math.abs(strikeX - penguinCenterX) >= minGapFromPenguin) break;
          strikeX = margin + Math.random() * Math.max(1, window.innerWidth - margin * 2);
        }
      }

      const boltChance = Number.isFinite(constants.RAIN_LIGHTNING_BOLT_CHANCE)
        ? Math.max(0, Math.min(1, constants.RAIN_LIGHTNING_BOLT_CHANCE))
        : 0.35;
      if (
        typeof createLightningBolt === "function" &&
        Math.random() < boltChance
      ) {
        createLightningBolt(strikeX);
      }

      scheduleRainLightningCycle();
    }, delay);
  }

  function stopSnowCycle(clearVisuals = false, preserveManualMode = false) {
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
    if (snowmanSpawnIntervalId !== null) {
      clearInterval(snowmanSpawnIntervalId);
      snowmanSpawnIntervalId = null;
    }
    clearSnowmanEncounter();
    if (clearVisuals) {
      document.querySelectorAll(".particle").forEach((el) => el.remove());
      document.querySelectorAll(".snowflake").forEach((el) => el.remove());
      document.querySelectorAll(".snow-event-snowman").forEach((el) => el.remove());
    }
    if (!preserveManualMode) snowManualMode = false;
  }

  function stopRainCycle(clearVisuals = false, preserveManualMode = false) {
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
    clearRainLightningCycle();
    if (clearVisuals) {
      document.querySelectorAll(".rain-drop").forEach((el) => el.remove());
    }
    const p = window.PenguinPet && window.PenguinPet.penguin;
    if (p && typeof p.hideUmbrella === "function") {
      p.hideUmbrella();
    }
    if (!preserveManualMode) rainManualMode = false;
  }

  function startRainCycle(manual = false) {
    if (rainSpawnIntervalId !== null) return;
    rainManualMode = manual;
    if (snowSpawnIntervalId !== null) stopSnowCycle(true, true);

    const penguin = window.PenguinPet && window.PenguinPet.penguin;
    if (penguin && typeof penguin.showUmbrella === "function") {
      penguin.showUmbrella();
    }

    const rainDropsPerTick = Number.isFinite(constants.RAIN_DROPS_PER_TICK)
      ? Math.max(1, Math.round(constants.RAIN_DROPS_PER_TICK))
      : 3;
    rainSpawnIntervalId = setInterval(() => {
      for (let i = 0; i < rainDropsPerTick; i += 1) {
        createRainDrop();
      }
    }, constants.RAIN_SPAWN_INTERVAL_MS);
    scheduleRainLightningCycle();

    rainActiveTimeoutId = setTimeout(() => {
      rainActiveTimeoutId = null;
      if (rainSpawnIntervalId !== null) {
        clearInterval(rainSpawnIntervalId);
        rainSpawnIntervalId = null;
      }
      clearRainLightningCycle();
      const p = window.PenguinPet && window.PenguinPet.penguin;
      if (p && typeof p.hideUmbrella === "function") {
        p.hideUmbrella();
      }
      if (rainManualMode) return;
      if (rainCooldownTimeoutId !== null) clearTimeout(rainCooldownTimeoutId);
      rainCooldownTimeoutId = setTimeout(
        () => startRainCycle(false),
        constants.RAIN_COOLDOWN_DURATION_MS,
      );
    }, constants.RAIN_ACTIVE_DURATION_MS);
  }

  function startSnowCycle(manual = false) {
    if (snowSpawnIntervalId !== null) return;
    snowManualMode = manual;
    if (rainSpawnIntervalId !== null) stopRainCycle(true, true);

    snowSpawnIntervalId = setInterval(
      createBackgroundParticles,
      constants.SNOW_SPAWN_INTERVAL_MS,
    );

    snowmanSpawnIntervalId = setInterval(() => {
      if (!isSnowing() || isSnowmanEncounterActive) return;
      if (Math.random() < 0.22) {
        beginSnowmanEncounter();
      }
    }, 6500);

    snowActiveTimeoutId = setTimeout(() => {
      snowActiveTimeoutId = null;
      if (snowSpawnIntervalId !== null) {
        clearInterval(snowSpawnIntervalId);
        snowSpawnIntervalId = null;
      }
      if (snowmanSpawnIntervalId !== null) {
        clearInterval(snowmanSpawnIntervalId);
        snowmanSpawnIntervalId = null;
      }

      if (snowManualMode) return;
      if (snowCooldownTimeoutId !== null) clearTimeout(snowCooldownTimeoutId);
      snowCooldownTimeoutId = setTimeout(
        () => startSnowCycle(false),
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
    const maxOpacity = 0.58 + Math.random() * 0.32;
    const duration = 0.2 + Math.random() * 0.28;
    overlay.style.setProperty("--lightning-max-opacity", maxOpacity.toFixed(2));
    overlay.style.animationDuration = `${duration.toFixed(3)}s`;
    document.body.appendChild(overlay);
    overlay.addEventListener("animationend", () => overlay.remove(), {
      once: true,
    });
    scarePenguinFromLightning();
  }

  // Raio visual que cai da posição X clicada (SVG zigzag animado)
  function createLightningBolt(x) {
    const uid = "bg" + Date.now();
    const svgNS = "http://www.w3.org/2000/svg";
    const viewWidth = 90;
    const viewHeight = 460;
    const startX = 45;
    const segments = 7;
    const stepY = viewHeight / segments;

    const points = [];
    let currentX = startX;
    points.push(`${startX},0`);
    for (let i = 1; i < segments; i += 1) {
      const sway = (Math.random() * 2 - 1) * 20;
      currentX = Math.max(12, Math.min(viewWidth - 12, currentX + sway));
      points.push(`${currentX.toFixed(1)},${Math.round(stepY * i)}`);
    }
    const finalX = Math.max(10, Math.min(viewWidth - 10, currentX + (Math.random() * 2 - 1) * 14));
    points.push(`${finalX.toFixed(1)},${viewHeight}`);
    const mainPoints = points.join(" ");

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", `0 0 ${viewWidth} ${viewHeight}`);
    svg.style.cssText =
      "position:fixed;top:0;left:" +
      (x - viewWidth / 2) +
      "px;width:" +
      viewWidth +
      "px;height:95vh;" +
      "pointer-events:none;z-index:9998;overflow:visible;" +
      "filter:drop-shadow(0 0 7px #fff) drop-shadow(0 0 16px #e7f6ff) drop-shadow(0 0 28px #c9e5ff);";

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

    const PATH_LEN = 640;

    const halo = document.createElementNS(svgNS, "polyline");
    halo.setAttribute("points", mainPoints);
    halo.setAttribute("fill", "none");
    halo.setAttribute("stroke", "url(#" + uid + ")");
    halo.setAttribute("stroke-width", "10");
    halo.setAttribute("stroke-linecap", "round");
    halo.setAttribute("stroke-linejoin", "round");
    halo.setAttribute("stroke-opacity", "0.34");
    halo.style.strokeDasharray = PATH_LEN;
    halo.style.strokeDashoffset = PATH_LEN;
    halo.classList.add("bolt-path");
    svg.appendChild(halo);

    const core = document.createElementNS(svgNS, "polyline");
    core.setAttribute("points", mainPoints);
    core.setAttribute("fill", "none");
    core.setAttribute("stroke", "url(#" + uid + ")");
    core.setAttribute("stroke-width", "3.2");
    core.setAttribute("stroke-linecap", "round");
    core.setAttribute("stroke-linejoin", "round");
    core.style.strokeDasharray = PATH_LEN;
    core.style.strokeDashoffset = PATH_LEN;
    core.classList.add("bolt-path");
    svg.appendChild(core);

    const branchCount = Math.random() < 0.4 ? 1 : 2;
    for (let i = 0; i < branchCount; i += 1) {
      const branchStartIndex = 1 + Math.floor(Math.random() * (segments - 2));
      const [bx, by] = points[branchStartIndex].split(",").map(Number);
      const dir = Math.random() < 0.5 ? -1 : 1;
      const b1x = Math.max(6, Math.min(viewWidth - 6, bx + dir * (10 + Math.random() * 16)));
      const b1y = Math.min(viewHeight - 50, by + 36 + Math.random() * 40);
      const b2x = Math.max(6, Math.min(viewWidth - 6, b1x + dir * (8 + Math.random() * 16)));
      const b2y = Math.min(viewHeight - 8, b1y + 28 + Math.random() * 48);
      const branchPoints = `${bx},${by} ${b1x.toFixed(1)},${b1y.toFixed(1)} ${b2x.toFixed(1)},${b2y.toFixed(1)}`;
      const branch = document.createElementNS(svgNS, "polyline");
      branch.setAttribute("points", branchPoints);
      branch.setAttribute("fill", "none");
      branch.setAttribute("stroke", "url(#" + uid + ")");
      branch.setAttribute("stroke-width", "2.1");
      branch.setAttribute("stroke-linecap", "round");
      branch.setAttribute("stroke-linejoin", "round");
      branch.style.strokeDasharray = "180";
      branch.style.strokeDashoffset = "180";
      branch.classList.add("bolt-branch");
      branch.style.animationDelay = `${(0.05 + Math.random() * 0.11).toFixed(3)}s`;
      svg.appendChild(branch);
    }

    document.body.appendChild(svg);
    setTimeout(function () {
      svg.remove();
    }, 860);
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

      if (typeof p.blowAwayUmbrella === "function") {
        p.blowAwayUmbrella(dir);
      }
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
      stopSnowCycle,
      stopRainCycle,
      isSnowing,
      isRaining,
      spawnExtraSnow,
      createLightningFlash,
      createLightningBolt,
      createWindGust,
    },
  };
})();
