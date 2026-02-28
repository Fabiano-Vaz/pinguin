(() => {
  const modules = (window.PenguinPetModules = window.PenguinPetModules || {});

  modules.interactionsClick = ({ phrases, PENGUIN_DOUBLE_CLICK_MS }) => ({
    onClickPenguin() {
      if (this.isJumpLocked) return;
      if (this.isFishingActive) return;
      if (this.isWalkingAway) return;
      if (
        typeof this.hasPendingFoodTargets === "function" &&
        this.hasPendingFoodTargets()
      ) {
        return;
      }

      const now = Date.now();
      if (!this.isRanting && now >= (this.rantCooldownUntil || 0)) {
        const penguinClickGapMs = 800;
        if (now - this.lastPenguinClickAt <= penguinClickGapMs) {
          this.penguinClickStreak += 1;
        } else {
          this.penguinClickStreak = 1;
        }
        this.lastPenguinClickAt = now;

        if (this.penguinClickStreak >= 4) {
          this.penguinClickStreak = 0;
          this.startRantMode();
          return;
        }
      }

      this.isChasing = false;
      this.aiLocked = true;
      this.stepQueue = [];
      const isCryingNow = this.currentState === "crying";

      const reactions = isCryingNow
        ? ["dancing", "shy", "waving", "scared"]
        : ["laughing", "dancing", "shy", "waving", "scared"];
      if (Math.random() < 0.12) reactions.push("jumping");
      const reaction = reactions[Math.floor(Math.random() * reactions.length)];

      if (reaction === "laughing") {
        this.playLaughThenIdleThenLaugh(2200, () => {
          this.aiLocked = false;
          this.scheduleNextBehavior();
        });
        return;
      }

      this.setState(reaction);
      this.speak();

      const anims = {
        jumping: "hop 0.52s ease-out 2",
        dancing: "dance 1.05s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite",
        shy: "shake 0.6s ease",
        scared: "shake 0.4s ease",
      };
      if (anims[reaction]) this.element.style.animation = anims[reaction];

      setTimeout(() => {
        if (
          typeof this.enforceFoodPriority === "function" &&
          this.enforceFoodPriority()
        ) {
          return;
        }
        this.element.style.animation = "";
        if (!this.isMoving) this.setState("idle");
        this.aiLocked = false;
        this.scheduleNextBehavior();
      }, this.scaleEmotionDuration(2000));
    },

    onDoubleClickPenguin() {
      if (this.isJumpLocked) return;
      if (this.isFishingActive) return;
      if (this.isWalkingAway || this.isDragging) return;

      if (this.pendingPenguinClickTimeoutId) {
        clearTimeout(this.pendingPenguinClickTimeoutId);
        this.pendingPenguinClickTimeoutId = null;
      }
      this.suppressClickUntil = Date.now() + PENGUIN_DOUBLE_CLICK_MS;
      this.penguinClickStreak = 0;
      this.lastPenguinClickAt = 0;

      if (typeof this.triggerLoveMoment === "function") {
        this.triggerLoveMoment();
      } else {
        this.aiLocked = true;
        this.stepQueue = [];
        this.setState("thinking");
        const loveSymbols =
          Array.isArray(phrases && phrases.loveSymbol) &&
          phrases.loveSymbol.length > 0
            ? phrases.loveSymbol
            : Array.isArray(phrases && phrases.love)
              ? phrases.love
              : [];
        if (loveSymbols.length > 0) {
          this.showSpeech(
            loveSymbols[Math.floor(Math.random() * loveSymbols.length)],
          );
        }
        setTimeout(() => {
          if (!this.isMoving) this.setState("idle");
          this.aiLocked = false;
          this.scheduleNextBehavior();
        }, this.scaleEmotionDuration(2200));
      }
    },
  });
})();
