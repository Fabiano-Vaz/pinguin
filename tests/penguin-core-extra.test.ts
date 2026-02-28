const assert = require("node:assert/strict");
const {
  ACTIVITY_TRANSITIONS,
  createActivityStateMachine,
  createTimerRegistry,
} = require("../src/penguin/penguin-core.ts");

(() => {
  const sm = createActivityStateMachine("idle");
  assert.equal(sm.canTransition("dragging"), true);
  assert.equal(sm.canTransition(""), false);
  assert.equal(sm.canTransition(null), false);

  const initialHistory = sm.getHistory();
  assert.equal(initialHistory.length, 1);
  assert.equal(initialHistory[0].state, "idle");

  for (let i = 0; i < 50; i += 1) {
    sm.transition("dragging", `loop-${i}`);
    sm.transition("idle", `loop-back-${i}`);
  }

  assert.ok(sm.getHistory().length <= 40);
})();

(() => {
  assert.equal(ACTIVITY_TRANSITIONS.idle.has("dragging"), true);
  assert.equal(ACTIVITY_TRANSITIONS.dragging.has("fishing"), false);
})();

(() => {
  const cleared = [];
  const registry = createTimerRegistry({
    setTimeoutFn: (fn) => ({ type: "timeout", fn }),
    clearTimeoutFn: (id) => cleared.push({ kind: "timeout", id }),
    setIntervalFn: (fn) => ({ type: "interval", fn }),
    clearIntervalFn: (id) => cleared.push({ kind: "interval", id }),
  });

  registry.setManagedTimeout("ctxA", "a1", () => {}, 100);
  registry.setManagedInterval("ctxA", "a2", () => {}, 100);
  registry.setManagedInterval("ctxB", "b1", () => {}, 100);

  assert.equal(registry.snapshot().total, 3);
  assert.equal(registry.clearAll(), 3);
  assert.equal(registry.snapshot().total, 0);
  assert.equal(cleared.length, 3);
})();

console.log("penguin-core extra tests passed");
