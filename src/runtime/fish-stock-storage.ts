import { FISH_STOCK_KEY, type FishStockStorage } from "./fish-stock-ledger.ts";

let hostApi: { postMessage(message: unknown): void } | undefined;
export function createFishStockStorage(): FishStockStorage {
  if (typeof window !== "undefined" && typeof window.acquireVsCodeApi === "function") {
    hostApi ||= window.acquireVsCodeApi();
    return {
      load: () => window.PENGUIN_FISH_STOCK,
      save: (snapshot) => hostApi!.postMessage({ type: "penguin:save-fish-stock", snapshot }),
    };
  }
  return {
    load: () => JSON.parse(localStorage.getItem(FISH_STOCK_KEY) || "null"),
    save: (snapshot) => localStorage.setItem(FISH_STOCK_KEY, JSON.stringify(snapshot)),
  };
}
