const assert = require("node:assert/strict");
const { advanceTravel } = require("../src/motion/locomotion.ts");
function simulate(fps, seconds, target = 1000) {
  let p = { x: 0, y: 0, velocityX: 0, velocityY: 0, arrived: false };
  for (let i = 0; i < fps * seconds; i++) p = advanceTravel(p.x, p.y, target, 0, p.velocityX, p.velocityY, 132, 1 / fps);
  return p;
}
const at30 = simulate(30, 1), at60 = simulate(60, 1), at144 = simulate(144, 1);
assert.ok(Math.abs(at30.x - at60.x) < 0.1);
assert.ok(Math.abs(at60.x - at144.x) < 0.5, "movement must be independent of refresh rate");
const start = advanceTravel(0, 0, 100, 0, 0, 0, 132, 1 / 60);
assert.ok(start.velocityX > 0 && start.velocityX < 132);
assert.ok(start.x < 132 / 60, "must accelerate instead of teleporting to full speed");
const reverse = advanceTravel(80, 0, 0, 0, 132, 0, 132, 1 / 60);
assert.ok(reverse.velocityX > 0 && reverse.velocityX < 132, "must brake before reversing");
for (const fps of [30, 60, 144]) {
  const arrival = simulate(fps, 3, 125);
  assert.equal(arrival.x, 125);
  assert.equal(arrival.velocityX, 0);
  assert.equal(arrival.arrived, true);
}
let diagonal = { x: 0, y: 0, velocityX: 0, velocityY: 0, arrived: false };
for (let i = 0; i < 500; i++) diagonal = advanceTravel(diagonal.x, diagonal.y, 73, 91, diagonal.velocityX, diagonal.velocityY, 90, 1 / 60);
assert.equal(diagonal.x, 73); assert.equal(diagonal.y, 91);
console.log("locomotion acceleration, braking, arrival and frame-rate tests passed");
