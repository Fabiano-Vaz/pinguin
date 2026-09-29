export const createActAction = () => ({
  runStepAct(step, { isFlowActive, setStepTimeout }) {
    if (step.state === "fishing") {
      this.runFishingAction(step);
      return;
    }

    const actDuration = this.scaleEmotionDuration(step.duration || 1200);

    if (step.state === "laughing") {
      this.playLaughThenIdleThenLaugh(actDuration, () => {
        if (!isFlowActive()) return;
        this.runNextStep();
      });
      return;
    }

    this.element.style.animation = "";
    this.isMoving = false;
    this.targetX = this.x;
    this.targetY = this.y;
    this.setState(step.state);
    if (step.line) this.sayPersonality?.(step.line);
    else if (!step.quiet) this.speak();
    if (step.anim) this.element.style.animation = step.anim;

    setStepTimeout(
      "act_next_step",
      () => {
        if (!isFlowActive()) return;
        this.element.style.animation = "";
        // The next planned action owns its transition; avoid a one-frame idle flash.
        if (!this.stepQueue.length && !this.isMoving) this.setState("idle");
        this.runNextStep();
      },
      actDuration,
    );
  },
});
