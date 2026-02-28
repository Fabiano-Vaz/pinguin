(() => {
  const modules = (window.PenguinPetModules = window.PenguinPetModules || {});

  modules.motion = ({
    penguinSize,
    halfPenguinSize,
    snowTopRatio,
    phrases,
    motion,
  }) => ({
    startJumpArc(targetX, targetY) {
      if (this.isJumpLocked) return;
      const cfg = motion || {};
      const clampedY = this.clampY(targetY);
      const gravity = Math.max(1200, cfg.fallGravityPxPerSec2 || 1900);
      const jumpHeight = Math.max(
        (cfg.jumpArcApexMinPx || 10) + 8,
        Math.min(
          (cfg.jumpArcApexMaxPx || 28) + 22,
          (cfg.jumpArcApexBasePx || 12) * 2.2,
        ),
      );
      const initialVy = -Math.sqrt(2 * gravity * jumpHeight);

      this.customMotion = {
        type: "jumpVertical",
        startX: this.x,
        targetY: clampedY,
        vy: initialVy,
        gravity,
        jumpHeight,
      };

      this.isMoving = true;
      this.allowAirMovement = true;
      this.targetX = this.x;
      this.targetY = this.y;
      this.isJumpLocked = true;
      this.allowJumpStateTransition = false;
      this.setState("jumping");
    },

    boostJumpArc() {
      if (!this.customMotion || this.customMotion.type !== "jumpVertical") {
        return false;
      }

      const cfg = motion || {};
      const boostVelocity = Math.max(
        40,
        cfg.jumpFlapBoostVelocityPxPerSec || 180,
      );
      const minUpwardVelocity = Math.max(
        60,
        cfg.jumpFlapMinUpwardVelocityPxPerSec || 240,
      );
      const maxUpwardVelocity = Math.max(
        minUpwardVelocity,
        cfg.jumpFlapMaxUpwardVelocityPxPerSec || 980,
      );

      const boostedVy = this.customMotion.vy - boostVelocity;
      this.customMotion.vy = Math.max(
        -maxUpwardVelocity,
        Math.min(boostedVy, -minUpwardVelocity),
      );
      this.setState("jumping");
      return true;
    },

    startDropFall() {
      const cfg = motion || {};
      this.customMotion = {
        type: "fall",
        vy: 0,
        gravity: cfg.fallGravityPxPerSec2 || 1900,
        maxVy: cfg.fallMaxVelocityPxPerSec || 1400,
        targetY: this.getWalkMinY(),
      };
      this.isMoving = true;
      this.allowAirMovement = true;
      this.setState("flying");
      this.startWingFlap();
    },

    updateCustomMotion(dtSeconds) {
      if (!this.customMotion) return;

      if (this.customMotion.type === "jumpVertical") {
        const motion = this.customMotion;
        this.x = motion.startX;
        motion.vy += motion.gravity * dtSeconds;
        this.y += motion.vy * dtSeconds;

        if (this.y >= motion.targetY && motion.vy > 0) {
          this.y = motion.targetY;
          this.customMotion = null;
          this.isMoving = false;
          this.allowAirMovement = false;
          this.isJumpLocked = false;
          this.allowJumpStateTransition = true;
          this.setState("idle");
          this.allowJumpStateTransition = false;
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
          if (typeof this.setActivityMode === "function") {
            this.setActivityMode("idle", "drop-fall:landed", { force: true });
          }
          this.setState("idle");
        }
        return;
      }

      if (this.customMotion.type === "walkAwayExit") {
        const cfg = motion || {};
        const currentMotion = this.customMotion;
        currentMotion.elapsed += dtSeconds * 1000;
        const t = Math.min(1, currentMotion.elapsed / currentMotion.duration);
        const eased = t * t * (3 - 2 * t);

        this.x =
          currentMotion.startX + (currentMotion.targetX - currentMotion.startX) * eased;
        this.y = currentMotion.startY;
        this.visualScale = Math.max(
          cfg.walkAwayExitMinVisualScale || 0.22,
          1 - eased * (cfg.walkAwayExitScaleReductionFactor || 0.78),
        );
        this.applyTransform(1);

        if (t >= 1) {
          this.customMotion = null;
          this.isMoving = false;
          this.allowAirMovement = false;
          this.stopWaddleSteps();
          this.element.style.opacity = "0";

          setTimeout(() => {
            const returnX = Math.max(
              0,
              Math.min(this.walkAwayReturnX, window.innerWidth - penguinSize),
            );
            const returnY = this.clampY(this.walkAwayReturnY, false);
            const exitedToRight = currentMotion.targetX > currentMotion.startX;
            const offscreenPadding = cfg.walkAwayOffscreenPaddingPx || 12;
            this.x = exitedToRight
              ? window.innerWidth + penguinSize + offscreenPadding
              : -penguinSize - offscreenPadding;
            this.y = this.getGroundTopY();
            this.targetX = this.x;
            this.targetY = this.y;
            this.visualScale = cfg.walkAwayReturnStartVisualScale || 0.55;
            this.element.style.opacity = "1";
            this.facingRight = true;
            this.setVisualState("default");
            this.applyTransform(1);
            this.startWaddleSteps();
            this.customMotion = {
              type: "returnAfterWalkAway",
              startX: this.x,
              startY: this.y,
              targetX: returnX,
              targetY: returnY,
              duration: cfg.walkAwayReturnDurationMs || 2200,
              elapsed: 0,
            };
            this.isMoving = true;
          }, cfg.walkAwayReturnDelayMs || 700);
        }
        return;
      }

      if (this.customMotion.type === "returnAfterWalkAway") {
        const cfg = motion || {};
        const currentMotion = this.customMotion;
        currentMotion.elapsed += dtSeconds * 1000;
        const t = Math.min(1, currentMotion.elapsed / currentMotion.duration);
        const eased = t * t * (3 - 2 * t);

        this.x =
          currentMotion.startX + (currentMotion.targetX - currentMotion.startX) * eased;
        this.y =
          currentMotion.startY + (currentMotion.targetY - currentMotion.startY) * eased;
        this.visualScale = (cfg.walkAwayReturnStartVisualScale || 0.55) + eased * 0.45;
        this.applyTransform(1);

        if (t >= 1) {
          this.customMotion = null;
          this.isMoving = false;
          this.allowAirMovement = false;
          this.isWalkingAway = false;
          if (typeof this.setActivityMode === "function") {
            this.setActivityMode("idle", "walk-away:return-finished", { force: true });
          }
          this.dropReleaseStreak = 0;
          this.visualScale = 1;
          this.stopWaddleSteps();
          this.setVisualState("default");
          this.applyTransform();
          const droppedList =
            Array.isArray(phrases && phrases.dropped) &&
            phrases.dropped.length > 0
              ? phrases.dropped
              : Array.isArray(phrases && phrases.idle)
                ? phrases.idle
                : [];
          if (droppedList.length > 0) {
            this.showSpeech(
              droppedList[Math.floor(Math.random() * droppedList.length)],
              cfg.walkAwayFinalSpeechDurationMs || 3200,
            );
          }

          setTimeout(() => {
            this.aiLocked = false;
            if (this.foodTargets.length > 0) {
              this.tryStartFoodHunt();
            } else {
              this.scheduleNextBehavior();
            }
          }, cfg.walkAwayAiUnlockDelayMs || 3300);
        }
      }
    },

    getFloorY() {
      return window.innerHeight * snowTopRatio;
    },

    getGroundTopY() {
      return Math.max(
        0,
        Math.min(
          this.getFloorY() - penguinSize,
          window.innerHeight - penguinSize,
        ),
      );
    },

    getWalkMinY() {
      return this.getGroundTopY();
    },

    getWalkMaxY() {
      const cfg = motion || {};
      return (
        this.getWalkMinY() +
        Math.round(window.innerHeight * (cfg.walkMaxYOffsetRatio || 0.13))
      );
    },

    getFlyMinY() {
      const cfg = motion || {};
      return Math.max(0, this.getWalkMinY() - (cfg.flyMinYOffsetPx || 90));
    },

    clampY(y, allowAir = false) {
      const minY = allowAir ? this.getFlyMinY() : this.getWalkMinY();
      return Math.max(minY, Math.min(y, this.getWalkMaxY()));
    },

    randomWalkY() {
      const minY = this.getWalkMinY();
      const maxY = this.getWalkMaxY();
      return minY + Math.random() * Math.max(1, maxY - minY);
    },

    randomFlyY() {
      const cfg = motion || {};
      const minY = this.getFlyMinY();
      const maxY = Math.max(minY, this.getWalkMinY() + (cfg.flyRandomYOffsetPx || 20));
      return minY + Math.random() * Math.max(1, maxY - minY);
    },

    moveToPosition(tx, ty, speed, allowAir = false) {
      this.targetX = tx - halfPenguinSize;
      this.allowAirMovement = allowAir;
      this.targetY =
        typeof ty === "number"
          ? this.clampY(ty - halfPenguinSize, allowAir)
          : this.getWalkMinY();
      this.isMoving = true;
      if (speed) this.speed = speed;
    },

    randomTarget(nearEdge) {
      const cfg = motion || {};
      const w = Math.max(0, window.innerWidth - penguinSize);
      const inset = Math.min(
        cfg.randomTargetInsetMaxPx || 70,
        Math.max(
          cfg.randomTargetInsetMinPx || 18,
          Math.round(w * (cfg.randomTargetInsetRatio || 0.12)),
        ),
      );
      const safeMin = Math.min(inset, w);
      const safeMax = Math.max(safeMin, w - inset);
      const randomY = this.randomWalkY();

      if (nearEdge) {
        const jitter = (Math.random() - 0.5) * (cfg.randomTargetEdgeJitterPx || 24);
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
    },

    randomShortWalkTarget() {
      const cfg = motion || {};
      const maxOffset = cfg.randomShortWalkMaxOffsetPx || 120;
      const sideInset = cfg.randomShortWalkSideInsetPx || 16;
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
    },
  });
})();
