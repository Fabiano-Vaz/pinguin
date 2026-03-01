export {};

import { getPenguinRunnerModules } from "../../runtime/webview-globals.ts";
import type { RunnerDebugTools, RunnerGameState, UnknownRecord } from "../../types/webview-runtime.ts";

const modules = getPenguinRunnerModules();

modules.createDebugTools = ({
  DEBUG,
  game,
  runnerConfig,
  debugCollisionDot,
  debugHitboxLayer,
}: {
  DEBUG: boolean;
  game: RunnerGameState;
  runnerConfig: UnknownRecord;
  debugCollisionDot: HTMLDivElement;
  debugHitboxLayer: HTMLDivElement;
}): RunnerDebugTools => {
  const debugHitboxPool: HTMLDivElement[] = [];

  const showDebugCollisionDot = (
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number },
  ): void => {
    if (!DEBUG) return;

    const overlapLeft = Math.max(a.x, b.x);
    const overlapTop = Math.max(a.y, b.y);
    const overlapRight = Math.min(a.x + a.width, b.x + b.width);
    const overlapBottom = Math.min(a.y + a.height, b.y + b.height);
    const hasOverlap = overlapRight > overlapLeft && overlapBottom > overlapTop;

    const centerX = hasOverlap
      ? overlapLeft + (overlapRight - overlapLeft) / 2
      : b.x + b.width / 2;
    const centerY = hasOverlap
      ? overlapTop + (overlapBottom - overlapTop) / 2
      : b.y + b.height / 2;

    debugCollisionDot.style.left = `${Math.round(centerX)}px`;
    debugCollisionDot.style.top = `${Math.round(centerY)}px`;
    debugCollisionDot.classList.add("is-visible");

    if (game.debugCollisionHideTimeoutId) {
      clearTimeout(game.debugCollisionHideTimeoutId);
    }

    game.debugCollisionHideTimeoutId = window.setTimeout(() => {
      debugCollisionDot.classList.remove("is-visible");
      game.debugCollisionHideTimeoutId = 0;
    }, Number(runnerConfig.debugCollisionHideMs) || 160);
  };

  const clearDebugHitboxes = (): void => {
    debugHitboxPool.forEach((boxEl) => {
      boxEl.style.display = "none";
    });
  };

  const ensureDebugHitboxPool = (count: number): void => {
    while (debugHitboxPool.length < count) {
      const boxEl = document.createElement("div");
      boxEl.className = "runner-debug-hitbox";
      debugHitboxLayer.appendChild(boxEl);
      debugHitboxPool.push(boxEl);
    }
  };

  const renderDebugHitboxes = (
    penguinBox: { x: number; y: number; width: number; height: number } | null,
    obstacleBoxes: Array<{ x: number; y: number; width: number; height: number }> = [],
  ): void => {
    if (!DEBUG) return;

    const boxes: Array<{ x: number; y: number; width: number; height: number; role: string }> =
      [];
    if (penguinBox) {
      boxes.push({ ...penguinBox, role: "penguin" });
    }
    obstacleBoxes.forEach((box) => {
      if (box) boxes.push({ ...box, role: "obstacle" });
    });

    ensureDebugHitboxPool(boxes.length);

    boxes.forEach((box, index) => {
      const boxEl = debugHitboxPool[index];
      boxEl.classList.toggle("is-penguin", box.role === "penguin");
      boxEl.classList.toggle("is-obstacle", box.role === "obstacle");
      boxEl.style.display = "block";
      boxEl.style.left = `${Math.round(box.x)}px`;
      boxEl.style.top = `${Math.round(box.y)}px`;
      boxEl.style.width = `${Math.max(1, Math.round(box.width))}px`;
      boxEl.style.height = `${Math.max(1, Math.round(box.height))}px`;
    });

    for (let i = boxes.length; i < debugHitboxPool.length; i += 1) {
      debugHitboxPool[i].style.display = "none";
    }
  };

  return {
    showDebugCollisionDot,
    renderDebugHitboxes,
    clearDebugHitboxes,
  };
};
