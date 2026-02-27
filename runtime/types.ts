import type Phaser from 'phaser';

export type RuntimeConfig = {
  nonce?: string;
  cssHref?: string;
  penguinAssets?: Record<string, string>;
  penguinConfig?: {
    size?: number;
    groundRatio?: number;
    backgroundImage?: string;
  };
};

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
      runtime?: {
        isRunnerActive?: boolean;
      };
    };
  }
}

export {};
