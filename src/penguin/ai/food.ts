import { pickRandomLine } from "./shared";

export const createFoodMethods = ({ actionStates, runtime, halfPenguinSize, phrases, SPEED_WALK }) => ({
  syncFoodTargetsFromGround() {
    const now = Date.now();
    const scanIntervalMs = 180;
    if (
      Number.isFinite(this.lastFoodGroundScanAt) &&
      now - this.lastFoodGroundScanAt < scanIntervalMs
    ) {
      return;
    }
    this.lastFoodGroundScanAt = now;

    const fishOnGround = document.querySelectorAll(".food-fish-drop:not(.eaten)");
    if (!fishOnGround.length) return;
    const maxQueuedTargets = 120;

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

    for (const fishEl of Array.from(fishOnGround)) {
      if (tracked.has(fishEl)) continue;
      if (this.foodTargets.length >= maxQueuedTargets) break;
      const rect = fishEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const clampedCenterX = Math.max(
        halfPenguinSize,
        Math.min(centerX, window.innerWidth - halfPenguinSize),
      );
      const targetY =
        typeof this.getWalkMinY === "function"
          ? this.getWalkMinY() + halfPenguinSize
          : rect.top + rect.height / 2;
      this.foodTargets.push({
        element: fishEl,
        x: clampedCenterX,
        y: targetY,
      });
    }
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

    return this.isEatingFood || Boolean(hasCurrentTarget) || this.foodTargets.length > 0;
  },

  enforceFoodPriority() {
    if (this.isFullBellySequenceActive) return true;
    if (this.isFishingActive) return false;
    if (this.currentState === "sleeping") return false;
    if (!this.hasPendingFoodTargets()) return false;

    if (typeof this.invalidateBehaviorFlow === "function") {
      this.invalidateBehaviorFlow("food-priority");
    }
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

  registerFishEaten() {
    if (this.isFullBellySequenceActive) return;
    const now = Date.now();
    const streakWindowMs = 12000;
    if (!this.lastFishEatenAt || now - this.lastFishEatenAt > streakWindowMs) {
      this.fishEatenCount = 0;
    }
    this.lastFishEatenAt = now;
    this.fishEatenCount = Number.isFinite(this.fishEatenCount)
      ? this.fishEatenCount + 1
      : 1;
    if (this.fishEatenCount >= 6) {
      this.startFullBellySequence();
    }
  },

  startFullBellySequence() {
    if (this.isFullBellySequenceActive) return;
    this.isFullBellySequenceActive = true;
    this.fishEatenCount = 0;
    this.lastFishEatenAt = 0;

    this.aiLocked = true;
    this.stepQueue = [];
    this.isChasing = false;
    this.isMoving = false;
    this.targetX = this.x;
    this.targetY = this.y;
    this.currentFoodTarget = null;
    this.foodTargets = [];
    this.isEatingFood = false;
    this.isCursorTouchEating = false;
    this.cursorTouchEatingUntil = 0;
    this.allowFullStateTransition = false;
    this.element.style.animation = "";

    if (this.nextBehaviorTimeoutId) {
      clearTimeout(this.nextBehaviorTimeoutId);
      this.nextBehaviorTimeoutId = null;
    }
    if (typeof this.clearManagedTimer === "function") {
      this.clearManagedTimer("behavior", "next");
    }
    if (typeof this.clearManagedContext === "function") {
      this.clearManagedContext("overfed");
    }
    if (typeof this.setActivityMode === "function") {
      this.setActivityMode("eating", "overfed:start", { force: true });
    }
    if (typeof this.unlockVisualSprite === "function") {
      this.unlockVisualSprite();
    }

    const fullLine = pickRandomLine(
      phrases && phrases.full,
      pickRandomLine(phrases && phrases.idle, ""),
    );
    const sleepLine = pickRandomLine(
      phrases && phrases.fullSleep,
      pickRandomLine(phrases && phrases.idle, ""),
    );

    this.setState("full");
    this.showSpeech(fullLine, 5000, false);

    const toSleepDelayMs = 5000;
    const sleepWakeLockMs = 10000;
    const recoverDelayMs = 20000;
    const moveToSleep = () => {
      if (!this.isFullBellySequenceActive) return;
      this.sleepWakeLockUntil = Date.now() + sleepWakeLockMs;
      this.allowFullStateTransition = true;
      this.setState("sleeping");
      this.allowFullStateTransition = false;
      this.showSpeech(sleepLine, 3200, false);
    };
    const recoverFromOverfed = () => {
      if (!this.isFullBellySequenceActive) return;
      this.isFullBellySequenceActive = false;
      this.allowFullStateTransition = false;
      this.sleepWakeLockUntil = 0;
      if (typeof this.setActivityMode === "function") {
        this.setActivityMode("idle", "overfed:finish", { force: true });
      }
      if (!this.isMoving) this.setState("idle");
      this.aiLocked = false;
      this.scheduleNextBehavior();
    };

    if (typeof this.setManagedTimeout === "function") {
      this.setManagedTimeout("overfed", "sleep", moveToSleep, toSleepDelayMs);
      this.setManagedTimeout(
        "overfed",
        "recover",
        recoverFromOverfed,
        toSleepDelayMs + recoverDelayMs,
      );
    } else {
      setTimeout(moveToSleep, toSleepDelayMs);
      setTimeout(recoverFromOverfed, toSleepDelayMs + recoverDelayMs);
    }
  },

  enqueueFoodTargets(targets) {
    if (!Array.isArray(targets) || targets.length === 0) return;
    const maxQueuedTargets = 120;
    if (!Array.isArray(this.foodTargets)) {
      this.foodTargets = [];
    }
    const availableSlots = Math.max(0, maxQueuedTargets - this.foodTargets.length);
    if (availableSlots === 0) return;

    const validTargets = targets.filter(
      (target) =>
        target &&
        Number.isFinite(target.x) &&
        Number.isFinite(target.y) &&
        target.element,
    );

    if (validTargets.length === 0) return;
    const normalizedTargets = validTargets.slice(0, availableSlots).map((target) => {
      const clampedX = Math.max(
        halfPenguinSize,
        Math.min(target.x, window.innerWidth - halfPenguinSize),
      );
      const clampedY = this.clampY(target.y - halfPenguinSize) + halfPenguinSize;
      return {
        ...target,
        x: clampedX,
        y: clampedY,
      };
    });
    this.foodTargets.push(...normalizedTargets);
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
    if (!nextTarget || !nextTarget.element || !nextTarget.element.isConnected) {
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
    if (target.element && target.element.isConnected) {
      target.element.classList.add("eaten");
      setTimeout(() => {
        if (target.element && target.element.isConnected) {
          target.element.remove();
        }
      }, 160);
    }

    this.registerFishEaten();
    if (this.isFullBellySequenceActive) {
      this.currentFoodTarget = null;
      this.isEatingFood = false;
      return;
    }

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

  handleFoodHunt() {
    if (this.isFullBellySequenceActive) return;
    if (this.isFishingActive) return;
    if (this.currentState === "sleeping") return;
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

    const clampedTargetX = Math.max(
      halfPenguinSize,
      Math.min(target.x, window.innerWidth - halfPenguinSize),
    );
    const clampedTargetY = this.clampY(target.y - halfPenguinSize) + halfPenguinSize;
    this.targetX = clampedTargetX - halfPenguinSize;
    this.targetY = this.clampY(clampedTargetY - halfPenguinSize);
    this.isMoving = true;

    const dx = clampedTargetX - (this.x + halfPenguinSize);
    const dy = clampedTargetY - (this.y + halfPenguinSize);
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance <= 22) {
      this.consumeCurrentFoodTarget();
    }
  },

  applyCursorEatingState() {
    if (this.isFullBellySequenceActive) return;
    if (this.currentState === "sleeping") {
      if (this.isCursorTouchEating) {
        this.isCursorTouchEating = false;
        this.cursorTouchEatingUntil = 0;
      }
      return;
    }
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
      this.registerFishEaten();
      if (this.isFullBellySequenceActive) return;
      this.isCursorTouchEating = true;
      this.cursorTouchEatingUntil = now + 4000;
      this.isChasing = false;
      this.setFishCursorEnabled(false);
      this.element.style.animation = "";
      this.setState("eating");
    }
  },
});
