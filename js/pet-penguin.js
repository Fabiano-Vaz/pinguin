(() => {
  const pet = window.PenguinPet || {};
  const constants = pet.constants || {};
  const effects = pet.effects || {};

  const {
    penguinSize,
    halfPenguinSize,
    snowTopRatio,
    BUBBLE_BASE_INTERVAL_MS,
    BUBBLE_INTERVAL_JITTER_MS,
    BUBBLE_SHOW_CHANCE,
    EMOTION_DURATION_MULTIPLIER,
    PRELUDE_EMOTIONS,
    PRELUDE_EMOTION_DURATION_MS,
    PRELUDE_IDLE_DURATION_MS,
    PRELUDE_CHANCE,
    BEHAVIOR_DELAY_MIN_MS,
    BEHAVIOR_DELAY_VARIATION_MS,
    STEP_TRANSITION_DELAY_MS,
    STEP_TRANSITION_DELAY_VARIATION_MS,
    SPEED_WALK,
    SPEED_WALK_FAST,
    SPEED_CHASE,
    SPEED_FLEE,
  } = constants;

  const actionStates = pet.actionStates || {};
  const phrases = pet.phrases || {};
  const behaviors = pet.behaviors || [];
  const runtime = pet.runtime || {
    mouseX: window.innerWidth / 2,
    mouseY: window.innerHeight / 2,
    isMouseInsideViewport: true,
    isFishCursorEnabled: true,
  };
  const createClickEffect =
    typeof effects.createClickEffect === "function"
      ? effects.createClickEffect
      : () => {};

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
    this.isCursorTouchEating = false;
    this.cursorTouchEatingUntil = 0;
    this.fishEatenCount = 0;
    this.fishCursorResumeTimeout = null;
    this.screenClickStreak = 0;
    this.lastScreenClickAt = 0;
    this.isRanting = false;
    this.rantCooldownUntil = 0;

    // Comida no chao (peixes)
    this.foodTargets = [];
    this.currentFoodTarget = null;
    this.isEatingFood = false;

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

  showSpeech(text, durationMs = 3000, shouldReschedule = true) {
    if (this.bubble) this.bubble.remove();
    if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);

    if (!text) {
      if (shouldReschedule) this.scheduleNextBubble();
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
    }, durationMs);

    if (shouldReschedule) this.scheduleNextBubble();
  }

  speak() {
    const now = Date.now();
    if (now < this.nextBubbleAt) return;
    if (Math.random() > BUBBLE_SHOW_CHANCE) {
      this.scheduleNextBubble();
      return;
    }

    const list = phrases[this.currentState];
    const text = list[Math.floor(Math.random() * list.length)];
    this.showSpeech(text);
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
    const w = Math.max(0, window.innerWidth - penguinSize);
    const inset = Math.min(70, Math.max(18, Math.round(w * 0.12)));
    const safeMin = Math.min(inset, w);
    const safeMax = Math.max(safeMin, w - inset);
    const randomY = this.randomWalkY();

    if (nearEdge) {
      const jitter = (Math.random() - 0.5) * 24;
      const chooseLeft = Math.random() < 0.5;
      const x = chooseLeft ? safeMin + jitter : safeMax + jitter;
      return {
        x: Math.max(safeMin, Math.min(x, safeMax)),
        y: randomY,
      };
    }

    return {
      x: safeMin + Math.random() * Math.max(1, safeMax - safeMin),
      y: randomY,
    };
  }

  randomShortWalkTarget() {
    const maxOffset = 120;
    const sideInset = 16;
    const minX = halfPenguinSize + sideInset;
    const maxX = window.innerWidth - halfPenguinSize - sideInset;
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

  setFishCursorEnabled(enabled) {
    if (typeof runtime.setFishCursorEnabled === "function") {
      runtime.setFishCursorEnabled(enabled);
      return;
    }
    runtime.isFishCursorEnabled = Boolean(enabled);
  }

  holdFishCursorFor(ms = 5000) {
    if (this.fishCursorResumeTimeout) {
      clearTimeout(this.fishCursorResumeTimeout);
      this.fishCursorResumeTimeout = null;
    }

    this.setFishCursorEnabled(false);
    this.fishCursorResumeTimeout = setTimeout(() => {
      this.setFishCursorEnabled(true);
      this.fishCursorResumeTimeout = null;
    }, ms);
  }

  isCursorTouchingPenguin() {
    if (!runtime.isMouseInsideViewport) return false;
    if (runtime.isFishCursorEnabled === false) return false;
    return (
      runtime.mouseX >= this.x &&
      runtime.mouseX <= this.x + penguinSize &&
      runtime.mouseY >= this.y &&
      runtime.mouseY <= this.y + penguinSize
    );
  }

  enqueueFoodTargets(targets) {
    if (!Array.isArray(targets) || targets.length === 0) return;

    const validTargets = targets.filter(
      (target) =>
        target &&
        Number.isFinite(target.x) &&
        Number.isFinite(target.y) &&
        target.element,
    );

    if (validTargets.length === 0) return;
    this.foodTargets.push(...validTargets);
    this.tryStartFoodHunt();
  }

  tryStartFoodHunt() {
    if (this.isDragging || this.isEatingFood) return;
    if (this.currentFoodTarget) return;
    if (this.foodTargets.length === 0) {
      if (this.aiLocked) {
        this.aiLocked = false;
        this.scheduleNextBehavior();
      }
      return;
    }

    const nextTarget = this.foodTargets.shift();
    if (!nextTarget || !nextTarget.element || !nextTarget.element.isConnected) {
      this.tryStartFoodHunt();
      return;
    }

    this.currentFoodTarget = nextTarget;
    this.aiLocked = true;
    this.stepQueue = [];
    this.isChasing = false;
    this.speed = SPEED_WALK;
    this.element.style.animation = "";
    this.moveToPosition(nextTarget.x, nextTarget.y, SPEED_WALK);
  }

  consumeCurrentFoodTarget() {
    if (!this.currentFoodTarget || this.isEatingFood) return;

    const target = this.currentFoodTarget;
    this.fishEatenCount += 1;
    const shouldShowLoveMoment = this.fishEatenCount % 5 === 0;
    this.isEatingFood = true;
    this.isMoving = false;
    this.targetX = this.x;
    this.targetY = this.y;
    this.element.style.animation = "";
    this.setState("eating");
    this.nextBubbleAt = 0;
    this.speak();

    if (target.element && target.element.isConnected) {
      target.element.classList.add("eaten");
      setTimeout(() => {
        if (target.element && target.element.isConnected) {
          target.element.remove();
        }
      }, 160);
    }

    setTimeout(() => {
      this.currentFoodTarget = null;
      this.isEatingFood = false;
      if (!this.isMoving) this.setState("idle");

      if (shouldShowLoveMoment) {
        this.triggerLoveMoment();
        return;
      }

      if (this.foodTargets.length > 0) {
        this.tryStartFoodHunt();
        return;
      }

      this.aiLocked = false;
      this.scheduleNextBehavior();
    }, this.scaleEmotionDuration(1300));
  }

  triggerLoveMoment() {
    this.aiLocked = true;
    this.stepQueue = [];
    this.isChasing = false;
    this.element.style.animation = "";
    this.setState("thinking");
    this.showSpeech("Te amo!");

    setTimeout(() => {
      if (!this.isMoving && !this.isDragging) this.setState("idle");

      if (this.foodTargets.length > 0) {
        this.tryStartFoodHunt();
      } else {
        this.aiLocked = false;
        this.scheduleNextBehavior();
      }
    }, this.scaleEmotionDuration(2200));
  }

  handleFoodHunt() {
    if (this.isDragging) return;

    if (!this.currentFoodTarget && this.foodTargets.length > 0) {
      this.tryStartFoodHunt();
    }

    if (!this.currentFoodTarget || this.isEatingFood) return;
    const target = this.currentFoodTarget;

    if (!target.element || !target.element.isConnected) {
      this.currentFoodTarget = null;
      if (this.foodTargets.length > 0) {
        this.tryStartFoodHunt();
      } else if (this.aiLocked) {
        this.aiLocked = false;
        this.scheduleNextBehavior();
      }
      return;
    }

    this.targetX = target.x - halfPenguinSize;
    this.targetY = this.clampY(target.y - halfPenguinSize);
    this.isMoving = true;

    const dx = target.x - (this.x + halfPenguinSize);
    const dy = target.y - (this.y + halfPenguinSize);
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance <= 22) {
      this.consumeCurrentFoodTarget();
    }
  }

  applyCursorEatingState() {
    const now = Date.now();

    if (this.isDragging || this.currentFoodTarget || this.isEatingFood) {
      if (this.isCursorTouchEating) {
        this.isCursorTouchEating = false;
        this.cursorTouchEatingUntil = 0;
        this.holdFishCursorFor(5000);
      }
      return;
    }

    if (this.isCursorTouchEating) {
      this.isChasing = false;
      this.element.style.animation = "";
      this.setState("eating");

      if (now < this.cursorTouchEatingUntil) {
        return;
      }

      this.isCursorTouchEating = false;
      this.cursorTouchEatingUntil = 0;
      this.holdFishCursorFor(5000);
      if (!this.isMoving) this.setState("idle");
      return;
    }

    const touching = this.isCursorTouchingPenguin();
    if (touching) {
      this.isCursorTouchEating = true;
      this.cursorTouchEatingUntil = now + 4000;
      this.isChasing = false;
      this.setFishCursorEnabled(false);
      this.element.style.animation = "";
      this.setState("eating");
      return;
    }
  }

  onScreenClick() {
    const now = Date.now();
    if (this.isRanting || now < this.rantCooldownUntil) return;

    const consecutiveGapMs = 900;
    if (now - this.lastScreenClickAt <= consecutiveGapMs) {
      this.screenClickStreak += 1;
    } else {
      this.screenClickStreak = 1;
    }
    this.lastScreenClickAt = now;

    if (this.screenClickStreak > 5) {
      this.screenClickStreak = 0;
      this.startRantMode();
    }
  }

  startRantMode() {
    if (this.isDragging || this.isRanting) return;

    this.isRanting = true;
    this.rantCooldownUntil = Date.now() + 12000;
    this.aiLocked = true;
    this.stepQueue = [];
    this.isChasing = false;
    this.currentFoodTarget = null;
    this.isEatingFood = false;
    this.foodTargets = [];
    this.isMoving = false;
    this.targetX = this.x;
    this.targetY = this.y;
    this.element.style.animation = "shake 0.4s ease";
    this.setState("angry");

    const rantLines = [
      "PARA P#!@ !!!!",
      "FILHO DA CUCA!!!",
      "NAO QUERO MAAAAIISS",
      "PARA DE CLICAR NESSA M#$%@!",
    ];

    const rantStepMs = 1000;
    rantLines.forEach((line, index) => {
      setTimeout(() => {
        this.showSpeech(line, 900, false);
      }, index * rantStepMs);
    });

    setTimeout(() => {
      this.element.style.animation = "";
      if (!this.isMoving) this.setState("idle");
      this.isRanting = false;
      this.aiLocked = false;
      this.scheduleNextBehavior();
    }, rantLines.length * rantStepMs + 300);
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
    if (!runtime.isMouseInsideViewport) return;
    if (this.isDragging || this.currentFoodTarget || this.isEatingFood) return;
    if (this.isCursorTouchingPenguin()) return;

    const mdx = runtime.mouseX - (this.x + halfPenguinSize);
    const mdy = runtime.mouseY - (this.y + halfPenguinSize);
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
      if (Math.random() < 0.9) {
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
      this.y + halfPenguinSize - runtime.mouseY,
      this.x + halfPenguinSize - runtime.mouseX,
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
    this.isCursorTouchEating = false;
    this.currentFoodTarget = null;
    this.isEatingFood = false;
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
      this.tryStartFoodHunt();
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
          if (this.foodTargets.length > 0) {
            this.tryStartFoodHunt();
          } else {
            this.scheduleNextBehavior();
          }
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

    this.handleFoodHunt();

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Se estiver perseguindo, atualiza o alvo para a posição atual do mouse
    if (
      this.isChasing &&
      runtime.isMouseInsideViewport &&
      !this.currentFoodTarget &&
      !this.isEatingFood
    ) {
      this.targetX = runtime.mouseX - halfPenguinSize;
      this.targetY = this.clampY(runtime.mouseY - halfPenguinSize);
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
    this.applyCursorEatingState();
    this.handleMouseProximity();

    requestAnimationFrame((ts) => this.update(ts));
  }
}


  window.PenguinPet = {
    ...pet,
    Penguin,
  };
})();
