const assert = require("node:assert/strict");

const clearModule = (modulePath) => {
  const resolved = require.resolve(modulePath);
  delete require.cache[resolved];
};

(() => {
  let callCount = 0;
  global.window = {
    PenguinPetModules: {
      bootstrapPetApp: () => {
        callCount += 1;
      },
    },
  };

  clearModule("../src/main.ts");
  require("../src/main.ts");
  assert.equal(callCount, 1);
})();

(() => {
  global.window = {
    PenguinPetModules: {},
  };

  clearModule("../src/main.ts");
  assert.doesNotThrow(() => {
    require("../src/main.ts");
  });
})();

console.log("main entry tests passed");
