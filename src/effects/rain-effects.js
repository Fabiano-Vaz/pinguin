(() => {
  const effects = (window.PenguinPetEffects = window.PenguinPetEffects || {});

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
    const constants = effects.getConstants ? effects.getConstants() : {};
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

  Object.assign(effects, {
    createRainSplash,
    createRainDrop,
  });
})();
