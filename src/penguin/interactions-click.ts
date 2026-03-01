(() => {
  const modules = (window.PenguinPetModules = window.PenguinPetModules || {});

  modules.interactionsClick = ({ phrases, PENGUIN_DOUBLE_CLICK_MS }) => ({
    triggerTemporaryMortinho(durationMs = 2000, { forceGround = false } = {}) {
      const duration = Number.isFinite(durationMs) ? Math.max(0, durationMs) : 2000;
      if (this.tempMortinhoTimeoutId) {
        clearTimeout(this.tempMortinhoTimeoutId);
        this.tempMortinhoTimeoutId = null;
      }

      if (forceGround && typeof this.getWalkMinY === "function") {
        const groundY = this.getWalkMinY();
        this.y = groundY;
        this.targetY = groundY;
      }

      this.aiLocked = true;
      this.isTemporaryDead = true;
      this.isChasing = false;
      this.stepQueue = [];
      this.currentFoodTarget = null;
      this.isEatingFood = false;
      this.foodTargets = [];
      this.customMotion = null;
      this.allowAirMovement = false;
      this.isMoving = false;
      this.isDragging = false;
      this.stopWingFlap();
      this.stopWaddleSteps();
      this.element.style.animation = "";
      if (this.nextBehaviorTimeoutId) {
        clearTimeout(this.nextBehaviorTimeoutId);
        this.nextBehaviorTimeoutId = null;
      }
      this.nextBehaviorDueAt = 0;
      if (typeof this.clearManagedContext === "function") {
        this.clearManagedContext("drop_reaction");
        this.clearManagedContext("fishing_action");
      }
      if (typeof this.hideUmbrella === "function") {
        this.hideUmbrella();
      }
      if (this.umbrellaEl && this.umbrellaEl.classList) {
        this.umbrellaEl.classList.remove("open", "closing", "flying-away");
      }

      this.setState("deadLying");
      this.visualLockUntil = Date.now() + duration + 40;
      this.applyTransform();
      this.updateBubblePosition();

      this.tempMortinhoTimeoutId = setTimeout(() => {
        this.tempMortinhoTimeoutId = null;
        this.visualLockUntil = 0;
        this.isTemporaryDead = false;
        if (this.pendingWalkAwayAfterMortinho) {
          this.pendingWalkAwayAfterMortinho = false;
          if (typeof this.startWalkAwayAfterDrops === "function") {
            this.startWalkAwayAfterDrops();
            return;
          }
        }
        if (!this.isMoving) this.setState("idle");
        this.aiLocked = false;
        this.scheduleNextBehavior();
      }, duration);
    },

    queuePenguinClick() {
      if (this.isTemporaryDead) return;
      if (Date.now() < (this.suppressClickUntil || 0)) return;
      if (this.pendingPenguinClickTimeoutId) {
        clearTimeout(this.pendingPenguinClickTimeoutId);
        this.pendingPenguinClickTimeoutId = null;
      }

      this.pendingPenguinClickTimeoutId = setTimeout(() => {
        this.pendingPenguinClickTimeoutId = null;
        if (Date.now() < (this.suppressClickUntil || 0)) return;
        if (typeof this.onClickPenguin === "function") {
          this.onClickPenguin();
        }
      }, PENGUIN_DOUBLE_CLICK_MS);
    },

    onClickPenguin() {
      if (this.isTemporaryDead) return;
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
      const reaction = "beaten";

      if (reaction === "laughing") {
        this.playLaughThenIdleThenLaugh(2200, () => {
          this.aiLocked = false;
          this.scheduleNextBehavior();
        });
        return;
      }

      this.setState(reaction);
      if (reaction === "beaten") {
        this.visualLockUntil = Math.max(
          Number(this.visualLockUntil) || 0,
          Date.now() + 500,
        );
      }
      const beatenLines =
        Array.isArray(phrases && phrases.beaten) && phrases.beaten.length > 0
          ? phrases.beaten
          : Array.isArray(phrases && phrases.rant)
            ? phrases.rant
            : [];
      if (beatenLines.length > 0) {
        this.showSpeech(
          beatenLines[Math.floor(Math.random() * beatenLines.length)],
          2200,
          false,
        );
      }

      const anims = {
        beaten: "shake 0.5s ease",
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
      if (this.isTemporaryDead) return;
      if (this.isJumpLocked) return;
      if (this.isFishingActive) return;
      if (this.isWalkingAway || this.isDragging) return;

      const hasOpenUmbrella = Boolean(
        this.umbrellaEl &&
          this.umbrellaEl.classList &&
          this.umbrellaEl.classList.contains("open"),
      );
      if (hasOpenUmbrella && typeof this.blowAwayUmbrella === "function") {
        this.blowAwayUmbrella(this.facingRight ? 1 : -1);
      }

      if (this.pendingPenguinClickTimeoutId) {
        clearTimeout(this.pendingPenguinClickTimeoutId);
        this.pendingPenguinClickTimeoutId = null;
      }
      this.suppressClickUntil = Date.now() + PENGUIN_DOUBLE_CLICK_MS;
      this.penguinClickStreak = 0;
      this.lastPenguinClickAt = 0;

      const now = Date.now();
      const tripleWindowMs = 1800;
      this.penguinDoubleClickStreak =
        now - (this.lastPenguinDoubleClickAt || 0) <= tripleWindowMs
          ? (this.penguinDoubleClickStreak || 0) + 1
          : 1;
      this.lastPenguinDoubleClickAt = now;

      if (this.penguinDoubleClickStreak >= 3) {
        this.penguinDoubleClickStreak = 0;
        this.lastPenguinDoubleClickAt = 0;
        if (typeof this.startWalkAwayAfterDrops === "function") {
          this.startWalkAwayAfterDrops();
        }
        return;
      }

      this.onClickPenguin();
    },
  });
})();
