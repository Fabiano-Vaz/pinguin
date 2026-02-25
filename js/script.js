// Mapeamento de ações para SVGs específicos
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
  flying: "assets/pinguin voando.svg",
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
const halfPenguinSize = penguinSize / 2;
const BUBBLE_BASE_INTERVAL_MS = 300000;
const BUBBLE_INTERVAL_JITTER_MS = 120000;
const BUBBLE_SHOW_CHANCE = 0.6;
const EMOTION_DURATION_MULTIPLIER = 1.35;
const PRELUDE_EMOTIONS = ["crying", "shy", "angry"];
const PRELUDE_EMOTION_DURATION_MS = 2200;
const PRELUDE_IDLE_DURATION_MS = 900;
const PRELUDE_CHANCE = 0.35;
const BEHAVIOR_DELAY_MIN_MS = 2400;
const BEHAVIOR_DELAY_VARIATION_MS = 2600;
const STEP_TRANSITION_DELAY_MS = 700;
const STEP_TRANSITION_DELAY_VARIATION_MS = 450;
const SPEED_WALK = 1.5;
const SPEED_WALK_FAST = 2.2;
const SPEED_CHASE = 2.2;
const SPEED_FLEE = 2.8;
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

if (typeof document !== "undefined" && document.body) {
  const backgroundTargetElements = [document.documentElement, document.body];
  backgroundTargetElements.forEach((element) => {
    if (!element) return;
    element.style.backgroundImage = `url("${backgroundImage}")`;
    element.style.backgroundSize = "cover";
    element.style.backgroundPosition = "center bottom";
    element.style.backgroundRepeat = "no-repeat";
  });
}

const phrases = {
  idle: [
    "Oi! Tudo bem?",
    "Alguém me chamou?",
    "Tô aqui... só sendo fofo.",
    "Hm... e agora?",
    "Tô esperando o Wi-Fi carregar a vida.",
    "Bom dia! Ou boa tarde. Tanto faz.",
  ],
  running: [
    "WHEEE! Não me para!",
    "Correr é minha terapia!",
    "Alguém soltou o pinguim!!",
  ],
  jumping: [
    "YAAAY!",
    "Eu consigo voar... quase.",
    "Olha eu aqui em cima!",
    "Pulo, logo existo!",
    "Mais alto! MAIS ALTO!",
    "Oba oba oba!",
  ],
  dancing: [
    "Isso é vida, minha gente!",
    "Ninguém me para na pista!",
    "La la laaaa! 🎵",
    "Dança, pinguim, dança!",
  ],
  sleeping: [
    "Zzz...",
    "Tô só descansando os olhos...",
    "Sonhando com peixe fresco...",
    "Zzz... mais cinco minutinhos...",
  ],
  scared: [
    "AHHH! QUE FOI ISSO?!",
    "Minha alma saiu pelo bico!!",
    "Eu vi alguma coisa! Juro!",
    "Socorroooo!",
    "Faz isso não!!",
  ],
  crying: [
    "Buááá!",
    "Tô bem... tô bem... não tô.",
    "Snif snif... que vida dura...",
    "Alguém me dá um abraço?",
    "Tô chorando, mas com estilo.",
    "Isso não foi legal não... 😢",
  ],
  angry: [
    "GRRRR!",
    "Tô com a cabeça fumegando aqui!",
    "Quem fez isso?! QUEM FOI?!",
    "Não, não e NÃO!",
    "Caramba! Que tombo foi esse?!",
    "Ei! Mais cuidado comigo, pô!",
    "Que queda desnecessária... droga!",
  ],
  scratching: [
    "Coça coça coça...",
    "Hmm... tô pensando ou coçando?",
    "Esse lugar coça todo dia...",
    "Não olha assim pra mim.",
    "Operação coça-cabeça em andamento.",
  ],
  waving: [
    "Tchau tchau! 👋",
    "Até a próxima aventura!",
    "Volte sempre! Tenho saudade fácil.",
    "Vai com Deus! E com peixe.",
    "Flau flau! (é tchau em pinguinês)",
    "Até logo, amiguinho!",
  ],
  shy: [
    "Ui... que situação...",
    "Eu? Não... não sou eu não...",
    "Que vergonhinha...",
    "Tô vermelho embaixo da pena.",
    "Fica de boas... eu fico de corado.",
    "Não olha pra mim assim!",
  ],
  peeking: [
    "Psiu... tá seguro?",
    "O que é isso ali?!",
    "Espreitando com discrição total.",
    "Eu vi alguma coisa suspeita...",
    "Curioso? Eu? Jamais. (mentira)",
    "Quem é esse ser misterioso?",
  ],
  laughing: [
    "HAHAHAHAHA!",
    "Para! Para que eu vou morrer!",
    "Isso foi hilário demais!!",
    "Tô morrendo de rir aqui!",
    "Minha barriga tá doendo de rir!",
    "KEK KEK KEK!",
  ],
  thinking: ["Te amo!", "Acho que apaixonei!", "Vc é um xuxuzinho!"],
  flying: [
    "Vou conseguir! Só mais um pouquinho!",
    "Os pinguins PODEM voar. Hoje é o dia!",
    "Bate! Bate! BATE as asas!",
    "Eu juro que tô saindo do chão...",
    "A gravidade é fake news!",
    "Weeeeee!! (quase)",
  ],
};

