export const FISH_LIFETIME_MS = 24 * 60 * 60 * 1000;
export const FISH_STOCK_KEY = "penguin.fish-stock.v1";
export interface FishBatch { amount: number; expiresAt: number }
export interface FishStockSnapshot { version: 1; batches: FishBatch[] }
export interface FishStockStorage {
  load(): unknown;
  save(snapshot: FishStockSnapshot): void;
  change?(amount: number): void;
  subscribe?(listener: (snapshot: FishStockSnapshot) => void): () => void;
}

/** Empty is a valid saved balance; expired fish must never become a new welcome gift. */
export function parseFishStock(raw: unknown): FishStockSnapshot | undefined {
  if (!raw || typeof raw !== "object") return;
  const candidate = raw as Partial<FishStockSnapshot>;
  if (candidate.version !== 1 || !Array.isArray(candidate.batches)) return;
  const batches: FishBatch[] = [];
  let total = 0;
  for (const batch of candidate.batches) {
    if (!batch || !Number.isSafeInteger(batch.amount) || batch.amount <= 0 ||
        !Number.isSafeInteger(batch.expiresAt) || batch.expiresAt <= 0 ||
        !Number.isSafeInteger(total + batch.amount)) continue;
    batches.push({ amount: batch.amount, expiresAt: batch.expiresAt });
    total += batch.amount;
  }
  return { version: 1, batches };
}

/** One timestamp per award, shared by all fish awarded together. Oldest expires/spends first. */
export class FishStockLedger {
  private batches: FishBatch[] = [];
  private now: () => number;

  constructor(raw: unknown, initialAmount = 5, now: () => number = Date.now) {
    this.now = now;
    const saved = parseFishStock(raw);
    if (saved) this.batches = saved.batches.sort((a, b) => a.expiresAt - b.expiresAt);
    else this.add(initialAmount);
    this.expire();
  }

  expire(): number {
    const now = this.now();
    const expired = this.batches.filter((batch) => batch.expiresAt <= now);
    this.batches = this.batches.filter((batch) => batch.expiresAt > now);
    return expired.reduce((sum, batch) => sum + batch.amount, 0);
  }

  get balance(): number {
    this.expire();
    return this.batches.reduce((sum, batch) => sum + batch.amount, 0);
  }

  get nextExpiration(): number | undefined {
    this.expire();
    return this.batches[0]?.expiresAt;
  }

  get snapshot(): FishStockSnapshot {
    this.expire();
    return { version: 1, batches: this.batches.map((batch) => ({ ...batch })) };
  }

  add(amount: number): boolean {
    if (!Number.isSafeInteger(amount) || amount <= 0 || !Number.isSafeInteger(this.balance + amount)) return false;
    const expiresAt = this.now() + FISH_LIFETIME_MS;
    const existing = this.batches.find((batch) => batch.expiresAt === expiresAt);
    if (existing) existing.amount += amount;
    else this.batches.push({ amount, expiresAt });
    this.batches.sort((a, b) => a.expiresAt - b.expiresAt);
    return true;
  }

  spend(amount: number): boolean {
    if (!Number.isSafeInteger(amount) || amount <= 0 || this.balance < amount) return false;
    let remaining = amount;
    while (remaining > 0) {
      const batch = this.batches[0];
      const spent = Math.min(remaining, batch.amount);
      batch.amount -= spent;
      remaining -= spent;
      if (batch.amount === 0) this.batches.shift();
    }
    return true;
  }
}
