export const clampProbability = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
};

export const chance = (probability: number): boolean =>
  Math.random() < clampProbability(probability);

export const pickRandom = <T>(items: T[], fallback: T | null = null): T | null => {
  if (!Array.isArray(items) || items.length === 0) return fallback;
  return items[Math.floor(Math.random() * items.length)] ?? fallback;
};