// Sequências de comportamentos autônomos
// Cada função retorna um array de passos: { type, state, duration, anim }
const behaviors = [
  () => [{ type: "walk" }, { type: "act", state: "thinking", duration: 3000 }],
  () => [
    { type: "walk" },
    {
      type: "act",
      state: "dancing",
      duration: 3000,
      anim: "dance 0.7s ease-in-out infinite",
    },
    { type: "act", state: "laughing", duration: 2000 },
  ],
  () => [
    { type: "walk" },
    { type: "act", state: "sleeping", duration: 20000 },
    { type: "walk" },
  ],
  () => [
    { type: "walkEdge" },
    { type: "act", state: "peeking", duration: 3000 },
    { type: "walk" },
  ],
  () => [
    { type: "walk" },
    { type: "act", state: "scratching", duration: 2500 },
    { type: "walk" },
  ],
  () => [
    { type: "walkFast" },
    { type: "act", state: "scared", duration: 1500, anim: "shake 0.6s ease" },
    { type: "act", state: "shy", duration: 2000 },
    { type: "walk" },
  ],
  () => [
    { type: "jumpMove", duration: 1300 },
    { type: "act", state: "waving", duration: 2000 },
    { type: "walk" },
  ],
  () => [
    { type: "walk" },
    { type: "act", state: "crying", duration: 2500 },
    { type: "act", state: "shy", duration: 2000 },
    { type: "walk" },
  ],
  () => [
    { type: "walk" },
    { type: "act", state: "angry", duration: 2000, anim: "shake 0.5s ease" },
    {
      type: "act",
      state: "dancing",
      duration: 3000,
      anim: "dance 0.7s ease-in-out infinite",
    },
  ],
  () => [
    { type: "walkFast" },
    { type: "walk" },
    { type: "act", state: "waving", duration: 2000 },
  ],
  () => [
    { type: "flyMove", duration: 1800 },
    { type: "jumpMove", duration: 1000 },
    { type: "walk" },
  ],
];

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let isMouseInsideViewport = true;

class Penguin {
  constructor() {
    this.element = document.createElement("div");
    this.element.className = "penguin";
    this.img = document.createElement("img");
    this.element.appendChild(this.img);
    document.body.appendChild(this.element);

    this.x = window.innerWidth / 2 - halfPenguinSize;
    this.y = this.getGroundTopY();
    this.targetX = this.x;
    this.targetY = this.y;

    this.currentState = "";
    this.facingRight = true;
    this.isMoving = false;
    this.speed = SPEED_WALK_FAST;
    this.allowAirMovement = false;
    this.customMotion = null;
    this.lastUpdateTime = performance.now();

    this.bubble = null;
    this.bubbleTimeout = null;
    this.nextBubbleAt = Date.now() + this.getNextBubbleDelay();

    // Controle da IA
    this.aiLocked = false;
    this.stepQueue = [];

    // Interação com o mouse
    this.lastMouseZone = "far";
    this.mouseReactionCooldown = 0;
    this.isChasing = false;
    this.isDragging = false;
    this.dragMoved = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.suppressClickUntil = 0;

    this.setState("idle");
    this.setupEventListeners();
    this.update(this.lastUpdateTime);
    setTimeout(() => this.startNextBehavior(), 500);
  }

  // ── Estado ────────────────────────────────────────────────────────────────

  setState(state) {
    if (this.isDragging && state !== "flying") return;
    if (this.currentState === state) return;
    this.currentState = state;
    this.img.src = actionStates[state];
  }

  startWingFlap() {
    this.img.style.animation = "wingFlap 0.18s ease-in-out infinite";
  }

  stopWingFlap() {
    this.img.style.animation = "";
  }

