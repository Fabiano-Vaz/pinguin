(() => {
  type SpeechFactoryArgs = {
    BUBBLE_BASE_INTERVAL_MS: number;
    BUBBLE_INTERVAL_JITTER_MS: number;
    BUBBLE_SHOW_CHANCE: number;
    EMOTION_DURATION_MULTIPLIER: number;
    phrases: Record<string, string[]>;
    halfPenguinSize: number;
  };

  type SpeechHost = {
    nextBubbleAt?: number;
    currentState?: string;
    isMoving?: boolean;
    x: number;
    y: number;
    setState: (state: string) => void;
    speak: () => void;
    showSpeech: (text: string, durationMs?: number, shouldReschedule?: boolean) => void;
    scheduleNextBubble: () => void;
  };

  const hostWindow = window as Window & {
    PenguinPetModules?: Record<string, unknown>;
    PenguinPet?: {
      runtime?: {
        emitEvent?: (eventName: string, payload: unknown) => void;
      };
    };
  };
  const modules = (hostWindow.PenguinPetModules = hostWindow.PenguinPetModules || {});

  modules.speech = ({
    BUBBLE_BASE_INTERVAL_MS,
    BUBBLE_INTERVAL_JITTER_MS,
    BUBBLE_SHOW_CHANCE,
    EMOTION_DURATION_MULTIPLIER,
    phrases,
    halfPenguinSize,
  }: SpeechFactoryArgs) => ({
    getNextBubbleDelay() {
      return BUBBLE_BASE_INTERVAL_MS + Math.random() * BUBBLE_INTERVAL_JITTER_MS;
    },

    scheduleNextBubble(this: SpeechHost & { getNextBubbleDelay: () => number }) {
      this.nextBubbleAt = Date.now() + this.getNextBubbleDelay();
    },

    scaleEmotionDuration(durationMs: number) {
      return Math.max(300, Math.round(durationMs * EMOTION_DURATION_MULTIPLIER));
    },

    playLaughThenIdleThenLaugh(this: SpeechHost, _totalDuration: number, onDone?: () => void) {
      this.setState("laughing");
      this.speak();
      if (!this.isMoving) this.setState("idle");
      if (typeof onDone === "function") onDone();
    },

    showSpeech(this: SpeechHost, text: string, durationMs = 3000, shouldReschedule = true) {
      if (!text) {
        if (shouldReschedule) this.scheduleNextBubble();
        return;
      }

      const runtime = hostWindow.PenguinPet?.runtime || {};
      if (typeof runtime.emitEvent === "function") {
        runtime.emitEvent("ui:speech:show", {
          text,
          x: this.x + halfPenguinSize,
          y: this.y,
          durationMs,
          source: "legacy",
        });
      }

      if (shouldReschedule) this.scheduleNextBubble();
    },

    speak(this: SpeechHost) {
      const now = Date.now();
      if (typeof this.nextBubbleAt === "number" && now < this.nextBubbleAt) return;
      if (Math.random() > BUBBLE_SHOW_CHANCE) {
        this.scheduleNextBubble();
        return;
      }

      const currentState = this.currentState ?? "idle";
      const list = Array.isArray(phrases[currentState])
        ? phrases[currentState]
        : Array.isArray(phrases.idle)
          ? phrases.idle
          : ["..."];
      if (list.length === 0) {
        this.scheduleNextBubble();
        return;
      }

      const text = list[Math.floor(Math.random() * list.length)];
      this.showSpeech(text);
    },

    updateBubblePosition() {
      // Speech rendering is managed by UIScene.
    },
  });
})();

export {};
