export {};

  const modules = (window.PenguinPetModules = window.PenguinPetModules || {});

  modules.interactionsClick = ({ phrases, PENGUIN_DOUBLE_CLICK_MS }) => ({
    triggerBeatenReaction() {
      this.isChasing = false;
      this.aiLocked = true;
      this.stepQueue = [];
      this.beatenStateAllowedUntil = Date.now() + 1200;
      this.setState("beaten");
      this.visualLockUntil = Math.max(
        Number(this.visualLockUntil) || 0,
        Date.now() + 500,
      );
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
      this.element.style.animation = "shake 0.5s ease";

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

    triggerTemporaryMortinho(durationMs = 2000, { forceGround = false } = {}) {
      const duration = Number.isFinite(durationMs) ? Math.max(0, durationMs) : 2000;
      if (this.tempMortinhoTimeoutId) {
        clearTimeout(this.tempMortinhoTimeoutId);
        this.tempMortinhoTimeoutId = null;
      }

      if (forceGround && typeof this.getWalkMinY === "function") {
        const groundY = this.getWalkMinY();
        const maxY =
          typeof this.getWalkMaxY === "function" ? this.getWalkMaxY() : groundY + 26;
        const landedY = Math.min(maxY, groundY + 26);
        this.y = landedY;
        this.targetY = landedY;
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

    triggerLightningCaveirinha(durationMs = 2200) {
      const duration = Number.isFinite(durationMs) ? Math.max(0, durationMs) : 2200;

      if (this.caveirinhaTimeoutId) {
        clearTimeout(this.caveirinhaTimeoutId);
        this.caveirinhaTimeoutId = null;
      }

      this.aiLocked = true;
      this.isCaveirinhaMode = true;
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
      if (typeof this.setActivityMode === "function") {
        this.setActivityMode("caveirinha", "lightning:double-click", { force: true });
      }

      this.setState("caveirinha");
      this.visualLockUntil = Date.now() + duration + 40;
      this.applyTransform();
      this.updateBubblePosition();

      this.caveirinhaTimeoutId = setTimeout(() => {
        this.caveirinhaTimeoutId = null;
        this.visualLockUntil = 0;
        this.isCaveirinhaMode = false;
        if (typeof this.setActivityMode === "function") {
          this.setActivityMode("idle", "lightning:recover", { force: true });
        }
        if (!this.isMoving) this.setState("idle");
        this.aiLocked = false;
        this.scheduleNextBehavior();
      }, duration);
    },

    queuePenguinClick(event) {
      if (this.isTemporaryDead) return;
      if (Date.now() < (this.suppressClickUntil || 0)) return;
      const clickDetail =
        event && Number.isFinite(event.detail) ? Number(event.detail) : null;
      if (clickDetail === 2) {
        if (this.pendingPenguinClickTimeoutId) {
          clearTimeout(this.pendingPenguinClickTimeoutId);
          this.pendingPenguinClickTimeoutId = null;
        }
        if (typeof this.onDoubleClickPenguin === "function") {
          this.onDoubleClickPenguin();
        }
        return;
      }
      if (clickDetail !== null && clickDetail !== 1) {
        return;
      }
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
      if (this.currentState === "beaten") {
        this.setState("idle");
      }
      this.element.style.animation = "shake 0.45s ease";

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

      if (typeof this.triggerBeatenReaction === "function") {
        this.triggerBeatenReaction();
      }
    },
  });
