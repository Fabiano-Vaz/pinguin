import { BehaviorSelectionService } from "../../services/behavior-selection-service";

export const createPlannerMethods = ({
  runtime,
  behaviors,
  PRELUDE_CHANCE,
  PRELUDE_EMOTIONS,
  PRELUDE_EMOTION_DURATION_MS,
  PRELUDE_IDLE_DURATION_MS,
  BEHAVIOR_DELAY_MIN_MS,
  BEHAVIOR_DELAY_VARIATION_MS,
}) => ({
  getDebugActionTemplates() {
    return [
      { label: "walkShort", step: { type: "walkShort" } },
      { label: "walk", step: { type: "walk" } },
      { label: "walkFast", step: { type: "walkFast" } },
      { label: "walkEdge", step: { type: "walkEdge" } },
      { label: "jumpMove", step: { type: "jumpMove", duration: 700 } },
      { label: "flyMove", step: { type: "flyMove", duration: 650 } },
      { label: "act:thinking", step: { type: "act", state: "thinking", duration: 1400 } },
      { label: "act:peeking", step: { type: "act", state: "peeking", duration: 1200 } },
      { label: "act:dancing", step: { type: "act", state: "dancing", duration: 1200 } },
      { label: "act:fishing", step: { type: "act", state: "fishing", duration: 15000 } },
    ];
  },

  debugAdvanceAction() {
    if (!this.debugEnabled) return false;
    if (this.isDragging || this.isWalkingAway || this.isCaveirinhaMode) return false;
    const templates =
      typeof this.getDebugActionTemplates === "function"
        ? this.getDebugActionTemplates()
        : [];
    if (!Array.isArray(templates) || templates.length === 0) return false;

    this.debugActionCycleIndex =
      (Number.isFinite(this.debugActionCycleIndex) ? this.debugActionCycleIndex : -1) + 1;
    if (this.debugActionCycleIndex >= templates.length) {
      this.debugActionCycleIndex = 0;
    }

    const selected = templates[this.debugActionCycleIndex];
    if (!selected || !selected.step) return false;
    const clonedStep = JSON.parse(JSON.stringify(selected.step));
    const prepareDebugStep = (step) => {
      if (!step || typeof step !== "object") return step;
      const prepared = { ...step, debugPinned: true };
      if (prepared.type === "act" && prepared.state !== "fishing") {
        prepared.duration = Math.max(
          5000,
          Number.isFinite(prepared.duration) ? prepared.duration : 0,
        );
      } else if (prepared.type === "jumpMove") {
        prepared.duration = Math.max(
          2600,
          Number.isFinite(prepared.duration) ? prepared.duration : 0,
        );
      } else if (prepared.type === "flyMove") {
        prepared.duration = Math.max(
          2800,
          Number.isFinite(prepared.duration) ? prepared.duration : 0,
        );
      } else if (
        prepared.type === "walk" ||
        prepared.type === "walkFast" ||
        prepared.type === "walkEdge" ||
        prepared.type === "walkShort"
      ) {
        prepared.holdAfterMs = Math.max(
          2200,
          Number.isFinite(prepared.holdAfterMs) ? prepared.holdAfterMs : 0,
        );
        prepared.minDistancePx = Math.max(
          180,
          Number.isFinite(prepared.minDistancePx) ? prepared.minDistancePx : 0,
        );
      } else if (prepared.type === "sequence" && Array.isArray(prepared.steps)) {
        prepared.steps = prepared.steps.map((frame) => {
          if (!frame || typeof frame !== "object") return frame;
          return {
            ...frame,
            duration: Math.max(1400, Number.isFinite(frame.duration) ? frame.duration : 0),
          };
        });
      }
      return prepared;
    };
    const debugStep = prepareDebugStep(clonedStep);
    this.lastDebugActionLabel =
      typeof selected.label === "string" ? selected.label : this.getActionKey(clonedStep);

    if (typeof this.invalidateBehaviorFlow === "function") {
      this.invalidateBehaviorFlow("debug:advance-action");
    }
    this.debugActionOverrideUntil = Date.now() + 12000;
    this.stepQueue = [debugStep];
    this.aiLocked = false;
    this.activeStep = null;
    this.runNextStep();
    return true;
  },

  scheduleNextBehavior() {
    if (this.isFishingActive) return;
    if (this.nextBehaviorTimeoutId) {
      clearTimeout(this.nextBehaviorTimeoutId);
      this.nextBehaviorTimeoutId = null;
    }
    this.nextBehaviorDueAt = 0;
    if (typeof this.clearManagedTimer === "function") {
      this.clearManagedTimer("behavior", "next");
    }
    const baseDelay = BEHAVIOR_DELAY_MIN_MS + Math.random() * BEHAVIOR_DELAY_VARIATION_MS;
    const debugHoldRemaining = Math.max(
      0,
      (Number.isFinite(this.debugActionOverrideUntil) ? this.debugActionOverrideUntil : 0) -
        Date.now(),
    );
    const delay = Math.max(baseDelay, debugHoldRemaining);
    this.nextBehaviorDueAt = Date.now() + delay;
    const runScheduledBehavior = () => {
      this.nextBehaviorTimeoutId = null;
      this.nextBehaviorDueAt = 0;
      if (this.isFishingActive) return;
      if (this.enforceFoodPriority()) return;
      this.startNextBehavior();
    };
    this.nextBehaviorTimeoutId =
      typeof this.setManagedTimeout === "function"
        ? this.setManagedTimeout("behavior", "next", runScheduledBehavior, delay)
        : setTimeout(runScheduledBehavior, delay);
  },

  startNextBehavior() {
    if (this.isFishingActive) return;
    if (this.nextBehaviorTimeoutId) {
      clearTimeout(this.nextBehaviorTimeoutId);
      this.nextBehaviorTimeoutId = null;
    }
    this.nextBehaviorDueAt = 0;
    if (typeof this.clearManagedTimer === "function") {
      this.clearManagedTimer("behavior", "next");
    }
    if (this.enforceFoodPriority()) return;
    if (this.aiLocked) return;
    this.invalidateBehaviorFlow();

    if (!this.behaviorSelectionService) {
      const getFishStock = () =>
        typeof runtime.getFishStock === "function"
          ? runtime.getFishStock()
          : Number.isFinite(runtime.fishStock)
            ? runtime.fishStock
            : null;
      this.behaviorSelectionService = new BehaviorSelectionService({
        behaviors,
        getFishStock,
      });
    }
    const selectedBehavior = this.behaviorSelectionService.chooseNextBehavior();
    const seq = typeof selectedBehavior === "function" ? selectedBehavior() : [];
    const withPrelude = Math.random() < PRELUDE_CHANCE;

    this.stepQueue = withPrelude
      ? [
          {
            type: "act",
            state: PRELUDE_EMOTIONS[Math.floor(Math.random() * PRELUDE_EMOTIONS.length)],
            duration: PRELUDE_EMOTION_DURATION_MS,
          },
          { type: "act", state: "idle", duration: PRELUDE_IDLE_DURATION_MS },
          ...seq,
        ]
      : seq;
    this.runNextStep();
  },

  runNextStep() {
    if (this.isCaveirinhaMode) return;
    if (this.isFishingActive) return;
    if (this.enforceFoodPriority()) return;
    if (this.stepQueue.length === 0) {
      this.activeStep = null;
      this.aiLocked = false;
      this.scheduleNextBehavior();
      return;
    }

    const flowToken =
      typeof this.invalidateBehaviorFlow === "function"
        ? this.invalidateBehaviorFlow()
        : (this.behaviorFlowToken = (this.behaviorFlowToken || 0) + 1);
    const isFlowActive = () =>
      typeof this.isBehaviorFlowActive === "function"
        ? this.isBehaviorFlowActive(flowToken)
        : flowToken === (this.behaviorFlowToken || 0);
    const setStepTimeout = (key, callback, delayMs) => {
      if (typeof this.setManagedTimeout === "function") {
        return this.setManagedTimeout(
          "behavior_step",
          `${flowToken}:${key}`,
          callback,
          delayMs,
        );
      }
      return setTimeout(callback, delayMs);
    };
    const setStepInterval = (key, callback, delayMs) => {
      if (typeof this.setManagedInterval === "function") {
        return this.setManagedInterval(
          "behavior_step",
          `${flowToken}:${key}`,
          callback,
          delayMs,
        );
      }
      return setInterval(callback, delayMs);
    };

    this.aiLocked = true;
    const step = this.stepQueue.shift();
    this.activeStep = step;
    this.recordAction(step);
    this.executeStep(step, { isFlowActive, setStepTimeout, setStepInterval });
  },

  executeStep(step, context) {
    if (!step || typeof step !== "object") {
      this.runNextStep();
      return;
    }
    const type = typeof step.type === "string" ? step.type : "";

    if (type === "walk" || type === "walkFast" || type === "walkEdge" || type === "walkShort") {
      this.runStepWalk(step, context);
      return;
    }
    if (type === "jumpMove") {
      this.runStepJumpMove(step, context);
      return;
    }
    if (type === "flyMove") {
      this.runStepFlyMove(step, context);
      return;
    }
    if (type === "sequence") {
      this.runStepSequence(step, context);
      return;
    }
    if (type === "act") {
      this.runStepAct(step, context);
      return;
    }

    this.runNextStep();
  },
});
