import type { PersonalityEvent } from "../personality/personality-brain.ts";

export const createPersonalityMethods = ({ runtime, halfPenguinSize }) => ({
  getPersonalityContext() {
    const effects = window.PenguinPet?.effects;
    return {
      state: this.currentState || "idle",
      moving: this.isMoving,
      raining: Boolean(effects?.isRaining?.()),
      pointerNearby: runtime.isMouseInsideViewport && Math.hypot(runtime.mouseX - this.x - halfPenguinSize, runtime.mouseY - this.y - halfPenguinSize) < 180,
    };
  },
  updatePersonality(dt: number) {
    if (!this.personality || document.hidden || document.body.classList.contains("runner-mode") || document.body.classList.contains("memory-mode")) return;
    this.personality.update(dt, this.getPersonalityContext());
  },
  reactPersonality(event: PersonalityEvent) {
    return this.personality?.react(event) || false;
  },
  sayPersonality(line: string) {
    if (!line || Date.now() < (this.personalitySpeechAt || 0)) return;
    this.personalitySpeechAt = Date.now() + 8000;
    this.showSpeech(line, 3400);
  },
  reactToAffection() {
    if (this.isTemporaryDead || this.isCaveirinhaMode || this.isCruzeiroMode || this.isFullBellySequenceActive || this.isDragging || this.isJumpLocked) return;
    this.invalidateBehaviorFlow();
    this.reactPersonality("affection");
    this.isChasing = false;
    this.isMoving = false;
    this.velocityX = 0;
    this.velocityY = 0;
    this.targetX = this.x;
    this.targetY = this.y;
    this.aiLocked = true;
    this.stepQueue = [];
    this.sleepWakeLockUntil = 0;
    this.element.style.animation = "";
    this.setState(this.personality.snapshot.affection > 70 ? "thinking" : "shy");
    this.sayPersonality(this.personality.pickLine([
      "carinho recebido. fofura aumentando ♡",
      "opa... meu ponto fraco é cafuné",
      "pronto, agora somos uma dupla",
      "esse carinho vale uns três peixinhos",
    ]));
    const flow = this.behaviorFlowToken;
    this.setManagedTimeout("behavior_step", "affection-finish", () => {
      if (!this.isBehaviorFlowActive(flow) || this.isDragging) return;
      this.setState("idle");
      this.aiLocked = false;
      this.scheduleNextBehavior();
    }, 2400);
  },
});
