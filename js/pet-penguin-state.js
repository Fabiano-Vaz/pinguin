(() => {
  const modules = (window.PenguinPetModules = window.PenguinPetModules || {});

  modules.state = ({ actionStates }) => ({
    setState(state) {
      if (
        this.isWalkingAway &&
        this.customMotion &&
        this.customMotion.type === "returnAfterWalkAway" &&
        state !== "idle"
      ) {
        return;
      }
      if (this.isDragging && state !== "flying") return;
      if (this.currentState === state) return;
      this.currentState = state;
      this.img.src = actionStates[state];
    },

    setVisualState(state) {
      const requestedState = typeof state === "string" ? state : "idle";
      const normalizedState =
        requestedState === "default" ? "idle" : requestedState;

      this.setState(normalizedState);

      if (requestedState === "default" && actionStates.default) {
        this.img.src = actionStates.default;
      }
    },

    playStateSequence(sequence, onDone) {
      if (!Array.isArray(sequence) || sequence.length === 0) {
        if (typeof onDone === "function") onDone();
        return;
      }

      const runFrame = (index) => {
        const frame = sequence[index];
        if (!frame) {
          this.element.style.animation = "";
          if (!this.isMoving) this.setState("idle");
          if (typeof onDone === "function") onDone();
          return;
        }

        const frameState =
          typeof frame === "string"
            ? frame
            : typeof frame.state === "string"
              ? frame.state
              : "idle";

        this.element.style.animation = "";
        this.setVisualState(frameState);

        if (frame && typeof frame === "object") {
          if (frame.facing === "right" && !this.facingRight) {
            this.facingRight = true;
            this.applyTransform();
          } else if (frame.facing === "left" && this.facingRight) {
            this.facingRight = false;
            this.applyTransform();
          }

          if (frame.anim) this.element.style.animation = frame.anim;
          if (frame.speak) this.speak();
        }

        const frameDuration = this.scaleEmotionDuration(
          frame && typeof frame === "object" && frame.duration
            ? frame.duration
            : 900,
        );

        setTimeout(() => {
          this.element.style.animation = "";
          runFrame(index + 1);
        }, frameDuration);
      };

      runFrame(0);
    },

    startWingFlap() {
      this.img.style.animation = "wingFlap 0.18s ease-in-out infinite";
    },

    stopWingFlap() {
      this.img.style.animation = "";
    },

    startWaddleSteps() {
      this.img.style.animation = "waddle 0.34s ease-in-out infinite";
    },

    stopWaddleSteps() {
      this.img.style.animation = "";
    },

    applyTransform(flipOverride) {
      const flip =
        typeof flipOverride === "number"
          ? flipOverride
          : this.facingRight
            ? 1
            : -1;
      const depth = this.getDepthScale();
      this.element.style.transform = `scaleX(${flip}) scale(${this.visualScale * depth})`;
      // Ajusta z-index: mais ao fundo = menor z-index (atrás), mais à frente = maior
      const zBase = 10;
      const zRange = 8;
      this.element.style.zIndex = String(
        Math.round(zBase + ((depth - 0.65) / 0.35) * zRange),
      );
    },

    getDepthScale() {
      // y = 0 (topo da tela) → escala 0.65 (fundo/longe)
      // y = getWalkMaxY() (chão) → escala 1.0 (frente/perto)
      const groundY = this.getWalkMaxY();
      const ratio = Math.max(0, Math.min(1, this.y / Math.max(1, groundY)));
      return 0.65 + ratio * 0.35;
    },
  });
})();
