export {};

const effects = (window.PenguinPetEffects = window.PenguinPetEffects || {});

function resolveRainVector(constants) {
  const configuredAngle = Number.isFinite(constants.rainAngleDeg)
    ? Number(constants.rainAngleDeg)
    : 8;
  const direction = configuredAngle < 0 ? -1 : 1;

  const baseAngleAbs = Math.max(2, Math.abs(configuredAngle));
  const jitterAbs = Number.isFinite(constants.rainAngleJitterDeg)
    ? Math.max(0, Number(constants.rainAngleJitterDeg))
    : 2;
  const angleAbs = Math.max(
    2,
    baseAngleAbs + (Math.random() * 2 - 1) * jitterAbs,
  );

  return {
    direction,
    angleDeg: direction * angleAbs,
  };
}

function createRainSplash(x, y, travelX, durationSec, isFarLayer) {
  const splash = document.createElement("div");
  splash.className = "rain-splash";
  if (isFarLayer) splash.classList.add("rain-splash--far");

  splash.style.left = `${x.toFixed(1)}px`;
  splash.style.top = `${y.toFixed(1)}px`;
  splash.style.setProperty("--splash-travel-x", `${travelX.toFixed(1)}px`);
  splash.style.animationDuration = `${Math.max(0.16, durationSec * 0.38).toFixed(3)}s`;

  document.body.appendChild(splash);
  setTimeout(() => {
    if (splash.isConnected) splash.remove();
  }, Math.max(260, durationSec * 420));
}

function createRainDrop() {
  const constants = effects.getConstants ? effects.getConstants() : {};
  const { direction, angleDeg } = resolveRainVector(constants);

  const drop = document.createElement("div");
  drop.className = "rain-drop";

  const depthRoll = Math.random();
  const isFarLayer = depthRoll < 0.45;
  const isHeavyLayer = depthRoll > 0.96;
  if (isFarLayer) drop.classList.add("rain-drop--far");
  if (isHeavyLayer) drop.classList.add("rain-drop--heavy");

  const dropHeight = isFarLayer
    ? Math.random() * 5 + 9
    : isHeavyLayer
      ? Math.random() * 6 + 16
      : Math.random() * 6 + 11;
  const dropWidth = isFarLayer ? 0.9 : isHeavyLayer ? 1.6 : 1.2;

  const durationSec = isFarLayer
    ? Math.random() * 0.2 + 0.42
    : isHeavyLayer
      ? Math.random() * 0.13 + 0.32
      : Math.random() * 0.18 + 0.36;

  const fallDistance = window.innerHeight * 1.05;
  const driftMagnitude = Math.abs(Math.tan((Math.abs(angleDeg) * Math.PI) / 180) * fallDistance);
  const driftX = direction * driftMagnitude;
  const visualAngleDeg = -angleDeg;

  const startX = Math.random() * (window.innerWidth + 140) - 70;
  const startY = -(dropHeight + 6);

  drop.style.left = `${startX.toFixed(1)}px`;
  drop.style.top = `${startY.toFixed(1)}px`;
  drop.style.height = `${dropHeight.toFixed(1)}px`;
  drop.style.width = `${dropWidth.toFixed(1)}px`;
  drop.style.animationDuration = `${durationSec.toFixed(3)}s`;
  drop.style.setProperty("--rain-angle", `${visualAngleDeg.toFixed(2)}deg`);
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
    const splashTravelX = direction * (Math.random() * 9 + 4);

    setTimeout(() => {
      if (!drop.isConnected) return;
      createRainSplash(endX, endY, splashTravelX, durationSec, isFarLayer);
    }, Math.max(40, durationSec * 760));
  }

  setTimeout(() => {
    if (drop.isConnected) drop.remove();
  }, Math.max(320, (durationSec + 0.12) * 1000));
}

Object.assign(effects, {
  createRainSplash,
  createRainDrop,
});
