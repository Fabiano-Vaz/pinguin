export const createSequenceAction = () => ({
  runStepSequence(step, { isFlowActive }) {
    this.playStateSequence(step.steps, () => {
      if (!isFlowActive()) return;
      this.runNextStep();
    });
  },
});
