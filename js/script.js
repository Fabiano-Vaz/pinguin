// Mapeamento de ações para SVGs específicos
const actionStates = {
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
  shy: "assets/pinguin envergonhado.svg",
  peeking: "assets/pinguin espiando curioso.svg",
  laughing: "assets/pinguin gargalhando.svg",
  thinking: "assets/pinguin pensando.svg",
};

const phrases = {
  idle: [
    "Oi! Tudo bem?",
    "Alguém me chamou?",
    "Tô aqui... só sendo fofo.",
    "Hm... e agora?",
    "Tô esperando o Wi-Fi carregar a vida.",
    "Não tô fazendo nada. E tô ótimo com isso.",
    "Bom dia! Ou boa tarde. Tanto faz.",
  ],
  running: [
    "WHEEE! Não me para!",
    "Correr é minha terapia!",
    "Vou buscar pizza... volta já!",
    "Alguém soltou o pinguim!!",
    "Tô atrasado pra nada, mas corro mesmo assim!",
    "Turbo mode: ATIVADO!",
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
    "Sinto o ritmo na alma... e na barriga.",
    "Ninguém me para na pista!",
    "La la laaaa! 🎵",
    "Minha dança é artística. Não questione.",
    "Dança, pinguim, dança!",
  ],
  sleeping: [
    "Zzz...",
    "Tô só descansando os olhos...",
    "Pode me acordar... mas não me acorde.",
    "Sonhando com peixe fresco...",
    "Zzz... mais cinco minutinhos...",
  ],
  scared: [
    "AHHH! QUE FOI ISSO?!",
    "Minha alma saiu pelo bico!!",
    "Eu vi alguma coisa! Juro!",
    "Socorroooo!",
    "Meu coração saiu correndo sem mim!",
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
    "Tô com raiva, mas sou fofo. Conflito interno.",
    "Deixa eu respirar... fundo... mais fundo...",
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
  thinking: [""],
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
    { type: "act", state: "sleeping", duration: 5000 },
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
    { type: "act", state: "jumping", duration: 1200, anim: "bounce 0.8s ease" },
    { type: "act", state: "waving", duration: 2000 },
    { type: "walk" },
  ],
  () => [
    { type: "walk" },
    { type: "act", state: "crying", duration: 2500 },
    { type: "act", state: "laughing", duration: 2000 },
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
];

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

class Penguin {
  constructor() {
    this.element = document.createElement("div");
    this.element.className = "penguin";
    this.img = document.createElement("img");
    this.element.appendChild(this.img);
    document.body.appendChild(this.element);

    this.x = window.innerWidth / 2 - 60;
    this.y = window.innerHeight / 2 - 60;
    this.targetX = this.x;
    this.targetY = this.y;

    this.currentState = "idle";
    this.facingRight = true;
    this.isMoving = false;
    this.speed = 4;

    this.bubble = null;
    this.bubbleTimeout = null;

    // Controle da IA
    this.aiLocked = false;
    this.stepQueue = [];

    // Interação com o mouse
    this.lastMouseZone = "far";
    this.mouseReactionCooldown = 0;
    this.isChasing = false;

    this.setState("idle");
    this.setupEventListeners();
    this.update();
    this.scheduleNextBehavior();
  }

  // ── Estado ────────────────────────────────────────────────────────────────

  setState(state) {
    this.currentState = state;
    this.img.src = actionStates[state];
  }

  // ── Fala ──────────────────────────────────────────────────────────────────

  speak() {
    if (this.bubble) this.bubble.remove();
    if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);

    const list = phrases[this.currentState];
    const text = list[Math.floor(Math.random() * list.length)];

    if (!text) return;

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
  }

  updateBubblePosition() {
    if (!this.bubble) return;

    // Balão deslocado para cima-direita do pinguim (estilo quadrinho)
    const bubbleLeft = this.x + 55;
    const bubbleTop = this.y - 80;
    this.bubble.style.left = bubbleLeft + "px";
    this.bubble.style.top = bubbleTop + "px";

    const dots = this.bubble.querySelectorAll(".bubble-dot");
    if (dots.length < 3) return;

    const content = this.bubble.querySelector(".bubble-content");
    const cw = (content && content.offsetWidth) || 120;
    const ch = (content && content.offsetHeight) || 47;

    // Ponto de partida: centro-inferior do conteúdo (relativo ao .speech-bubble)
    const startX = cw / 2;
    const startY = ch;

    // Centro do pinguim em coordenadas locais do .speech-bubble
    const penguinCX = this.x + 60 - bubbleLeft;
    const penguinCY = this.y + 60 - bubbleTop;

    const dx = penguinCX - startX;
    const dy = penguinCY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;

    const specs = [
      { size: 14, gap: 14 },
      { size: 9, gap: 26 },
      { size: 5, gap: 36 },
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

  moveToPosition(tx, ty, speed) {
    this.targetX = tx - 60;
    this.targetY = ty - 60;
    this.isMoving = true;
    if (speed) this.speed = speed;
  }

  randomTarget(nearEdge) {
    const margin = 80;
    const w = window.innerWidth - 120;
    const h = window.innerHeight - 120;
    if (nearEdge) {
      const edge = Math.floor(Math.random() * 4);
      if (edge === 0) return { x: Math.random() * w + margin, y: margin };
      if (edge === 1) return { x: Math.random() * w + margin, y: h - margin };
      if (edge === 2) return { x: margin, y: Math.random() * h };
      return { x: w - margin, y: Math.random() * h };
    }
    return {
      x: margin + Math.random() * (w - margin * 2),
      y: margin + Math.random() * (h - margin * 2),
    };
  }

  // ── IA autônoma ───────────────────────────────────────────────────────────

  scheduleNextBehavior() {
    const delay = 2500 + Math.random() * 4000;
    setTimeout(() => this.startNextBehavior(), delay);
  }

  startNextBehavior() {
    if (this.aiLocked) return;
    const seq = behaviors[Math.floor(Math.random() * behaviors.length)]();
    this.stepQueue = [...seq];
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
      step.type === "walkEdge"
    ) {
      const sp = step.type === "walkFast" ? 3 : 2;
      const t =
        step.type === "walkEdge"
          ? this.randomTarget(true)
          : this.randomTarget(false);
      this.speed = sp;
      this.moveToPosition(t.x + 60, t.y + 60);

      const waitArrival = setInterval(() => {
        if (!this.isMoving) {
          clearInterval(waitArrival);
          this.speed = 2;
          setTimeout(() => this.runNextStep(), 600);
        }
      }, 100);
    } else if (step.type === "act") {
      this.element.style.animation = "";
      this.setState(step.state);
      this.speak();
      if (step.anim) this.element.style.animation = step.anim;

      setTimeout(() => {
        this.element.style.animation = "";
        if (!this.isMoving) this.setState("idle");
        this.runNextStep();
      }, step.duration);
    }
  }

  // ── Interação com o mouse ─────────────────────────────────────────────────

  handleMouseProximity() {
    const mdx = mouseX - (this.x + 60);
    const mdy = mouseY - (this.y + 60);
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
    this.speed = 4;
    this.setState("running");
    this.speak();

    // Para de perseguir após 4 segundos
    setTimeout(() => {
      this.isChasing = false;
      this.speed = 2;
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

    const angle = Math.atan2(this.y + 60 - mouseY, this.x + 60 - mouseX);
    const fleeX = this.x + 60 + Math.cos(angle) * 280;
    const fleeY = this.y + 60 + Math.sin(angle) * 280;
    this.speed = 5;
    this.moveToPosition(
      Math.max(60, Math.min(fleeX, window.innerWidth - 60)),
      Math.max(60, Math.min(fleeY, window.innerHeight - 60)),
    );

    setTimeout(() => {
      this.speed = 2;
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
    }, 2500);
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
    }, 2000);
  }

  // ── Interação manual ──────────────────────────────────────────────────────

  setupEventListeners() {
    this.element.addEventListener("click", (e) => {
      e.stopPropagation();
      this.onClickPenguin();
    });
  }

  onClickPenguin() {
    this.isChasing = false;
    this.aiLocked = true;
    this.stepQueue = [];

    const reactions = [
      "laughing",
      "jumping",
      "dancing",
      "shy",
      "waving",
      "scared",
    ];
    const reaction = reactions[Math.floor(Math.random() * reactions.length)];

    this.setState(reaction);
    this.speak();
    createClickEffect(this.x + 60, this.y + 60);

    const anims = {
      jumping: "bounce 0.8s ease",
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
    }, 2000);
  }

  // ── Loop de animação ──────────────────────────────────────────────────────

  update() {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Se estiver perseguindo, atualiza o alvo para a posição atual do mouse
    if (this.isChasing) {
      this.targetX = mouseX - 60;
      this.targetY = mouseY - 60;
    }

    if (distance > 5) {
      this.x += (dx / distance) * this.speed;
      this.y += (dy / distance) * this.speed;

      if (this.currentState !== "running") this.setState("running");

      if (dx < 0 && this.facingRight) {
        this.facingRight = false;
        this.element.style.transform = "scaleX(-1)";
      } else if (dx > 0 && !this.facingRight) {
        this.facingRight = true;
        this.element.style.transform = "scaleX(1)";
      }
    } else if (this.isMoving) {
      this.isMoving = false;
      this.setState("idle");
    }

    this.x = Math.max(0, Math.min(this.x, window.innerWidth - 120));
    this.y = Math.max(0, Math.min(this.y, window.innerHeight - 120));
    this.targetX = Math.max(0, Math.min(this.targetX, window.innerWidth - 120));
    this.targetY = Math.max(
      0,
      Math.min(this.targetY, window.innerHeight - 120),
    );

    this.element.style.left = this.x + "px";
    this.element.style.top = this.y + "px";
    this.updateBubblePosition();
    this.handleMouseProximity();

    requestAnimationFrame(() => this.update());
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
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Neve de fundo
setInterval(createBackgroundParticles, 400);
