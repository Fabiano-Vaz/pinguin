type ActivityTransitionResult = {
  ok: boolean;
};

type ActivityStateMachine = {
  transition: (nextState: string, reason?: string) => ActivityTransitionResult;
  getHistory: () => Array<{ state: string; at: number; reason?: string }>;
};

type TimerSnapshot = {
  total: number;
  byContext: Record<string, number>;
};

type TimerRegistry = {
  setManagedTimeout: (
    context: string,
    key: string,
    callback: () => void,
    delayMs?: number,
  ) => ReturnType<typeof setTimeout> | null;
  setManagedInterval: (
    context: string,
    key: string,
    callback: () => void,
    delayMs?: number,
  ) => ReturnType<typeof setInterval> | null;
  clear: (context: string, key: string) => boolean;
  clearContext: (context: string) => number;
  snapshot: () => TimerSnapshot;
};

type PenguinStateServiceDeps = {
  createActivityStateMachine?: (initialActivity: string) => ActivityStateMachine | null;
  createTimerRegistry?: () => TimerRegistry | null;
  initialActivity?: string;
};

export class PenguinStateService {
  activityStateMachine: ActivityStateMachine | null;
  activityMode: string;
  activityModeChangedAt: number;
  timerRegistry: TimerRegistry | null;
  locks: Map<string, number>;
  lockState: {
    visualLockUntil: number;
    sleepWakeLockUntil: number;
    isFullBellySequenceActive: boolean;
    allowFullStateTransition: boolean;
    isJumpLocked: boolean;
    allowJumpStateTransition: boolean;
  };

  constructor({
    createActivityStateMachine,
    createTimerRegistry,
    initialActivity = "idle",
  }: PenguinStateServiceDeps = {}) {
    this.activityStateMachine =
      typeof createActivityStateMachine === "function"
        ? createActivityStateMachine(initialActivity)
        : null;
    this.activityMode = initialActivity;
    this.activityModeChangedAt = Date.now();
    this.timerRegistry =
      typeof createTimerRegistry === "function" ? createTimerRegistry() : null;
    this.locks = new Map();
    this.lockState = {
      visualLockUntil: 0,
      sleepWakeLockUntil: 0,
      isFullBellySequenceActive: false,
      allowFullStateTransition: false,
      isJumpLocked: false,
      allowJumpStateTransition: false,
    };
  }

  setActivityMode(nextMode: string, reason = "", { force = false } = {}): boolean {
    if (typeof nextMode !== "string" || nextMode.length === 0) return false;
    if (nextMode === this.activityMode) return true;

    if (
      this.activityStateMachine &&
      typeof this.activityStateMachine.transition === "function"
    ) {
      const result = this.activityStateMachine.transition(nextMode, reason || "transition");
      if (!result.ok && !force) return false;
    }

    this.activityMode = nextMode;
    this.activityModeChangedAt = Date.now();
    return true;
  }

  getActivityMode(): string {
    return this.activityMode;
  }

  getActivityModeChangedAt(): number {
    return this.activityModeChangedAt;
  }

  getActivityHistory(limit = 40): Array<{ state: string; at: number; reason?: string }> {
    if (
      !this.activityStateMachine ||
      typeof this.activityStateMachine.getHistory !== "function"
    ) {
      return [];
    }
    const history = this.activityStateMachine.getHistory();
    if (!Number.isFinite(limit) || limit <= 0) return history.slice();
    return history.slice(-Math.floor(limit));
  }

  setManagedTimeout(
    context: string,
    key: string,
    callback: () => void,
    delayMs = 0,
  ): ReturnType<typeof setTimeout> | null {
    if (
      this.timerRegistry &&
      typeof this.timerRegistry.setManagedTimeout === "function"
    ) {
      return this.timerRegistry.setManagedTimeout(context, key, callback, delayMs);
    }
    return setTimeout(callback, delayMs);
  }

