const assert = require('node:assert/strict');
const {
  createActivityStateMachine,
  createTimerRegistry,
} = require('../src/penguin/penguin-core.ts');

{
  const sm = createActivityStateMachine('idle');
  assert.equal(sm.getCurrent(), 'idle');

  const okDrag = sm.transition('dragging', 'test drag');
  assert.equal(okDrag.ok, true);
  assert.equal(sm.getCurrent(), 'dragging');

  const invalid = sm.transition('fishing', 'invalid direct transition');
  assert.equal(invalid.ok, false);
  assert.equal(sm.getCurrent(), 'dragging');

  const okWalkAway = sm.transition('walk_away', 'drop x2');
  assert.equal(okWalkAway.ok, true);
  assert.equal(sm.getCurrent(), 'walk_away');

  const okIdle = sm.transition('idle', 'returned');
  assert.equal(okIdle.ok, true);
  assert.equal(sm.getCurrent(), 'idle');
}

{
  const timeouts = new Map();
  const intervals = new Map();
  let idCounter = 0;

  const registry = createTimerRegistry({
    setTimeoutFn: (fn) => {
      const id = ++idCounter;
      timeouts.set(id, fn);
      return id;
    },
    clearTimeoutFn: (id) => timeouts.delete(id),
    setIntervalFn: (fn) => {
      const id = ++idCounter;
      intervals.set(id, fn);
      return id;
    },
    clearIntervalFn: (id) => intervals.delete(id),
  });

  let timeoutRuns = 0;
  registry.setManagedTimeout('drop', 'cooldown', () => {
    timeoutRuns += 1;
  }, 100);

  // replacing same context/key should remove previous timer
  registry.setManagedTimeout('drop', 'cooldown', () => {
    timeoutRuns += 10;
  }, 100);

  assert.equal(registry.snapshot().total, 1);

  const timeoutFn = [...timeouts.values()][0];
  timeoutFn();
  assert.equal(timeoutRuns, 10);
  assert.equal(registry.snapshot().total, 0);

  let intervalRuns = 0;
  registry.setManagedInterval('behavior', 'poll', () => {
    intervalRuns += 1;
  }, 50);
  assert.equal(registry.snapshot().byContext.behavior, 1);

  const intervalFn = [...intervals.values()][0];
  intervalFn();
  intervalFn();
  assert.equal(intervalRuns, 2);

  const cleared = registry.clearContext('behavior');
  assert.equal(cleared, 1);
  assert.equal(registry.snapshot().total, 0);
}

console.log('penguin-core tests passed');
