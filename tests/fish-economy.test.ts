const assert = require("node:assert/strict");

const clearModule = (modulePath) => {
  const resolved = require.resolve(modulePath);
  delete require.cache[resolved];
};

const createClassList = () => {
  const classes = new Set();
  return {
    add: (name) => classes.add(name),
    remove: (name) => classes.delete(name),
    contains: (name) => classes.has(name),
    toggle: (name, force) => {
      if (typeof force === "boolean") {
        if (force) classes.add(name);
        else classes.delete(name);
        return force;
      }
      if (classes.has(name)) {
        classes.delete(name);
        return false;
      }
      classes.add(name);
      return true;
    },
  };
};

const createMockElement = (tagName = "div") => {
  const listeners = new Map();
  return {
    tagName: tagName.toUpperCase(),
    className: "",
    textContent: "",
    style: {},
    children: [],
    classList: createClassList(),
    appendChild(child) {
      this.children.push(child);
    },
    addEventListener(name, handler) {
      listeners.set(name, handler);
    },
    dispatch(name, event = {}) {
      const handler = listeners.get(name);
      if (handler) handler(event);
    },
  };
};

const withMockTimers = (run) => {
  const originalSetTimeout = global.setTimeout;
  const originalClearTimeout = global.clearTimeout;
  let timeoutId = 0;
  const timeoutMap = new Map();

  global.setTimeout = (fn, delay) => {
    timeoutId += 1;
    timeoutMap.set(timeoutId, { fn, delay });
    return timeoutId;
  };
  global.clearTimeout = (id) => {
    timeoutMap.delete(id);
  };

  try {
    run({
      timeoutMap,
      runTimeout: (id) => {
        const entry = timeoutMap.get(id);
        if (entry) entry.fn();
      },
    });
  } finally {
    global.setTimeout = originalSetTimeout;
    global.clearTimeout = originalClearTimeout;
  }
};

withMockTimers(() => {
  const body = createMockElement("body");
  let hasUneatenFish = false;

  global.document = {
    body,
    createElement: (tag) => createMockElement(tag),
    querySelector: (selector) => {
      if (selector === ".food-fish-drop:not(.eaten)") {
        return hasUneatenFish ? {} : null;
      }
      return null;
    },
  };

  const speechLog = [];
  const stateLog = [];
  const penguin = {
    showSpeech: (text) => speechLog.push(text),
    setState: (state) => stateLog.push(state),
    isDragging: false,
    isWalkingAway: false,
    isRanting: false,
    isFishingActive: false,
    currentState: "idle",
    isEatingFood: false,
    currentFoodTarget: null,
    isMoving: false,
    element: { style: {} },
  };

  global.window = {
    PenguinPet: { penguin },
    PenguinPetModules: {},
  };

  clearModule("../src/runtime/pet-fish-economy.ts");
  require("../src/runtime/pet-fish-economy.ts");

  const runtime = { isFishCursorEnabled: true };
  const economy = window.PenguinPetModules.createFishEconomy({
    phrases: {
      fishRage: ["SEM PEIXE"],
      fishEmpty: ["acabou"],
      fishLow: ["pouco"],
      fishLast: ["ultimo"],
      eating: ["nham"],
      idle: ["..."],
    },
    runtime,
    settings: {
      initialFishStock: 2,
      naturalConsumeEnabled: false,
    },
  });

  economy.initialize();
  assert.equal(runtime.fishStock, 2);
  assert.equal(document.body.classList.contains("fish-cursor-enabled"), true);

  assert.equal(economy.consumeFishStock(1), true);
  assert.equal(economy.getFishStock(), 1);
  assert.equal(runtime.fishStock, 1);

  assert.equal(economy.consumeFishStock(10), false);
  assert.equal(economy.getFishStock(), 1);

  assert.equal(economy.consumeFishStock(1), true);
  assert.equal(economy.getFishStock(), 0);
  assert.equal(document.body.classList.contains("fish-cursor-enabled"), false);

  runtime.isFishCursorEnabled = false;
  assert.equal(economy.addFishStock(3), 3);
  assert.equal(runtime.fishStock, 3);
  assert.equal(document.body.classList.contains("fish-cursor-enabled"), true);

  hasUneatenFish = false;
  economy.complainNoFishOnClick();
  assert.equal(stateLog.includes("angry"), true);
  assert.equal(speechLog.length > 0, true);
});

console.log("fish economy tests passed");