  startJumpArc(targetX, targetY) {
    const clampedX = Math.max(
      0,
      Math.min(targetX, window.innerWidth - penguinSize),
    );
    const clampedY = this.clampY(targetY);
    const horizontalDistance = Math.abs(clampedX - this.x);
    const realisticDistance = Math.min(70, horizontalDistance);
    const apex = Math.max(
      10,
      Math.min(28, 12 + realisticDistance * 0.12),
    );
    const duration = Math.max(
      380,
      Math.min(620, 420 + realisticDistance * 2.1),
    );

    this.customMotion = {
      type: "jumpArc",
      startX: this.x,
      startY: this.y,
      targetX: clampedX,
      targetY: clampedY,
      duration,
      elapsed: 0,
      apex,
    };

    this.isMoving = true;
    this.allowAirMovement = true;
    this.setState("jumping");
  }

  startDropFall() {
    this.customMotion = {
      type: "fall",
      vy: 0,
      gravity: 1900,
      maxVy: 1400,
      targetY: this.getWalkMinY(),
    };
    this.isMoving = true;
    this.allowAirMovement = true;
    this.setState("flying");
    this.startWingFlap();
  }

  updateCustomMotion(dtSeconds) {
    if (!this.customMotion) return;

    if (this.customMotion.type === "jumpArc") {
      const motion = this.customMotion;
      motion.elapsed += dtSeconds * 1000;
      const t = Math.min(1, motion.elapsed / motion.duration);
      const arc = 4 * motion.apex * t * (1 - t);

      this.x = motion.startX + (motion.targetX - motion.startX) * t;
      this.y = motion.startY + (motion.targetY - motion.startY) * t - arc;

      if (t >= 1) {
        this.x = motion.targetX;
        this.y = motion.targetY;
        this.customMotion = null;
        this.isMoving = false;
        this.allowAirMovement = false;
        this.setState("idle");
      }
      return;
    }

    if (this.customMotion.type === "fall") {
      const motion = this.customMotion;
      motion.vy = Math.min(
        motion.maxVy,
        motion.vy + motion.gravity * dtSeconds,
      );
      this.y += motion.vy * dtSeconds;

      if (this.y >= motion.targetY) {
        this.y = motion.targetY;
        this.customMotion = null;
        this.isMoving = false;
        this.allowAirMovement = false;
        this.stopWingFlap();
        this.setState("idle");
      }
    }
  }

  // ── Fala ──────────────────────────────────────────────────────────────────

  getNextBubbleDelay() {
    return BUBBLE_BASE_INTERVAL_MS + Math.random() * BUBBLE_INTERVAL_JITTER_MS;
  }

  scheduleNextBubble() {
    this.nextBubbleAt = Date.now() + this.getNextBubbleDelay();
  }

  scaleEmotionDuration(durationMs) {
    return Math.max(300, Math.round(durationMs * EMOTION_DURATION_MULTIPLIER));
  }

  playLaughThenIdleThenLaugh(totalDuration, onDone) {
    const duration = Math.max(
      900,
      this.scaleEmotionDuration(totalDuration || 2000),
    );
    const firstLaugh = Math.round(duration * 0.4);
    const neutral = Math.round(duration * 0.2);
    const secondLaugh = duration - firstLaugh - neutral;

    this.element.style.animation = "";
    this.setState("laughing");
    this.speak();

    setTimeout(() => {
      if (!this.isMoving) this.setState("idle");
      setTimeout(() => {
        this.setState("laughing");
        setTimeout(() => {
          this.element.style.animation = "";
          if (!this.isMoving) this.setState("idle");
          if (typeof onDone === "function") onDone();
        }, secondLaugh);
      }, neutral);
    }, firstLaugh);
  }

  speak() {
    const now = Date.now();
    if (now < this.nextBubbleAt) return;
    if (Math.random() > BUBBLE_SHOW_CHANCE) {
      this.scheduleNextBubble();
      return;
    }

    if (this.bubble) this.bubble.remove();
    if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);

    const list = phrases[this.currentState];
    const text = list[Math.floor(Math.random() * list.length)];

    if (!text) {
      this.scheduleNextBubble();
      return;
    }

    this.bubble = document.createElement("div");
    this.bubble.className = "speech-bubble";

    const content = document.createElement("div");
    content.className = "bubble-content";
    content.textContent = text;
    this.bubble.appendChild(content);

    const dot1 = document.createElement("span");
    dot1.className = "bubble-dot";
    this.bubble.appendChild(dot1);

    const dot2 = document.createElement("span");
    dot2.className = "bubble-dot";
    this.bubble.appendChild(dot2);

    const dot3 = document.createElement("span");
    dot3.className = "bubble-dot";
    this.bubble.appendChild(dot3);

