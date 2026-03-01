export type UnknownRecord = Record<string, any>;

export interface PenguinRuntime {
  addFishStock?: (amount: number) => void;
  isFishCursorEnabled?: boolean;
  setFishCursorEnabled?: (enabled: boolean) => void;
  [key: string]: any;
}

export interface PenguinEffectsApi {
  isSnowing?: () => boolean;
  isRaining?: () => boolean;
  [key: string]: any;
}

export interface PenguinPetGlobal {
  constants?: UnknownRecord;
  actionStates?: Record<string, string>;
  runtime?: PenguinRuntime;
  effects?: PenguinEffectsApi;
  [key: string]: any;
}

export interface PenguinPetModulesRegistry {
  bootstrapPetApp?: () => void;
  [key: string]: any;
}

export interface PenguinPetEffectsRegistry {
  createClickEffect?: (...args: any[]) => any;
  createFoodDrops?: (...args: any[]) => any;
  createBackgroundParticles?: (...args: any[]) => any;
  createShootingStar?: (...args: any[]) => any;
  startSnowCycle?: (...args: any[]) => any;
  startRainCycle?: (...args: any[]) => any;
  stopSnowCycle?: (...args: any[]) => any;
  stopRainCycle?: (...args: any[]) => any;
  isSnowing?: (...args: any[]) => any;
  isRaining?: (...args: any[]) => any;
  spawnExtraSnow?: (...args: any[]) => any;
  createLightningFlash?: (...args: any[]) => any;
  createLightningBolt?: (...args: any[]) => any;
  createWindGust?: (...args: any[]) => any;
  triggerShootingStarEvent?: (...args: any[]) => any;
  startShootingStarCycle?: (...args: any[]) => any;
  stopShootingStarCycle?: (...args: any[]) => any;
  state?: UnknownRecord;
  [key: string]: any;
}

export interface RunnerObstacle {
  id: string;
  el: HTMLDivElement;
  x: number;
  y: number;
  width: number;
  height: number;
  requiresCrouch: boolean;
  passed: boolean;
}

export interface RunnerGroundDecorPiece {
  el: HTMLDivElement;
  x: number;
  y: number;
  width: number;
}

export interface RunnerFishRainEntry {
  el: HTMLDivElement;
  timeoutId: any;
}

export interface RunnerPenguinState {
  x: number;
  y: number;
  width: number;
  standingHeight: number;
  crouchingHeight: number;
  velocityY: number;
  isJumping: boolean;
  isCrouching: boolean;
  jumpQueuedMs: number;
  coyoteTimerMs: number;
  isJumpPressed: boolean;
}

export interface RunnerGameState {
  active: boolean;
  isGameOver: boolean;
  score: number;
  bestScore: number;
  worldSpeed: number;
  minWorldSpeed: number;
  maxWorldSpeed: number;
  speedGainPerSecond: number;
  gravity: number;
  fallGravityMultiplier: number;
  lowJumpGravityMultiplier: number;
  diveGravityMultiplier: number;
  jumpVelocity: number;
  maxFallSpeed: number;
  jumpBufferMs: number;
  coyoteTimeMs: number;
  spawnTimerMs: number;
  spawnGapMinMs: number;
  spawnGapMaxMs: number;
  lastFrameAt: number;
  worldTimeMs: number;
  obstacles: RunnerObstacle[];
  groundDecor: RunnerGroundDecorPiece[];
  fishRain: RunnerFishRainEntry[];
  nextHelicopterIndex: number;
  nextFishDropScore: number;
  backgroundScrollX: number;
  moonScrollX: number;
  fishCursorWasEnabledClass: boolean;
  fishCursorWasEnabledRuntime: boolean | null;
  debugLastCollisionAt: number;
  debugCollisionHideTimeoutId: any;
  penguin: RunnerPenguinState;
}

