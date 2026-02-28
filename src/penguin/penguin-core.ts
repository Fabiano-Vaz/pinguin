(() => {
  const root = typeof window !== "undefined" ? window : globalThis;

  const ACTIVITY_TRANSITIONS = {
    idle: new Set(["dragging", "walk_away", "caveirinha", "fishing", "ranting", "eating"]),
    dragging: new Set(["idle", "walk_away"]),
    walk_away: new Set(["idle", "caveirinha"]),
    caveirinha: new Set(["idle"]),
    fishing: new Set(["idle"]),
    ranting: new Set(["idle"]),
    eating: new Set(["idle"]),
  };

  const createActivityStateMachine = (initialState = "idle") => {
    let current = typeof initialState === "string" ? initialState : "idle";
    const history = [{ state: current, at: Date.now(), reason: "init" }];

    const canTransition = (nextState) => {
      if (typeof nextState !== "string" || nextState.length === 0) return false;
      if (nextState === current) return true;
      const allowed = ACTIVITY_TRANSITIONS[current] || new Set(["idle"]);
      return allowed.has(nextState);
    };

    const transition = (nextState, reason = "") => {
      if (!canTransition(nextState)) {
        return { ok: false, previous: current, current, next: nextState };
      }
      const previous = current;
      current = nextState;
      history.push({ state: current, at: Date.now(), reason });
      if (history.length > 40) history.shift();
      return { ok: true, previous, current, next: nextState };
    };

    return {
      getCurrent: () => current,
      getHistory: () => history.slice(),
      canTransition,
      transition,
      is: (value) => current === value,
    };
  };

  const createTimerRegistry = (scheduler = {}) => {
    const setTimeoutFn = scheduler.setTimeoutFn || root.setTimeout?.bind(root);
    const clearTimeoutFn = scheduler.clearTimeoutFn || root.clearTimeout?.bind(root);
    const setIntervalFn = scheduler.setIntervalFn || root.setInterval?.bind(root);
    const clearIntervalFn = scheduler.clearIntervalFn || root.clearInterval?.bind(root);

    const contexts = new Map();

    const ensureContext = (context) => {
      if (!contexts.has(context)) contexts.set(context, new Map());
      return contexts.get(context);
    };

    const clear = (context, key) => {
      const store = contexts.get(context);
      if (!store || !store.has(key)) return false;
      const timer = store.get(key);
      if (timer.type === "timeout" && clearTimeoutFn) clearTimeoutFn(timer.id);
      if (timer.type === "interval" && clearIntervalFn) clearIntervalFn(timer.id);
      store.delete(key);
      if (store.size === 0) contexts.delete(context);
      return true;
    };

    const setManagedTimeout = (context, key, callback, delayMs = 0) => {
      if (!setTimeoutFn) return null;
      clear(context, key);
      const store = ensureContext(context);
      const id = setTimeoutFn(() => {
        clear(context, key);
        callback();
      }, delayMs);
      store.set(key, { id, type: "timeout" });
      return id;
    };

    const setManagedInterval = (context, key, callback, delayMs = 0) => {
      if (!setIntervalFn) return null;
      clear(context, key);
      const store = ensureContext(context);
      const id = setIntervalFn(callback, delayMs);
      store.set(key, { id, type: "interval" });
      return id;
    };

    const clearContext = (context) => {
      const store = contexts.get(context);
      if (!store) return 0;
      const keys = [...store.keys()];
      keys.forEach((key) => clear(context, key));
      return keys.length;
    };

    const clearAll = () => {
      let total = 0;
      [...contexts.keys()].forEach((context) => {
        total += clearContext(context);
      });
      return total;
    };

    const snapshot = () => {
      const byContext = {};
      contexts.forEach((store, context) => {
        byContext[context] = store.size;
      });
      return {
        total: Object.values(byContext).reduce((acc, value) => acc + value, 0),
        byContext,
      };
    };

    return {
      setManagedTimeout,
      setManagedInterval,
      clear,
      clearContext,
      clearAll,
      snapshot,
    };
  };

  root.PenguinPetCore = {
    ...(root.PenguinPetCore || {}),
    ACTIVITY_TRANSITIONS,
    createActivityStateMachine,
    createTimerRegistry,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      ACTIVITY_TRANSITIONS,
      createActivityStateMachine,
      createTimerRegistry,
    };
  }
})();
