import { accessoryCatalog, accessoryMotifs, headKinds, legacyAccessoryIds, type Accessory, type AccessorySlot } from "./catalog.ts";

export type Outfit = Readonly<Partial<Record<AccessorySlot, string>>>;
export interface WardrobeSnapshot { version: 2; owned: string[]; equipped: Outfit }
export interface WardrobeStorage { load(): unknown; save(snapshot: WardrobeSnapshot): void }

export const ACCESSORY_PRICE = 10;
export interface FishWallet {
  balance(): number;
  spend(amount: number): boolean;
  subscribe?(listener: () => void): () => void;
}
export type PurchaseResult = "purchased" | "owned" | "insufficient" | "unknown";

/** Inventory/equipment domain. A purchase debits the injected wallet only once. */
export class WardrobeStore {
  readonly catalog: readonly Accessory[];
  private items: Map<string, Accessory>;
  private owned = new Set<string>();
  private equipped: Partial<Record<AccessorySlot, string>> = {};
  private listeners = new Set<() => void>();
  private storage?: WardrobeStorage;

  constructor(catalog: readonly Accessory[] = accessoryCatalog, storage?: WardrobeStorage) {
    this.catalog = Object.freeze(catalog.map((item) => Object.freeze({ ...item })));
    this.items = new Map();
    for (const item of this.catalog) {
      if (!/^[a-z0-9-]+$/.test(item.id) || this.items.has(item.id) ||
          !/^#[\da-f]{6}$/i.test(item.color) || !/^#[\da-f]{6}$/i.test(item.accent) ||
          !accessoryMotifs.includes(item.motif) ||
          !((headKinds.includes(item.kind as typeof headKinds[number]) && item.slot === "head") || (item.kind === "tshirt" && item.slot === "body"))) {
        throw new Error(`Invalid accessory: ${item.id}`);
      }
      this.items.set(item.id, item);
      if (item.starter) this.owned.add(item.id);
    }
    this.storage = storage;
    try { this.restore(storage?.load()); } catch { /* A blocked/corrupt store must not prevent rendering. */ }
  }

  private restore(raw: unknown) {
    if (!raw || typeof raw !== "object") return;
    const data = raw as Partial<WardrobeSnapshot>;
    if (data.version !== 2) return;
    const resolveId = (id: unknown) => typeof id === "string" ? (this.items.has(id) ? id : legacyAccessoryIds[id]) : undefined;
    if (Array.isArray(data.owned)) for (const oldId of data.owned) {
      const id = resolveId(oldId);
      if (id && this.items.has(id)) this.owned.add(id);
    }
    for (const slot of ["head", "body"] as const) {
      const id = resolveId(data.equipped?.[slot]);
      if (id && this.owned.has(id) && this.items.get(id)?.slot === slot) this.equipped[slot] = id;
    }
  }

  get snapshot(): WardrobeSnapshot { return { version: 2, owned: [...this.owned], equipped: { ...this.equipped } }; }
  getItem(id: string) { return this.items.get(id); }
  owns(id: string) { return this.owned.has(id); }

  /** Call after the shop has confirmed an entitlement. This is not a payment boundary. */
  grant(id: string): boolean {
    if (!this.items.has(id)) return false;
    if (!this.owned.has(id)) { this.owned.add(id); this.commit(); }
    return true;
  }

  purchase(id: string, wallet: FishWallet): PurchaseResult {
    if (!this.items.has(id)) return "unknown";
    if (this.owns(id)) return "owned";
    // The wallet performs the authoritative balance check at click time.
    if (!wallet.spend(ACCESSORY_PRICE)) return "insufficient";
    this.grant(id);
    return "purchased";
  }

  equip(id: string): boolean {
    const item = this.items.get(id);
    if (!item || !this.owned.has(id)) return false;
    if (this.equipped[item.slot] !== id) { this.equipped[item.slot] = id; this.commit(); }
    return true;
  }

  unequip(slot: AccessorySlot) {
    if (this.equipped[slot]) { delete this.equipped[slot]; this.commit(); }
  }

  subscribe(listener: () => void) { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; }
  private commit() {
    try { this.storage?.save(this.snapshot); } catch { /* Keep the in-memory outfit usable if storage is unavailable. */ }
    this.listeners.forEach((listener) => listener());
  }
}

let shared: WardrobeStore | undefined;
export function getWardrobe(): WardrobeStore {
  return shared ||= new WardrobeStore(accessoryCatalog, {
    load: () => JSON.parse(localStorage.getItem("penguin.wardrobe.v2") || "null"),
    save: (snapshot) => localStorage.setItem("penguin.wardrobe.v2", JSON.stringify(snapshot)),
  });
}
