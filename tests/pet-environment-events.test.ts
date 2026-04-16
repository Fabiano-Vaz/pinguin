const assert = require("node:assert/strict");

const clearModule = (modulePath) => {
  const resolved = require.resolve(modulePath);
  delete require.cache[resolved];
};

const createListenerTarget = () => {
  const listeners = new Map();
  return {
    listeners,
    addEventListener(name, handler) {
      listeners.set(name, handler);
    },
    removeEventListener(name, handler) {
      if (listeners.get(name) === handler) {
        listeners.delete(name);
      }
    },
  };
};

{
  const documentTarget = createListenerTarget();
  const windowTarget = createListenerTarget();
  const jumpCalls = [];
  const snowCalls = [];
  const rainCalls = [];
  let bodyFocusCalls = 0;

  global.document = {
    ...documentTarget,
    visibilityState: "visible",
    body: {
      focus() {
        bodyFocusCalls += 1;
      },
      classList: {
        contains: () => false,
      },
    },
  };

  global.window = {
    ...windowTarget,
    PenguinPetModules: {},
    PenguinPet: {
      penguin: {
        x: 120,
        isFishingActive: false,
        isCaveirinhaMode: false,
        isDragging: false,
        isWalkingAway: false,
        isJumpLocked: false,
        startJumpArc(x, y) {
          jumpCalls.push([x, y]);
        },
        getWalkMinY() {
          return 333;
        },
      },
    },
  };

  const effects = {
    isSnowing: () => false,
    isRaining: () => false,
    startSnowCycle: (manual) => snowCalls.push(["start", manual]),
    stopSnowCycle: (manual) => snowCalls.push(["stop", manual]),
    startRainCycle: (manual) => rainCalls.push(["start", manual]),
    stopRainCycle: (manual) => rainCalls.push(["stop", manual]),
  };

  clearModule("../src/runtime/pet-environment-events.ts");
  require("../src/runtime/pet-environment-events.ts");

  const events = window.PenguinPetModules.createEnvironmentEvents({
    penguin: window.PenguinPet.penguin,
    effects,
    runtime: {},
  });

  events.attach();

  assert.equal(typeof document.listeners.get("keydown"), "function");
  assert.equal(typeof document.listeners.get("visibilitychange"), "function");
  assert.equal(typeof window.listeners.get("focus"), "function");
  assert.equal(typeof window.listeners.get("keydown"), "function");
  assert.equal(bodyFocusCalls > 0, true);

  const mouseenter = document.listeners.get("mouseenter");
  const focusCallsAfterAttach = bodyFocusCalls;
  mouseenter({ clientX: 10, clientY: 20 });
  assert.equal(bodyFocusCalls, focusCallsAfterAttach);

  const visibilitychange = document.listeners.get("visibilitychange");
  visibilitychange();
  assert.equal(bodyFocusCalls, focusCallsAfterAttach + 1);

  const keydown = window.listeners.get("keydown");
  keydown({
    key: "v",
    target: null,
    defaultPrevented: false,
    preventDefault() {},
  });
  keydown({
    key: "n",
    target: null,
    defaultPrevented: false,
    preventDefault() {},
  });
  keydown({
    key: "c",
    target: null,
    defaultPrevented: false,
    preventDefault() {},
  });

  assert.deepEqual(jumpCalls, [[120, 333]]);
  assert.deepEqual(snowCalls, [["start", true]]);
  assert.deepEqual(rainCalls, [["start", true]]);

  events.detach();
  assert.equal(window.listeners.has("keydown"), false);
  assert.equal(window.listeners.has("focus"), false);
}

console.log("pet environment events tests passed");
