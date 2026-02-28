export const createJumpMoveAction = ({ SPEED_WALK, SPEED_WALK_FAST }) => ({
  runStepJumpMove(step, { isFlowActive, setStepTimeout, setStepInterval }) {
    const baseY =
      typeof this.getGroundTopY === "function"
        ? this.getGroundTopY()
        : this.y;
    this.speed = SPEED_WALK_FAST;
    this.speak();
    this.element.style.animation = "";
    this.startJumpArc(this.x, baseY);

    const waitArrival = setStepInterval(
      "jump_wait_arrival",
      () => {
        if (!isFlowActive()) {
          clearInterval(waitArrival);
          return;
        }
        if (!this.isMoving) {
          clearInterval(waitArrival);
          this.speed = SPEED_WALK;
          if (!this.isMoving) this.setState("idle");
          setStepTimeout(
            "jump_next_step",
            () => {
              if (!isFlowActive()) return;
              this.runNextStep();
            },
            step.duration || this.getStepTransitionDelay(),
          );
        }
      },
      100,
    );
  },
});
