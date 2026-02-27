import type Phaser from 'phaser';

export type RuntimeEventPayloadMap = {
  'runner:mode-changed': {
    active: boolean;
    source: 'legacy' | 'phaser' | 'system';
  };
  'runner:start-request': {
    source: 'legacy' | 'phaser' | 'system';
  };
  'runner:stop-request': {
    source: 'legacy' | 'phaser' | 'system';
  };
  'hud:fish-stock-changed': {
    count: number;
    source: 'legacy' | 'phaser' | 'system';
  };
  'cursor:fish-mode-changed': {
    enabled: boolean;
    source: 'legacy' | 'phaser' | 'system';
  };
  'ui:speech:show': {
    text: string;
    x: number;
    y: number;
    durationMs?: number;
    source: 'legacy' | 'phaser' | 'system';
  };
  'effects:click': {
    x: number;
    y: number;
    source: 'legacy' | 'phaser' | 'system';
  };
  'effects:snow:burst': {
    x: number;
    y: number;
    count?: number;
    source: 'legacy' | 'phaser' | 'system';
  };
  'effects:lightning:flash': {
    source: 'legacy' | 'phaser' | 'system';
  };
  'effects:lightning:bolt': {
    x: number;
    source: 'legacy' | 'phaser' | 'system';
  };
  'effects:wind:gust': {
    direction: 1 | -1;
    source: 'legacy' | 'phaser' | 'system';
  };
  'effects:weather:start-snow': {
    source: 'legacy' | 'phaser' | 'system';
  };
  'effects:weather:start-rain': {
    source: 'legacy' | 'phaser' | 'system';
  };
  'effects:weather:state': {
    snowing: boolean;
    raining: boolean;
    source: 'legacy' | 'phaser' | 'system';
  };
};

export type RuntimeEventName = keyof RuntimeEventPayloadMap;
export type RuntimeEventHandler<K extends RuntimeEventName = RuntimeEventName> = (
  payload: RuntimeEventPayloadMap[K],
) => void;

export type RuntimeEventApi = {
  onEvent?: <K extends RuntimeEventName>(eventName: K, handler: RuntimeEventHandler<K>) => void;
  offEvent?: <K extends RuntimeEventName>(eventName: K, handler: RuntimeEventHandler<K>) => void;
  emitEvent?: <K extends RuntimeEventName>(eventName: K, payload: RuntimeEventPayloadMap[K]) => void;
};

export type RuntimeConfig = {
  nonce?: string;
  cssHref?: string;
  isRunnerActive?: boolean;
  fishStock?: number;
  isFishCursorEnabled?: boolean;
  penguinAssets?: Record<string, string>;
  penguinConfig?: {
    size?: number;
    groundRatio?: number;
    backgroundImage?: string;
  };
} & RuntimeEventApi;

declare global {
  interface Window {
    PINGUIN_RUNTIME?: RuntimeConfig;
    PENGUIN_ASSETS?: Record<string, string>;
    PENGUIN_CONFIG?: {
      size?: number;
      groundRatio?: number;
      backgroundImage?: string;
    };
    Phaser?: typeof Phaser;
    PenguinPet?: {
      actionStates?: Record<string, string>;
      penguin?: Record<string, unknown>;
      constants?: {
        SNOW_ACTIVE_DURATION_MS?: number;
        SNOW_COOLDOWN_DURATION_MS?: number;
        SNOW_SPAWN_INTERVAL_MS?: number;
        RAIN_ACTIVE_DURATION_MS?: number;
        RAIN_COOLDOWN_DURATION_MS?: number;
        RAIN_SPAWN_INTERVAL_MS?: number;
      };
      runtime?: {
        isRunnerActive?: boolean;
        onEvent?: RuntimeEventApi['onEvent'];
        offEvent?: RuntimeEventApi['offEvent'];
        emitEvent?: RuntimeEventApi['emitEvent'];
      };
    };
  }
}

export {};
