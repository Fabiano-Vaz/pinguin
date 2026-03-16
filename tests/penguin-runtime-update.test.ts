const assert = require("node:assert/strict");

const clearModule = (modulePath) => {
  const resolved = require.resolve(modulePath);
  delete require.cache[resolved];
};

global.window = {
  PenguinPetModules: {},
};

clearModule("../src/penguin/penguin-runtime-update.ts");
require("../src/penguin/penguin-runtime-update.ts");

const runtimeUpdateModule = window.PenguinPetModules.penguinRuntimeUpdate({
  runtime: {},
  halfPenguinSize: 43,
  penguinSize: 86,
});

{
  const originalDateNow = Date.now;
  let now = 1_000;
  Date.now = () => now;

  try {
    const stateChanges = [];
    const penguin = {
      currentState: "jumping",
      customMotion: null,
      isJumpLocked: true,
      isCruzeiroMode: false,
      isFishingActive: false,
      isEatingFood: false,
      isCursorTouchEating: false,
      currentFoodTarget: null,
      isMoving: false,
      isWalkingAway: false,
      isDragging: false,
      aiLocked: false,
      stepQueue: [],
      element: { style: { animation: "" } },
      recoverStuckJumpState: runtimeUpdateModule.recoverStuckJumpState,
      unlockVisualSprite() {},
      setState(state) {
        this.currentState = state;
        stateChanges.push(state);
      },
    };

    runtimeUpdateModule.recoverInvalidPose.call(penguin);
    assert.equal(penguin.isJumpLocked, true);
    assert.equal(penguin.currentState, "jumping");

    now += 1300;
    runtimeUpdateModule.recoverInvalidPose.call(penguin);
    assert.equal(penguin.isJumpLocked, false);
    assert.equal(penguin.currentState, "idle");
    assert.deepEqual(stateChanges, ["idle"]);
  } finally {
    Date.now = originalDateNow;
  }
}

{
  const originalDateNow = Date.now;
  let now = 5_000;
  Date.now = () => now;

  try {
    const penguin = {
      currentState: "jumping",
      customMotion: null,
      isJumpLocked: true,
      isCruzeiroMode: true,
      isFishingActive: false,
      isEatingFood: false,
      isCursorTouchEating: false,
      currentFoodTarget: null,
      isMoving: false,
      isWalkingAway: false,
      isDragging: false,
      aiLocked: false,
      stepQueue: [],
      element: { style: { animation: "jumping 1s infinite" } },
      recoverStuckJumpState: runtimeUpdateModule.recoverStuckJumpState,
      unlockVisualSprite() {
        throw new Error("should not recover during cruzeiro jump");
      },
      setState() {
        throw new Error("should not change state during cruzeiro jump");
      },
    };

    now += 2000;
    runtimeUpdateModule.recoverInvalidPose.call(penguin);
    assert.equal(penguin.isJumpLocked, true);
    assert.equal(penguin.currentState, "jumping");
  } finally {
    Date.now = originalDateNow;
  }
}

console.log("penguin runtime update tests passed");
