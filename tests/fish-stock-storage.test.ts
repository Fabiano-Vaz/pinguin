const assert = require("node:assert/strict");
const Module = require("node:module");
const { FISH_STOCK_KEY } = require("../src/runtime/fish-stock-ledger.ts");
const originalWindow = global.window;
const originalStorage = global.localStorage;
const originalLoad = Module._load;
const saved = { version: 1, batches: [{ amount: 12, expiresAt: 2000000000000 }] };
const entries = new Map();
let provider;
let received;
let disposed = false;
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
  global.window = {
    PENGUIN_FISH_STOCK: saved,
    acquireVsCodeApi: () => { acquired++; return { postMessage: (message) => messages.push(message) }; },
  };
  const hostStorage = createFishStockStorage();
  assert.deepEqual(hostStorage.load(), saved);
  hostStorage.save({ version: 1, batches: [] });
  createFishStockStorage();
  assert.equal(acquired, 1, "VS Code API can only be acquired once");
  assert.deepEqual(messages[0], { type: "penguin:save-fish-stock", snapshot: { version: 1, batches: [] } });
  window.PENGUIN_FISH_STOCK = null;
  assert.equal(hostStorage.load(), null, "VS Code does not inherit browser preview funds");

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
  const makeView = () => ({
    onDidDispose: (callback) => { disposed = callback; },
    webview: {
      cspSource: "vscode-webview:", asWebviewUri: (value) => value,
      onDidReceiveMessage: (callback) => { received = callback; return { dispose() {} }; },
    },
  });
  let view = makeView();
  provider.resolveWebviewView(view);
  assert.ok(view.webview.html.includes(`window.PENGUIN_FISH_STOCK = ${JSON.stringify(saved)};`));
  received(messages[0]);
  assert.deepEqual(disk.get(FISH_STOCK_KEY), { version: 1, batches: [] });
  received({ type: "unrelated", snapshot: saved });
  received({ type: "penguin:save-fish-stock", snapshot: { version: 99 } });
  assert.deepEqual(disk.get(FISH_STOCK_KEY), { version: 1, batches: [] }, "Invalid host messages cannot replace funds");
  disposed();
  view = makeView();
  provider.resolveWebviewView(view);
  assert.ok(view.webview.html.includes('window.PENGUIN_FISH_STOCK = {"version":1,"batches":[]};'), "Recreated views restore persisted empty funds");
} finally {
  global.window = originalWindow;
  global.localStorage = originalStorage;
  Module._load = originalLoad;
}
console.log("fish storage browser and VS Code host bridge tests passed");
