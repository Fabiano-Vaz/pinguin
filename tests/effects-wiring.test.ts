const assert = require("node:assert/strict");

const clearModule = (modulePath) => {
  const resolved = require.resolve(modulePath);
  delete require.cache[resolved];
};

{
  global.window = {
    PenguinPet: {
      constants: { a: 1 },
      phrases: { idle: ["oi"] },
    },
    PenguinPetEffects: {
      state: {
        snowSpawnIntervalId: 123,
        customFlag: true,
      },
    },
  };

  clearModule("../src/effects/effects-core.ts");
  require("../src/effects/effects-core.ts");

  assert.equal(typeof window.PenguinPetEffects.getPet, "function");
  assert.equal(typeof window.PenguinPetEffects.getConstants, "function");
  assert.equal(typeof window.PenguinPetEffects.getPhrases, "function");
  assert.equal(window.PenguinPetEffects.getConstants().a, 1);
  assert.equal(window.PenguinPetEffects.getPhrases().idle[0], "oi");
  assert.equal(window.PenguinPetEffects.state.customFlag, true);
  assert.equal(window.PenguinPetEffects.state.snowSpawnIntervalId, 123);
}

{
  const clickFn = () => "click";
  const rainFn = () => "rain";
  const customEffect = () => "custom";
  global.window = {
    PenguinPet: {
      effects: {
        customEffect,
      },
    },
    PenguinPetEffects: {
      createClickEffect: clickFn,
      startRainCycle: rainFn,
    },
  };

  clearModule("../src/effects-registry.ts");
  require("../src/effects-registry.ts");

  assert.equal(window.PenguinPet.effects.customEffect, customEffect);
  assert.equal(window.PenguinPet.effects.createClickEffect, clickFn);
  assert.equal(window.PenguinPet.effects.startRainCycle, rainFn);
}

console.log("effects wiring tests passed");
