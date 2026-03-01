  const bootstrapPetApp = () => {
    const pet = window.PenguinPet || {};
    const constants = pet.constants || {};
    const phrases = pet.phrases || {};
    const runtime = pet.runtime || {};
    const Penguin = pet.Penguin;
    const effects = pet.effects || {};
    const modules = window.PenguinPetModules || {};

    if (typeof document !== "undefined" && document.body) {
      const backgroundTargetElements = [document.documentElement, document.body];

      if (Number.isFinite(constants.penguinSize)) {
        document.body.style.setProperty("--penguin-size", `${constants.penguinSize}px`);
      }

      backgroundTargetElements.forEach((element) => {
        if (!element) return;
        element.style.backgroundImage = `url("${constants.backgroundImage}")`;
        element.style.backgroundSize = "cover";
        element.style.backgroundPosition = "center bottom";
        element.style.backgroundRepeat = "no-repeat";
      });
    }

    if (typeof Penguin !== "function") return;

    const penguin = new Penguin();

    window.PenguinPet = {
      ...pet,
      runtime,
      penguin,
    };

    const fishEconomy =
      typeof modules.createFishEconomy === "function"
        ? modules.createFishEconomy({ phrases, runtime })
        : null;

    if (fishEconomy && typeof fishEconomy.initialize === "function") {
      fishEconomy.initialize();
    }

    const environmentEvents =
      typeof modules.createEnvironmentEvents === "function"
        ? modules.createEnvironmentEvents({
            penguin,
            effects,
            runtime,
            constants,
            fishEconomy,
          })
        : null;

    if (environmentEvents && typeof environmentEvents.attach === "function") {
      environmentEvents.attach();
    }

    const weatherStartDelayMs = Number.isFinite(constants.WEATHER_START_DELAY_MS)
      ? constants.WEATHER_START_DELAY_MS
      : 20000;
    const snowStartDelayMs = Number.isFinite(constants.SNOW_START_DELAY_MS)
      ? constants.SNOW_START_DELAY_MS
      : weatherStartDelayMs;
    const rainStartDelayMs = Number.isFinite(constants.RAIN_START_DELAY_MS)
      ? constants.RAIN_START_DELAY_MS
      : weatherStartDelayMs;

    setTimeout(() => {
      if (typeof effects.startSnowCycle === "function") {
        effects.startSnowCycle();
      }
    }, Math.max(0, snowStartDelayMs));

    setTimeout(() => {
      if (typeof effects.startRainCycle === "function") {
        effects.startRainCycle();
      }
    }, Math.max(0, rainStartDelayMs));

    setTimeout(() => {
      if (typeof effects.startShootingStarCycle === "function") {
        effects.startShootingStarCycle();
      }
    }, Math.max(0, weatherStartDelayMs));
  };

  window.PenguinPetModules = {
    ...(window.PenguinPetModules || {}),
    bootstrapPetApp,
  };
