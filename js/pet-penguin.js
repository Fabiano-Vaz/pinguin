(() => {
  const pet = window.PenguinPet || {};
  const constants = pet.constants || {};
  const effects = pet.effects || {};
  const modules = window.PenguinPetModules || {};

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
  } = constants;

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
      this.isRanting = false;
      this.rantCooldownUntil = 0;
      this.dropReleaseStreak = 0;
      this.lastDropReleaseAt = 0;
      this.isWalkingAway = false;
      this.walkAwayReturnX = this.x;
      this.walkAwayReturnY = this.y;

      this.foodTargets = [];
      this.currentFoodTarget = null;
      this.isEatingFood = false;

      this.setState("idle");
      this.applyTransform();
      this.setupEventListeners();
      this.update(this.lastUpdateTime);
      setTimeout(() => this.startNextBehavior(), 500);
    }

    update(now = performance.now()) {
      const dtSeconds = Math.min(
        0.05,
        Math.max(0.001, (now - this.lastUpdateTime) / 1000),
      );
      this.lastUpdateTime = now;

      if (this.isDragging) {
        requestAnimationFrame((ts) => this.update(ts));
        return;
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
        this.handleMouseProximity();
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
          if (!this.isWalkingAway) this.setState("running");
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

      if (!movedThisFrame && this.currentState === "running") {
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
      this.applyCursorEatingState();
      this.handleMouseProximity();

      requestAnimationFrame((ts) => this.update(ts));
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
