(() => {
  const modules = (window.PenguinPetModules = window.PenguinPetModules || {});

  modules.ai = ({
    actionStates,
    runtime,
    behaviors,
    penguinSize,
    PRELUDE_CHANCE,
    PRELUDE_EMOTIONS,
    PRELUDE_EMOTION_DURATION_MS,
    PRELUDE_IDLE_DURATION_MS,
    BEHAVIOR_DELAY_MIN_MS,
    BEHAVIOR_DELAY_VARIATION_MS,
    STEP_TRANSITION_DELAY_MS,
    STEP_TRANSITION_DELAY_VARIATION_MS,
    SPEED_WALK,
    SPEED_WALK_FAST,
    halfPenguinSize,
    phrases,
  }) => ({
    syncFoodTargetsFromGround() {
      const fishOnGround = document.querySelectorAll(
        ".food-fish-drop:not(.eaten)",
      );
      if (!fishOnGround.length) return;

      const tracked = new Set();
      if (
        this.currentFoodTarget &&
        this.currentFoodTarget.element &&
        this.currentFoodTarget.element.isConnected
      ) {
        tracked.add(this.currentFoodTarget.element);
      }
      if (Array.isArray(this.foodTargets) && this.foodTargets.length > 0) {
        this.foodTargets.forEach((target) => {
          if (target && target.element && target.element.isConnected) {
            tracked.add(target.element);
          }
        });
      }

      fishOnGround.forEach((fishEl) => {
        if (tracked.has(fishEl)) return;
        const rect = fishEl.getBoundingClientRect();
        const targetY =
          typeof this.getWalkMinY === "function"
            ? this.getWalkMinY() + halfPenguinSize
            : rect.top + rect.height / 2;
        this.foodTargets.push({
          element: fishEl,
          x: rect.left + rect.width / 2,
          y: targetY,
        });
      });
    },

    pruneFoodTargets() {
      this.syncFoodTargetsFromGround();
      if (!Array.isArray(this.foodTargets) || this.foodTargets.length === 0) {
        this.foodTargets = [];
        return;
      }

      this.foodTargets = this.foodTargets.filter(
        (target) => target && target.element && target.element.isConnected,
      );
    },

    hasPendingFoodTargets() {
      this.pruneFoodTargets();

      const hasCurrentTarget =
        this.currentFoodTarget &&
        this.currentFoodTarget.element &&
        this.currentFoodTarget.element.isConnected;

      if (!hasCurrentTarget && this.currentFoodTarget) {
        this.currentFoodTarget = null;
      }

      return (
        this.isEatingFood ||
        Boolean(hasCurrentTarget) ||
        this.foodTargets.length > 0
      );
    },

    enforceFoodPriority() {
      if (this.isFishingActive) return false;
      if (!this.hasPendingFoodTargets()) return false;

      this.activeFishingSessionId = null;
      this.aiLocked = true;
      this.stepQueue = [];
      this.isChasing = false;
      this.element.style.animation = "";

      if (!this.isDragging) {
        this.tryStartFoodHunt();
      }

      return true;
    },

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

    enqueueFoodTargets(targets) {
      if (!Array.isArray(targets) || targets.length === 0) return;

      const validTargets = targets.filter(
        (target) =>
          target &&
          Number.isFinite(target.x) &&
          Number.isFinite(target.y) &&
          target.element,
      );

      if (validTargets.length === 0) return;
      this.foodTargets.push(...validTargets);
      this.enforceFoodPriority();
    },

    tryStartFoodHunt() {
      if (this.isDragging || this.isEatingFood) return;
      if (this.currentFoodTarget) return;
      this.pruneFoodTargets();
      if (this.foodTargets.length === 0) {
        if (this.aiLocked && !this.hasPendingFoodTargets()) {
          this.aiLocked = false;
          this.scheduleNextBehavior();
        }
        return;
      }

      const nextTarget = this.foodTargets.shift();
      if (
        !nextTarget ||
        !nextTarget.element ||
        !nextTarget.element.isConnected
      ) {
        this.tryStartFoodHunt();
        return;
      }

      this.currentFoodTarget = nextTarget;
      this.aiLocked = true;
      this.stepQueue = [];
      this.isChasing = false;
      this.speed = SPEED_WALK;
      this.element.style.animation = "";
      this.moveToPosition(nextTarget.x, nextTarget.y, SPEED_WALK);
    },

    consumeCurrentFoodTarget() {
      if (!this.currentFoodTarget || this.isEatingFood) return;

      const target = this.currentFoodTarget;
      this.fishEatenCount += 1;
      this.isEatingFood = true;
      this.isMoving = false;
      this.targetX = this.x;
      this.targetY = this.y;
      this.element.style.animation = "";
      this.setState("runningCrouched");
      const crouchedFishAsset =
        actionStates.runningCrouched || "assets/pinguin correndo abaixado.svg";
      if (typeof this.lockVisualSprite === "function") {
        this.lockVisualSprite(crouchedFishAsset, 260);
      }

      if (target.element && target.element.isConnected) {
        target.element.classList.add("eaten");
        setTimeout(() => {
          if (target.element && target.element.isConnected) {
            target.element.remove();
          }
        }, 160);
      }

      setTimeout(() => {
        if (!this.isEatingFood || this.currentFoodTarget !== target) return;
        if (typeof this.unlockVisualSprite === "function") {
          this.unlockVisualSprite();
        }
        this.setState("eating");
        this.speak();
      }, 280);

      setTimeout(() => {
        this.currentFoodTarget = null;
        this.isEatingFood = false;
        if (!this.isMoving) this.setState("idle");
        this.enforceFoodPriority();
        if (!this.hasPendingFoodTargets()) {
          this.aiLocked = false;
          this.scheduleNextBehavior();
        }
      }, this.scaleEmotionDuration(1180));
    },

    triggerLoveMoment() {
      this.aiLocked = true;
      this.stepQueue = [];
      this.isChasing = false;
      this.element.style.animation = "";
      this.setState("thinking");
      const loveList =
        Array.isArray(phrases && phrases.love) && phrases.love.length > 0
          ? phrases.love
          : Array.isArray(phrases && phrases.idle)
            ? phrases.idle
            : [];
      if (loveList.length > 0) {
        this.showSpeech(loveList[Math.floor(Math.random() * loveList.length)]);
      }

      setTimeout(() => {
        if (!this.isMoving && !this.isDragging) this.setState("idle");

        if (this.foodTargets.length > 0) {
          this.tryStartFoodHunt();
        } else {
          this.aiLocked = false;
          this.scheduleNextBehavior();
        }
      }, this.scaleEmotionDuration(2200));
    },

    handleFoodHunt() {
      if (this.isFishingActive) return;
      if (this.isDragging) return;
      this.pruneFoodTargets();

      if (!this.currentFoodTarget && this.foodTargets.length > 0) {
        this.tryStartFoodHunt();
      }

      if (!this.currentFoodTarget || this.isEatingFood) return;
      const target = this.currentFoodTarget;

      if (!target.element || !target.element.isConnected) {
        this.currentFoodTarget = null;
        if (this.foodTargets.length > 0) {
          this.tryStartFoodHunt();
        } else if (this.aiLocked) {
          this.aiLocked = false;
          this.scheduleNextBehavior();
        }
        return;
      }

      this.targetX = target.x - halfPenguinSize;
      this.targetY = this.clampY(target.y - halfPenguinSize);
      this.isMoving = true;

      const dx = target.x - (this.x + halfPenguinSize);
      const dy = target.y - (this.y + halfPenguinSize);
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= 22) {
        this.consumeCurrentFoodTarget();
      }
    },

    applyCursorEatingState() {
      if (this.isFishingActive) {
        if (this.isCursorTouchEating) {
          this.isCursorTouchEating = false;
          this.cursorTouchEatingUntil = 0;
        }
        return;
      }

      const now = Date.now();

      if (this.isDragging || this.currentFoodTarget || this.isEatingFood) {
        if (this.isCursorTouchEating) {
          this.isCursorTouchEating = false;
          this.cursorTouchEatingUntil = 0;
          this.holdFishCursorFor(5000);
        }
        return;
      }

      if (this.isCursorTouchEating) {
        this.isChasing = false;
        this.element.style.animation = "";
        this.setState("eating");

        if (now < this.cursorTouchEatingUntil) {
          return;
        }

        this.isCursorTouchEating = false;
        this.cursorTouchEatingUntil = 0;
        this.holdFishCursorFor(5000);
        if (!this.isMoving) this.setState("idle");
        return;
      }

      const touching = this.isCursorTouchingPenguin();
      if (touching) {
        if (typeof runtime.consumeFishStock === "function") {
          const consumed = runtime.consumeFishStock(1);
          if (!consumed) {
            this.setFishCursorEnabled(false);
            return;
          }
        }
        this.fishEatenCount += 1;
        this.isCursorTouchEating = true;
        this.cursorTouchEatingUntil = now + 4000;
        this.isChasing = false;
        this.setFishCursorEnabled(false);
        this.element.style.animation = "";
        this.setState("eating");
      }
    },

    onScreenClick() {
      if (this.isFishingActive) return;
      const now = Date.now();
      if (this.isRanting || now < this.rantCooldownUntil) return;

      const consecutiveGapMs = 900;
      if (now - this.lastScreenClickAt <= consecutiveGapMs) {
        this.screenClickStreak += 1;
      } else {
        this.screenClickStreak = 1;
      }
      this.lastScreenClickAt = now;

      if (this.screenClickStreak > 5) {
        this.screenClickStreak = 0;
        this.startRantMode();
      }
    },

    startRantMode() {
      if (this.isDragging || this.isRanting) return;

      this.isRanting = true;
      if (typeof this.setActivityMode === "function") {
        this.setActivityMode("ranting", "rant:start", { force: true });
      }
      this.rantCooldownUntil = Date.now() + 12000;
      this.aiLocked = true;
      this.stepQueue = [];
      this.isChasing = false;
      this.currentFoodTarget = null;
      this.isEatingFood = false;
      this.foodTargets = [];
      this.isMoving = false;
      this.targetX = this.x;
      this.targetY = this.y;
      this.element.style.animation = "shake 0.4s ease";
      this.setState("angry");

      const rantLines =
        Array.isArray(phrases && phrases.rant) && phrases.rant.length > 0
          ? phrases.rant
          : Array.isArray(phrases && phrases.angry)
            ? phrases.angry
            : [];

      const rantStepMs = 1000;
      rantLines.forEach((line, index) => {
        setTimeout(() => {
          this.showSpeech(line, 900, false);
        }, index * rantStepMs);
      });

      setTimeout(
        () => {
          this.element.style.animation = "";
          if (!this.isMoving) this.setState("idle");
          this.isRanting = false;
          if (typeof this.setActivityMode === "function") {
            this.setActivityMode("idle", "rant:finish", { force: true });
          }
          this.aiLocked = false;
          this.scheduleNextBehavior();
        },
        rantLines.length * rantStepMs + 300,
      );
    },

    insertWalkBetweenEmotionSteps(currentStep) {
      if (!currentStep || currentStep.type !== "act") return;
      if (currentStep.state === "idle") return;
      if (this.stepQueue.length === 0) return;

      const nextStep = this.stepQueue[0];
      if (!nextStep || nextStep.type !== "act" || nextStep.state === "idle") {
        return;
      }

      this.stepQueue.unshift({ type: "walkShort" });
    },

    scheduleNextBehavior() {
      if (this.nextBehaviorTimeoutId) {
        clearTimeout(this.nextBehaviorTimeoutId);
        this.nextBehaviorTimeoutId = null;
      }
      if (typeof this.clearManagedTimer === "function") {
        this.clearManagedTimer("behavior", "next");
      }
      const delay =
        BEHAVIOR_DELAY_MIN_MS + Math.random() * BEHAVIOR_DELAY_VARIATION_MS;
      const runScheduledBehavior = () => {
        this.nextBehaviorTimeoutId = null;
        if (this.enforceFoodPriority()) return;
        this.startNextBehavior();
      };
      this.nextBehaviorTimeoutId =
        typeof this.setManagedTimeout === "function"
          ? this.setManagedTimeout("behavior", "next", runScheduledBehavior, delay)
          : setTimeout(runScheduledBehavior, delay);
    },

    getStepTransitionDelay() {
      return (
        STEP_TRANSITION_DELAY_MS +
        Math.random() * STEP_TRANSITION_DELAY_VARIATION_MS
      );
    },

    startNextBehavior() {
      if (this.nextBehaviorTimeoutId) {
        clearTimeout(this.nextBehaviorTimeoutId);
        this.nextBehaviorTimeoutId = null;
      }
      if (typeof this.clearManagedTimer === "function") {
        this.clearManagedTimer("behavior", "next");
      }
      if (this.enforceFoodPriority()) return;
      if (this.aiLocked) return;
      const fishingBehavior = behaviors.find((builder) => {
        if (typeof builder !== "function") return false;
        const steps = builder();
        return (
          Array.isArray(steps) &&
          steps.some(
            (step) =>
              step &&
              step.type === "act" &&
              typeof step.state === "string" &&
              step.state === "fishing",
          )
        );
      });
      const fishStock =
        typeof runtime.getFishStock === "function"
          ? runtime.getFishStock()
          : Number.isFinite(runtime.fishStock)
            ? runtime.fishStock
            : null;
      const shouldPrioritizeFishing =
        fishStock !== null && fishStock <= 0 && Math.random() < 0.9;
      const fallbackBehavior =
        behaviors[Math.floor(Math.random() * behaviors.length)];
      const selectedBehavior =
        shouldPrioritizeFishing && fishingBehavior
          ? fishingBehavior
          : fallbackBehavior;
      const seq =
        typeof selectedBehavior === "function" ? selectedBehavior() : [];
      const withPrelude = Math.random() < PRELUDE_CHANCE;

      this.stepQueue = withPrelude
        ? [
            {
              type: "act",
              state:
                PRELUDE_EMOTIONS[
                  Math.floor(Math.random() * PRELUDE_EMOTIONS.length)
                ],
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
      if (this.enforceFoodPriority()) return;
      if (this.stepQueue.length === 0) {
        this.aiLocked = false;
        this.scheduleNextBehavior();
        return;
      }
      this.aiLocked = true;
      const step = this.stepQueue.shift();

      if (
        step.type === "walk" ||
        step.type === "walkFast" ||
        step.type === "walkEdge" ||
        step.type === "walkShort"
      ) {
        const sp = step.type === "walkFast" ? SPEED_WALK_FAST : SPEED_WALK;
        const t =
          step.type === "walkEdge"
            ? this.randomTarget(true)
            : step.type === "walkShort"
              ? this.randomShortWalkTarget()
              : this.randomTarget(false);
        this.speed = sp;
        this.moveToPosition(t.x + halfPenguinSize, t.y + halfPenguinSize);

        const waitArrival = setInterval(() => {
          if (!this.isMoving) {
            clearInterval(waitArrival);
            this.speed = SPEED_WALK;
            setTimeout(() => this.runNextStep(), this.getStepTransitionDelay());
          }
        }, 100);
      } else if (step.type === "jumpMove") {
        const jumpDirection = Math.random() < 0.5 ? -1 : 1;
        const jumpDistance = 30 + Math.random() * 40;
        const target = {
          x: this.x + jumpDirection * jumpDistance,
          y: this.randomWalkY(),
        };
        this.speed = SPEED_WALK_FAST;
        this.speak();
        this.element.style.animation = "";
        this.startJumpArc(target.x, target.y);

        const waitArrival = setInterval(() => {
          if (!this.isMoving) {
            clearInterval(waitArrival);
            this.speed = SPEED_WALK;
            if (!this.isMoving) this.setState("idle");
            setTimeout(
              () => this.runNextStep(),
              step.duration || this.getStepTransitionDelay(),
            );
          }
        }, 100);
      } else if (step.type === "flyMove") {
        const isRainingNow = Boolean(
          window.PenguinPet &&
            window.PenguinPet.effects &&
            typeof window.PenguinPet.effects.isRaining === "function" &&
            window.PenguinPet.effects.isRaining(),
        );
        if (isRainingNow) {
          this.stepQueue.unshift({ type: "walkShort" });
          this.runNextStep();
          return;
        }

        const targetX = Math.max(
          halfPenguinSize,
          Math.min(
            this.x + (Math.random() - 0.5) * 260 + halfPenguinSize,
            window.innerWidth - halfPenguinSize,
          ),
        );
        const targetY = this.randomFlyY() + halfPenguinSize;
        this.speed = SPEED_WALK_FAST + 0.6;
        this.setState("flying");
        this.speak();
        this.element.style.animation = "bounce 1s ease-in-out infinite";
        this.moveToPosition(targetX, targetY, this.speed, true);

        const waitArrival = setInterval(() => {
          if (!this.isMoving) {
            clearInterval(waitArrival);
            this.element.style.animation = "";
            this.speed = SPEED_WALK;
            this.moveToPosition(
              this.x + halfPenguinSize,
              this.randomWalkY() + halfPenguinSize,
            );
            const backToSnow = setInterval(() => {
              if (!this.isMoving) {
                clearInterval(backToSnow);
                if (!this.isMoving) this.setState("idle");
                setTimeout(
                  () => this.runNextStep(),
                  step.duration || this.getStepTransitionDelay(),
                );
              }
            }, 100);
          }
        }, 100);
      } else if (step.type === "sequence") {
        this.playStateSequence(step.steps, () => {
          this.runNextStep();
        });
      } else if (step.type === "act") {
        if (step.state === "fishing") {
          this.runFishingAction(step);
          return;
        }

        const actDuration = this.scaleEmotionDuration(step.duration || 1200);

        if (step.state === "laughing") {
          this.playLaughThenIdleThenLaugh(actDuration, () => {
            this.runNextStep();
          });
          return;
        }

        this.element.style.animation = "";
        this.setState(step.state);
        this.speak();
        if (step.anim) this.element.style.animation = step.anim;

        setTimeout(() => {
          this.element.style.animation = "";
          if (!this.isMoving) this.setState("idle");
          this.insertWalkBetweenEmotionSteps(step);
          this.runNextStep();
        }, actDuration);
      }
    },

    runFishingAction(step) {
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
})();
