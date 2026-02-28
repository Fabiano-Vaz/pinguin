(() => {
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
    const uid = "bg" + Date.now();
    const svgNS = "http://www.w3.org/2000/svg";
    const viewWidth = 90;
    const viewHeight = 460;
    const startX = 45;
    const segments = 7;
    const stepY = viewHeight / segments;

    const points = [];
    let currentX = startX;
    points.push(`${startX},0`);
    for (let i = 1; i < segments; i += 1) {
      const sway = (Math.random() * 2 - 1) * 20;
      currentX = Math.max(12, Math.min(viewWidth - 12, currentX + sway));
      points.push(`${currentX.toFixed(1)},${Math.round(stepY * i)}`);
    }
    const finalX = Math.max(
      10,
      Math.min(viewWidth - 10, currentX + (Math.random() * 2 - 1) * 14),
    );
    points.push(`${finalX.toFixed(1)},${viewHeight}`);
    const mainPoints = points.join(" ");

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", `0 0 ${viewWidth} ${viewHeight}`);
    svg.style.cssText =
      "position:fixed;top:0;left:" +
      (x - viewWidth / 2) +
      "px;width:" +
      viewWidth +
      "px;height:95vh;" +
      "pointer-events:none;z-index:9998;overflow:visible;" +
      "filter:drop-shadow(0 0 7px #fff) drop-shadow(0 0 16px #e7f6ff) drop-shadow(0 0 28px #c9e5ff);";

    const defs = document.createElementNS(svgNS, "defs");
    const grad = document.createElementNS(svgNS, "linearGradient");
    grad.setAttribute("id", uid);
    grad.setAttribute("x1", "0");
    grad.setAttribute("y1", "0");
    grad.setAttribute("x2", "0");
    grad.setAttribute("y2", "1");
    [
      ["0%", "#ffffff"],
      ["30%", "#fff176"],
      ["70%", "#ffeb3b"],
      ["100%", "#ff6f00"],
    ].forEach((stopData) => {
      const stop = document.createElementNS(svgNS, "stop");
      stop.setAttribute("offset", stopData[0]);
      stop.setAttribute("stop-color", stopData[1]);
      grad.appendChild(stop);
    });
    defs.appendChild(grad);
    svg.appendChild(defs);

    const PATH_LEN = 640;

    const halo = document.createElementNS(svgNS, "polyline");
    halo.setAttribute("points", mainPoints);
    halo.setAttribute("fill", "none");
    halo.setAttribute("stroke", "url(#" + uid + ")");
    halo.setAttribute("stroke-width", "10");
    halo.setAttribute("stroke-linecap", "round");
    halo.setAttribute("stroke-linejoin", "round");
    halo.setAttribute("stroke-opacity", "0.34");
    halo.style.strokeDasharray = PATH_LEN;
    halo.style.strokeDashoffset = PATH_LEN;
    halo.classList.add("bolt-path");
    svg.appendChild(halo);

    const core = document.createElementNS(svgNS, "polyline");
    core.setAttribute("points", mainPoints);
    core.setAttribute("fill", "none");
    core.setAttribute("stroke", "url(#" + uid + ")");
    core.setAttribute("stroke-width", "3.2");
    core.setAttribute("stroke-linecap", "round");
    core.setAttribute("stroke-linejoin", "round");
    core.style.strokeDasharray = PATH_LEN;
    core.style.strokeDashoffset = PATH_LEN;
    core.classList.add("bolt-path");
    svg.appendChild(core);

    const branchCount = Math.random() < 0.4 ? 1 : 2;
    for (let i = 0; i < branchCount; i += 1) {
      const branchStartIndex = 1 + Math.floor(Math.random() * (segments - 2));
      const [bx, by] = points[branchStartIndex].split(",").map(Number);
      const dir = Math.random() < 0.5 ? -1 : 1;
      const b1x = Math.max(
        6,
        Math.min(viewWidth - 6, bx + dir * (10 + Math.random() * 16)),
      );
      const b1y = Math.min(viewHeight - 50, by + 36 + Math.random() * 40);
      const b2x = Math.max(
        6,
        Math.min(viewWidth - 6, b1x + dir * (8 + Math.random() * 16)),
      );
      const b2y = Math.min(viewHeight - 8, b1y + 28 + Math.random() * 48);
      const branchPoints = `${bx},${by} ${b1x.toFixed(1)},${b1y.toFixed(1)} ${b2x.toFixed(1)},${b2y.toFixed(1)}`;
      const branch = document.createElementNS(svgNS, "polyline");
      branch.setAttribute("points", branchPoints);
      branch.setAttribute("fill", "none");
      branch.setAttribute("stroke", "url(#" + uid + ")");
      branch.setAttribute("stroke-width", "2.1");
      branch.setAttribute("stroke-linecap", "round");
      branch.setAttribute("stroke-linejoin", "round");
      branch.style.strokeDasharray = "180";
      branch.style.strokeDashoffset = "180";
      branch.classList.add("bolt-branch");
      branch.style.animationDelay = `${(0.05 + Math.random() * 0.11).toFixed(3)}s`;
      svg.appendChild(branch);
    }

    document.body.appendChild(svg);
    setTimeout(() => {
      svg.remove();
    }, 860);
  }

  Object.assign(effects, {
    scarePenguinFromLightning,
    createLightningFlash,
    createLightningBolt,
  });
})();
