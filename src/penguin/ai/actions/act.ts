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
    this.setState(step.state);
    this.speak();
    if (step.anim) this.element.style.animation = step.anim;

    setStepTimeout(
      "act_next_step",
      () => {
        if (!isFlowActive()) return;
        this.element.style.animation = "";
        if (!this.isMoving) this.setState("idle");
        this.insertWalkBetweenEmotionSteps(step);
        this.runNextStep();
      },
      actDuration,
    );
  },
});
