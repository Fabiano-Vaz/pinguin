(() => {
  type WeatherStatePayload = {
    snowing?: boolean;
    raining?: boolean;
  };

  type RuntimeBridge = {
    emitEvent?: (eventName: string, payload: unknown) => void;
    onEvent?: (eventName: string, handler: (payload: unknown) => void) => void;
  };

  type PenguinState = {
    x?: number;
    targetX?: number;
  };

  const hostWindow = window as Window & {
    PenguinPet?: {
      constants?: {
        snowTopRatio?: number;
        penguinSize?: number;
        halfPenguinSize?: number;
      };
      runtime?: RuntimeBridge;
      penguin?: PenguinState;
      effects?: Record<string, unknown>;
    };
  };
  const pet = hostWindow.PenguinPet || {};
  const getConstants = () => pet.constants || {};
  const getRuntime = (): RuntimeBridge => hostWindow.PenguinPet?.runtime || {};

  let snowing = false;
  let raining = false;

  const emit = (eventName: string, payload: unknown) => {
    const runtime = getRuntime();
    if (typeof runtime.emitEvent !== "function") return;
    runtime.emitEvent(eventName, payload);
  };

  const runtime = getRuntime();
  if (typeof runtime.onEvent === "function") {
    runtime.onEvent("effects:weather:state", (payload) => {
      const state = payload as WeatherStatePayload;
      snowing = Boolean(state && state.snowing);
      raining = Boolean(state && state.raining);
    });
  }

  function createFoodDrops(x: number, y: number, count = 6) {
    const constants = getConstants();
    const safeCount = Math.max(1, Math.min(12, Math.round(count)));
    const groundTopY = Math.max(
      0,
      Math.min(
        window.innerHeight * (constants.snowTopRatio ?? 0.86) - (constants.penguinSize ?? 120),
        window.innerHeight - (constants.penguinSize ?? 120),
      ),
    );
    const targetCenterY = groundTopY + (constants.halfPenguinSize ?? 60);
    const targets = [];

    for (let i = 0; i < safeCount; i += 1) {
      const fish = document.createElement("div");
      fish.className = "food-fish-drop";
      fish.textContent = "🐟";

      const startX = x + (Math.random() - 0.5) * 70;
      const startY = Math.max(0, y - 30 - Math.random() * 50);
      const margin = (constants.penguinSize ?? 120) * 1.2;
      const landedX = Math.max(
        margin,
        Math.min(startX + (Math.random() - 0.5) * 120, window.innerWidth - margin),
      );
      const landedY = Math.min(
        window.innerHeight - 20,
        groundTopY + (constants.penguinSize ?? 120) - 14 + Math.random() * 10,
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

  function createClickEffect(x: number, y: number) {
    emit("effects:click", { x, y, source: "legacy" });
  }

  function createBackgroundParticles() {
    emit("effects:snow:burst", {
      x: Math.random() * window.innerWidth,
      y: -8,
      count: 1,
      source: "legacy",
    });
  }

  function startSnowCycle() {
    snowing = true;
    raining = false;
    emit("effects:weather:start-snow", { source: "legacy" });
  }

  function startRainCycle() {
    raining = true;
    snowing = false;
    emit("effects:weather:start-rain", { source: "legacy" });
  }

  function isSnowing() {
    return snowing;
  }

  function isRaining() {
    return raining;
  }

  function spawnExtraSnow(x: number, y: number) {
    emit("effects:snow:burst", { x, y, count: 12, source: "legacy" });
  }

  function createLightningFlash() {
    emit("effects:lightning:flash", { source: "legacy" });
  }

  function createLightningBolt(x: number) {
    emit("effects:lightning:bolt", { x, source: "legacy" });
  }

  function createWindGust(direction: number) {
    const constants = getConstants();
    const dir = direction >= 0 ? 1 : -1;
    emit("effects:wind:gust", { direction: dir, source: "legacy" });

    const p = hostWindow.PenguinPet?.penguin;
    if (p && typeof p.x === "number") {
      const push = (Math.random() * 40 + 30) * dir;
      const maxX = window.innerWidth - (constants.penguinSize ?? 86);
      p.x = Math.max(0, Math.min(maxX, p.x + push));
      if (typeof p.targetX === "number") {
        p.targetX = Math.max(0, Math.min(maxX, p.targetX + push * 0.6));
      }
    }
  }

  hostWindow.PenguinPet = {
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
