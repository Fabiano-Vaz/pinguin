const assert = require("node:assert/strict");
const { PersonalityBrain } = require("../src/personality/personality-brain.ts");
const { PERSONALITY_ROUTINES } = require("../src/personality/routines.ts");
const { BehaviorSelectionService } = require("../src/services/behavior-selection-service.ts");

const tired = new PersonalityBrain({ energy: 10 }, () => 0.5);
assert.equal(tired.choose(PERSONALITY_ROUTINES, { state: "idle", fishStock: 5 }).intent, "rest");
assert.equal(tired.choose(PERSONALITY_ROUTINES, { state: "idle", fishStock: 0 }).intent, "fish");
for (let i = 0; i < 20; i++) tired.update(1, { state: "sleeping" });
assert.ok(tired.snapshot.energy > 60);
assert.notEqual(tired.snapshot.mood, "sleepy");
const friendly = new PersonalityBrain({}, () => 0.5);
const before = friendly.snapshot;
assert.equal(friendly.react("affection", 1000), true);
assert.equal(friendly.react("affection", 1200), false, "rapid input must not inflate affection");
assert.ok(friendly.snapshot.affection > before.affection);
assert.equal(friendly.react("affection", 3000), true);
friendly.react("overwhelmed", 5000);
assert.ok(friendly.snapshot.calm < before.calm);
for (let i = 0; i < 200; i++) friendly.update(1, { state: "idle" });
assert.equal(friendly.snapshot.calm, 100);
for (const value of Object.values(friendly.snapshot).filter(v => typeof v === "number")) assert.ok(value >= 0 && value <= 100);
assert.notEqual(friendly.pickLine(["oi", "olá"]), friendly.pickLine(["oi", "olá"]));
const copy = friendly.snapshot; copy.energy = -100;
assert.ok(friendly.snapshot.energy >= 0, "debug consumers cannot mutate the brain");
const invalid = new PersonalityBrain({ energy: NaN, affection: Infinity });
invalid.update(NaN, { state: "idle" });
assert.ok(Number.isFinite(invalid.snapshot.energy));

let seed = 21;
const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const varied = new PersonalityBrain({}, random);
let previous = "", repeated = 0;
for (let i = 0; i < 150; i++) {
  const choice = varied.choose(PERSONALITY_ROUTINES, { state: "idle", fishStock: 8 });
  if (choice.id === previous) repeated++;
  previous = choice.id;
}
assert.ok(repeated < 10, `too many repeated routines: ${repeated}`);
const planner = new BehaviorSelectionService({ personality: tired, getFishStock: () => 0 });
const routine = planner.chooseNextBehavior();
const first = routine(); first[0].state = "corrupted";
assert.notEqual(routine()[0].state, "corrupted", "each execution must own its steps");
assert.ok(routine().some(step => step.state === "fishing"));
const fishingBrain = new PersonalityBrain({}, () => 0.5);
assert.ok(fishingBrain.score("fish", { state: "idle", fishStock: 3 }) > fishingBrain.score("explore", { state: "idle", fishStock: 3 }), "At three fish the penguin should prioritize replenishing stock");
assert.ok(fishingBrain.score("fish", { state: "idle", fishStock: 20 }) < fishingBrain.score("explore", { state: "idle", fishStock: 20 }), "With enough fish, exploration should take priority over fishing");
console.log("personality needs, memory, priorities and interruption-safe plan tests passed");
