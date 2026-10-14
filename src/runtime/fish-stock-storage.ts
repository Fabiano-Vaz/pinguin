import { FISH_STOCK_KEY, FishStockLedger, parseFishStock, type FishStockStorage } from "./fish-stock-ledger.ts";

let hostApi: { postMessage(message: unknown): void } | undefined;
export function createFishStockStorage(): FishStockStorage {
  if (typeof window !== "undefined" && typeof window.acquireVsCodeApi === "function") {
    hostApi ||= window.acquireVsCodeApi();
    let requestId = 0;
    const pending = new Map<number, number>();
    return {
      load: () => window.PENGUIN_FISH_STOCK,
      // The extension owns persistence; snapshots from a suspended view cannot overwrite rewards.
      save: () => {},
      change: (amount) => {
        pending.set(++requestId, amount);
        hostApi!.postMessage({ type: "penguin:change-fish-stock", amount, requestId });
      },
      subscribe: (listener) => {
        const receive = (event: MessageEvent) => {
          if (event.data?.type !== "penguin:fish-stock") return;
          const snapshot = parseFishStock(event.data.snapshot);
          if (!snapshot) return;
          const acknowledged = event.data.requestId;
          if (Number.isSafeInteger(acknowledged)) {
            for (const id of pending.keys()) if (id <= acknowledged) pending.delete(id);
          }
          window.PENGUIN_FISH_STOCK = snapshot;
          // Keep local clicks visible until the host acknowledges them.
          const projected = new FishStockLedger(snapshot, 0);
          for (const amount of pending.values()) {
            if (amount > 0) projected.add(amount);
            else projected.spend(-amount);
          }
          listener(projected.snapshot);
        };
        const requestStock = () => hostApi!.postMessage({ type: "penguin:request-fish-stock" });
        window.addEventListener("message", receive);
        window.addEventListener("focus", requestStock);
        document.addEventListener("visibilitychange", requestStock);
        requestStock();
        return () => {
          window.removeEventListener("message", receive);
          window.removeEventListener("focus", requestStock);
          document.removeEventListener("visibilitychange", requestStock);
        };
      },
    };
  }
  return {
    load: () => JSON.parse(localStorage.getItem(FISH_STOCK_KEY) || "null"),
    save: (snapshot) => localStorage.setItem(FISH_STOCK_KEY, JSON.stringify(snapshot)),
  };
}
