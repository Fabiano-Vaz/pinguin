export const createSocialMethods = ({ phrases }) => ({
  triggerLoveMoment() {
    this.aiLocked = true;
    this.stepQueue = [];
    this.isChasing = false;
    this.element.style.animation = "";
    this.setState("shy");
    const loveList =
      Array.isArray(phrases && phrases.shy) && phrases.shy.length > 0
        ? phrases.shy
        : Array.isArray(phrases && phrases.dropped) &&
            phrases.dropped.length > 0
          ? phrases.dropped
          : Array.isArray(phrases && phrases.angry)
            ? phrases.angry
            : [];
    if (loveList.length > 0) {
      this.showSpeech(loveList[Math.floor(Math.random() * loveList.length)]);
    }

    setTimeout(() => {
      if (!this.isMoving && !this.isDragging) this.setState("idle");

      if (this.foodTargets.length > 0) {
        this.tryStartFoodHunt();
      } else {
        this.aiLocked = false;
        this.scheduleNextBehavior();
      }
    }, this.scaleEmotionDuration(2200));
  },

  onScreenClick() {
    if (this.isFishingActive) return;
    if (this.currentState === "sleeping") return;
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
  },

  startRantMode() {
    if (this.isDragging || this.isRanting) return;

    this.isRanting = true;
    if (typeof this.setActivityMode === "function") {
      this.setActivityMode("ranting", "rant:start", { force: true });
    }
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

    const rantLines =
      Array.isArray(phrases && phrases.rant) && phrases.rant.length > 0
        ? phrases.rant
        : Array.isArray(phrases && phrases.angry)
          ? phrases.angry
          : [];

    const rantStepMs = 1000;
    rantLines.forEach((line, index) => {
      setTimeout(() => {
        this.showSpeech(line, 900, false);
      }, index * rantStepMs);
    });

    setTimeout(
      () => {
        this.element.style.animation = "";
        if (!this.isMoving) this.setState("idle");
        this.isRanting = false;
        if (typeof this.setActivityMode === "function") {
          this.setActivityMode("idle", "rant:finish", { force: true });
        }
        this.aiLocked = false;
        this.scheduleNextBehavior();
      },
      rantLines.length * rantStepMs + 300,
    );
  },

  triggerCruzeiro() {
    if (this.isDragging || this.isWalkingAway || this.isCruzeiroMode) return;
    const assets = window.PenguinPet && window.PenguinPet.actionStates;
    const cruzeirSrc = assets && assets.cruzeiro;
    const jumpSrc = assets && (assets.jumping || assets.flying || assets.idle);
    if (!cruzeirSrc) return;

    // Seleciona frase aleatória do grupo 'cruzeiro'
    const cruzeiroLines = Array.isArray(phrases && phrases.cruzeiro)
      ? phrases.cruzeiro
      : [];
    const line =
      cruzeiroLines[Math.floor(Math.random() * cruzeiroLines.length)];

    // Trava o AI para nenhum comportamento interromper
    this.aiLocked = true;
    this.isCruzeiroMode = true;
    this.stepQueue = [];
    this.isChasing = false;
    this.isMoving = false;
    this.customMotion = null;
    if (this.nextBehaviorTimeoutId) {
      clearTimeout(this.nextBehaviorTimeoutId);
      this.nextBehaviorTimeoutId = null;
    }
    if (typeof this.clearManagedContext === "function") {
      this.clearManagedContext("cruzeiro_action");
    }

    const holdCruzeiroMs = 3000;
    const jumpDurationMs = 1800;

    // Fase 1: exibe o SVG do Cruzeiro por 3 segundos
    // Mantém lock por toda a sequência para impedir qualquer estado intermediário (idle/full/sleeping)
    if (typeof this.hideUmbrella === "function") this.hideUmbrella();
    this.lockVisualSprite(cruzeirSrc, holdCruzeiroMs + jumpDurationMs + 1200);
    this.currentState = "cruzeiro";
    if (this.img) this.img.src = cruzeirSrc;
    this.applyTransform();
    if (line) this.showSpeech(line, 2800, false);

    // Fase 2: após 3s, exibe animação de pulo usando troca direta de sprite
    // (sem depender de setState, que pode ser bloqueado por regras de full/sleep)
    const startJumpPhase = () => {
      this.currentState = "jumping";
      if (jumpSrc && this.img) this.img.src = jumpSrc;
      this.element.style.animation =
        "jumping 1.05s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite";
      this.applyTransform();

      // Fase 3: após 2s pulando, volta ao normal
      const finishCruzeiroPhase = () => {
        this.element.style.animation = "";
        if (typeof this.unlockVisualSprite === "function")
          this.unlockVisualSprite();
        this.isCruzeiroMode = false;
        if (!this.isMoving && !this.isDragging) this.setState("idle");
        this.aiLocked = false;
        this.scheduleNextBehavior();
      };

      if (typeof this.setManagedTimeout === "function") {
        this.setManagedTimeout(
          "cruzeiro_action",
          "finish",
          finishCruzeiroPhase,
          jumpDurationMs,
        );
      } else {
        setTimeout(finishCruzeiroPhase, jumpDurationMs);
      }
    };

    if (typeof this.setManagedTimeout === "function") {
      this.setManagedTimeout(
        "cruzeiro_action",
        "jump",
        startJumpPhase,
        holdCruzeiroMs,
      );
    } else {
      setTimeout(startJumpPhase, holdCruzeiroMs);
    }
  },

  insertWalkBetweenEmotionSteps(currentStep) {
    if (!currentStep || currentStep.type !== "act") return;
    if (currentStep.state === "idle") return;
    if (this.stepQueue.length === 0) return;

    const nextStep = this.stepQueue[0];
    if (!nextStep || nextStep.type !== "act" || nextStep.state === "idle") {
      return;
    }

    this.stepQueue.unshift({ type: "walkShort" });
  },
});