  setManagedInterval(
    context: string,
    key: string,
    callback: () => void,
    delayMs = 0,
  ): ReturnType<typeof setInterval> | null {
    if (
      this.timerRegistry &&
      typeof this.timerRegistry.setManagedInterval === "function"
    ) {
      return this.timerRegistry.setManagedInterval(context, key, callback, delayMs);
    }
    return setInterval(callback, delayMs);
  }

  clearManagedTimer(context: string, key: string): boolean {
    if (this.timerRegistry && typeof this.timerRegistry.clear === "function") {
      return this.timerRegistry.clear(context, key);
    }
    return false;
  }

  clearManagedContext(context: string): number {
    if (this.timerRegistry && typeof this.timerRegistry.clearContext === "function") {
      return this.timerRegistry.clearContext(context);
    }
    return 0;
  }

  getTimerSnapshot(): TimerSnapshot {
    if (this.timerRegistry && typeof this.timerRegistry.snapshot === "function") {
      return this.timerRegistry.snapshot();
    }
    return { total: 0, byContext: {} };
  }

  setLock(lockKey: string, durationMs = 0): number {
    if (typeof lockKey !== "string" || lockKey.length === 0) return 0;
    const expiresAt = Date.now() + Math.max(0, Number(durationMs) || 0);
    this.locks.set(lockKey, expiresAt);
    return expiresAt;
  }

  clearLock(lockKey: string): boolean {
    if (typeof lockKey !== "string" || lockKey.length === 0) return false;
    return this.locks.delete(lockKey);
  }

  isLocked(lockKey: string): boolean {
    if (typeof lockKey !== "string" || lockKey.length === 0) return false;
    const expiresAt = this.locks.get(lockKey);
    if (!Number.isFinite(expiresAt)) return false;
    if (Date.now() >= expiresAt) {
      this.locks.delete(lockKey);
      return false;
    }
    return true;
  }

  getLockValue(
    key:
      | "visualLockUntil"
      | "sleepWakeLockUntil"
      | "isFullBellySequenceActive"
      | "allowFullStateTransition"
      | "isJumpLocked"
      | "allowJumpStateTransition",
  ): number | boolean {
    return this.lockState[key];
  }

  setLockValue(
    key:
      | "visualLockUntil"
      | "sleepWakeLockUntil"
      | "isFullBellySequenceActive"
      | "allowFullStateTransition"
      | "isJumpLocked"
      | "allowJumpStateTransition",
    value: number | boolean,
  ): boolean {
    if (!Object.prototype.hasOwnProperty.call(this.lockState, key)) return false;
    this.lockState[key] = value as never;
    return true;
  }

  isVisualLocked(): boolean {
    return Date.now() < (this.lockState.visualLockUntil || 0);
  }

  lockVisualFor(durationMs = 0): number {
    const duration = Number.isFinite(durationMs) ? Math.max(0, durationMs) : 0;
    this.lockState.visualLockUntil = Date.now() + duration;
    return this.lockState.visualLockUntil;
  }

  unlockVisual(): void {
    this.lockState.visualLockUntil = 0;
  }

  setSleepWakeLockFor(durationMs = 0): number {
    const duration = Number.isFinite(durationMs) ? Math.max(0, durationMs) : 0;
    this.lockState.sleepWakeLockUntil = Date.now() + duration;
    return this.lockState.sleepWakeLockUntil;
  }

  clearSleepWakeLock(): void {
    this.lockState.sleepWakeLockUntil = 0;
  }

  isSleepWakeLocked(): boolean {
    return Date.now() < (this.lockState.sleepWakeLockUntil || 0);
  }

  setFullBellySequenceActive(active: boolean): void {
    this.lockState.isFullBellySequenceActive = Boolean(active);
  }

  setAllowFullStateTransition(allowed: boolean): void {
    this.lockState.allowFullStateTransition = Boolean(allowed);
  }

  setJumpLocked(locked: boolean): void {
    this.lockState.isJumpLocked = Boolean(locked);
  }

  setAllowJumpStateTransition(allowed: boolean): void {
    this.lockState.allowJumpStateTransition = Boolean(allowed);
  }
}
