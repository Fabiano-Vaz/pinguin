import type { AccessorySlot } from "./catalog.ts";
import { getWardrobe, type WardrobeStore } from "./wardrobe-store.ts";

/** Shared by the pet's wardrobe and the pose-fitting gallery. Returns cleanup. */
export function bindWardrobeSelect(select: HTMLSelectElement, slot: AccessorySlot, onChange?: () => void, store: WardrobeStore = getWardrobe()) {
  const sync = () => {
    select.replaceChildren(new Option(slot === "head" ? "Sem acessório" : "Sem roupa", ""),
      ...store.catalog.filter((item) => item.slot === slot && store.owns(item.id)).map((item) => new Option(item.name, item.id)));
    select.value = store.snapshot.equipped[slot] || "";
  };
  const change = () => {
    if (select.value) store.equip(select.value);
    else store.unequip(slot);
    onChange?.();
  };
  sync();
  select.addEventListener("change", change);
  const unsubscribe = store.subscribe(sync);
  return () => { unsubscribe(); select.removeEventListener("change", change); };
}
