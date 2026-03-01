export {};

import { getPenguinPetModules } from "./runtime/webview-globals.ts";

const modules = getPenguinPetModules();
if (typeof modules.bootstrapPetApp === "function") {
  modules.bootstrapPetApp();
}
