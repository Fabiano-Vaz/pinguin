import { AI_ACTION_REGISTRY } from "./shared";

export const createCoreMethods = ({
  runtime,
  actionStates,
  penguinSize,
  STEP_TRANSITION_DELAY_MS,
  STEP_TRANSITION_DELAY_VARIATION_MS,
}) => ({
  setFishCursorEnabled(enabled) {
    if (typeof runtime.setFishCursorEnabled === "function") {
      runtime.setFishCursorEnabled(enabled);
      return;
    }
    runtime.isFishCursorEnabled = Boolean(enabled);
  },

  holdFishCursorFor(ms = 5000) {
    if (this.fishCursorResumeTimeout) {
      clearTimeout(this.fishCursorResumeTimeout);
      this.fishCursorResumeTimeout = null;
    }

    this.setFishCursorEnabled(false);
    this.fishCursorResumeTimeout = setTimeout(() => {
      this.setFishCursorEnabled(true);
      this.fishCursorResumeTimeout = null;
    }, ms);
  },

  invalidateBehaviorFlow() {
    this.behaviorFlowToken = (this.behaviorFlowToken || 0) + 1;
    this.activeStep = null;
    if (typeof this.clearManagedContext === "function") {
      this.clearManagedContext("behavior_step");
    }
    return this.behaviorFlowToken;
  },

  isBehaviorFlowActive(token) {
    return token === (this.behaviorFlowToken || 0);
  },

    getActionRegistry() {
      const registry = { ...AI_ACTION_REGISTRY };
      Object.keys(actionStates || {}).forEach((state) => {
        if (state === "default" || state === "snowman") return;
        registry[`state:${state}`] = `Visual/action state "${state}".`;
      });
    return registry;
  },

  getActionKey(step) {
    if (!step || typeof step !== "object") return "unknown";
    const type = typeof step.type === "string" ? step.type : "unknown";
    if (type !== "act") return type;
    const state = typeof step.state === "string" ? step.state : "";
    if (state === "fishing") return "act:fishing";
    if (state === "laughing") return "act:laughing";
    return "act";
  },

  describeAction(step) {
    const key = this.getActionKey(step);
    const registry = this.getActionRegistry();
    return registry[key] || "Unknown action.";
  },

  recordAction(step) {
    if (!Array.isArray(this.recentActions)) {
      this.recentActions = [];
    }
    const key = this.getActionKey(step);
    this.recentActions.push({
      at: Date.now(),
      key,
      summary: this.describeAction(step),
      step,
    });
    if (this.recentActions.length > 30) this.recentActions.shift();
  },

    isCursorTouchingPenguin() {
      if (!runtime.isMouseInsideViewport) return false;
      if (runtime.isFishCursorEnabled === false) return false;
      return (
        runtime.mouseX >= this.x &&
        runtime.mouseX <= this.x + penguinSize &&
        runtime.mouseY >= this.y &&
        runtime.mouseY <= this.y + penguinSize
      );
  },

  getStepTransitionDelay() {
    return (
      STEP_TRANSITION_DELAY_MS +
      Math.random() * STEP_TRANSITION_DELAY_VARIATION_MS
    );
  },

  runFishingAction(step) {
    if (typeof this.invalidateBehaviorFlow === "function") {
      this.invalidateBehaviorFlow();
    }
    const fishingSessionId = `${Date.now()}-${Math.random()}`;
    this.activeFishingSessionId = fishingSessionId;
    this.isFishingActive = true;
    if (typeof this.setActivityMode === "function") {
      this.setActivityMode("fishing", "runFishingAction:start", { force: true });
    }
    if (typeof this.clearManagedContext === "function") {
      this.clearManagedContext("fishing_action");
    }
    if (typeof this.hideUmbrella === "function") {
      this.hideUmbrella();
    }
    this.fishCursorEnabledBeforeFishing = runtime.isFishCursorEnabled !== false;
    if (typeof runtime.setFishCursorEnabled === "function") {
      runtime.setFishCursorEnabled(false);
    } else {
      runtime.isFishCursorEnabled = false;
    }
    const totalDurationMs = Number.isFinite(step.duration)
      ? Math.max(10000, step.duration)
      : 30000;
    const rewardIntervalMs = 5000;
    const fishPerTick =
      Number.isFinite(step.fishPerTick) && step.fishPerTick > 0
        ? Math.round(step.fishPerTick)
        : 1;
    const rewardTicks = Math.floor(totalDurationMs / rewardIntervalMs);

    this.element.style.animation = "";
    this.customMotion = null;
    this.isMoving = false;
    this.isChasing = false;
    this.allowAirMovement = false;
    this.targetX = this.x;
    this.targetY = this.y;
    this.setState("fishing");
    if (
      actionStates &&
      actionStates.fishing &&
      typeof this.lockVisualSprite === "function"
    ) {
      this.lockVisualSprite(actionStates.fishing, totalDurationMs + 250);
    }
    this.speak();

    for (let tick = 1; tick <= rewardTicks; tick += 1) {
      const rewardKey = `reward_${tick}`;
      const rewardTask = () => {
        if (
          this.activeFishingSessionId !== fishingSessionId ||
          !this.isFishingActive
        ) {
          return;
        }
        if (typeof runtime.addFishStock === "function") {
          runtime.addFishStock(fishPerTick);
        }
      };
      if (typeof this.setManagedTimeout === "function") {
        this.setManagedTimeout(
          "fishing_action",
          rewardKey,
          rewardTask,
          tick * rewardIntervalMs,
        );
      } else {
        setTimeout(rewardTask, tick * rewardIntervalMs);
      }
    }

    const finishFishingTask = () => {
      if (this.activeFishingSessionId !== fishingSessionId) return;
      this.activeFishingSessionId = null;
      this.isFishingActive = false;
      if (typeof this.setActivityMode === "function") {
        this.setActivityMode("idle", "runFishingAction:finish", { force: true });
      }
      const shouldRestoreFishCursor =
        this.fishCursorEnabledBeforeFishing &&
        (typeof runtime.getFishStock !== "function" || runtime.getFishStock() > 0);
      if (shouldRestoreFishCursor) {
        if (typeof runtime.setFishCursorEnabled === "function") {
          runtime.setFishCursorEnabled(true);
        } else {
          runtime.isFishCursorEnabled = true;
        }
      }
      this.fishCursorEnabledBeforeFishing = null;
      if (typeof this.unlockVisualSprite === "function") {
        this.unlockVisualSprite();
      }
      this.element.style.animation = "";
      const effects =
        window.PenguinPet && window.PenguinPet.effects
          ? window.PenguinPet.effects
          : null;
      if (
        effects &&
        typeof effects.isRaining === "function" &&
        effects.isRaining() &&
        typeof this.showUmbrella === "function"
      ) {
        this.showUmbrella();
      }
      if (!this.isMoving) this.setState("idle");
      this.runNextStep();
    };
    if (typeof this.setManagedTimeout === "function") {
      this.setManagedTimeout(
        "fishing_action",
        "finish",
        finishFishingTask,
        totalDurationMs,
      );
    } else {
      setTimeout(finishFishingTask, totalDurationMs);
    }
  },
});
