import "./penguin-runtime-state";
import "./penguin-runtime-update";
import { PenguinStateService } from "../services/penguin-state-service";

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
    [key: string]: any;

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
      this.dragStartY = 0;
      this.suppressClickUntil = 0;
      this.isCursorTouchEating = false;
      this.cursorTouchEatingUntil = 0;
      this.fishEatenCount = 0;
      this.lastFishEatenAt = 0;
      this.isFullBellySequenceActive = false;
      this.allowFullStateTransition = false;
      this.isJumpLocked = false;
      this.allowJumpStateTransition = false;
      this.fishCursorResumeTimeout = null;
      this.screenClickStreak = 0;
      this.lastScreenClickAt = 0;
      this.penguinClickStreak = 0;
      this.lastPenguinClickAt = 0;
      this.pendingPenguinClickTimeoutId = null;
      this.penguinDoubleClickStreak = 0;
      this.lastPenguinDoubleClickAt = 0;
      this.tempMortinhoTimeoutId = null;
      this.isTemporaryDead = false;
      this.pendingMortinhoAfterDrop = false;
      this.pendingWalkAwayAfterMortinho = false;
      this.blockUmbrellaUntilNextRain = false;
      this.isRanting = false;
      this.rantCooldownUntil = 0;
      this.dropReleaseStreak = 0;
      this.lastDropReleaseAt = 0;
      this.isWalkingAway = false;
      this.walkAwayReturnX = this.x;
      this.walkAwayReturnY = this.y;
      this.visualLockUntil = 0;
      this.sleepWakeLockUntil = 0;
      this.caveirinhaTimeoutId = null;
      this.isCaveirinhaMode = false;
      this.windTilt = 0;
      this.windTiltPhaseATimeoutId = null;
      this.windTiltPhaseBTimeoutId = null;
      this.nextBehaviorTimeoutId = null;
      this.nextBehaviorDueAt = 0;
      this.dropReactionIntervalId = null;
      this.dropReactionTimeoutId = null;
      this.dropReactionToken = 0;
      this.behaviorFlowToken = 0;
      this.activeStep = null;
      this.recentActions = [];
      this.invalidPoseSince = 0;
      this.debugStateCycleIndex = -1;
      this.debugActionCycleIndex = -1;
      this.debugActivityCycleIndex = -1;
      this.lastDebugActionLabel = "";
      this.lastDebugActivityLabel = "";
      this.lastDebugControlAt = 0;
      this.debugActivityOverrideUntil = 0;
      this.debugActionOverrideUntil = 0;
      this.stateService = new PenguinStateService({
        createActivityStateMachine: core.createActivityStateMachine,
        createTimerRegistry: core.createTimerRegistry,
        initialActivity: "idle",
      });
      this.bindStateLockAliases();
      this.activityStateMachine = this.stateService.activityStateMachine;
      this.activityMode = this.stateService.getActivityMode();
      this.activityModeChangedAt = this.stateService.getActivityModeChangedAt();
      this.timerRegistry = this.stateService.timerRegistry;
      this.debugEnabled = Boolean(
        (window.PENGUIN_CONFIG && window.PENGUIN_CONFIG.debugPanel) ||
          (typeof localStorage !== "undefined" &&
            localStorage.getItem("penguin.debugPanel") === "1"),
      );
      this.debugPanelComponent = null;
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
    modules.penguinRuntimeState ? modules.penguinRuntimeState(deps) : {},
    modules.penguinRuntimeUpdate ? modules.penguinRuntimeUpdate(deps) : {},
  );

  window.PenguinPet = {
    ...pet,
    Penguin,
  };
})();
