const assert = require("node:assert/strict");
const {
  ASSET_FILES,
  DEFAULT_CONFIG,
  buildAssetPaths,
  getActionStates,
  getMergedConfig,
} = require("../src/manifest.ts");

(() => {
  const built = buildAssetPaths((fileName) => `/static/${fileName}`);
  assert.equal(built.idle, "/static/pinguin sentado balançando os pezinhos.svg");
  assert.equal(built.flying, "/static/pinguin voando.svg");
})();

(() => {
  const actionStates = getActionStates({
    idle: "assets/custom-idle.svg",
    flying: "assets/custom-flying.svg",
    invalid: "ignored.svg",
  });

  assert.equal(actionStates.idle, "assets/custom-idle.svg");
  assert.equal(actionStates.flying, "assets/custom-flying.svg");
  assert.equal(actionStates.default, "assets/pinguin.svg");
  assert.equal(typeof actionStates.invalid, "undefined");
})();

(() => {
  const merged = getMergedConfig({
    size: 120,
    groundRatio: 0.72,
    backgroundImage: "assets/custom-bg.png",
  });
  assert.equal(merged.size, 120);
  assert.equal(merged.groundRatio, 0.72);
  assert.equal(merged.backgroundImage, "assets/custom-bg.png");
})();

(() => {
  const merged = getMergedConfig({
    size: -10,
    groundRatio: 3,
    backgroundImage: "   ",
  });
  assert.equal(merged.size, DEFAULT_CONFIG.size);
  assert.equal(merged.groundRatio, DEFAULT_CONFIG.groundRatio);
  assert.equal(merged.backgroundImage, DEFAULT_CONFIG.backgroundImage);
})();

(() => {
  assert.equal(typeof ASSET_FILES.trace, "string");
  assert.ok(Object.keys(ASSET_FILES).length > 10);
})();

console.log("manifest tests passed");
