import type { PenguinMemoryGameGlobal } from "../../types/webview-runtime.ts";

type SnowCard = {
  pairId: string;
  symbol: string;
  label: string;
};

const SNOW_PAIRS = [
  { pairId: "snowflake", symbol: "❄️", label: "Floco de neve" },
  { pairId: "snowman", symbol: "⛄", label: "Boneco de neve" },
  { pairId: "ski", symbol: "🎿", label: "Esquis" },
  { pairId: "skate", symbol: "⛸️", label: "Patins de gelo" },
  { pairId: "mountain", symbol: "🏔️", label: "Montanha nevada" },
  { pairId: "glove", symbol: "🧤", label: "Luva de inverno" },
] as const;

const stage = document.createElement("section");
stage.className = "memory-game";
stage.setAttribute("aria-label", "Jogo da memória de neve");

const panel = document.createElement("div");
panel.className = "memory-panel";

const header = document.createElement("header");
header.className = "memory-header";

const headingGroup = document.createElement("div");
const title = document.createElement("h2");
title.className = "memory-title";
title.textContent = "Memória Gelada";
const subtitle = document.createElement("p");
subtitle.className = "memory-subtitle";
subtitle.textContent = "Encontre todos os pares da neve";
headingGroup.append(title, subtitle);

const closeButton = document.createElement("button");
closeButton.className = "memory-close";
closeButton.type = "button";
closeButton.textContent = "×";
closeButton.setAttribute("aria-label", "Fechar jogo");
header.append(headingGroup, closeButton);

const stats = document.createElement("div");
stats.className = "memory-stats";
const movesLabel = document.createElement("span");
const timeLabel = document.createElement("span");
const pairsLabel = document.createElement("span");
const fishLabel = document.createElement("span");
stats.append(movesLabel, timeLabel, pairsLabel, fishLabel);

const board = document.createElement("div");
board.className = "memory-board";

const result = document.createElement("div");
result.className = "memory-result";
result.setAttribute("aria-live", "polite");

const restartButton = document.createElement("button");
restartButton.className = "memory-restart";
restartButton.type = "button";
restartButton.textContent = "Embaralhar novamente";

const hint = document.createElement("p");
hint.className = "memory-hint";
hint.textContent = "M abre/fecha | Esc sai";

panel.append(header, stats, board, result, restartButton, hint);
stage.appendChild(panel);
document.body.appendChild(stage);

let active = false;
let cards: SnowCard[] = [];
let firstCard: HTMLButtonElement | null = null;
let secondCard: HTMLButtonElement | null = null;
let matchedPairs = 0;
let moves = 0;
let elapsedSeconds = 0;
let boardLocked = false;
let isGameOver = false;
let mismatchTimeoutId = 0;
let timerId = 0;
let fishCursorWasEnabledClass = false;
let fishCursorWasEnabledRuntime: boolean | null = null;
let fishStockAtStart = 0;

const shuffle = <T>(items: T[]): T[] => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }
  return shuffled;
};

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

const renderStats = (): void => {
  movesLabel.textContent = `Jogadas: ${moves}`;
  timeLabel.textContent = `Tempo: ${formatTime(elapsedSeconds)}`;
  pairsLabel.textContent = `Pares: ${matchedPairs}/${SNOW_PAIRS.length}`;
  fishLabel.textContent = `🐟 ${getFishStock()}`;
};

const getRuntime = () => window.PenguinPet && window.PenguinPet.runtime;

const getFishStock = (): number => {
  const runtime = getRuntime();
  const value =
    runtime && typeof runtime.getFishStock === "function"
      ? runtime.getFishStock()
      : runtime && Number.isFinite(runtime.fishStock)
        ? Number(runtime.fishStock)
        : 0;
  return Math.max(0, Math.floor(value));
};

const stopTimer = (): void => {
  if (!timerId) return;
  window.clearInterval(timerId);
  timerId = 0;
};

const startTimer = (): void => {
  stopTimer();
  timerId = window.setInterval(() => {
    if (!active || matchedPairs === SNOW_PAIRS.length) return;
    elapsedSeconds += 1;
    renderStats();
  }, 1000);
};

const setCardRevealed = (card: HTMLButtonElement, revealed: boolean): void => {
  card.classList.toggle("is-revealed", revealed);
  card.setAttribute("aria-pressed", String(revealed));
  card.setAttribute(
    "aria-label",
    revealed ? card.dataset.label || "Carta revelada" : "Carta escondida",
  );
};

const finishRound = (): void => {
  stopTimer();
  boardLocked = true;
  result.textContent = `Você encontrou tudo em ${moves} jogadas e ${formatTime(elapsedSeconds)}!`;
  result.classList.add("is-visible");
  panel.classList.add("is-complete");
};

const endGame = (): void => {
  isGameOver = true;
  boardLocked = true;
  stopTimer();
  board.classList.add("is-locked");
  result.textContent = "Game over! Seus peixes acabaram.";
  result.classList.add("is-visible", "is-game-over");
  restartButton.textContent = "Sair para pescar";
};

const rewardMatch = (): void => {
  const runtime = getRuntime();
  if (runtime && typeof runtime.addFishStock === "function") {
    runtime.addFishStock(2);
  }
};

const chargeMismatch = (): boolean => {
  const runtime = getRuntime();
  if (!runtime || typeof runtime.consumeFishStock !== "function") {
    return getFishStock() <= 0;
  }
  runtime.consumeFishStock(1);
  return getFishStock() <= 0;
};

const resetSelection = (): void => {
  firstCard = null;
  secondCard = null;
  boardLocked = false;
};

