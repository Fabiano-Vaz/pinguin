export {};

  const effects = (window.PenguinPetEffects = window.PenguinPetEffects || {});

  function scarePenguinFromLightning() {
    const constants = effects.getConstants ? effects.getConstants() : {};
    const state = effects.state || {};
    const now = Date.now();
    const scareCooldownMs = Number.isFinite(constants.RAIN_LIGHTNING_SCARE_COOLDOWN_MS)
      ? constants.RAIN_LIGHTNING_SCARE_COOLDOWN_MS
      : 2200;
    if (now - state.lastLightningScareAt < scareCooldownMs) return;
    state.lastLightningScareAt = now;

    const penguin = window.PenguinPet && window.PenguinPet.penguin;
    if (!penguin || penguin.isFishingActive || penguin.isDragging) return;
    if (typeof penguin.setState !== "function") return;

    penguin.reactPersonality?.("startled");
    penguin.setState("scared");
    setTimeout(() => {
      if (
        typeof penguin.setState === "function" &&
        !penguin.isMoving &&
        !penguin.currentFoodTarget &&
        !penguin.isFishingActive
      ) {
        penguin.setState("idle");
      }
    }, 900);
  }

  function createLightningFlash() {
    const overlay = document.createElement("div");
    overlay.className = "lightning-flash";
    const maxOpacity = 0.58 + Math.random() * 0.32;
    const duration = 0.2 + Math.random() * 0.28;
    overlay.style.setProperty("--lightning-max-opacity", maxOpacity.toFixed(2));
    overlay.style.animationDuration = `${duration.toFixed(3)}s`;
    document.body.appendChild(overlay);
    overlay.addEventListener("animationend", () => overlay.remove(), {
      once: true,
    });
    scarePenguinFromLightning();
  }

  function createLightningBolt(x) {
    const viewWidth = 90;
    const viewHeight = 460;
    const segments = 7;
    const points: [number, number][] = [[45, 0]];
    let currentX = 45;
    for (let i = 1; i < segments; i += 1) {
      currentX = Math.max(12, Math.min(78, currentX + (Math.random() * 2 - 1) * 20));
      points.push([currentX, Math.round((viewHeight / segments) * i)]);
    }
    points.push([Math.max(10, Math.min(80, currentX + (Math.random() * 2 - 1) * 14)), viewHeight]);

    const bolt = document.createElement("div");
    bolt.className = "lightning-bolt";
    bolt.style.left = `${x - viewWidth / 2}px`;
    const scale = Math.min(1, (window.innerHeight * 0.95) / viewHeight);
    bolt.style.top = `${Math.max(0, (window.innerHeight * 0.95 - viewHeight) / 2)}px`;
    bolt.style.transform = `scale(${scale})`;

    // Trace both sides of a stroke as a CSS polygon, with joined corners.
    const outline = (vertices: [number, number][], width: number) => {
      const sides = [1, -1].map((side) => vertices.map(([px, py], i) => {
        const before = vertices[Math.max(0, i - 1)];
        const after = vertices[Math.min(vertices.length - 1, i + 1)];
        const dx = after[0] - before[0];
        const dy = after[1] - before[1];
        const length = Math.hypot(dx, dy) || 1;
        return `${((px - (dy / length) * width * side / 2) / viewWidth) * 100}% ${((py + (dx / length) * width * side / 2) / viewHeight) * 100}%`;
      }));
      return `polygon(${[...sides[0], ...sides[1].reverse()].join(",")})`;
    };
    const addStroke = (vertices: [number, number][], width: number, branch = false, halo = false) => {
      const reveal = document.createElement("div");
      reveal.className = branch ? "bolt-branch" : "bolt-path";
      if (branch) reveal.style.animationDelay = `${0.05 + Math.random() * 0.11}s`;
      const stroke = document.createElement("div");
      stroke.className = "lightning-stroke";
      stroke.style.clipPath = outline(vertices, width);
      if (halo) stroke.style.opacity = "0.34";
      reveal.appendChild(stroke);
      bolt.appendChild(reveal);
    };
    addStroke(points, 10, false, true);
    addStroke(points, 3.2);

    const branchCount = Math.random() < 0.4 ? 1 : 2;
    for (let i = 0; i < branchCount; i += 1) {
      const [bx, by] = points[1 + Math.floor(Math.random() * (segments - 2))];
      const dir = Math.random() < 0.5 ? -1 : 1;
      const b1x = Math.max(6, Math.min(84, bx + dir * (10 + Math.random() * 16)));
      const b1y = Math.min(viewHeight - 50, by + 36 + Math.random() * 40);
      const b2x = Math.max(6, Math.min(84, b1x + dir * (8 + Math.random() * 16)));
      const b2y = Math.min(viewHeight - 8, b1y + 28 + Math.random() * 48);
      addStroke([[bx, by], [b1x, b1y], [b2x, b2y]], 2.1, true);
    }
    document.body.appendChild(bolt);
    setTimeout(() => bolt.remove(), 860);
  }

  Object.assign(effects, {
    scarePenguinFromLightning,
    createLightningFlash,
    createLightningBolt,
  });
