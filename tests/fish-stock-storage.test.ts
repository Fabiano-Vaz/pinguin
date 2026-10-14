const assert = require("node:assert/strict");
const Module = require("node:module");
const { FISH_STOCK_KEY } = require("../src/runtime/fish-stock-ledger.ts");
const originalWindow = global.window;
const originalStorage = global.localStorage;
const originalDocument = global.document;
const originalLoad = Module._load;
const originalSetInterval = global.setInterval;
const originalClearInterval = global.clearInterval;
const saved = { version: 1, batches: [{ amount: 12, expiresAt: 2000000000000 }] };
const entries = new Map();
let provider;
let received;
let disposed;
let tick;
let timerCleared = false;
const uri = (value) => ({ toString: () => value });
try {
  global.window = {};
  global.localStorage = {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
  };
  const { createFishStockStorage } = require("../src/runtime/fish-stock-storage.ts");
  const browserStorage = createFishStockStorage();
  assert.equal(browserStorage.load(), null);
  browserStorage.save(saved);
  assert.deepEqual(createFishStockStorage().load(), saved);
  let acquired = 0;
  const messages = [];
  let receiveSnapshot;
  global.window = {
    PENGUIN_FISH_STOCK: saved,
    acquireVsCodeApi: () => { acquired++; return { postMessage: (message) => messages.push(message) }; },
    addEventListener: (name, callback) => { if (name === "message") receiveSnapshot = callback; },
    removeEventListener: (name, callback) => { if (name === "message") { assert.equal(callback, receiveSnapshot); receiveSnapshot = undefined; } },
  };
  let visibilityChanged;
  global.document = {
    addEventListener: (_name, callback) => { visibilityChanged = callback; },
    removeEventListener: (_name, callback) => { assert.equal(callback, visibilityChanged); },
  };
  const hostStorage = createFishStockStorage();
  assert.deepEqual(hostStorage.load(), saved);
  hostStorage.save({ version: 1, batches: [] });
  assert.equal(messages.length, 0, "Stale view snapshots cannot replace host funds");
  createFishStockStorage();
  assert.equal(acquired, 1, "VS Code API can only be acquired once");
  const balances = [];
  const unsubscribe = hostStorage.subscribe((snapshot) => balances.push(snapshot.batches.reduce((sum, b) => sum + b.amount, 0)));
  hostStorage.change(-2);
  assert.deepEqual(messages[1], { type: "penguin:change-fish-stock", amount: -2, requestId: 1 });
  receiveSnapshot({ data: { type: "penguin:fish-stock", snapshot: saved, requestId: 0 } });
  assert.equal(balances.at(-1), 10, "An unacknowledged spend survives a passive reward update");
  receiveSnapshot({ data: { type: "penguin:fish-stock", snapshot: { version: 1, batches: [{ ...saved.batches[0], amount: 10 }] }, requestId: 1 } });
  assert.equal(balances.at(-1), 10, "An acknowledged spend is not deducted twice");
  visibilityChanged();
  assert.equal(messages.at(-1).type, "penguin:request-fish-stock", "Showing a suspended panel requests the latest balance");
  unsubscribe();
  window.PENGUIN_FISH_STOCK = null;
  assert.equal(hostStorage.load(), null, "VS Code does not inherit browser preview funds");

  global.setInterval = (callback, delay) => { assert.equal(delay, 10000); tick = callback; return 123; };
  global.clearInterval = (id) => { assert.equal(id, 123); timerCleared = true; };
  Module._load = function (name, ...args) {
    if (name === "vscode") return {
      window: { registerWebviewViewProvider: (_id, value) => { provider = value; return { dispose() {} }; } },
      commands: { registerCommand: () => ({ dispose() {} }), executeCommand: () => Promise.resolve() },
      workspace: { getConfiguration: () => ({ get: () => false }) },
      Uri: { joinPath: (base, ...parts) => uri([base.toString(), ...parts].join("/")) },
    };
    return originalLoad.call(this, name, ...args);
  };
  const disk = new Map([[FISH_STOCK_KEY, saved]]);
  const context = {
    extensionPath: "/opt/pinguin", extensionUri: uri("/opt/pinguin"), subscriptions: [],
    globalState: {
      get: (key) => disk.get(key),
      update: (key, value) => { disk.set(key, value); return Promise.resolve(); },
    },
  };
  require("../src/extension.ts").activate(context);
  const balance = () => disk.get(FISH_STOCK_KEY).batches.reduce((sum, batch) => sum + batch.amount, 0);
  tick(); tick();
  assert.equal(balance(), 12, "Time alone does not award fish");
  const published = [];
  const makeView = () => ({
    onDidDispose: (callback) => { disposed = callback; },
    webview: {
      cspSource: "vscode-webview:", asWebviewUri: (value) => value,
      onDidReceiveMessage: (callback) => { received = callback; return { dispose() {} }; },
      postMessage: (message) => { published.push(message); return Promise.resolve(true); },
    },
  });
  let view = makeView();
  provider.resolveWebviewView(view);
  assert.ok(view.webview.html.includes(`window.PENGUIN_FISH_STOCK = ${JSON.stringify(disk.get(FISH_STOCK_KEY))};`));
  tick();
  assert.equal(balance(), 12);
  received({ type: "penguin:request-fish-stock" });
  assert.equal(published.at(-1).type, "penguin:fish-stock");
  received(messages[1]);
  assert.equal(balance(), 10, "A click updates the host balance");
  received(messages[1]);
  assert.equal(balance(), 10, "Duplicate requests do not spend twice");
  received({ type: "penguin:change-fish-stock", amount: -100, requestId: 2 });
  assert.equal(balance(), 10, "Insufficient funds cannot make the balance negative");
  received({ type: "penguin:save-fish-stock", snapshot: { version: 1, batches: [] } });
  received({ type: "penguin:change-fish-stock", amount: NaN, requestId: 3 });
  assert.equal(balance(), 10, "Stale and invalid messages cannot replace funds");
  disposed();
  tick();
  assert.equal(balance(), 10, "Time with the panel disposed does not award fish");
  view = makeView();
  provider.resolveWebviewView(view);
  assert.ok(view.webview.html.includes(`window.PENGUIN_FISH_STOCK = ${JSON.stringify(disk.get(FISH_STOCK_KEY))};`));
  received({ type: "penguin:request-fish-stock" });
  assert.equal(published.at(-1).requestId, 0, "Recreated views start a new request sequence");
  for (const subscription of context.subscriptions) subscription.dispose();
  assert.equal(timerCleared, true, "The timer stops with the extension");
} finally {
  global.window = originalWindow;
  global.localStorage = originalStorage;
  global.document = originalDocument;
  global.setInterval = originalSetInterval;
  global.clearInterval = originalClearInterval;
  Module._load = originalLoad;
}
console.log("fish storage browser and VS Code host bridge tests passed");