const selectCard = (card: HTMLButtonElement): void => {
  if (
    boardLocked ||
    isGameOver ||
    card === firstCard ||
    card.classList.contains("is-matched")
  ) {
    return;
  }

  setCardRevealed(card, true);
  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  moves += 1;
  renderStats();

  if (firstCard.dataset.pairId === secondCard.dataset.pairId) {
    firstCard.classList.add("is-matched");
    secondCard.classList.add("is-matched");
    firstCard.disabled = true;
    secondCard.disabled = true;
    matchedPairs += 1;
    rewardMatch();
    renderStats();
    resetSelection();
    if (matchedPairs === SNOW_PAIRS.length) finishRound();
    return;
  }

  boardLocked = true;
  const firstMismatch = firstCard;
  const secondMismatch = secondCard;
  const hasNoFish = chargeMismatch();
  renderStats();
  if (hasNoFish) {
    endGame();
    return;
  }
  mismatchTimeoutId = window.setTimeout(() => {
    setCardRevealed(firstMismatch, false);
    setCardRevealed(secondMismatch, false);
    mismatchTimeoutId = 0;
    resetSelection();
  }, 780);
};

const renderBoard = (): void => {
  board.replaceChildren();
  cards.forEach((cardData) => {
    const card = document.createElement("button");
    card.className = "memory-card";
    card.type = "button";
    card.dataset.pairId = cardData.pairId;
    card.dataset.label = cardData.label;
    card.setAttribute("aria-label", "Carta escondida");
    card.setAttribute("aria-pressed", "false");

    const back = document.createElement("span");
    back.className = "memory-card-face memory-card-back";
    back.textContent = "❄";
    const front = document.createElement("span");
    front.className = "memory-card-face memory-card-front";
    front.textContent = cardData.symbol;
    front.setAttribute("aria-hidden", "true");

    card.append(back, front);
    card.addEventListener("click", () => selectCard(card));
    board.appendChild(card);
  });
};

const restart = (): void => {
  if (mismatchTimeoutId) {
    window.clearTimeout(mismatchTimeoutId);
    mismatchTimeoutId = 0;
  }
  cards = shuffle(SNOW_PAIRS.flatMap((item) => [{ ...item }, { ...item }]));
  firstCard = null;
  secondCard = null;
  matchedPairs = 0;
  moves = 0;
  elapsedSeconds = 0;
  boardLocked = false;
  isGameOver = false;
  result.textContent = "";
  result.classList.remove("is-visible", "is-game-over");
  panel.classList.remove("is-complete");
  board.classList.remove("is-locked");
  restartButton.textContent = "Embaralhar novamente";
  renderStats();
  renderBoard();
  if (getFishStock() <= 0) {
    endGame();
  } else if (active) {
    startTimer();
  }
};

const setPetInteractionsEnabled = (enabled: boolean): void => {
  const runtime = window.PenguinPet && window.PenguinPet.runtime;
  if (!enabled) {
    fishStockAtStart = getFishStock();
    fishCursorWasEnabledClass = document.body.classList.contains(
      "fish-cursor-enabled",
    );
    fishCursorWasEnabledRuntime =
      runtime && typeof runtime.isFishCursorEnabled === "boolean"
        ? runtime.isFishCursorEnabled
        : null;
    document.body.classList.remove("fish-cursor-enabled");
    if (runtime && typeof runtime.setFishCursorEnabled === "function") {
      runtime.setFishCursorEnabled(false);
    }
    return;
  }

  const fishStockChanged = getFishStock() !== fishStockAtStart;
  const shouldEnableFishCursor = fishStockChanged
    ? getFishStock() > 0
    : fishCursorWasEnabledRuntime;
  if (fishStockChanged ? getFishStock() > 0 : fishCursorWasEnabledClass) {
    document.body.classList.add("fish-cursor-enabled");
  } else {
    document.body.classList.remove("fish-cursor-enabled");
  }
  if (runtime && shouldEnableFishCursor !== null) {
    if (typeof runtime.setFishCursorEnabled === "function") {
      runtime.setFishCursorEnabled(shouldEnableFishCursor);
    } else {
      runtime.isFishCursorEnabled = shouldEnableFishCursor;
    }
  }
};

const start = (): void => {
  if (active) return;
  const runnerActive = Boolean(
    window.PenguinRunnerGame && window.PenguinRunnerGame.game.active,
  );
  if (runnerActive) return;

  active = true;
  memoryGame.active = true;
  setPetInteractionsEnabled(false);
  document.body.classList.add("memory-mode");
  stage.classList.add("active");
  restart();
};

const stop = (): void => {
  if (!active) return;
  active = false;
  memoryGame.active = false;
  stopTimer();
  if (mismatchTimeoutId) {
    window.clearTimeout(mismatchTimeoutId);
    mismatchTimeoutId = 0;
  }
  resetSelection();
  document.body.classList.remove("memory-mode");
  stage.classList.remove("active");
  setPetInteractionsEnabled(true);
};

closeButton.addEventListener("click", stop);
restartButton.addEventListener("click", () => {
  if (isGameOver && getFishStock() <= 0) {
    stop();
    return;
  }
  restart();
});

document.addEventListener("keydown", (event) => {
  const target = event.target as HTMLElement | null;
  const isTypingTarget =
    target &&
    (target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable);
  if (isTypingTarget || event.repeat) return;

  if (event.code === "Escape" && active) {
    event.preventDefault();
    stop();
    return;
  }

  const key = typeof event.key === "string" ? event.key.toLowerCase() : "";
  if (event.code !== "KeyM" && key !== "m") return;
  event.preventDefault();
  if (active) stop();
  else start();
});

const memoryGame: PenguinMemoryGameGlobal = {
  active,
  start,
  stop,
  restart,
};

window.PenguinMemoryGame = memoryGame;
restart();