    document.body.appendChild(this.bubble);
    this.updateBubblePosition(); // após append para ter offsetWidth real

    this.bubbleTimeout = setTimeout(() => {
      if (this.bubble) {
        this.bubble.remove();
        this.bubble = null;
      }
    }, 3000);
    this.scheduleNextBubble();
  }

  updateBubblePosition() {
    if (!this.bubble) return;

    const content = this.bubble.querySelector(".bubble-content");
    if (!content) return;

    const cw = content.offsetWidth || penguinSize;
    const ch = content.offsetHeight || 47;
    const viewportMargin = 8;

    // Centraliza o balão no pinguim e mantém dentro da viewport.
    let bubbleLeft = this.x + halfPenguinSize - cw / 2;
    bubbleLeft = Math.max(
      viewportMargin,
      Math.min(bubbleLeft, window.innerWidth - cw - viewportMargin),
    );

    // Prioriza acima do pinguim; se faltar espaço, posiciona abaixo.
    let bubbleTop = this.y - ch - 24;
    if (bubbleTop < viewportMargin) {
      bubbleTop = this.y + penguinSize + 16;
    }

    this.bubble.style.left = bubbleLeft + "px";
    this.bubble.style.top = bubbleTop + "px";

    const dots = this.bubble.querySelectorAll(".bubble-dot");
    if (dots.length < 3) return;

    const isBelowPenguin = bubbleTop > this.y;
    // Ponto de partida da cauda: embaixo quando o balão está acima, em cima quando está abaixo.
    const startX = cw / 2;
    const startY = isBelowPenguin ? 0 : ch;

    // Centro do pinguim em coordenadas locais do .speech-bubble
    const penguinCX = this.x + halfPenguinSize - bubbleLeft;
    const penguinCY = this.y + halfPenguinSize - bubbleTop;

    const dx = penguinCX - startX;
    const dy = penguinCY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;

    const specs = [
      { size: 10, gap: 10 },
      { size: 7, gap: 19 },
      { size: 4, gap: 27 },
    ];

    dots.forEach((dot, i) => {
      const { size, gap } = specs[i];
      dot.style.width = size + "px";
      dot.style.height = size + "px";
      dot.style.left = startX + nx * gap - size / 2 + "px";
      dot.style.top = startY + ny * gap - size / 2 + "px";
    });
  }

  // ── Movimento ─────────────────────────────────────────────────────────────

  getFloorY() {
    return window.innerHeight * snowTopRatio;
  }

  getGroundTopY() {
    return Math.max(
      0,
      Math.min(
        this.getFloorY() - penguinSize,
        window.innerHeight - penguinSize,
      ),
    );
  }

  getWalkMinY() {
    return this.getGroundTopY();
  }

  getWalkMaxY() {
    // Limita a caminhada à faixa do "chão" (topo da neve), evitando descer para o rodapé.
    return this.getWalkMinY() + 10;
  }

  getFlyMinY() {
    return Math.max(0, this.getWalkMinY() - 90);
  }

  clampY(y, allowAir = false) {
    const minY = allowAir ? this.getFlyMinY() : this.getWalkMinY();
    return Math.max(minY, Math.min(y, this.getWalkMaxY()));
  }

  randomWalkY() {
    const minY = this.getWalkMinY();
    const maxY = this.getWalkMaxY();
    return minY + Math.random() * Math.max(1, maxY - minY);
  }

  randomFlyY() {
    const minY = this.getFlyMinY();
    const maxY = Math.max(minY, this.getWalkMinY() + 20);
    return minY + Math.random() * Math.max(1, maxY - minY);
  }

  moveToPosition(tx, ty, speed, allowAir = false) {
    this.targetX = tx - halfPenguinSize;
    this.allowAirMovement = allowAir;
    this.targetY =
      typeof ty === "number"
        ? this.clampY(ty - halfPenguinSize, allowAir)
        : this.getWalkMinY();
    this.isMoving = true;
    if (speed) this.speed = speed;
  }

  randomTarget(nearEdge) {
    const margin = 80;
    const w = window.innerWidth - penguinSize;
    const randomY = this.randomWalkY();
    if (nearEdge) {
      const edge = Math.floor(Math.random() * 4);
      if (edge === 0) return { x: Math.random() * w + margin, y: randomY };
      if (edge === 1) return { x: Math.random() * w + margin, y: randomY };
      if (edge === 2) return { x: margin, y: randomY };
      return { x: w - margin, y: randomY };
    }
    return {
      x: margin + Math.random() * (w - margin * 2),
      y: randomY,
    };
  }

  randomShortWalkTarget() {
    const maxOffset = 120;
    const minX = halfPenguinSize;
    const maxX = window.innerWidth - halfPenguinSize;
    const targetCenterX = Math.max(
      minX,
      Math.min(
        this.x + halfPenguinSize + (Math.random() * 2 - 1) * maxOffset,
        maxX,
      ),
    );

    return {
      x: targetCenterX - halfPenguinSize,
      y: this.randomWalkY(),
    };
  }

  insertWalkBetweenEmotionSteps(currentStep) {
    if (!currentStep || currentStep.type !== "act") return;
    if (currentStep.state === "idle") return;
    if (this.stepQueue.length === 0) return;

    const nextStep = this.stepQueue[0];
    if (!nextStep || nextStep.type !== "act" || nextStep.state === "idle") {
      return;
    }

    this.stepQueue.unshift({ type: "walkShort" });
  }

  // ── IA autônoma ───────────────────────────────────────────────────────────

  scheduleNextBehavior() {
    const delay =
      BEHAVIOR_DELAY_MIN_MS + Math.random() * BEHAVIOR_DELAY_VARIATION_MS;
    setTimeout(() => this.startNextBehavior(), delay);
  }

  getStepTransitionDelay() {
    return (
      STEP_TRANSITION_DELAY_MS +
      Math.random() * STEP_TRANSITION_DELAY_VARIATION_MS
    );
  }

  startNextBehavior() {
    if (this.aiLocked) return;
    const seq = behaviors[Math.floor(Math.random() * behaviors.length)]();
    const withPrelude = Math.random() < PRELUDE_CHANCE;

    this.stepQueue = withPrelude
      ? [
          {
            type: "act",
            state:
              PRELUDE_EMOTIONS[
                Math.floor(Math.random() * PRELUDE_EMOTIONS.length)
              ],
            duration: PRELUDE_EMOTION_DURATION_MS,
          },
          { type: "act", state: "idle", duration: PRELUDE_IDLE_DURATION_MS },
          ...seq,
        ]
      : seq;
    this.runNextStep();
  }

  runNextStep() {
    if (this.stepQueue.length === 0) {
      this.aiLocked = false;
      this.scheduleNextBehavior();
      return;
    }
    this.aiLocked = true;
    const step = this.stepQueue.shift();

    if (
      step.type === "walk" ||
      step.type === "walkFast" ||
      step.type === "walkEdge" ||
      step.type === "walkShort"
    ) {
      const sp = step.type === "walkFast" ? SPEED_WALK_FAST : SPEED_WALK;
      const t =
        step.type === "walkEdge"
          ? this.randomTarget(true)
          : step.type === "walkShort"
            ? this.randomShortWalkTarget()
            : this.randomTarget(false);
      this.speed = sp;
      this.moveToPosition(t.x + halfPenguinSize, t.y + halfPenguinSize);

      const waitArrival = setInterval(() => {
        if (!this.isMoving) {
          clearInterval(waitArrival);
          this.speed = SPEED_WALK;
          setTimeout(() => this.runNextStep(), this.getStepTransitionDelay());
        }
      }, 100);
    } else if (step.type === "jumpMove") {
      const jumpDirection = Math.random() < 0.5 ? -1 : 1;
      const jumpDistance = 30 + Math.random() * 40;
      const target = {
        x: this.x + jumpDirection * jumpDistance,
        y: this.randomWalkY(),
      };
      this.speed = SPEED_WALK_FAST;
      this.speak();
      this.element.style.animation = "";
      this.startJumpArc(target.x, target.y);

      const waitArrival = setInterval(() => {
        if (!this.isMoving) {
          clearInterval(waitArrival);
          this.speed = SPEED_WALK;
          if (!this.isMoving) this.setState("idle");
          setTimeout(
            () => this.runNextStep(),
            step.duration || this.getStepTransitionDelay(),
          );
        }
      }, 100);
    } else if (step.type === "flyMove") {
      const targetX = Math.max(
        halfPenguinSize,
        Math.min(
          this.x + (Math.random() - 0.5) * 260 + halfPenguinSize,
          window.innerWidth - halfPenguinSize,
        ),
      );
      const targetY = this.randomFlyY() + halfPenguinSize;
      this.speed = SPEED_WALK_FAST + 0.6;
      this.setState("flying");
      this.speak();
      this.element.style.animation = "bounce 1s ease-in-out infinite";
      this.moveToPosition(targetX, targetY, this.speed, true);

      const waitArrival = setInterval(() => {
        if (!this.isMoving) {
          clearInterval(waitArrival);
          this.element.style.animation = "";
          this.speed = SPEED_WALK;
          this.moveToPosition(
            this.x + halfPenguinSize,
            this.randomWalkY() + halfPenguinSize,
          );
          const backToSnow = setInterval(() => {
            if (!this.isMoving) {
              clearInterval(backToSnow);
              if (!this.isMoving) this.setState("idle");
              setTimeout(
                () => this.runNextStep(),
                step.duration || this.getStepTransitionDelay(),
              );
            }
          }, 100);
        }
      }, 100);
    } else if (step.type === "act") {
      const actDuration = this.scaleEmotionDuration(step.duration || 1200);

      if (step.state === "laughing") {
        this.playLaughThenIdleThenLaugh(actDuration, () => {
          this.runNextStep();
        });
        return;
      }

      this.element.style.animation = "";
      this.setState(step.state);
      this.speak();
      if (step.anim) this.element.style.animation = step.anim;

      setTimeout(() => {
        this.element.style.animation = "";
        if (!this.isMoving) this.setState("idle");
        this.insertWalkBetweenEmotionSteps(step);
        this.runNextStep();
      }, actDuration);
    }
  }

  // ── Interação com o mouse ─────────────────────────────────────────────────

  handleMouseProximity() {
    if (!isMouseInsideViewport) return;

    const mdx = mouseX - (this.x + halfPenguinSize);
    const mdy = mouseY - (this.y + halfPenguinSize);
    const dist = Math.sqrt(mdx * mdx + mdy * mdy);

    if (this.mouseReactionCooldown > 0) {
      this.mouseReactionCooldown -= 16;
      return;
    }

    if (dist < 90 && this.lastMouseZone !== "close") {
      this.lastMouseZone = "close";
      this.mouseReactionCooldown = 3000;
      this.isChasing = false;
      this.triggerMouseFlee();
    } else if (dist >= 90 && dist < 220 && this.lastMouseZone === "far") {
      this.lastMouseZone = "near";
      // 45% de chance de sair correndo atrás do mouse
      if (Math.random() < 0.8) {
        this.mouseReactionCooldown = 5000;
        this.triggerMouseChase();
      } else {
        this.mouseReactionCooldown = 4000;
        this.triggerMouseCurious();
      }
    } else if (dist >= 220 && this.lastMouseZone === "near") {
      this.lastMouseZone = "far";
      this.mouseReactionCooldown = 1500;
      this.triggerMouseGoodbye();
    } else if (dist >= 90 && this.lastMouseZone === "close") {
      this.lastMouseZone = dist < 220 ? "near" : "far";
    }
  }

  triggerMouseChase() {
    this.aiLocked = true;
    this.stepQueue = [];
    this.isChasing = true;
    this.speed = SPEED_CHASE;
    this.setState("running");
    this.speak();

    // Para de perseguir após 4 segundos
    setTimeout(() => {
      this.isChasing = false;
      this.speed = SPEED_WALK;
      if (!this.isMoving) this.setState("idle");
      this.aiLocked = false;
      this.scheduleNextBehavior();
    }, 4000);
  }

  triggerMouseFlee() {
    this.aiLocked = true;
    this.stepQueue = [];
    this.setState("scared");
    this.speak();

    const angle = Math.atan2(
      this.y + halfPenguinSize - mouseY,
      this.x + halfPenguinSize - mouseX,
    );
    const fleeX = this.x + halfPenguinSize + Math.cos(angle) * 280;
    const fleeY = this.y + halfPenguinSize + Math.sin(angle) * 280;
    this.speed = SPEED_FLEE;
    this.moveToPosition(
      Math.max(
        halfPenguinSize,
        Math.min(fleeX, window.innerWidth - halfPenguinSize),
      ),
      Math.max(
        halfPenguinSize,
        Math.min(fleeY, this.getWalkMaxY() + halfPenguinSize),
      ),
    );

    setTimeout(() => {
      this.speed = SPEED_WALK;
      this.aiLocked = false;
      this.scheduleNextBehavior();
    }, 2500);
  }

  triggerMouseCurious() {
    this.aiLocked = true;
    this.stepQueue = [];
    this.setState("peeking");
    this.speak();

    setTimeout(() => {
      if (!this.isMoving) this.setState("idle");
      this.aiLocked = false;
      this.scheduleNextBehavior();
    }, this.scaleEmotionDuration(2500));
  }

  triggerMouseGoodbye() {
    this.aiLocked = true;
    this.stepQueue = [];
    this.setState("waving");
    this.speak();

    setTimeout(() => {
      if (!this.isMoving) this.setState("idle");
      this.aiLocked = false;
      this.scheduleNextBehavior();
    }, this.scaleEmotionDuration(2000));
  }

  // ── Interação manual ──────────────────────────────────────────────────────

  setupEventListeners() {
    this.element.addEventListener("pointerdown", (e) => {
      this.onDragStart(e);
    });

    window.addEventListener("pointermove", (e) => {
      this.onDragMove(e);
    });

    window.addEventListener("pointerup", (e) => {
      this.onDragEnd(e);
    });
    window.addEventListener("pointercancel", (e) => {
      this.onDragEnd(e);
    });
    document.addEventListener("mouseleave", () => {
      this.onDragEnd();
    });

    this.element.addEventListener("click", (e) => {
      e.stopPropagation();
      if (Date.now() < this.suppressClickUntil) return;
      this.onClickPenguin();
    });
  }

  onDragStart(e) {
    e.preventDefault();
    this.isDragging = true;
    this.dragMoved = false;
    this.dragOffsetX = e.clientX - this.x;
    this.dragOffsetY = e.clientY - this.y;
    this.isChasing = false;
    this.aiLocked = true;
    this.stepQueue = [];
    this.isMoving = false;
    this.customMotion = null;
    this.allowAirMovement = true;
    this.element.style.animation = "";
    this.setState("flying");
    this.startWingFlap();
  }

  onDragMove(e) {
    if (!this.isDragging) return;

    if (
      e.clientX < 0 ||
      e.clientX > window.innerWidth ||
      e.clientY < 0 ||
      e.clientY > window.innerHeight
    ) {
      this.onDragEnd();
      return;
    }

    e.preventDefault();

    this.dragMoved = true;
    this.x = Math.max(
      0,
      Math.min(e.clientX - this.dragOffsetX, window.innerWidth - penguinSize),
    );
    this.y = Math.max(
      0,
      Math.min(e.clientY - this.dragOffsetY, window.innerHeight - penguinSize),
    );
    this.targetX = this.x;
    this.targetY = this.y;

    this.element.style.left = this.x + "px";
    this.element.style.top = this.y + "px";
    this.updateBubblePosition();
  }

  onDragEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.stopWingFlap();

    if (!this.dragMoved) {
      this.allowAirMovement = false;
      this.setState("idle");
      this.aiLocked = false;
      return;
    }

    this.suppressClickUntil = Date.now() + 250;
    this.dropWithFlap();
  }

  dropWithFlap() {
    this.aiLocked = true;
    this.isChasing = false;
    this.stepQueue = [];
    this.speed = SPEED_WALK;
    this.startDropFall();

    const waitLanding = setInterval(() => {
      if (!this.isMoving) {
        clearInterval(waitLanding);
        this.speed = SPEED_WALK;
        this.setState("angry");
        this.nextBubbleAt = 0;
        this.speak();
        setTimeout(() => {
          if (!this.isMoving) this.setState("idle");
          this.aiLocked = false;
          this.scheduleNextBehavior();
        }, 1800);
      }
    }, 100);
  }

  onClickPenguin() {
    this.isChasing = false;
    this.aiLocked = true;
    this.stepQueue = [];
    const isCryingNow = this.currentState === "crying";

    const reactions = isCryingNow
      ? ["jumping", "dancing", "shy", "waving", "scared"]
      : ["laughing", "jumping", "dancing", "shy", "waving", "scared"];
    const reaction = reactions[Math.floor(Math.random() * reactions.length)];

    if (reaction === "laughing") {
      createClickEffect(this.x + halfPenguinSize, this.y + halfPenguinSize);
      this.playLaughThenIdleThenLaugh(2200, () => {
        this.aiLocked = false;
        this.scheduleNextBehavior();
      });
      return;
    }

    this.setState(reaction);
    this.speak();
    createClickEffect(this.x + halfPenguinSize, this.y + halfPenguinSize);

    const anims = {
      jumping: "hop 0.45s ease-out 2",
      dancing: "dance 0.7s ease-in-out infinite",
      shy: "shake 0.6s ease",
      scared: "shake 0.4s ease",
    };
    if (anims[reaction]) this.element.style.animation = anims[reaction];

    setTimeout(() => {
      this.element.style.animation = "";
      if (!this.isMoving) this.setState("idle");
      this.aiLocked = false;
      this.scheduleNextBehavior();
    }, this.scaleEmotionDuration(2000));
  }

  // ── Loop de animação ──────────────────────────────────────────────────────

  update(now = performance.now()) {
    const dtSeconds = Math.min(
      0.05,
      Math.max(0.001, (now - this.lastUpdateTime) / 1000),
    );
    this.lastUpdateTime = now;

    if (this.isDragging) {
      requestAnimationFrame((ts) => this.update(ts));
      return;
    }

    if (this.customMotion) {
      this.updateCustomMotion(dtSeconds);
      this.x = Math.max(0, Math.min(this.x, window.innerWidth - penguinSize));
      this.y = Math.max(0, Math.min(this.y, this.getWalkMaxY()));
      this.element.style.left = this.x + "px";
      this.element.style.top = this.y + "px";
      this.updateBubblePosition();
      this.handleMouseProximity();
      requestAnimationFrame((ts) => this.update(ts));
      return;
    }

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Se estiver perseguindo, atualiza o alvo para a posição atual do mouse
    if (this.isChasing && isMouseInsideViewport) {
      this.targetX = mouseX - halfPenguinSize;
      this.targetY = this.clampY(mouseY - halfPenguinSize);
    }

    let movedThisFrame = false;

    if (distance > 5) {
      this.x += (dx / distance) * this.speed;
      this.y += (dy / distance) * this.speed;
      movedThisFrame = true;

      if (this.currentState !== "jumping" && this.currentState !== "flying") {
        this.setState("running");
      }

      if (dx < 0 && this.facingRight) {
        this.facingRight = false;
        this.element.style.transform = "scaleX(-1)";
      } else if (dx > 0 && !this.facingRight) {
        this.facingRight = true;
        this.element.style.transform = "scaleX(1)";
      }
    } else if (this.isMoving) {
      this.isMoving = false;
      this.allowAirMovement = false;
      this.setState("idle");
    }

    // Garante que o sprite de corrida só apareça com deslocamento real.
    if (!movedThisFrame && this.currentState === "running") {
      this.setState("idle");
    }

    this.x = Math.max(0, Math.min(this.x, window.innerWidth - penguinSize));
    this.y = this.clampY(this.y, this.allowAirMovement);
    this.targetX = Math.max(
      0,
      Math.min(this.targetX, window.innerWidth - penguinSize),
    );
    this.targetY = this.clampY(this.targetY, this.allowAirMovement);

    this.element.style.left = this.x + "px";
    this.element.style.top = this.y + "px";
    this.updateBubblePosition();
    this.handleMouseProximity();

    requestAnimationFrame((ts) => this.update(ts));
  }
}

