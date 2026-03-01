import type {
  PenguinPetEffectsRegistry,
  PenguinPetGlobal,
  PenguinPetModulesRegistry,
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
    PENGUIN_CONFIG?: any;
    PENGUIN_ASSETS?: Record<string, string>;
  }
}
