export const createSocialMethods = ({ phrases }) => ({
  triggerLoveMoment() {
    this.aiLocked = true;
    this.stepQueue = [];
    this.isChasing = false;
    this.element.style.animation = "";
    this.setState("thinking");
    const loveList =
      Array.isArray(phrases && phrases.love) && phrases.love.length > 0
        ? phrases.love
        : Array.isArray(phrases && phrases.idle)
          ? phrases.idle
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
