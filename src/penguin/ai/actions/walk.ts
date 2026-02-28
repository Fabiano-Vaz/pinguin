export const createWalkAction = ({ SPEED_WALK, SPEED_WALK_FAST, halfPenguinSize }) => ({
  runStepWalk(step, { isFlowActive, setStepTimeout, setStepInterval }) {
    const sp = step.type === "walkFast" ? SPEED_WALK_FAST : SPEED_WALK;
    const pickTarget = () =>
      step.type === "walkEdge"
        ? this.randomTarget(true)
        : step.type === "walkShort"
          ? this.randomShortWalkTarget()
          : this.randomTarget(false);
    let t = pickTarget();
    const minDistancePx =
      Number.isFinite(step.minDistancePx) && step.minDistancePx > 0 ? step.minDistancePx : 0;
    if (minDistancePx > 0) {
      const currentCenterX = this.x + halfPenguinSize;
      const currentCenterY = this.y + halfPenguinSize;
      const distanceFromCurrent = (candidate) => {
        if (!candidate || !Number.isFinite(candidate.x) || !Number.isFinite(candidate.y)) return 0;
        const dx = candidate.x + halfPenguinSize - currentCenterX;
        const dy = candidate.y + halfPenguinSize - currentCenterY;
        return Math.hypot(dx, dy);
      };
      let attempts = 0;
      while (attempts < 6 && distanceFromCurrent(t) < minDistancePx) {
        t = pickTarget();
        attempts += 1;
      }
    }
    this.speed = sp;
    this.moveToPosition(t.x + halfPenguinSize, t.y + halfPenguinSize);

    const waitArrival = setStepInterval(
      "walk_wait_arrival",
      () => {
        if (!isFlowActive()) {
          clearInterval(waitArrival);
          return;
        }
        if (!this.isMoving) {
          clearInterval(waitArrival);
          this.speed = SPEED_WALK;
          setStepTimeout(
            "walk_next_step",
            () => {
              if (!isFlowActive()) return;
              this.runNextStep();
            },
            Number.isFinite(step.holdAfterMs) && step.holdAfterMs >= 0
              ? step.holdAfterMs
              : this.getStepTransitionDelay(),
          );
        }
      },
      100,
    );
  },
});
