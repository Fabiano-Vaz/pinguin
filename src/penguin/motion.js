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
      const cfg = motion || {};
      const clampedX = Math.max(
        0,
        Math.min(targetX, window.innerWidth - penguinSize),
      );
      const clampedY = this.clampY(targetY);
      const horizontalDistance = Math.abs(clampedX - this.x);
      const realisticDistance = Math.min(
        cfg.jumpArcDistanceCapPx || 70,
        horizontalDistance,
      );
      const apex = Math.max(
        cfg.jumpArcApexMinPx || 10,
        Math.min(
          cfg.jumpArcApexMaxPx || 28,
          (cfg.jumpArcApexBasePx || 12) +
            realisticDistance * (cfg.jumpArcApexDistanceFactor || 0.12),
        ),
      );
      const duration = Math.max(
        cfg.jumpArcDurationMinMs || 380,
        Math.min(
          cfg.jumpArcDurationMaxMs || 620,
          (cfg.jumpArcDurationBaseMs || 420) +
            realisticDistance * (cfg.jumpArcDurationDistanceFactor || 2.1),
        ),
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
