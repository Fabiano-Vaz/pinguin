import type { RuntimeConfig } from './types';

const DEFAULT_FISH_STOCK = 5;

const normalizeFishAmount = (amount: number | undefined): number => {
  const parsed = Math.round(Number(amount) || 1);
  return Math.max(1, parsed);
};

const normalizeFishStock = (value: number | undefined, fallback = DEFAULT_FISH_STOCK): number => {
  const parsed = Math.round(Number(value));
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, parsed);
};

export const installFishEconomy = (runtime: RuntimeConfig): void => {
  let fishStock = normalizeFishStock(runtime.fishStock, DEFAULT_FISH_STOCK);
  let isFishCursorEnabled = runtime.isFishCursorEnabled !== false;

  const emitFishStockChanged = (): void => {
    runtime.emitEvent?.('hud:fish-stock-changed', {
      count: fishStock,
      source: 'system',
    });
  };

  const emitCursorModeChanged = (): void => {
    runtime.emitEvent?.('cursor:fish-mode-changed', {
      enabled: isFishCursorEnabled,
      source: 'system',
    });
  };

  const setFishCursorEnabled = (enabled: boolean): void => {
    const wantsEnabled = Boolean(enabled);
    isFishCursorEnabled = wantsEnabled && fishStock > 0;
    runtime.isFishCursorEnabled = isFishCursorEnabled;
    emitCursorModeChanged();
  };

  const consumeFishStock = (amount = 1): boolean => {
    const safeAmount = normalizeFishAmount(amount);
    if (fishStock < safeAmount) return false;
    fishStock -= safeAmount;
    runtime.fishStock = fishStock;
    emitFishStockChanged();
    if (fishStock <= 0) {
      setFishCursorEnabled(false);
    }
    return true;
  };

  const addFishStock = (amount = 1): number => {
    const safeAmount = normalizeFishAmount(amount);
    fishStock += safeAmount;
    runtime.fishStock = fishStock;
    emitFishStockChanged();
    if (runtime.isFishCursorEnabled === false && fishStock > 0) {
      setFishCursorEnabled(true);
    }
    return fishStock;
  };

  const getFishStock = (): number => fishStock;

  runtime.setFishCursorEnabled = setFishCursorEnabled;
  runtime.consumeFishStock = consumeFishStock;
  runtime.addFishStock = addFishStock;
  runtime.getFishStock = getFishStock;
  runtime.fishStock = fishStock;
  runtime.isFishCursorEnabled = isFishCursorEnabled && fishStock > 0;

  emitFishStockChanged();
  emitCursorModeChanged();
};
