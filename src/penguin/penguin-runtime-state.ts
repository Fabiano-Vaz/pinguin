import { DebugPanelComponent } from "./components/debug-panel-component";

(() => {
  const modules = (window.PenguinPetModules = window.PenguinPetModules || {});

  modules.penguinRuntimeState = ({ actionStates, runtime }) => ({
    setActivityMode(nextMode, reason = "", { force = false } = {}) {
      if (!this.stateService || typeof this.stateService.setActivityMode !== "function") {
        return false;
      }
      const changed = this.stateService.setActivityMode(nextMode, reason, { force });
      this.activityMode = this.stateService.getActivityMode();
      this.activityModeChangedAt = this.stateService.getActivityModeChangedAt();
      this.activityStateMachine = this.stateService.activityStateMachine;
      return changed;
    },

    bindStateLockAliases() {
      if (!this.stateService) return;
      const aliasKeys = [
        "visualLockUntil",
        "sleepWakeLockUntil",
        "isFullBellySequenceActive",
        "allowFullStateTransition",
        "isJumpLocked",
        "allowJumpStateTransition",
      ];
      aliasKeys.forEach((key) => {
        Object.defineProperty(this, key, {
          configurable: true,
          enumerable: true,
          get: () => this.stateService.getLockValue(key),
          set: (value) => {
            this.stateService.setLockValue(key, value);
          },
        });
      });
    },

    inferActivityMode() {
      if (this.isCaveirinhaMode) return "caveirinha";
      if (this.isDragging) return "dragging";
      if (this.isWalkingAway) return "walk_away";
      if (this.currentState === "sleeping") return "sleeping";
      if (this.currentState === "full") return "full";
      if (this.isFishingActive || this.currentState === "fishing") return "fishing";
      if (this.isRanting) return "ranting";
      if (this.isEatingFood || this.currentFoodTarget) return "eating";
      return "idle";
    },

    setManagedTimeout(context, key, callback, delayMs = 0) {
      if (!this.stateService) return setTimeout(callback, delayMs);
      return this.stateService.setManagedTimeout(context, key, callback, delayMs);
    },

    setManagedInterval(context, key, callback, delayMs = 0) {
      if (!this.stateService) return setInterval(callback, delayMs);
      return this.stateService.setManagedInterval(context, key, callback, delayMs);
    },

    clearManagedTimer(context, key) {
      if (!this.stateService) return false;
      return this.stateService.clearManagedTimer(context, key);
    },

    clearManagedContext(context) {
      if (!this.stateService) return 0;
      return this.stateService.clearManagedContext(context);
    },

    getTimerSnapshot() {
      if (!this.stateService) return { total: 0, byContext: {} };
      return this.stateService.getTimerSnapshot();
    },

    getActivityHistory(limit = 3) {
      if (!this.stateService) return [];
      return this.stateService.getActivityHistory(limit);
    },

    ensureDebugPanel() {
      if (!this.debugEnabled || typeof document === "undefined") return;
      if (!this.debugPanelComponent) {
        this.debugPanelComponent = new DebugPanelComponent({
          onAction: (action) => {
            this.lastDebugControlAt = Date.now();
            if (action === "next-action" && typeof this.debugAdvanceAction === "function") {
              this.debugAdvanceAction();
              return;
            }
            if (
              action === "next-activity" &&
              typeof this.debugAdvanceActivity === "function"
            ) {
              this.debugAdvanceActivity();
            }
          },
        });
      }
      this.debugPanelEl = this.debugPanelComponent.ensure();
    },

    renderDebugPanel(now = performance.now()) {
      if (!this.debugEnabled) return;
      if (!this.debugPanelEl || !this.debugPanelEl.isConnected) {
        this.ensureDebugPanel();
      }
      if (!this.debugPanelEl || !this.debugPanelComponent) return;
      if (Date.now() - (this.lastDebugControlAt || 0) < 260) return;
      if (now - (this.lastDebugRenderAt || 0) < 180) return;
      this.lastDebugRenderAt = now;

      const inferredMode = this.inferActivityMode();
      const shouldRespectManualActivity =
        Date.now() < (this.debugActivityOverrideUntil || 0);
      if (!shouldRespectManualActivity && inferredMode !== this.activityMode) {
        this.setActivityMode(inferredMode, "sync", { force: true });
      }

      const motionType =
        this.customMotion && typeof this.customMotion.type === "string"
          ? this.customMotion.type
          : this.isDragging
            ? "drag"
            : this.isFishingActive
              ? "fishing_lock"
              : this.isCursorTouchEating
                ? "cursor_eating"
                : this.isEatingFood
                  ? "food_eating"
                  : this.isMoving
                    ? this.isChasing
                      ? "chasing"
                      : this.currentState === "runningCrouched"
                        ? "run_crouched"
                        : "walking"
                    : this.activeStep && typeof this.activeStep.type === "string"
                      ? `step:${this.activeStep.type}`
                      : "idle";
      const timerInfo = this.getTimerSnapshot();
      const formatDebugStep = (step) => {
        if (!step || typeof step !== "object") return "none";
        const type = typeof step.type === "string" ? step.type : "unknown";
        if (type === "act") {
          const state = typeof step.state === "string" ? step.state : "?";
          const duration = Number.isFinite(step.duration) ? ` ${step.duration}ms` : "";
          return `act:${state}${duration}`;
        }
        if (type === "sequence") {
          const count = Array.isArray(step.steps) ? step.steps.length : 0;
          return `sequence:${count}`;
        }
        const duration = Number.isFinite(step.duration) ? ` ${step.duration}ms` : "";
        return `${type}${duration}`;
      };
      const formatStepDuration = (step) => {
        if (!step || typeof step !== "object") return "auto";
        if (Number.isFinite(step.duration) && step.duration > 0) {
          return `${(step.duration / 1000).toFixed(1)}s`;
        }
        return "auto";
      };
      const formatStepName = (step) => {
        if (!step || typeof step !== "object") return "unknown";
        if (step.type === "act") {
          return typeof step.state === "string" ? step.state : "act";
        }
        return typeof step.type === "string" ? step.type : "unknown";
      };
      const x = Math.round(this.x);
      const y = Math.round(this.y);
      const tx = Math.round(Number.isFinite(this.targetX) ? this.targetX : this.x);
      const ty = Math.round(Number.isFinite(this.targetY) ? this.targetY : this.y);
      const speed = Number.isFinite(this.speed) ? this.speed.toFixed(2) : "0.00";
      const fishStock =
        typeof runtime.getFishStock === "function"
          ? runtime.getFishStock()
          : Number.isFinite(runtime.fishStock)
            ? runtime.fishStock
            : "?";
      const byContextEntries = Object.entries(timerInfo.byContext || {}).sort(
        (a, b) => Number(b[1]) - Number(a[1]),
      );
      const timerContextText =
        byContextEntries.length > 0
          ? byContextEntries
              .slice(0, 8)
              .map(([context, total]) => `${context}:${total}`)
              .join(" | ")
          : "none";
      const activityHistory = this.getActivityHistory(3).reverse();
      const historyText =
        activityHistory.length > 0
          ? activityHistory
              .map((entry) => {
                const reason =
                  entry && typeof entry.reason === "string" && entry.reason.length > 0
                    ? entry.reason
                    : "-";
                const mode =
                  entry && typeof entry.state === "string" && entry.state.length > 0
                    ? entry.state
                    : "unknown";
                return `${mode}(${reason})`;
              })
              .join(" <- ")
          : "none";
      const recentActions = Array.isArray(this.recentActions)
        ? this.recentActions.slice(-3).reverse()
        : [];
      const actionHistoryText =
        recentActions.length > 0
          ? recentActions
              .map((entry) => {
                const key =
                  entry && typeof entry.key === "string" && entry.key.length > 0
                    ? entry.key
                    : "unknown";
                return key;
              })
              .join(" <- ")
          : "none";
      const debugActionLabel =
        typeof this.lastDebugActionLabel === "string" &&
        this.lastDebugActionLabel.length > 0
          ? this.lastDebugActionLabel
          : "none";
      const debugActivityLabel =
        typeof this.lastDebugActivityLabel === "string" &&
        this.lastDebugActivityLabel.length > 0
          ? this.lastDebugActivityLabel
          : "none";
      const queuePreview =
        Array.isArray(this.stepQueue) && this.stepQueue.length > 0
          ? this.stepQueue.slice(0, 10)
          : [];
      const queueOverflow =
        Array.isArray(this.stepQueue) && this.stepQueue.length > queuePreview.length
          ? this.stepQueue.length - queuePreview.length
          : 0;
      const currentTarget =
        this.currentFoodTarget &&
        Number.isFinite(this.currentFoodTarget.x) &&
        Number.isFinite(this.currentFoodTarget.y)
          ? `${Math.round(this.currentFoodTarget.x)}, ${Math.round(this.currentFoodTarget.y)}`
          : "none";
      const queueEmptyText =
        Number.isFinite(this.nextBehaviorDueAt) && this.nextBehaviorDueAt > Date.now()
          ? `waiting next behavior: ${Math.max(
              0,
              (this.nextBehaviorDueAt - Date.now()) / 1000,
            ).toFixed(1)}s`
          : "empty";

      this.debugPanelComponent.render({
        activityMode: this.activityMode || "idle",
        currentState: this.currentState || "none",
        debugActionLabel,
        debugActivityLabel,
        posText: `${x}, ${y}`,
        targetText: `${tx}, ${ty}`,
        speedText: speed,
        motionType,
        flowText: String(this.behaviorFlowToken || 0),
        fishText: String(fishStock),
        flags: {
          moving: this.isMoving,
          aiLocked: this.aiLocked,
          drag: this.isDragging,
          fishing: this.isFishingActive,
          eating: this.isEatingFood,
          cursorEat: this.isCursorTouchEating,
          sleep: this.currentState === "sleeping",
          fishCursor: runtime.isFishCursorEnabled !== false,
        },
        activeStepText: formatDebugStep(this.activeStep),
        queueTotal: Array.isArray(this.stepQueue) ? this.stepQueue.length : 0,
        queueItems: queuePreview.map((step) => ({
          name: formatStepName(step),
          duration: formatStepDuration(step),
        })),
        queueOverflow,
        queueEmptyText,
        foodTargetText: currentTarget,
        pendingFoodText: Array.isArray(this.foodTargets) ? this.foodTargets.length : 0,
        timersTotal: timerInfo.total,
        timerContextText,
        activityHistoryText: historyText,
        actionHistoryText,
      });
    },

    debugAdvanceActivity() {
      if (!this.debugEnabled) return false;
      const activityCycle = [
        "idle",
        "eating",
        "fishing",
        "sleeping",
        "full",
        "dragging",
        "walk_away",
        "ranting",
        "caveirinha",
      ];
      this.debugActivityCycleIndex =
        (Number.isFinite(this.debugActivityCycleIndex)
          ? this.debugActivityCycleIndex
          : -1) + 1;
      if (this.debugActivityCycleIndex >= activityCycle.length) {
        this.debugActivityCycleIndex = 0;
      }
      const nextActivity = activityCycle[this.debugActivityCycleIndex];
      if (typeof this.setActivityMode === "function") {
        this.setActivityMode(nextActivity, "debug:advance-activity", { force: true });
      } else {
        this.activityMode = nextActivity;
      }
      this.debugActivityOverrideUntil = Date.now() + 15000;
      const representativeStateByActivity = {
        idle: "idle",
        eating: "eating",
        fishing: "fishing",
        sleeping: "sleeping",
        full: "full",
        dragging: "flying",
        walk_away: "turningBack",
        ranting: "angry",
        caveirinha: "scared",
      };
      const repState = representativeStateByActivity[nextActivity];
      if (typeof repState === "string" && typeof this.setState === "function") {
        this.setState(repState);
      }
      this.lastDebugActivityLabel = nextActivity;
      return true;
    },

    debugAdvanceState() {
      if (!this.debugEnabled) return false;
      if (this.isDragging || this.isWalkingAway || this.isCaveirinhaMode) {
        return false;
      }

      const cycleStates = Object.keys(actionStates || {}).filter((state) => {
        if (state === "default" || state === "snowman") return false;
        return typeof actionStates[state] === "string" && actionStates[state].length > 0;
      });
      if (cycleStates.length === 0) return false;

      this.debugStateCycleIndex =
        (Number.isFinite(this.debugStateCycleIndex) ? this.debugStateCycleIndex : -1) + 1;
      if (this.debugStateCycleIndex >= cycleStates.length) {
        this.debugStateCycleIndex = 0;
      }

      const nextState = cycleStates[this.debugStateCycleIndex];
      const stateAsset = actionStates[nextState] || actionStates.idle || actionStates.default;
      if (!stateAsset) return false;

      this.unlockVisualSprite();
      this.element.style.animation = "";
      this.currentState = nextState;
      this.img.src = stateAsset;
      this.applyTransform(this.isWalkingAway ? 1 : undefined);
      return true;
    },
  });
})();
