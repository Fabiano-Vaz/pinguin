export type TravelResult = { x: number; y: number; velocityX: number; velocityY: number; arrived: boolean };

/** Speeds are pixels/second; substeps keep acceleration and braking stable across frame rates. */
export function advanceTravel(x: number, y: number, targetX: number, targetY: number, vx: number, vy: number, maxSpeed: number, dt: number): TravelResult {
  let remaining = Math.max(0, Math.min(0.05, dt));
  while (remaining > 0.000001) {
    const step = Math.min(remaining, 1 / 240);
    remaining -= step;
    const dx = targetX - x, dy = targetY - y, distance = Math.hypot(dx, dy);
    if (distance < 0.6) return { x: targetX, y: targetY, velocityX: 0, velocityY: 0, arrived: true };
    const acceleration = 620, braking = 760;
    const desiredSpeed = Math.min(Math.max(0, maxSpeed), Math.sqrt(2 * braking * distance));
    const desiredX = dx / distance * desiredSpeed, desiredY = dy / distance * desiredSpeed;
    const changeX = desiredX - vx, changeY = desiredY - vy, change = Math.hypot(changeX, changeY);
    const limit = (Math.hypot(vx, vy) > desiredSpeed ? braking : acceleration) * step;
    const blend = change > limit ? limit / change : 1;
    vx += changeX * blend; vy += changeY * blend;
    const nextX = vx * step, nextY = vy * step;
    if (nextX * dx + nextY * dy > 0 && Math.hypot(nextX, nextY) >= distance) {
      return { x: targetX, y: targetY, velocityX: 0, velocityY: 0, arrived: true };
    }
    x += nextX; y += nextY;
  }
  return { x, y, velocityX: vx, velocityY: vy, arrived: false };
}
