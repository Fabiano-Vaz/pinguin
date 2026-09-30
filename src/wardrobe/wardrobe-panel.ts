import { createArtwork } from "../artwork/artwork.ts";
import { ACCESSORY_PRICE, getWardrobe, WardrobeStore, type FishWallet } from "./wardrobe-store.ts";
import type { Accessory, AccessorySlot } from "./catalog.ts";

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
  type WardrobeRow = {
    slot: AccessorySlot;
    options: (Accessory | undefined)[];
    index: number;
    selection: HTMLOutputElement;
    button: HTMLButtonElement;
  };
  const rows: WardrobeRow[] = [];
  const selectedItem = (row: WardrobeRow) => row.options[row.index];
  const refresh = () => {
    const fish = wallet.balance();
    balance.textContent = "Saldo: " + fish + " 🐟";
    for (const row of rows) {
      const { slot, button } = row;
      const item = selectedItem(row);
      const equipped = store.snapshot.equipped[slot];
      row.selection.textContent = item
        ? item.name.replace(/^(Camiseta|Boné) /, "").replace(/^./, (letter) => letter.toLocaleUpperCase("pt-BR"))
        : slot === "body" ? "Sem roupa" : "Sem acessório";
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
      const priceLabel = item && !store.owns(item.id) ? " por " + ACCESSORY_PRICE + " peixes" : "";
      button.setAttribute("aria-label", item ? button.textContent + ": " + item.name + priceLabel : "Retirar " + (slot === "body" ? "roupa" : "acessório"));
      button.title = item && !store.owns(item.id) && fish < ACCESSORY_PRICE ? "Você precisa de " + ACCESSORY_PRICE + " peixes." : "";
    }
  };
  const applyPreview = (row: WardrobeRow, announce = true) => {
    const item = selectedItem(row);
    if (item) fittingRoom.equip(item.id);
    else fittingRoom.unequip(row.slot);
    if (announce) status.textContent = "Prévia grátis, sem cobrança.";
    refresh();
  };
  for (const [slot, name] of [["body", "Roupa"], ["head", "Cabeça"]] as const) {
    const row = document.createElement("div");
    row.className = "wardrobe-item";
    const items = store.catalog.filter((item) => item.slot === slot);
    const category = document.createElement("span");
    category.className = "wardrobe-category";
    category.textContent = name;
    const navigator = document.createElement("div");
    navigator.className = "wardrobe-navigator";
    navigator.setAttribute("role", "group");
    navigator.setAttribute("aria-label", "Escolher " + name.toLocaleLowerCase("pt-BR"));
    const previous = document.createElement("button");
    previous.type = "button";
    previous.className = "wardrobe-nav wardrobe-nav--previous";
    previous.textContent = "‹";
    previous.dataset.wardrobeNav = slot;
    previous.dataset.direction = "previous";
    previous.setAttribute("aria-label", name + " anterior");
    const selection = document.createElement("output");
    selection.className = "wardrobe-selection";
    selection.setAttribute("aria-live", "polite");
    const next = document.createElement("button");
    next.type = "button";
    next.className = "wardrobe-nav wardrobe-nav--next";
    next.textContent = "›";
    next.dataset.wardrobeNav = slot;
    next.dataset.direction = "next";
    next.setAttribute("aria-label", "Próxima " + name.toLocaleLowerCase("pt-BR"));
    navigator.append(previous, selection, next);
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.slot = slot;
    const wardrobeRow: WardrobeRow = { slot, options: [undefined, ...items], index: 0, selection, button };
    const navigate = (direction: number) => {
      wardrobeRow.index = (wardrobeRow.index + direction + wardrobeRow.options.length) % wardrobeRow.options.length;
      applyPreview(wardrobeRow);
    };
    previous.addEventListener("click", () => navigate(-1));
    next.addEventListener("click", () => navigate(1));
    button.addEventListener("click", () => {
      const item = selectedItem(wardrobeRow);
      if (!item) { store.unequip(slot); status.textContent = "Acessório retirado."; }
      else {
        const result = store.purchase(item.id, wallet);
        if (result === "insufficient") status.textContent = "Você precisa de " + ACCESSORY_PRICE + " peixes.";
        else if (result === "purchased" || result === "owned") {
          store.equip(item.id);
          status.textContent = result === "purchased" ? "Comprado e vestido!" : "Prontinho! Já estou usando.";
        }
      }
      refresh();
    });
    rows.push(wardrobeRow);
    row.append(category, navigator, button);
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
    for (const row of rows) {
      const equipped = store.snapshot.equipped[row.slot];
      const equippedIndex = row.options.findIndex((item) => item?.id === equipped);
      row.index = equippedIndex >= 0 ? equippedIndex : 0;
      applyPreview(row, false);
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
