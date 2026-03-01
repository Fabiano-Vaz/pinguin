import type {
  PenguinPetEffectsRegistry,
  PenguinPetGlobal,
  PenguinPetModulesRegistry,
  PenguinRunnerGameGlobal,
  RunnerModulesRegistry,
} from "../types/webview-runtime.ts";

export const getPenguinPet = (): PenguinPetGlobal => window.PenguinPet || {};

export const setPenguinPet = (value: PenguinPetGlobal): void => {
  window.PenguinPet = value;
};

export const getPenguinPetModules = (): PenguinPetModulesRegistry =>
  (window.PenguinPetModules = window.PenguinPetModules || {});

export const getPenguinPetEffects = (): PenguinPetEffectsRegistry =>
  (window.PenguinPetEffects = window.PenguinPetEffects || {});

export const getPenguinRunnerModules = (): RunnerModulesRegistry =>
  (window.PenguinRunnerModules = window.PenguinRunnerModules || {});

export const getPenguinRunnerGame = (): PenguinRunnerGameGlobal | null =>
  window.PenguinRunnerGame || null;

export const setPenguinRunnerGame = (value: PenguinRunnerGameGlobal): void => {
  window.PenguinRunnerGame = value;
};
