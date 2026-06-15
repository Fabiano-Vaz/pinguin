import type {
  PenguinPetEffectsRegistry,
  PenguinPetGlobal,
  PenguinPetModulesRegistry,
  PenguinMemoryGameGlobal,
  PenguinRunnerGameGlobal,
  RunnerModulesRegistry,
} from "./webview-runtime";

export {};

declare global {
  interface Window {
    PenguinPet?: PenguinPetGlobal;
    PenguinPetModules?: PenguinPetModulesRegistry;
    PenguinPetCore?: any;
    PenguinPetEffectModules?: any;
    PenguinPetEffects?: PenguinPetEffectsRegistry;
    PenguinRunnerModules?: RunnerModulesRegistry;
    PenguinPetShared?: any;
    PenguinRunnerGame?: PenguinRunnerGameGlobal;
    PenguinMemoryGame?: PenguinMemoryGameGlobal;
    PENGUIN_CONFIG?: any;
    PENGUIN_ASSETS?: Record<string, string>;
  }
}
