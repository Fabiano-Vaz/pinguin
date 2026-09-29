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

withMockTimers(({ timeoutMap, runTimeout }) => {
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

  const balances = [];
  const unsubscribe = economy.subscribeFishStock(() => balances.push(economy.getFishStock()));
  economy.addFishStock(10);
  economy.consumeFishStock(10);
  assert.deepEqual(balances, [13, 3]);
  unsubscribe();
  economy.addFishStock(1);
  assert.deepEqual(balances, [13, 3]);

  const fittingRuntime = { isWardrobeOpen: true };
  const fittingEconomy = window.PenguinPetModules.createFishEconomy({
    runtime: fittingRuntime,
    settings: { initialFishStock: 20, naturalConsumeEnabled: true, naturalConsumeMinMs: 100, naturalConsumeMaxMs: 100 },
  });
  fittingEconomy.initialize();
  let timer = Array.from(timeoutMap.entries()).find(([, value]) => value.delay === 100);
  runTimeout(timer[0]);
  assert.equal(fittingEconomy.getFishStock(), 20, "Browsing must pause automatic consumption");
  fittingRuntime.isWardrobeOpen = false;
  timer = Array.from(timeoutMap.entries()).filter(([, value]) => value.delay === 100).pop();
  runTimeout(timer[0]);
  assert.equal(fittingEconomy.getFishStock(), 19, "Consumption resumes after closing");
  fittingEconomy.dispose();

  const { FISH_LIFETIME_MS } = require("../src/runtime/fish-stock-ledger.ts");
  let now = 100000;
  let saved;
  const storage = {
    load: () => saved,
    save: (value) => { saved = JSON.parse(JSON.stringify(value)); },
  };
  const createPersistent = () => window.PenguinPetModules.createFishEconomy({
    runtime: {}, storage, now: () => now,
  });
  let persistent = createPersistent();
  persistent.initialize();
  assert.equal(persistent.getFishStock(), 5);
  assert.equal(saved.batches[0].expiresAt, now + FISH_LIFETIME_MS);
  const firstExpiry = saved.batches[0].expiresAt;
  now += 3600000;
  persistent.addFishStock(10);
  assert.equal(persistent.consumeFishStock(3), true);
  assert.deepEqual(saved.batches.map((batch) => batch.amount), [2, 10]);
  persistent.dispose();
  persistent = createPersistent();
  persistent.initialize();
  assert.equal(persistent.getFishStock(), 12, "Reopening restores earned and spent fish");
  assert.equal(saved.batches[0].expiresAt, firstExpiry, "Reopening never renews expiration");
  const expirationBalances = [];
  persistent.subscribeFishStock(() => expirationBalances.push(persistent.getFishStock()));
  now = firstExpiry;
  assert.equal(persistent.getFishStock(), 10, "A read after suspension removes expired fish");
  assert.deepEqual(expirationBalances, [10]);
  assert.equal(persistent.consumeFishStock(11), false);
  assert.equal(persistent.consumeFishStock(1), true);
  now += 3600000;
  for (const [id, entry] of Array.from(timeoutMap.entries())) {
    if (entry.delay === 60000) runTimeout(id);
  }
  assert.equal(expirationBalances.at(-1), 0, "The expiration timer notifies HUD and wardrobe");
  assert.deepEqual(saved.batches, []);
  persistent.dispose();
  persistent = createPersistent();
  persistent.initialize();
  assert.equal(persistent.getFishStock(), 0, "An empty saved balance never grants welcome fish again");
  assert.equal(persistent.consumeFishStock(1), false);
  persistent.dispose();

  hasUneatenFish = false;
  economy.complainNoFishOnClick();
  assert.equal(stateLog.includes("angry"), true);
  assert.equal(speechLog.length > 0, true);
  economy.dispose();
});

console.log("fish economy tests passed");