// ── Efeitos visuais ───────────────────────────────────────────────────────────

function createClickEffect(x, y) {
  const effect = document.createElement("div");
  effect.className = "clickEffect";
  effect.style.left = x - 50 + "px";
  effect.style.top = y - 50 + "px";
  document.body.appendChild(effect);
  for (let i = 0; i < 10; i++) createParticle(x, y);
  setTimeout(() => effect.remove(), 600);
}

function createParticle(x, y) {
  const particle = document.createElement("div");
  particle.className = "particle";
  particle.textContent = ["❄️", "🧊", "❄️", "🐟"][
    Math.floor(Math.random() * 8)
  ];
  particle.style.left = x + (Math.random() - 0.5) * 100 + "px";
  particle.style.top = y + (Math.random() - 0.5) * 100 + "px";
  particle.style.fontSize = Math.random() * 20 + 12 + "px";
  particle.style.animation = `particleFall ${Math.random() * 2 + 1}s ease-out`;
  document.body.appendChild(particle);
  setTimeout(() => particle.remove(), 3000);
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

// ── Inicialização ─────────────────────────────────────────────────────────────

const penguin = new Penguin();

document.addEventListener("mousemove", (e) => {
  isMouseInsideViewport = true;
  mouseX = e.clientX;
  mouseY = e.clientY;
});

document.addEventListener("mouseenter", (e) => {
  isMouseInsideViewport = true;
  mouseX = e.clientX;
  mouseY = e.clientY;
});

document.addEventListener("mouseleave", () => {
  isMouseInsideViewport = false;
});

// Neve de fundo
const SNOW_ACTIVE_DURATION_MS = 15_000;
const SNOW_COOLDOWN_DURATION_MS = 3_600_000;
const SNOW_SPAWN_INTERVAL_MS = 400;

let snowSpawnIntervalId = null;

function startSnowCycle() {
  if (snowSpawnIntervalId !== null) return;

  snowSpawnIntervalId = setInterval(
    createBackgroundParticles,
    SNOW_SPAWN_INTERVAL_MS,
  );

  setTimeout(() => {
    if (snowSpawnIntervalId !== null) {
      clearInterval(snowSpawnIntervalId);
      snowSpawnIntervalId = null;
    }

    setTimeout(startSnowCycle, SNOW_COOLDOWN_DURATION_MS);
  }, SNOW_ACTIVE_DURATION_MS);
}

startSnowCycle();
