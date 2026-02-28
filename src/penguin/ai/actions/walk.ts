export const createWalkAction = ({ SPEED_WALK, SPEED_WALK_FAST, halfPenguinSize }) => ({
  runStepWalk(step, { isFlowActive, setStepTimeout, setStepInterval }) {
    const sp = step.type === "walkFast" ? SPEED_WALK_FAST : SPEED_WALK;
    const t =
      step.type === "walkEdge"
        ? this.randomTarget(true)
        : step.type === "walkShort"
          ? this.randomShortWalkTarget()
          : this.randomTarget(false);
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
            this.getStepTransitionDelay(),
          );
        }
      },
      100,
    );
  },
});