export interface RunnerElements {
  stage: HTMLDivElement;
  hud: HTMLDivElement;
  hint: HTMLDivElement;
  message: HTMLDivElement;
  penguinEl: HTMLImageElement;
  ground: HTMLDivElement;
  debugCollisionDot: HTMLDivElement;
  debugHitboxLayer: HTMLDivElement;
}

export interface RunnerObstacleTemplate {
  id: string;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  topOffset: number;
  color: string;
  requiresCrouch: boolean;
}

export interface RunnerHelicopterVariant {
  key: string;
  src: string;
  scale: number;
  hitboxInsetRatios: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
}

export interface RunnerAssetsFactory {
  sprites?: Record<string, string>;
  runnerBackgroundDarkBImage?: string;
  runnerMoonImage?: string;
  snowmanObstacleImage?: string;
  helicopterVariants?: RunnerHelicopterVariant[];
}

export interface RunnerDebugTools {
  showDebugCollisionDot?: (
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number },
  ) => void;
  renderDebugHitboxes?: (
    penguinBox: { x: number; y: number; width: number; height: number } | null,
    obstacleBoxes?: Array<{ x: number; y: number; width: number; height: number }>,
  ) => void;
  clearDebugHitboxes?: () => void;
}

export interface RunnerModulesRegistry {
  createRunnerAssets?: (input: {
    actionStates: Record<string, string>;
  }) => RunnerAssetsFactory;
  createDebugTools?: (input: {
    DEBUG: boolean;
    game: RunnerGameState;
    runnerConfig: UnknownRecord;
    debugCollisionDot: HTMLDivElement;
    debugHitboxLayer: HTMLDivElement;
  }) => RunnerDebugTools;
  [key: string]: any;
}

export interface PenguinRunnerGameGlobal {
  pet: PenguinPetGlobal;
  runnerConfig: UnknownRecord;
  game: RunnerGameState;
  sprites: Record<string, string>;
  snowmanObstacleImage: string;
  helicopterVariants: RunnerHelicopterVariant[];
  clamp: (value: number, min: number, max: number) => number;
  trySaveBestScore: (value: number) => void;
  DEBUG: boolean;
  LOSS_REACTION_STATES: string[];
  elements: RunnerElements;
  actions: {
    endGame: (() => void) | null;
  };
  obstacleTemplates: Record<string, RunnerObstacleTemplate>;
  setPenguinSprite: (state: string) => void;
  getPenguinHeight: () => number;
  getPenguinTopY: () => number;
  applyPenguinPosition: () => void;
  applyPenguinMotionVisual: () => void;
  centerPenguin: () => void;
  setRunnerMode: (enabled: boolean) => void;
  playEnterTransition: () => void;
  shakeStage: () => void;
  clearObstacles: () => void;
  clearGroundDecor: () => void;
  updateRunnerBackgroundMotion: (deltaMs?: number) => void;
  updateGroundPresentation: () => void;
  createGroundDecor: () => void;
  updateGroundDecorMotion: (deltaMs: number) => void;
  difficultyLevel: () => number;
  getPlayfieldHeight: () => number;
  getGroundY: () => number;
  getGroundLineY: () => number;
  getPenguinBox: () => { x: number; y: number; width: number; height: number };
  hasCollision: (
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number },
  ) => boolean;
  showDebugCollisionDot: (
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number },
  ) => void;
  renderDebugHitboxes: (
    penguinBox: { x: number; y: number; width: number; height: number } | null,
    obstacleBoxes?: Array<{ x: number; y: number; width: number; height: number }>,
  ) => void;
  clearDebugHitboxes: () => void;
  renderHud: () => void;
  chooseObstacleTemplate?: () => RunnerObstacleTemplate;
  spawnObstacle?: () => void;
  getObstacleHitbox?: (obstacle: RunnerObstacle) => {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  ensureSafeSpawnGap?: () => boolean;
  updateObstacles?: (deltaMs: number) => void;
  realignObstacleY?: () => void;
}
