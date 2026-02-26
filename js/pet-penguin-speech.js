(() => {
  const modules = (window.PenguinPetModules = window.PenguinPetModules || {});

  modules.speech = ({
    BUBBLE_BASE_INTERVAL_MS,
    BUBBLE_INTERVAL_JITTER_MS,
    BUBBLE_SHOW_CHANCE,
    EMOTION_DURATION_MULTIPLIER,
    phrases,
    penguinSize,
    halfPenguinSize,
  }) => ({
    getNextBubbleDelay() {
      return (
        BUBBLE_BASE_INTERVAL_MS + Math.random() * BUBBLE_INTERVAL_JITTER_MS
      );
    },

    scheduleNextBubble() {
      this.nextBubbleAt = Date.now() + this.getNextBubbleDelay();
    },

    scaleEmotionDuration(durationMs) {
      return Math.max(
        300,
        Math.round(durationMs * EMOTION_DURATION_MULTIPLIER),
      );
    },

    playLaughThenIdleThenLaugh(totalDuration, onDone) {
      const duration = Math.max(
        900,
        this.scaleEmotionDuration(totalDuration || 2000),
      );
      const firstLaugh = Math.round(duration * 0.4);
      const neutral = Math.round(duration * 0.2);
      const secondLaugh = duration - firstLaugh - neutral;

      this.element.style.animation = "";
      this.setState("laughing");
      this.speak();

      setTimeout(() => {
        if (!this.isMoving) this.setState("idle");
        setTimeout(() => {
          this.setState("laughing");
          setTimeout(() => {
            this.element.style.animation = "";
            if (!this.isMoving) this.setState("idle");
            if (typeof onDone === "function") onDone();
          }, secondLaugh);
        }, neutral);
      }, firstLaugh);
    },

    showSpeech(text, durationMs = 3000, shouldReschedule = true) {
      if (this.bubble) this.bubble.remove();
      if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);

      if (!text) {
        if (shouldReschedule) this.scheduleNextBubble();
        return;
      }

      this.bubble = document.createElement("div");
      this.bubble.className = "speech-bubble";

      const content = document.createElement("div");
      content.className = "bubble-content";
      const escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      content.innerHTML = escaped.replace(
        /\*([^*]+)\*/g,
        "<strong>$1</strong>",
      );
      this.bubble.appendChild(content);

      const dot1 = document.createElement("span");
      dot1.className = "bubble-dot";
      this.bubble.appendChild(dot1);

      const dot2 = document.createElement("span");
      dot2.className = "bubble-dot";
      this.bubble.appendChild(dot2);

      const dot3 = document.createElement("span");
      dot3.className = "bubble-dot";
      this.bubble.appendChild(dot3);

      document.body.appendChild(this.bubble);
      this.updateBubblePosition();

      this.bubbleTimeout = setTimeout(() => {
        if (this.bubble) {
          this.bubble.remove();
          this.bubble = null;
        }
      }, durationMs);

      if (shouldReschedule) this.scheduleNextBubble();
    },

    speak() {
      const now = Date.now();
      if (now < this.nextBubbleAt) return;
      if (Math.random() > BUBBLE_SHOW_CHANCE) {
        this.scheduleNextBubble();
        return;
      }

      const list = phrases[this.currentState];
      const text = list[Math.floor(Math.random() * list.length)];
      this.showSpeech(text);
    },

    updateBubblePosition() {
      if (!this.bubble) return;

      const content = this.bubble.querySelector(".bubble-content");
      if (!content) return;

      const cw = content.offsetWidth || penguinSize;
      const ch = content.offsetHeight || 47;
      const viewportMargin = 8;

      let bubbleLeft = this.x + halfPenguinSize - cw / 2;
      bubbleLeft = Math.max(
        viewportMargin,
        Math.min(bubbleLeft, window.innerWidth - cw - viewportMargin),
      );

      let bubbleTop = this.y - ch - 24;
      if (bubbleTop < viewportMargin) {
        bubbleTop = this.y + penguinSize + 16;
      }

      this.bubble.style.left = bubbleLeft + "px";
      this.bubble.style.top = bubbleTop + "px";

      const dots = this.bubble.querySelectorAll(".bubble-dot");
      if (dots.length < 3) return;

      const isBelowPenguin = bubbleTop > this.y;
      const startX = cw / 2;
      const startY = isBelowPenguin ? 0 : ch;

      const penguinCX = this.x + halfPenguinSize - bubbleLeft;
      const penguinCY = this.y + halfPenguinSize - bubbleTop;

      const dx = penguinCX - startX;
      const dy = penguinCY - startY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = dx / dist;
      const ny = dy / dist;

      const specs = [
        { size: 10, gap: 10 },
        { size: 7, gap: 19 },
        { size: 4, gap: 27 },
      ];

      dots.forEach((dot, i) => {
        const { size, gap } = specs[i];
        dot.style.width = size + "px";
        dot.style.height = size + "px";
        dot.style.left = startX + nx * gap - size / 2 + "px";
        dot.style.top = startY + ny * gap - size / 2 + "px";
      });
    },
  });
})();
