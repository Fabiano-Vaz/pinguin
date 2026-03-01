const assert = require("node:assert/strict");

const clearModule = (modulePath) => {
  const resolved = require.resolve(modulePath);
  delete require.cache[resolved];
};

{
  global.window = {
    PenguinPetShared: {
      getActionStates: () => ({ idle: "assets/idle.svg", default: "assets/default.svg" }),
      getMergedConfig: () => ({
        size: 77,
        groundRatio: 0.8,
        backgroundImage: "assets/bg.png",
      }),
    },
    PENGUIN_ASSETS: {},
    PENGUIN_CONFIG: {
      constants: {
        pet: {
          speed: {
            walk: 1.8,
          },
        },
      },
    },
  };

  clearModule("../src/config/pet-config.ts");
  require("../src/config/pet-config.ts");

  assert.equal(window.PenguinPet.constants.penguinSize, 77);
  assert.equal(window.PenguinPet.constants.snowTopRatio, 0.8);
  assert.equal(window.PenguinPet.constants.backgroundImage, "assets/bg.png");
  assert.equal(window.PenguinPet.constants.SPEED_WALK, 1.5);
}

{
  global.window = {
    PenguinPet: {
      constants: {},
    },
    PENGUIN_CONFIG: {
      constants: {
        game: {
          runner: {
            debug: true,
            worldSpeedInitial: 250,
          },
        },
      },
    },
  };

  clearModule("../src/config/game-config.ts");
  require("../src/config/game-config.ts");

  assert.equal(window.PenguinPet.constants.game.runner.debug, true);
  assert.equal(window.PenguinPet.constants.game.runner.worldSpeedInitial, 250);
  assert.equal(window.PenguinPet.constants.runner.worldSpeedInitial, 250);
}

console.log("config bootstrap tests passed");
