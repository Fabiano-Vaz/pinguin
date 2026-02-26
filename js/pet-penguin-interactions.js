(() => {
  const modules = (window.PenguinPetModules = window.PenguinPetModules || {});
  const PENGUIN_DOUBLE_CLICK_MS = 450;
  const MOUSE_IDLE_MOVEMENT_THRESHOLD_PX = 10;

  modules.interactions = ({
    runtime,
    createClickEffect,
    SPEED_WALK,
    SPEED_CHASE,
    SPEED_FLEE,
    MOUSE_IDLE_TRIGGER_MS,
    MOUSE_IDLE_REACTION_COOLDOWN_MS,
    halfPenguinSize,
    penguinSize,
  }) => ({
    onMouseMove(mouseX, mouseY) {
      if (!Number.isFinite(mouseX) || !Number.isFinite(mouseY)) return;
      if (this.isWalkingAway || this.isDragging || this.isRanting) return;
      if (
        typeof this.hasPendingFoodTargets === "function" &&
        this.hasPendingFoodTargets()
      ) {
        return;
      }

      const now = Date.now();
      const penguinCenterX = this.x + halfPenguinSize;
      const penguinCenterY = this.y + halfPenguinSize;
      const mdx = mouseX - penguinCenterX;
      const mdy = mouseY - penguinCenterY;
      const dist = Math.sqrt(mdx * mdx + mdy * mdy);
      const sinceLastSample = Math.max(
        16,
        now - (this.lastMouseSampleAt || now),
      );
      const lastX =
        typeof this.lastMouseSampleX === "number"
          ? this.lastMouseSampleX
          : mouseX;
      const lastY =
        typeof this.lastMouseSampleY === "number"
          ? this.lastMouseSampleY
          : mouseY;
      const mouseSpeed =
        (Math.hypot(mouseX - lastX, mouseY - lastY) / sinceLastSample) * 1000;

      this.lastMouseSampleX = mouseX;
      this.lastMouseSampleY = mouseY;
      this.lastMouseSampleAt = now;
      const lastMovementX =
        typeof this.lastMouseMovementX === "number"
          ? this.lastMouseMovementX
          : mouseX;
      const lastMovementY =
        typeof this.lastMouseMovementY === "number"
          ? this.lastMouseMovementY
          : mouseY;
      const movementDist = Math.hypot(
        mouseX - lastMovementX,
        mouseY - lastMovementY,
      );
      if (movementDist >= MOUSE_IDLE_MOVEMENT_THRESHOLD_PX) {
        this.lastMouseMovementAt = now;
        this.lastMouseMovementX = mouseX;
        this.lastMouseMovementY = mouseY;
        this.mouseIdleApproachTriggered = false;
      }

      if (!this.isMoving && !this.customMotion && Math.abs(mdx) > 18) {
        const shouldFaceRight = mdx > 0;
        if (shouldFaceRight !== this.facingRight) {
          this.facingRight = shouldFaceRight;
          this.applyTransform();
        }
      }

      const isCursorAbovePenguin = mouseY < this.y - 18;
      const isCursorTooHighToReach = mouseY < this.getFlyMinY() - 8;
      const isNearHorizontally = Math.abs(mdx) <= 180;
      if (
        isCursorAbovePenguin &&
        isCursorTooHighToReach &&
        isNearHorizontally &&
        !this.aiLocked &&
        now >= (this.unreachableMouseReactCooldownUntil || 0)
      ) {
        this.unreachableMouseReactCooldownUntil = now + 6000;
        this.aiLocked = true;
        this.stepQueue = [];
        this.isChasing = false;
        this.element.style.animation = "";

        const shouldFaceRight = mdx >= 0;
        if (shouldFaceRight !== this.facingRight) {
          this.facingRight = shouldFaceRight;
          this.applyTransform();
        }

        if (Math.random() < 0.55) {
          this.setState("peeking");
          if (Math.random() < 0.45) this.speak();

          setTimeout(() => {
            if (
              typeof this.enforceFoodPriority === "function" &&
              this.enforceFoodPriority()
            ) {
              return;
            }
            if (!this.isMoving) this.setState("idle");
            this.aiLocked = false;
            this.scheduleNextBehavior();
          }, this.scaleEmotionDuration(1000));
          return;
        }

        this.setState("flying");
        this.startWingFlap();
        this.speed = SPEED_CHASE;
        this.moveToPosition(
          mouseX,
          this.getFlyMinY() + halfPenguinSize,
          SPEED_CHASE,
          true,
        );

        setTimeout(() => {
          if (
            typeof this.enforceFoodPriority === "function" &&
            this.enforceFoodPriority()
          ) {
            return;
          }
          this.stopWingFlap();
          this.speed = SPEED_WALK;
          this.moveToPosition(
            this.x + halfPenguinSize,
            this.randomWalkY() + halfPenguinSize,
            SPEED_WALK,
          );

          const waitLanding = setInterval(() => {
            if (!this.isMoving) {
              clearInterval(waitLanding);
              if (!this.isMoving) this.setState("idle");
              this.aiLocked = false;
              this.scheduleNextBehavior();
            }
          }, 100);
        }, 850);
        return;
      }

      if (
        dist < 55 &&
        !this.aiLocked &&
        now >= (this.hoverReactionCooldownUntil || 0) &&
        Math.random() < 0.55
      ) {
        this.hoverReactionCooldownUntil = now + 6000;
        this.aiLocked = true;
        this.stepQueue = [];

        const hoverReactions = ["peeking", "waving", "shy"];
        const reaction =
          hoverReactions[Math.floor(Math.random() * hoverReactions.length)];
        this.element.style.animation = "";
        this.setState(reaction);
        this.speak();

        setTimeout(() => {
          if (
            typeof this.enforceFoodPriority === "function" &&
            this.enforceFoodPriority()
          ) {
            return;
          }
          if (!this.isMoving) this.setState("idle");
          this.aiLocked = false;
          this.scheduleNextBehavior();
        }, this.scaleEmotionDuration(1200));
        return;
      }

      if (
        dist >= 150 &&
        dist <= 280 &&
        mouseSpeed > 1500 &&
        !this.aiLocked &&
        !this.isMoving &&
        now >= (this.playfulFollowCooldownUntil || 0)
      ) {
        this.playfulFollowCooldownUntil = now + 10000;
        this.aiLocked = true;
        this.stepQueue = [];
        this.isChasing = true;
        this.speed = SPEED_CHASE;
        this.setState("running");

        setTimeout(() => {
          if (
            typeof this.enforceFoodPriority === "function" &&
            this.enforceFoodPriority()
          ) {
            return;
          }
          this.isChasing = false;
          this.speed = SPEED_WALK;
          if (!this.isMoving) this.setState("idle");
          this.aiLocked = false;
          this.scheduleNextBehavior();
        }, 1400);
      }
    },

    handleMouseProximity() {
      if (this.isWalkingAway) return;
      if (!runtime.isMouseInsideViewport) return;
      if (this.aiLocked) return;
      if (
        typeof this.hasPendingFoodTargets === "function" &&
        this.hasPendingFoodTargets()
      ) {
        return;
      }
      if (this.isDragging || this.currentFoodTarget || this.isEatingFood)
        return;
      if (this.isCursorTouchingPenguin()) return;

      const mdx = runtime.mouseX - (this.x + halfPenguinSize);
      const mdy = runtime.mouseY - (this.y + halfPenguinSize);
      const dist = Math.sqrt(mdx * mdx + mdy * mdy);
      const now = Date.now();
      const lastMovementAt =
        typeof this.lastMouseMovementAt === "number"
          ? this.lastMouseMovementAt
          : now;

      if (
        !this.customMotion &&
        !this.mouseIdleApproachTriggered &&
        now - lastMovementAt >= MOUSE_IDLE_TRIGGER_MS &&
        now >= (this.mouseIdleApproachCooldownUntil || 0)
      ) {
        this.mouseIdleApproachTriggered = true;
        this.mouseIdleApproachCooldownUntil =
          now + MOUSE_IDLE_REACTION_COOLDOWN_MS;
        this.triggerMouseIdleApproach();
        return;
      }

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
        // Keep chase as an occasional reaction; always-chase traps movement near the cursor.
        if (Math.random() < 0.2) {
          this.mouseReactionCooldown = 9000;
          this.triggerMouseChase();
        } else {
          this.mouseReactionCooldown = 7000;
          this.triggerMouseCurious();
        }
      } else if (dist >= 220 && this.lastMouseZone === "near") {
        this.lastMouseZone = "far";
        this.mouseReactionCooldown = 3000;
        this.triggerMouseGoodbye();
      } else if (dist >= 90 && this.lastMouseZone === "close") {
        this.lastMouseZone = dist < 220 ? "near" : "far";
      }
    },

    triggerMouseChase() {
      this.aiLocked = true;
      this.stepQueue = [];
      this.isChasing = true;
      this.speed = SPEED_CHASE;
      this.setState("running");
      this.speak();

      setTimeout(() => {
        if (
          typeof this.enforceFoodPriority === "function" &&
          this.enforceFoodPriority()
        )
          return;
        this.isChasing = false;
        this.speed = SPEED_WALK;
        if (!this.isMoving) this.setState("idle");
        this.aiLocked = false;
        this.scheduleNextBehavior();
      }, 2500);
    },

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
        if (
          typeof this.enforceFoodPriority === "function" &&
          this.enforceFoodPriority()
        )
          return;
        this.speed = SPEED_WALK;
        this.aiLocked = false;
        this.scheduleNextBehavior();
      }, 2500);
    },

    triggerMouseCurious() {
      this.aiLocked = true;
      this.stepQueue = [];
      this.setState("peeking");
      this.speak();

      setTimeout(() => {
        if (
          typeof this.enforceFoodPriority === "function" &&
          this.enforceFoodPriority()
        )
          return;
        if (!this.isMoving) this.setState("idle");
        this.aiLocked = false;
        this.scheduleNextBehavior();
      }, this.scaleEmotionDuration(2500));
    },

    triggerMouseIdleApproach() {
      this.aiLocked = true;
      this.stepQueue = [];
      this.isChasing = false;
      this.element.style.animation = "";

      const approachSpeed = Math.max(0.9, SPEED_WALK * 0.72);
      const currentCenterX = this.x + halfPenguinSize;
      const dir = runtime.mouseX >= currentCenterX ? 1 : -1;
      const stopDist = 70;
      const rawTargetCenterX = runtime.mouseX - dir * stopDist;
      // Garante que o alvo sempre fique na direção do mouse, nunca do lado oposto
      const clampedByDir =
        dir > 0
          ? Math.max(currentCenterX, rawTargetCenterX)
          : Math.min(currentCenterX, rawTargetCenterX);
      const targetCenterX = Math.max(
        halfPenguinSize,
        Math.min(clampedByDir, window.innerWidth - halfPenguinSize),
      );
      const targetTopY = this.clampY(runtime.mouseY - halfPenguinSize);

      this.speed = approachSpeed;
      this.setState("running");
      this.moveToPosition(
        targetCenterX,
        targetTopY + halfPenguinSize,
        approachSpeed,
      );

      const waitArrival = setInterval(() => {
        if (this.isMoving) return;
        clearInterval(waitArrival);

        if (
          typeof this.enforceFoodPriority === "function" &&
          this.enforceFoodPriority()
        ) {
          return;
        }

        this.speed = SPEED_WALK;
        this.setState("peeking");
        this.speak();

        setTimeout(() => {
          if (
            typeof this.enforceFoodPriority === "function" &&
            this.enforceFoodPriority()
          ) {
            return;
          }
          if (!this.isMoving) this.setState("idle");
          this.aiLocked = false;
          this.scheduleNextBehavior();
        }, this.scaleEmotionDuration(1600));
      }, 100);
    },

    triggerMouseGoodbye() {
      this.aiLocked = true;
      this.stepQueue = [];
      this.setState("waving");
      this.speak();

      setTimeout(() => {
        if (
          typeof this.enforceFoodPriority === "function" &&
          this.enforceFoodPriority()
        )
          return;
        if (!this.isMoving) this.setState("idle");
        this.aiLocked = false;
        this.scheduleNextBehavior();
      }, this.scaleEmotionDuration(2000));
    },

    setupEventListeners() {
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

      this.element.addEventListener("click", (e) => {
        e.stopPropagation();
        if (Date.now() < this.suppressClickUntil) return;
        if (this.pendingPenguinClickTimeoutId) return;
        this.pendingPenguinClickTimeoutId = setTimeout(() => {
          this.pendingPenguinClickTimeoutId = null;
          this.onClickPenguin();
        }, PENGUIN_DOUBLE_CLICK_MS);
      });

      this.element.addEventListener("dblclick", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (Date.now() < this.suppressClickUntil) return;
        if (this.pendingPenguinClickTimeoutId) {
          clearTimeout(this.pendingPenguinClickTimeoutId);
          this.pendingPenguinClickTimeoutId = null;
        }
        this.onDoubleClickPenguin();
      });
    },

    onDragStart(e) {
      if (this.isWalkingAway) return;
      if (
        typeof this.hasPendingFoodTargets === "function" &&
        this.hasPendingFoodTargets()
      ) {
        return;
      }
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
    },

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
        Math.min(
          e.clientY - this.dragOffsetY,
          window.innerHeight - penguinSize,
        ),
      );
      this.targetX = this.x;
      this.targetY = this.y;

      this.element.style.left = this.x + "px";
      this.element.style.top = this.y + "px";
      this.updateBubblePosition();
    },

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
      const now = Date.now();
      const streakWindowMs = 1800;
      this.dropReleaseStreak =
        now - this.lastDropReleaseAt <= streakWindowMs
          ? this.dropReleaseStreak + 1
          : 1;
      this.lastDropReleaseAt = now;

      if (this.dropReleaseStreak >= 2) {
        this.startWalkAwayAfterDrops();
        return;
      }

      this.dropWithFlap();
    },

    startWalkAwayAfterDrops() {
      this.aiLocked = true;
      this.isChasing = false;
      this.stepQueue = [];
      this.currentFoodTarget = null;
      this.isEatingFood = false;
      this.foodTargets = [];
      this.customMotion = null;
      this.allowAirMovement = false;
      this.isWalkingAway = true;
      this.isMoving = true;
      this.speed = SPEED_WALK;
      this.element.style.animation = "";
      this.setState("turningBack");
      this.startWaddleSteps();
      this.walkAwayReturnX = Math.max(
        0,
        Math.min(this.x, window.innerWidth - penguinSize),
      );
      this.walkAwayReturnY = this.clampY(this.y, false);

      const midX = this.x + halfPenguinSize;
      const goRight = midX >= window.innerWidth / 2;
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
    },

    onClickPenguin() {
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
        )
          return;
        this.element.style.animation = "";
        if (!this.isMoving) this.setState("idle");
        this.aiLocked = false;
        this.scheduleNextBehavior();
      }, this.scaleEmotionDuration(2000));
    },

    onDoubleClickPenguin() {
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
        this.showSpeech("♥");
        setTimeout(() => {
          if (!this.isMoving) this.setState("idle");
          this.aiLocked = false;
          this.scheduleNextBehavior();
        }, this.scaleEmotionDuration(2200));
      }
    },
  });
})();
