type DebugFlags = {
  moving?: boolean;
  aiLocked?: boolean;
  drag?: boolean;
  fishing?: boolean;
  eating?: boolean;
  cursorEat?: boolean;
  sleep?: boolean;
  fishCursor?: boolean;
};

type DebugPanelSnapshot = {
  activityMode: string;
  currentState: string;
  debugActionLabel: string;
  debugActivityLabel: string;
  posText: string;
  targetText: string;
  speedText: string;
  motionType: string;
  flowText: string;
  fishText: string;
  flags?: DebugFlags;
  activeStepText: string;
  queueTotal: number;
  queueItems: Array<{ name: string; duration: string }>;
  queueOverflow: number;
  queueEmptyText?: string;
  foodTargetText: string;
  pendingFoodText: number;
  timersTotal: number;
  timerContextText: string;
  activityHistoryText: string;
  actionHistoryText: string;
};

type DebugPanelComponentDeps = {
  onAction?: (action: string | null) => void;
};

const escapeHtml = (value: unknown): string =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const boolBadge = (value: boolean): string =>
  value
    ? '<span class="penguin-debug-badge on">on</span>'
    : '<span class="penguin-debug-badge off">off</span>';

export class DebugPanelComponent {
  onAction: (action: string | null) => void;
  element: HTMLDivElement | null;

  constructor({ onAction }: DebugPanelComponentDeps = {}) {
    this.onAction = typeof onAction === "function" ? onAction : () => {};
    this.element = null;
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  ensure(): HTMLDivElement | null {
    if (typeof document === "undefined") return null;
    if (this.element && this.element.isConnected) return this.element;
    const panel = document.createElement("div");
    panel.className = "penguin-debug-panel";
    panel.addEventListener("pointerdown", this.handlePointerDown);
    panel.addEventListener("click", this.handleClick);
    document.body.appendChild(panel);
    this.element = panel;
    return this.element;
  }

  getActionTarget(event: Event): Element | null {
    const rawTarget = event && event.target ? event.target : null;
    const textTarget = rawTarget instanceof Text ? rawTarget : null;
    const elementTarget =
      rawTarget instanceof Element
        ? rawTarget
        : textTarget && textTarget.parentElement
          ? textTarget.parentElement
          : null;
    return elementTarget && typeof elementTarget.closest === "function"
      ? elementTarget.closest("[data-debug-action]")
      : null;
  }

  handlePointerDown(event: Event): void {
    event.stopPropagation();
    const target = this.getActionTarget(event);
    if (!target) return;
    event.preventDefault();
    const action = target.getAttribute("data-debug-action");
    this.onAction(action);
  }

  handleClick(event: Event): void {
    event.stopPropagation();
    const target = this.getActionTarget(event);
    if (!target) return;
    event.preventDefault();
    const action = target.getAttribute("data-debug-action");
    this.onAction(action);
  }

  render(snapshot: DebugPanelSnapshot): void {
    const panel = this.ensure();
    if (!panel || !snapshot || typeof snapshot !== "object") return;

    const queueHtml =
      Array.isArray(snapshot.queueItems) && snapshot.queueItems.length > 0
        ? `<ol class="penguin-debug-queue-list">${snapshot.queueItems
            .map(
              (item) =>
                `<li><code>${escapeHtml(item.name)}</code><span>${escapeHtml(item.duration)}</span></li>`,
            )
            .join("")}</ol>${
            snapshot.queueOverflow > 0
              ? `<div class="penguin-debug-queue-more">+${snapshot.queueOverflow} steps</div>`
              : ""
          }`
        : `<div class="penguin-debug-queue-empty">${escapeHtml(snapshot.queueEmptyText || "empty")}</div>`;

    panel.innerHTML = [
      `<div class="penguin-debug-head">`,
      `  <div class="penguin-debug-title">Penguin Debug</div>`,
      `  <div class="penguin-debug-meta">mode=<code>${escapeHtml(snapshot.activityMode)}</code> state=<code>${escapeHtml(snapshot.currentState)}</code> | <code>→ next state</code></div>`,
      `</div>`,
      `<div class="penguin-debug-controls">`,
      `  <button type="button" data-debug-action="next-action">Next Action</button>`,
      `  <button type="button" data-debug-action="next-activity">Next Activity</button>`,
      `  <span>A:${escapeHtml(snapshot.debugActionLabel)} | M:${escapeHtml(snapshot.debugActivityLabel)}</span>`,
      `</div>`,
      `<div class="penguin-debug-grid">`,
      `  <div><span>pos</span><code>${escapeHtml(snapshot.posText)}</code></div>`,
      `  <div><span>target</span><code>${escapeHtml(snapshot.targetText)}</code></div>`,
      `  <div><span>speed</span><code>${escapeHtml(snapshot.speedText)}</code></div>`,
      `  <div><span>motion</span><code>${escapeHtml(snapshot.motionType)}</code></div>`,
      `  <div><span>flow</span><code>${escapeHtml(snapshot.flowText)}</code></div>`,
      `  <div><span>fish</span><code>${escapeHtml(snapshot.fishText)}</code></div>`,
      `</div>`,
      `<div class="penguin-debug-flags">`,
      `  <span>moving ${boolBadge(Boolean(snapshot.flags?.moving))}</span>`,
      `  <span>aiLocked ${boolBadge(Boolean(snapshot.flags?.aiLocked))}</span>`,
      `  <span>drag ${boolBadge(Boolean(snapshot.flags?.drag))}</span>`,
      `  <span>fishing ${boolBadge(Boolean(snapshot.flags?.fishing))}</span>`,
      `  <span>eating ${boolBadge(Boolean(snapshot.flags?.eating))}</span>`,
      `  <span>cursorEat ${boolBadge(Boolean(snapshot.flags?.cursorEat))}</span>`,
      `  <span>sleep ${boolBadge(Boolean(snapshot.flags?.sleep))}</span>`,
      `  <span>fishCursor ${boolBadge(Boolean(snapshot.flags?.fishCursor))}</span>`,
      `</div>`,
      `<div class="penguin-debug-section">`,
      `  <div class="penguin-debug-label">Active Step</div>`,
      `  <div class="penguin-debug-value"><code>${escapeHtml(snapshot.activeStepText)}</code></div>`,
      `</div>`,
      `<div class="penguin-debug-section">`,
      `  <div class="penguin-debug-label">Queue (${escapeHtml(snapshot.queueTotal)})</div>`,
      `  <div class="penguin-debug-value">${queueHtml}</div>`,
      `</div>`,
      `<div class="penguin-debug-section">`,
      `  <div class="penguin-debug-label">Food Target</div>`,
      `  <div class="penguin-debug-value"><code>${escapeHtml(snapshot.foodTargetText)} | pending=${escapeHtml(snapshot.pendingFoodText)}</code></div>`,
      `</div>`,
      `<div class="penguin-debug-section">`,
      `  <div class="penguin-debug-label">Timers (${escapeHtml(snapshot.timersTotal)})</div>`,
      `  <div class="penguin-debug-value"><code>${escapeHtml(snapshot.timerContextText)}</code></div>`,
      `</div>`,
      `<div class="penguin-debug-section">`,
      `  <div class="penguin-debug-label">Activity History</div>`,
      `  <div class="penguin-debug-value"><code>${escapeHtml(snapshot.activityHistoryText)}</code></div>`,
      `</div>`,
      `<div class="penguin-debug-section">`,
      `  <div class="penguin-debug-label">Action History</div>`,
      `  <div class="penguin-debug-value"><code>${escapeHtml(snapshot.actionHistoryText)}</code></div>`,
      `</div>`,
    ].join("");
  }
}
