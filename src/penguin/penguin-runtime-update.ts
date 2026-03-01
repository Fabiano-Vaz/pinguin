(() => {
  const modules = (window.PenguinPetModules = window.PenguinPetModules || {});

  modules.penguinRuntimeUpdate = ({ runtime, halfPenguinSize, penguinSize }) => ({
    update(now = performance.now()) {
      const dtSeconds = Math.min(0.05, Math.max(0.001, (now - this.lastUpdateTime) / 1000));
      this.lastUpdateTime = now;
      try {
        if (this.isCaveirinhaMode) {
          this.customMotion = null;
          this.isMoving = false;
          this.isChasing = false;
          this.allowAirMovement = false;
          this.targetX = this.x;
          this.targetY = this.y;
          this.element.style.left = this.x + "px";
          this.element.style.top = this.y + "px";
          this.applyTransform(this.isWalkingAway ? 1 : undefined);
          this.updateBubblePosition();
          this.updateUmbrellaPosition();
          this.renderDebugPanel(now);
          requestAnimationFrame((ts) => this.update(ts));
          return;
        }

        if (this.isTemporaryDead) {
          this.customMotion = null;
          this.isMoving = false;
          this.isChasing = false;
          this.allowAirMovement = false;
          this.targetX = this.x;
          this.targetY = this.y;
          this.element.style.left = this.x + "px";
          this.element.style.top = this.y + "px";
          this.applyTransform();
          this.updateBubblePosition();
          this.updateUmbrellaPosition();
          this.renderDebugPanel(now);
          requestAnimationFrame((ts) => this.update(ts));
          return;
        }

        if (this.isDragging) {
          this.renderDebugPanel(now);
          requestAnimationFrame((ts) => this.update(ts));
          return;
        }

        if (this.isFishingActive) {
          this.customMotion = null;
          this.isMoving = false;
          this.isChasing = false;
          this.allowAirMovement = false;
          this.targetX = this.x;
          this.targetY = this.y;
        }

        if (
          this.isWalkingAway &&
          !this.isDragging &&
          !this.customMotion &&
          this.element.style.opacity !== "0"
        ) {
          this.allowAirMovement = false;
          this.isMoving = true;
          this.y = this.getGroundTopY();
          this.targetY = this.y;
          this.startWaddleSteps();
          const midX = this.x + halfPenguinSize;
          const goRight = midX >= window.innerWidth / 2;
          const exitPadding = penguinSize + 12;
          const targetX = goRight ? window.innerWidth + exitPadding : -exitPadding;
          this.customMotion = {
            type: "walkAwayExit",
            startX: this.x,
            startY: this.y,
            targetX,
            elapsed: 0,
            duration: 2200,
          };
        }

        if (this.customMotion) {
          this.updateCustomMotion(dtSeconds);
          if (this.customMotion && this.customMotion.type === "walkAwayExit") {
            this.y = this.clampY(this.y, false);
          } else {
            this.x = Math.max(0, Math.min(this.x, window.innerWidth - penguinSize));
            this.y = Math.max(0, Math.min(this.y, this.getWalkMaxY()));
          }
          this.element.style.left = this.x + "px";
          this.element.style.top = this.y + "px";
          this.updateBubblePosition();
          this.updateUmbrellaPosition();
          this.handleMouseProximity();
          this.renderDebugPanel(now);
          requestAnimationFrame((ts) => this.update(ts));
          return;
        }

        this.handleFoodHunt();

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

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
            if (!this.isWalkingAway) {
              this.setState("running");
            }
          }

          if (dx < 0 && this.facingRight) {
            this.facingRight = false;
            this.applyTransform();
          } else if (dx > 0 && !this.facingRight) {
            this.facingRight = true;
            this.applyTransform();
          }
        } else if (this.isMoving) {
          this.isMoving = false;
          this.allowAirMovement = false;
          this.setState("idle");
        }

        if (
          !movedThisFrame &&
          (this.currentState === "running" || this.currentState === "runningCrouched")
        ) {
          this.setState("idle");
        }

        this.x = Math.max(0, Math.min(this.x, window.innerWidth - penguinSize));
        this.y = this.clampY(this.y, this.allowAirMovement);
        this.targetX = Math.max(0, Math.min(this.targetX, window.innerWidth - penguinSize));
        this.targetY = this.clampY(this.targetY, this.allowAirMovement);

        this.element.style.left = this.x + "px";
        this.element.style.top = this.y + "px";
        this.applyTransform(this.isWalkingAway ? 1 : undefined);
        this.updateBubblePosition();
        this.updateUmbrellaPosition();
        this.applyCursorEatingState();
        this.recoverInvalidPose();
        this.handleMouseProximity();
        this.renderDebugPanel(now);

        requestAnimationFrame((ts) => this.update(ts));
      } catch (error) {
        console.error("[PenguinPet] update loop recovered from error", error);
        this.isDragging = false;
        this.allowAirMovement = false;
        this.targetX = this.x;
        this.targetY = this.y;

        if (this.isWalkingAway) {
          this.isMoving = true;
          this.y = this.getGroundTopY();
          this.targetY = this.y;
          if (typeof this.startWaddleSteps === "function") {
            this.startWaddleSteps();
          }
          const midX = this.x + halfPenguinSize;
          const goRight = midX >= window.innerWidth / 2;
          const exitPadding = penguinSize + 12;
          this.customMotion = {
            type: "walkAwayExit",
            startX: this.x,
            startY: this.y,
            targetX: goRight ? window.innerWidth + exitPadding : -exitPadding,
            elapsed: 0,
            duration: 2200,
          };
        } else {
          this.x = Math.max(0, Math.min(this.x, window.innerWidth - penguinSize));
          this.y = this.clampY(this.y, false);
          this.customMotion = null;
          this.isMoving = false;
          if (typeof this.setState === "function") this.setState("idle");
        }
        if (this.element) {
          this.element.style.left = this.x + "px";
          this.element.style.top = this.y + "px";
        }
        if (typeof this.applyTransform === "function") {
          this.applyTransform(this.isWalkingAway ? 1 : undefined);
        }
        if (typeof this.updateBubblePosition === "function") this.updateBubblePosition();
        if (typeof this.updateUmbrellaPosition === "function") this.updateUmbrellaPosition();
        this.renderDebugPanel(now);
        requestAnimationFrame((ts) => this.update(ts));
      }
    },

    recoverInvalidPose() {
      const isPoseState =
        this.currentState === "eating" ||
        this.currentState === "runningCrouched" ||
        this.currentState === "fishing";
      if (!isPoseState) {
        this.invalidPoseSince = 0;
        return;
      }

      const shouldKeepPose =
        this.isFishingActive ||
        this.isEatingFood ||
        this.isCursorTouchEating ||
        Boolean(this.currentFoodTarget) ||
        this.isDragging ||
        this.isWalkingAway ||
        Boolean(this.customMotion);

      if (shouldKeepPose) {
        this.invalidPoseSince = 0;
        return;
      }

      const now = Date.now();
      if (!this.invalidPoseSince) {
        this.invalidPoseSince = now;
        return;
      }
      if (now - this.invalidPoseSince < 1200) return;

      this.invalidPoseSince = 0;
      if (typeof this.unlockVisualSprite === "function") {
        this.unlockVisualSprite();
      }
      if (typeof this.setState === "function" && !this.isMoving) {
        this.setState("idle");
      }
      if (this.aiLocked && this.stepQueue.length === 0) {
        this.aiLocked = false;
      }
    },

    showUmbrella() {
      if (this.blockUmbrellaUntilNextRain) return;
      if (this.isTemporaryDead || this.currentState === "deadLying") return;
      if (this.isFishingActive) return;
      if (this.currentState === "sleeping" || this.currentState === "full") return;
      if (this.umbrellaEl.classList.contains("flying-away")) return;
      if (this.umbrellaEl.classList.contains("open")) return;
      this.updateUmbrellaPosition();
      this.umbrellaEl.classList.remove("closing");
      void this.umbrellaEl.offsetWidth;
      this.umbrellaEl.classList.add("open");
    },

    hideUmbrella() {
      if (this.umbrellaEl.classList.contains("flying-away")) {
        this.umbrellaEl.classList.remove("flying-away");
      }
      if (!this.umbrellaEl.classList.contains("open")) return;
      this.umbrellaEl.classList.remove("open");
      this.umbrellaEl.classList.add("closing");
      const el = this.umbrellaEl;
      el.addEventListener(
        "animationend",
        () => el.classList.remove("closing"),
        { once: true },
      );
    },

    updateUmbrellaPosition() {
      if (!this.umbrellaEl) return;
      if (this.umbrellaEl.classList.contains("flying-away")) return;
      const depthScale =
        typeof this.getDepthScale === "function" ? this.getDepthScale() : 1;
      const umbrellaSize = penguinSize * 0.85 * depthScale;
      const sideOffset = -umbrellaSize * 0.2;
      const left = this.x + halfPenguinSize - umbrellaSize / 2 + sideOffset;
      const liftOffset = this.umbrellaLiftOffset || 0;
      const top = this.y - umbrellaSize * 0.3 - liftOffset;
      this.umbrellaEl.style.left = left + "px";
      this.umbrellaEl.style.top = top + "px";
      this.umbrellaEl.style.zIndex = String(
        parseInt(this.element.style.zIndex || "10", 10) + 1,
      );

      const centerX = window.innerWidth / 2;
      const tiltMax = 10;
      const rawTilt = ((runtime.mouseX - centerX) / Math.max(1, centerX)) * tiltMax;
      const tilt = Math.max(-tiltMax, Math.min(tiltMax, rawTilt));
      this.umbrellaEl.style.setProperty("--umbrella-tilt", tilt.toFixed(2) + "deg");
    },

    blowAwayUmbrella(direction = 1) {
      if (!this.umbrellaEl) return;
      if (!this.umbrellaEl.classList.contains("open")) return;

      const dir = direction >= 0 ? 1 : -1;
      const el = this.umbrellaEl;
      this.updateUmbrellaPosition();
      el.classList.remove("open", "closing");
      const travelX = Math.round((window.innerWidth + 260) * dir);
      const travelY = Math.round(-(window.innerHeight * (0.24 + Math.random() * 0.14)));
      el.style.setProperty("--umbrella-fly-dir", String(dir));
      el.style.setProperty("--umbrella-fly-x", `${travelX}px`);
      el.style.setProperty("--umbrella-fly-y", `${travelY}px`);
      el.style.setProperty(
        "--umbrella-fly-rot",
        `${Math.round((520 + Math.random() * 280) * dir)}deg`,
      );
      void el.offsetWidth;
      el.classList.add("flying-away");

      el.addEventListener(
        "animationend",
        () => {
          el.classList.remove("flying-away");
          el.style.removeProperty("--umbrella-fly-x");
          el.style.removeProperty("--umbrella-fly-y");
          el.style.removeProperty("--umbrella-fly-rot");
        },
        { once: true },
      );
    },
  });
})();
