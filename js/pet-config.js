(() => {
  const defaultActionStates = {
    idle: "assets/pinguin.svg",
    running: "assets/pinguin correndo.svg",
    jumping: "assets/pinguin pulando feliz.svg",
    dancing: "assets/pinguin dançando.svg",
    sleeping: "assets/pinguin dormindo.svg",
    scared: "assets/pinguin assustado.svg",
    crying: "assets/pinguin chorando.svg",
    angry: "assets/pinguin com raiva.svg",
    scratching: "assets/pinguin coçando a cabecinha.svg",
    waving: "assets/pinguin dando tchau.svg",
    shy: "assets/pinguin-apaixonado.svg",
    peeking: "assets/pinguin espiando curioso.svg",
    laughing: "assets/pinguin gargalhando.svg",
    thinking: "assets/pinguin-apaixonado.svg",
    eating: "assets/pinguin comendo peixe.svg",
    flying: "assets/pinguin voando.svg",
    turningBack: "assets/pinguin de costas.svg",
  };

  const actionStates =
    typeof window !== "undefined" &&
    window.PENGUIN_ASSETS &&
    typeof window.PENGUIN_ASSETS === "object"
      ? window.PENGUIN_ASSETS
      : defaultActionStates;

  const defaultPenguinSize = 120;
  const penguinSize =
    typeof window !== "undefined" &&
    window.PENGUIN_CONFIG &&
    Number.isFinite(window.PENGUIN_CONFIG.size) &&
    window.PENGUIN_CONFIG.size > 0
      ? window.PENGUIN_CONFIG.size
      : defaultPenguinSize;

  const defaultSnowTopRatio = 0.86;
  const snowTopRatio =
    typeof window !== "undefined" &&
    window.PENGUIN_CONFIG &&
    Number.isFinite(window.PENGUIN_CONFIG.groundRatio) &&
    window.PENGUIN_CONFIG.groundRatio > 0 &&
    window.PENGUIN_CONFIG.groundRatio <= 1
      ? window.PENGUIN_CONFIG.groundRatio
      : defaultSnowTopRatio;

  const backgroundImage =
    typeof window !== "undefined" &&
    window.PENGUIN_CONFIG &&
    typeof window.PENGUIN_CONFIG.backgroundImage === "string" &&
    window.PENGUIN_CONFIG.backgroundImage.length > 0
      ? window.PENGUIN_CONFIG.backgroundImage
      : "assets/backgroung-dark.png";

  window.PenguinPet = {
    ...(window.PenguinPet || {}),
    actionStates,
    constants: {
      penguinSize,
      halfPenguinSize: penguinSize / 2,
      snowTopRatio,
      backgroundImage,
      BUBBLE_BASE_INTERVAL_MS: 60000,
      BUBBLE_INTERVAL_JITTER_MS: 0,
      BUBBLE_SHOW_CHANCE: 0.6,
      EMOTION_DURATION_MULTIPLIER: 1.35,
      PRELUDE_EMOTIONS: ["crying", "shy", "angry"],
      PRELUDE_EMOTION_DURATION_MS: 2200,
      PRELUDE_IDLE_DURATION_MS: 900,
      PRELUDE_CHANCE: 0.35,
      BEHAVIOR_DELAY_MIN_MS: 2400,
      BEHAVIOR_DELAY_VARIATION_MS: 2600,
      STEP_TRANSITION_DELAY_MS: 700,
      STEP_TRANSITION_DELAY_VARIATION_MS: 450,
      SPEED_WALK: 1.5,
      SPEED_WALK_FAST: 2.2,
      SPEED_CHASE: 2.2,
      SPEED_FLEE: 2.8,
      SNOW_ACTIVE_DURATION_MS: 15000,
      SNOW_COOLDOWN_DURATION_MS: 3600000,
      SNOW_SPAWN_INTERVAL_MS: 400,
    },
    runtime: {
      mouseX: window.innerWidth / 2,
      mouseY: window.innerHeight / 2,
      isMouseInsideViewport: true,
      isFishCursorEnabled: true,
    },
  };
})();
