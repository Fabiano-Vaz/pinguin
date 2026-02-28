(() => {
  const pet = window.PenguinPet || {};
  const constants = pet.constants || {};
  const effects = pet.effects || {};
  const modules = window.PenguinPetModules || {};
  const core = window.PenguinPetCore || {};

  const {
    penguinSize,
    halfPenguinSize,
    snowTopRatio,
    BUBBLE_BASE_INTERVAL_MS,
    BUBBLE_INTERVAL_JITTER_MS,
    BUBBLE_SHOW_CHANCE,
    EMOTION_DURATION_MULTIPLIER,
    PRELUDE_EMOTIONS,
    PRELUDE_EMOTION_DURATION_MS,
    PRELUDE_IDLE_DURATION_MS,
    PRELUDE_CHANCE,
    BEHAVIOR_DELAY_MIN_MS,
    BEHAVIOR_DELAY_VARIATION_MS,
    STEP_TRANSITION_DELAY_MS,
    STEP_TRANSITION_DELAY_VARIATION_MS,
    SPEED_WALK,
    SPEED_WALK_FAST,
    SPEED_CHASE,
    SPEED_FLEE,
    MOUSE_IDLE_TRIGGER_MS,
    MOUSE_IDLE_REACTION_COOLDOWN_MS,
  } = constants;
  const petConfig = constants.pet || {};
  const speechConfig = petConfig.speech || constants.speech || {};
  const motionConfig = petConfig.motion || constants.motion || {};

  const actionStates = pet.actionStates || {};
  const phrases = pet.phrases || {};
  const behaviors = pet.behaviors || [];
  const runtime = pet.runtime || {
    mouseX: window.innerWidth / 2,
    mouseY: window.innerHeight / 2,
    isMouseInsideViewport: true,
    isFishCursorEnabled: true,
  };
  const createClickEffect =
    typeof effects.createClickEffect === "function"
      ? effects.createClickEffect
      : () => {};

  class Penguin {
    constructor() {
      this.element = document.createElement("div");
      this.element.className = "penguin";
      this.img = document.createElement("img");
      this.img.draggable = false;
      this.element.appendChild(this.img);

      this.umbrellaEl = document.createElement("img");
      this.umbrellaEl.className = "penguin-umbrella";
      this.umbrellaEl.draggable = false;
      this.umbrellaEl.src =
        window.PENGUIN_ASSETS && window.PENGUIN_ASSETS.umbrella
          ? window.PENGUIN_ASSETS.umbrella
          : "assets/umbrella.svg";
      document.body.appendChild(this.umbrellaEl);

      document.body.appendChild(this.element);

      this.x = window.innerWidth / 2 - halfPenguinSize;
      this.y = this.getGroundTopY();
      this.targetX = this.x;
      this.targetY = this.y;

      this.currentState = "";
      this.facingRight = true;
      this.isMoving = false;
      this.speed = SPEED_WALK_FAST;
      this.allowAirMovement = false;
      this.customMotion = null;
      this.lastUpdateTime = performance.now();
      this.visualScale = 1;

      this.bubble = null;
      this.bubbleTimeout = null;
      this.nextBubbleAt = Date.now() + this.getNextBubbleDelay();

      this.aiLocked = false;
      this.stepQueue = [];

      this.lastMouseZone = "far";
      this.mouseReactionCooldown = 0;
      this.hoverReactionCooldownUntil = 0;
      this.playfulFollowCooldownUntil = 0;
      this.unreachableMouseReactCooldownUntil = 0;
      this.lastMouseSampleX = runtime.mouseX;
      this.lastMouseSampleY = runtime.mouseY;
      this.lastMouseSampleAt = Date.now();
      this.lastMouseMovementAt = Date.now();
      this.lastMouseMovementX = runtime.mouseX;
      this.lastMouseMovementY = runtime.mouseY;
      this.mouseIdleApproachTriggered = false;
      this.mouseIdleApproachCooldownUntil = 0;
      this.isChasing = false;
      this.isDragging = false;
      this.dragMoved = false;
      this.dragOffsetX = 0;
      this.dragOffsetY = 0;
      this.suppressClickUntil = 0;
      this.isCursorTouchEating = false;
      this.cursorTouchEatingUntil = 0;
      this.fishEatenCount = 0;
      this.fishCursorResumeTimeout = null;
      this.screenClickStreak = 0;
      this.lastScreenClickAt = 0;
      this.penguinClickStreak = 0;
      this.lastPenguinClickAt = 0;
      this.pendingPenguinClickTimeoutId = null;
      this.isRanting = false;
      this.rantCooldownUntil = 0;
      this.dropReleaseStreak = 0;
      this.lastDropReleaseAt = 0;
      this.isWalkingAway = false;
      this.walkAwayReturnX = this.x;
      this.walkAwayReturnY = this.y;
      this.visualLockUntil = 0;
      this.caveirinhaTimeoutId = null;
      this.isCaveirinhaMode = false;
      this.windTilt = 0;
      this.windTiltPhaseATimeoutId = null;
      this.windTiltPhaseBTimeoutId = null;
      this.nextBehaviorTimeoutId = null;
      this.dropReactionIntervalId = null;
      this.dropReactionTimeoutId = null;
      this.dropReactionToken = 0;
      this.activityStateMachine =
        typeof core.createActivityStateMachine === "function"
          ? core.createActivityStateMachine("idle")
          : null;
      this.activityMode = "idle";
      this.activityModeChangedAt = Date.now();
      this.timerRegistry =
        typeof core.createTimerRegistry === "function"
          ? core.createTimerRegistry()
          : null;
      this.debugEnabled = Boolean(
        (window.PENGUIN_CONFIG && window.PENGUIN_CONFIG.debugPanel) ||
          (typeof localStorage !== "undefined" &&
            localStorage.getItem("penguin.debugPanel") === "1"),
      );
      this.debugPanelEl = null;
      this.lastDebugRenderAt = 0;

      this.foodTargets = [];
      this.currentFoodTarget = null;
      this.isEatingFood = false;

      this.setActivityMode("idle", "constructor");
      this.ensureDebugPanel();
      this.setState("idle");
      this.applyTransform();
      this.setupEventListeners();
      this.update(this.lastUpdateTime);
      setTimeout(() => this.startNextBehavior(), 500);
    }

    setActivityMode(nextMode, reason = "", { force = false } = {}) {
      if (typeof nextMode !== "string" || nextMode.length === 0) return false;
      if (nextMode === this.activityMode) return true;

      if (this.activityStateMachine && typeof this.activityStateMachine.transition === "function") {
        const result = this.activityStateMachine.transition(nextMode, reason || "transition");
        if (!result.ok && !force) return false;
      }

      this.activityMode = nextMode;
      this.activityModeChangedAt = Date.now();
      return true;
    }

    inferActivityMode() {
      if (this.isCaveirinhaMode) return "caveirinha";
      if (this.isDragging) return "dragging";
      if (this.isWalkingAway) return "walk_away";
      if (this.isFishingActive || this.currentState === "fishing") return "fishing";
      if (this.isRanting) return "ranting";
      if (this.isEatingFood || this.currentFoodTarget) return "eating";
      return "idle";
    }

    setManagedTimeout(context, key, callback, delayMs = 0) {
      if (this.timerRegistry && typeof this.timerRegistry.setManagedTimeout === "function") {
        return this.timerRegistry.setManagedTimeout(context, key, callback, delayMs);
      }
      return setTimeout(callback, delayMs);
    }

    setManagedInterval(context, key, callback, delayMs = 0) {
      if (this.timerRegistry && typeof this.timerRegistry.setManagedInterval === "function") {
        return this.timerRegistry.setManagedInterval(context, key, callback, delayMs);
      }
      return setInterval(callback, delayMs);
    }

    clearManagedTimer(context, key) {
      if (this.timerRegistry && typeof this.timerRegistry.clear === "function") {
        return this.timerRegistry.clear(context, key);
      }
      return false;
    }

    clearManagedContext(context) {
      if (this.timerRegistry && typeof this.timerRegistry.clearContext === "function") {
        return this.timerRegistry.clearContext(context);
      }
      return 0;
    }

    ensureDebugPanel() {
      if (!this.debugEnabled || typeof document === "undefined") return;
      if (this.debugPanelEl && this.debugPanelEl.isConnected) return;
      const panel = document.createElement("div");
      panel.className = "penguin-debug-panel";
      document.body.appendChild(panel);
      this.debugPanelEl = panel;
    }

    renderDebugPanel(now = performance.now()) {
      if (!this.debugEnabled) return;
      if (!this.debugPanelEl || !this.debugPanelEl.isConnected) {
        this.ensureDebugPanel();
      }
      if (!this.debugPanelEl) return;
      if (now - (this.lastDebugRenderAt || 0) < 180) return;
      this.lastDebugRenderAt = now;

      const inferredMode = this.inferActivityMode();
      if (inferredMode !== this.activityMode) {
        this.setActivityMode(inferredMode, "sync", { force: true });
      }

      const motionType =
        this.customMotion && typeof this.customMotion.type === "string"
          ? this.customMotion.type
          : "none";
      const timerInfo =
        this.timerRegistry && typeof this.timerRegistry.snapshot === "function"
          ? this.timerRegistry.snapshot()
          : { total: 0, byContext: {} };

      this.debugPanelEl.innerHTML = [
        `<strong>mode</strong>: ${this.activityMode}`,
        `<strong>state</strong>: ${this.currentState || "none"}`,
        `<strong>motion</strong>: ${motionType}`,
        `<strong>moving</strong>: ${this.isMoving ? "1" : "0"} | <strong>drag</strong>: ${this.isDragging ? "1" : "0"} | <strong>away</strong>: ${this.isWalkingAway ? "1" : "0"}`,
        `<strong>xy</strong>: ${Math.round(this.x)}, ${Math.round(this.y)}`,
        `<strong>timers</strong>: ${timerInfo.total} ${JSON.stringify(timerInfo.byContext)}`,
      ].join("<br>");
    }

    update(now = performance.now()) {
      const dtSeconds = Math.min(
        0.05,
        Math.max(0.001, (now - this.lastUpdateTime) / 1000),
      );
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

        // Failsafe: se o fluxo "ir embora" perder o customMotion com o pinguim visível,
        // recria a saída para evitar travar de costas no ar.
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
            this.x = Math.max(
              0,
              Math.min(this.x, window.innerWidth - penguinSize),
            );
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
          (this.currentState === "running" ||
            this.currentState === "runningCrouched")
        ) {
          this.setState("idle");
        }

        this.x = Math.max(0, Math.min(this.x, window.innerWidth - penguinSize));
        this.y = this.clampY(this.y, this.allowAirMovement);
        this.targetX = Math.max(
          0,
          Math.min(this.targetX, window.innerWidth - penguinSize),
        );
        this.targetY = this.clampY(this.targetY, this.allowAirMovement);

        this.element.style.left = this.x + "px";
        this.element.style.top = this.y + "px";
        this.applyTransform(this.isWalkingAway ? 1 : undefined);
        this.updateBubblePosition();
        this.updateUmbrellaPosition();
        this.applyCursorEatingState();
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
          this.x = Math.max(
            0,
            Math.min(this.x, window.innerWidth - penguinSize),
          );
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
    }

    showUmbrella() {
      if (this.isFishingActive) return;
      if (this.umbrellaEl.classList.contains("flying-away")) return;
      if (this.umbrellaEl.classList.contains("open")) return;
      this.updateUmbrellaPosition();
      this.umbrellaEl.classList.remove("closing");
      void this.umbrellaEl.offsetWidth;
      this.umbrellaEl.classList.add("open");
    }

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
    }

    updateUmbrellaPosition() {
      if (!this.umbrellaEl) return;
      if (this.umbrellaEl.classList.contains("flying-away")) return;
      const depthScale =
        typeof this.getDepthScale === "function" ? this.getDepthScale() : 1;
      const umbrellaSize = penguinSize * 0.85 * depthScale;
      // Mantém sempre fixo no lado esquerdo da tela.
      const sideOffset = -umbrellaSize * 0.2;
      const left = this.x + halfPenguinSize - umbrellaSize / 2 + sideOffset;
      // Align so the pole base (56% from top of SVG) sits at the penguin's upper body
      const liftOffset = this.umbrellaLiftOffset || 0;
      const top = this.y - umbrellaSize * 0.30 - liftOffset;
      this.umbrellaEl.style.left = left + "px";
      this.umbrellaEl.style.top = top + "px";
      this.umbrellaEl.style.zIndex = String(
        parseInt(this.element.style.zIndex || "10", 10) + 1,
      );

      // Inclinação sutil baseada na posição horizontal do mouse
      const centerX = window.innerWidth / 2;
      const tiltMax = 10;
      const rawTilt =
        ((runtime.mouseX - centerX) / Math.max(1, centerX)) * tiltMax;
      const tilt = Math.max(-tiltMax, Math.min(tiltMax, rawTilt));
      this.umbrellaEl.style.setProperty(
        "--umbrella-tilt",
        tilt.toFixed(2) + "deg",
      );
    }

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
      el.style.setProperty(
        "--umbrella-fly-x",
        `${travelX}px`,
      );
      el.style.setProperty(
        "--umbrella-fly-y",
        `${travelY}px`,
      );
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
    }
  }

  const deps = {
    actionStates,
    phrases,
    behaviors,
    runtime,
    createClickEffect,
    penguinSize,
    halfPenguinSize,
    snowTopRatio,
    BUBBLE_BASE_INTERVAL_MS,
    BUBBLE_INTERVAL_JITTER_MS,
    BUBBLE_SHOW_CHANCE,
    EMOTION_DURATION_MULTIPLIER,
    PRELUDE_EMOTIONS,
    PRELUDE_EMOTION_DURATION_MS,
    PRELUDE_IDLE_DURATION_MS,
    PRELUDE_CHANCE,
    BEHAVIOR_DELAY_MIN_MS,
    BEHAVIOR_DELAY_VARIATION_MS,
    STEP_TRANSITION_DELAY_MS,
    STEP_TRANSITION_DELAY_VARIATION_MS,
    SPEED_WALK,
    SPEED_WALK_FAST,
    SPEED_CHASE,
    SPEED_FLEE,
    MOUSE_IDLE_TRIGGER_MS,
    MOUSE_IDLE_REACTION_COOLDOWN_MS,
    speech: speechConfig,
    motion: motionConfig,
  };

  Object.assign(
    Penguin.prototype,
    modules.state ? modules.state(deps) : {},
    modules.speech ? modules.speech(deps) : {},
    modules.motion ? modules.motion(deps) : {},
    modules.ai ? modules.ai(deps) : {},
    modules.interactions ? modules.interactions(deps) : {},
  );

  window.PenguinPet = {
    ...pet,
    Penguin,
  };
})();
