(() => {
  const modules = (window.PenguinPetModules = window.PenguinPetModules || {});

  modules.interactionsPointer = ({
    runtime,
    SPEED_WALK,
    halfPenguinSize,
    penguinSize,
  }) => ({
    setupEventListeners() {
      this.element.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        runtime.lastPenguinInteractionAt = Date.now();
        if (typeof this.queuePenguinClick === "function") {
          this.queuePenguinClick();
        }
      });

      this.element.addEventListener("dblclick", (event) => {
        event.preventDefault();
        event.stopPropagation();
        runtime.lastPenguinInteractionAt = Date.now();
        if (typeof this.onDoubleClickPenguin === "function") {
          this.onDoubleClickPenguin();
        }
      });

      this.element.addEventListener("pointerdown", (e) => {
        this.onDragStart(e);
      });

      window.addEventListener("pointermove", (e) => {
        this.onDragMove(e);
      });

      window.addEventListener("pointerup", () => {
        this.onDragEnd();
      });
      window.addEventListener("pointercancel", () => {
        this.onDragEnd();
      });
      document.addEventListener("mouseleave", () => {
        this.onDragEnd();
      });
    },

    clearPendingDropReaction() {
      this.dropReactionToken = (this.dropReactionToken || 0) + 1;
      if (typeof this.clearManagedContext === "function") {
        this.clearManagedContext("drop_reaction");
      }
      if (this.dropReactionIntervalId) {
        clearInterval(this.dropReactionIntervalId);
        this.dropReactionIntervalId = null;
      }
      if (this.dropReactionTimeoutId) {
        clearTimeout(this.dropReactionTimeoutId);
        this.dropReactionTimeoutId = null;
      }
    },

    onDragStart(e) {
      if (this.isTemporaryDead) return;
      if (this.isJumpLocked) return;
      if (this.isCaveirinhaMode) return;
      if (this.isFishingActive) return;
      if (this.isWalkingAway) return;
      if (
        typeof this.hasPendingFoodTargets === "function" &&
        this.hasPendingFoodTargets()
      ) {
        return;
      }
      e.preventDefault();
      runtime.lastPenguinInteractionAt = Date.now();
      this.isDragging = true;
      this.clearPendingDropReaction();
      this.isCursorTouchEating = false;
      this.currentFoodTarget = null;
      this.isEatingFood = false;
      this.dragMoved = false;
      this.dragStartY = this.y;
      this.dragOffsetX = e.clientX - this.x;
      this.dragOffsetY = e.clientY - this.y;
      this.isChasing = false;
      this.aiLocked = true;
      this.stepQueue = [];
      this.isMoving = false;
      this.customMotion = null;
      this.allowAirMovement = true;
      if (typeof this.setActivityMode === "function") {
        this.setActivityMode("dragging", "drag:start", { force: true });
      }
      this.element.style.animation = "";
      this.setState("flying");
      this.startWingFlap();
    },

    onDragMove(e) {
      if (this.isTemporaryDead) return;
      if (this.isJumpLocked) return;
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
    },

    onDragEnd() {
      if (this.isTemporaryDead) return;
      if (this.isJumpLocked) return;
      if (!this.isDragging) return;
      this.isDragging = false;
      this.stopWingFlap();

      if (!this.dragMoved) {
        runtime.lastPenguinInteractionAt = Date.now();
        this.allowAirMovement = false;
        if (typeof this.setActivityMode === "function") {
          this.setActivityMode("idle", "drag:end:no-move", { force: true });
        }
        this.setState("idle");
        this.aiLocked = false;
        this.tryStartFoodHunt();
        // Pointer down cancels native click in some environments, so treat no-move drop as click.
        if (typeof this.queuePenguinClick === "function") {
          this.queuePenguinClick();
        }
        return;
      }

      this.suppressClickUntil = Date.now() + 250;
      const walkMinY =
        typeof this.getWalkMinY === "function" ? this.getWalkMinY() : this.y;
      const highDropMinHeightPx = Math.max(90, Math.round(penguinSize * 1.1));
      const startedY = Number.isFinite(this.dragStartY) ? this.dragStartY : this.y;
      const highestY = Math.min(startedY, this.y);
      const releasedFromHigh = highestY < walkMinY - highDropMinHeightPx;
      this.dragStartY = 0;
      this.pendingMortinhoAfterDrop = releasedFromHigh;
      this.pendingWalkAwayAfterMortinho = false;

      const now = Date.now();
      const streakWindowMs = 1800;
      this.dropReleaseStreak =
        now - this.lastDropReleaseAt <= streakWindowMs
          ? this.dropReleaseStreak + 1
          : 1;
      this.lastDropReleaseAt = now;

      if (this.dropReleaseStreak >= 2) {
        if (releasedFromHigh) {
          this.pendingWalkAwayAfterMortinho = true;
        } else {
          this.startWalkAwayAfterDrops();
          return;
        }
      }

      const thrownUp = this.y < walkMinY - 12;
      if (thrownUp && typeof this.blowAwayUmbrella === "function") {
        this.blowAwayUmbrella(this.facingRight ? 1 : -1);
      }

      this.dropWithFlap();
    },

    startWalkAwayAfterDrops() {
      this.clearPendingDropReaction();
      this.aiLocked = true;
      this.isChasing = false;
      this.stepQueue = [];
      this.currentFoodTarget = null;
      this.isEatingFood = false;
      this.foodTargets = [];
      this.customMotion = null;
      this.allowAirMovement = false;
      this.isWalkingAway = true;
      if (typeof this.setActivityMode === "function") {
        this.setActivityMode("walk_away", "drop:walk-away", { force: true });
      }
      this.isMoving = true;
      this.speed = SPEED_WALK;
      this.element.style.animation = "";
      this.setState("turningBack");
      this.startWaddleSteps();
      this.walkAwayReturnX = Math.max(0, Math.min(this.x, window.innerWidth - penguinSize));
      this.walkAwayReturnY = this.clampY(this.y, false);

      const midX = this.x + halfPenguinSize;
      const goRight = midX >= window.innerWidth / 2;
      this.blockUmbrellaUntilNextRain = true;
      if (typeof this.blowAwayUmbrella === "function") {
        this.blowAwayUmbrella(goRight ? 1 : -1);
      }
      const exitPadding = penguinSize + 12;
      const targetX = goRight ? window.innerWidth + exitPadding : -exitPadding;
      this.customMotion = {
        type: "walkAwayExit",
        startX: this.x,
        startY: this.getGroundTopY(),
        targetX,
        elapsed: 0,
        duration: 2600,
      };
    },

    dropWithFlap() {
      this.clearPendingDropReaction();
      const reactionToken = this.dropReactionToken;
      this.aiLocked = true;
      this.isChasing = false;
      this.stepQueue = [];
      this.speed = SPEED_WALK;
      this.startDropFall();

      const onDropPoll = () => {
        if (reactionToken !== this.dropReactionToken) return;
        if (this.isWalkingAway || this.isDragging) return;
        if (!this.isMoving) {
          if (typeof this.clearManagedTimer === "function") {
            this.clearManagedTimer("drop_reaction", "poll");
          }
          this.dropReactionIntervalId = null;
          if (
            this.pendingMortinhoAfterDrop &&
            typeof this.triggerTemporaryMortinho === "function"
          ) {
            this.pendingMortinhoAfterDrop = false;
            this.triggerTemporaryMortinho(3000, { forceGround: true });
            return;
          }
          this.pendingMortinhoAfterDrop = false;
          this.speed = SPEED_WALK;
          this.setState("angry");
          this.speak();
          const onDropCooldownDone = () => {
            if (reactionToken !== this.dropReactionToken) return;
            if (this.isWalkingAway || this.isDragging) return;
            if (!this.isMoving) this.setState("idle");
            this.aiLocked = false;
            if (this.foodTargets.length > 0) {
              this.tryStartFoodHunt();
            } else {
              this.scheduleNextBehavior();
            }
            this.dropReactionTimeoutId = null;
          };
          this.dropReactionTimeoutId =
            typeof this.setManagedTimeout === "function"
              ? this.setManagedTimeout(
                  "drop_reaction",
                  "cooldown",
                  onDropCooldownDone,
                  1800,
                )
              : setTimeout(onDropCooldownDone, 1800);
        }
      };
      this.dropReactionIntervalId =
        typeof this.setManagedInterval === "function"
          ? this.setManagedInterval("drop_reaction", "poll", onDropPoll, 100)
          : setInterval(onDropPoll, 100);
    },
  });
})();
