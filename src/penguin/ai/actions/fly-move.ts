export const createFlyMoveAction = ({ SPEED_WALK }) => ({
  runStepFlyMove(step, { isFlowActive, setStepTimeout, setStepInterval }) {
    const baseY =
      typeof this.getGroundTopY === "function"
        ? this.getGroundTopY()
        : this.y;
    this.element.style.animation = "";
    if (typeof this.blowAwayUmbrella === "function") {
      this.blowAwayUmbrella(this.facingRight ? 1 : -1);
    }
    if (typeof this.startJumpArc === "function") {
      this.startJumpArc(this.x, baseY);
    }
    if (this.customMotion && this.customMotion.type === "jumpVertical") {
      // Fly mode should be a short hop, not a high arc.
      this.customMotion.vy *= 0.45;
      if (Number.isFinite(this.customMotion.jumpHeight)) {
        this.customMotion.jumpHeight *= 0.55;
      }
    }

    const flapCount = 2;
    const flapIntervalMs = 80;
    for (let flapIndex = 0; flapIndex < flapCount; flapIndex += 1) {
      setStepTimeout(
        `fly_flap_${flapIndex + 1}`,
        () => {
          if (!isFlowActive()) return;
          if (typeof this.boostJumpArc === "function") {
            this.boostJumpArc();
          }
        },
        45 + flapIndex * flapIntervalMs,
      );
    }

    const waitArrival = setStepInterval(
      "fly_wait_arrival",
      () => {
        if (!isFlowActive()) {
          clearInterval(waitArrival);
          return;
        }
        const isJumpMotion = this.customMotion && this.customMotion.type === "jumpVertical";
        if (!this.isMoving && !isJumpMotion && !this.isJumpLocked) {
          clearInterval(waitArrival);
          this.element.style.animation = "";
          this.speed = SPEED_WALK;
          if (!this.isMoving) this.setState("idle");
          const baseFlyDelay = step.duration || this.getStepTransitionDelay();
          const flyNextDelayMs =
            step && step.debugPinned
              ? Math.max(1400, Math.round(baseFlyDelay))
              : Math.max(260, Math.round(baseFlyDelay * 0.45));
          setStepTimeout(
            "fly_next_step",
            () => {
              if (!isFlowActive()) return;
              this.runNextStep();
            },
            flyNextDelayMs,
          );
        }
      },
      100,
    );
  },
});
