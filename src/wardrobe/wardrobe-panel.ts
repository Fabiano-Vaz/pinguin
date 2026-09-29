import { createArtwork } from "../artwork/artwork.ts";
import { ACCESSORY_PRICE, getWardrobe, WardrobeStore, type FishWallet } from "./wardrobe-store.ts";
import type { AccessorySlot } from "./catalog.ts";

export function mountWardrobePanel(wallet: FishWallet, onOpenChange: (open: boolean) => void = () => {}) {
  const store = getWardrobe();
  // Fitting-room inventory is private: browsing never grants/equips a live item.
  const fittingRoom = new WardrobeStore(store.catalog);
  store.catalog.forEach((item) => fittingRoom.grant(item.id));
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "wardrobe-toggle";
  toggle.textContent = "👕 Guarda-roupa";
  toggle.setAttribute("aria-haspopup", "dialog");
  const dialog = document.createElement("dialog");
  dialog.className = "wardrobe-dialog";
  dialog.setAttribute("aria-labelledby", "wardrobe-title");
  const header = document.createElement("header");
  header.className = "wardrobe-header";
  const title = document.createElement("h2");
  title.id = "wardrobe-title";
  title.textContent = "Meu guarda-roupa";
  const close = document.createElement("button");
  close.type = "button";
  close.className = "wardrobe-close";
  close.textContent = "×";
  close.setAttribute("aria-label", "Fechar guarda-roupa");
  close.addEventListener("click", () => dialog.close());
  header.append(title, close);
  const content = document.createElement("div");
  content.className = "wardrobe-content";
  const subtitle = document.createElement("p");
  subtitle.className = "wardrobe-price";
  subtitle.textContent = `${ACCESSORY_PRICE} 🐟 por peça`;
  const preview = createArtwork("css:waving", fittingRoom);
  preview.classList.add("wardrobe-preview");
  const overview = document.createElement("div");
  overview.className = "wardrobe-overview";
  const summary = document.createElement("div");
  summary.className = "wardrobe-summary";
  overview.append(preview, summary);
  content.append(overview);
  const footer = document.createElement("footer");
  footer.className = "wardrobe-footer";
  const balance = document.createElement("p");
  balance.className = "wardrobe-balance";
  const status = document.createElement("p");
  status.className = "wardrobe-status";
  status.setAttribute("role", "status");
  summary.append(balance, subtitle);
  footer.append(status);
  const rows: { slot: AccessorySlot; select: HTMLSelectElement; button: HTMLButtonElement }[] = [];
  const refresh = () => {
    const fish = wallet.balance();
    balance.textContent = `Saldo: ${fish} 🐟`;
    for (const { slot, select, button } of rows) {
      const item = store.getItem(select.value);
      const equipped = store.snapshot.equipped[slot];
      if (!item) {
        button.textContent = equipped ? "Retirar" : "—";
        button.disabled = !equipped;
      } else if (store.owns(item.id)) {
        button.textContent = equipped === item.id ? "Em uso" : "Vestir";
        button.disabled = equipped === item.id;
      } else {
        button.textContent = "Comprar";
        button.disabled = fish < ACCESSORY_PRICE;
      }
      button.setAttribute("aria-label", item ? `${button.textContent}: ${item.name}${store.owns(item.id) ? "" : ` por ${ACCESSORY_PRICE} peixes`}` : `Retirar ${slot === "body" ? "roupa" : "acessório"}`);
      button.title = item && !store.owns(item.id) && fish < ACCESSORY_PRICE ? `Você precisa de ${ACCESSORY_PRICE} peixes.` : "";
    }
  };
  for (const [slot, name] of [["body", "Roupa"], ["head", "Cabeça"]] as const) {
    const row = document.createElement("div");
    row.className = "wardrobe-item";
    const label = document.createElement("label");
    label.textContent = name;
    const select = document.createElement("select");
    select.name = slot;
    const items = store.catalog.filter((item) => item.slot === slot);
    select.append(new Option("Sem", ""), ...items.map((item) => new Option(item.name.replace(/^(Camiseta|Boné) /, "").replace(/^./, (letter) => letter.toLocaleUpperCase("pt-BR")), item.id)));
    label.append(select);
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.slot = slot;
    select.addEventListener("change", () => {
      if (select.value) fittingRoom.equip(select.value);
      else fittingRoom.unequip(slot);
      status.textContent = "Prévia grátis, sem cobrança.";
      refresh();
    });
    button.addEventListener("click", () => {
      const id = select.value;
      if (!id) { store.unequip(slot); status.textContent = "Acessório retirado."; }
      else {
        const result = store.purchase(id, wallet);
        if (result === "insufficient") status.textContent = `Você precisa de ${ACCESSORY_PRICE} peixes.`;
        else if (result === "purchased" || result === "owned") {
          store.equip(id);
          status.textContent = result === "purchased" ? "Comprado e vestido!" : "Prontinho! Já estou usando.";
        }
      }
      refresh();
    });
    rows.push({ slot, select, button });
    row.append(label, button);
    content.append(row);
  }
  dialog.append(header, content, footer);
  const cleanups = [store.subscribe(refresh), wallet.subscribe?.(refresh) || (() => {})];
  for (const target of [toggle, dialog]) {
    for (const event of ["click", "dblclick", "pointerdown", "pointerup", "mousedown", "mouseup", "mousemove"]) {
      target.addEventListener(event, (event) => event.stopPropagation());
    }
  }
  for (const event of ["keydown", "keyup"]) dialog.addEventListener(event, (event) => event.stopPropagation());
  toggle.addEventListener("click", () => {
    for (const { slot, select } of rows) {
      select.value = store.snapshot.equipped[slot] || "";
      if (select.value) fittingRoom.equip(select.value);
      else fittingRoom.unequip(slot);
    }
    status.textContent = "Experimente uma peça.";
    refresh();
    dialog.showModal();
    onOpenChange(true);
  });
  dialog.addEventListener("close", () => { onOpenChange(false); toggle.focus(); });
  document.body.append(toggle, dialog);
  return () => { cleanups.forEach((cleanup) => cleanup()); onOpenChange(false); toggle.remove(); dialog.remove(); };
}
