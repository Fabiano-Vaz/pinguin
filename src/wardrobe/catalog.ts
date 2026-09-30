export type AccessorySlot = "head" | "body";
export const headKinds = ["helmet", "cowl", "wig", "viking", "beanie", "headphones", "duck", "ninja", "anya"] as const;
export const accessoryMotifs = ["panel", "bat", "clown", "duck", "bolt", "minion", "cruzeiro", "naruto", "none"] as const;
export type Accessory = Readonly<{
  id: string;
  name: string;
  slot: AccessorySlot;
  kind: typeof headKinds[number] | "tshirt";
  color: string;
  accent: string;
  motif: typeof accessoryMotifs[number];
  starter?: boolean;
}>;

/** A design is fitted by the rig, never drawn separately for each animation. */
export const accessoryCatalog: readonly Accessory[] = Object.freeze([
  { id: "suit-vader", name: "Darth Vader", slot: "body", kind: "tshirt", color: "#252a35", accent: "#bec8d5", motif: "panel" },
  { id: "suit-batman", name: "Batman", slot: "body", kind: "tshirt", color: "#566477", accent: "#ffcf36", motif: "bat" },
  { id: "suit-clown", name: "Palhaço Pipoquinha", slot: "body", kind: "tshirt", color: "#7b4ddd", accent: "#ffe457", motif: "clown" },
  { id: "suit-duck", name: "Patinho de borracha", slot: "body", kind: "tshirt", color: "#ffdc42", accent: "#f69a32", motif: "duck" },
  { id: "suit-bolt", name: "Moletom turbo", slot: "body", kind: "tshirt", color: "#35b8b2", accent: "#fcec80", motif: "bolt" },
  { id: "tee-minion", name: "Camiseta Minion", slot: "body", kind: "tshirt", color: "#ffdc40", accent: "#3983c8", motif: "minion" },
  { id: "tee-cruzeiro", name: "Camiseta Cruzeiro", slot: "body", kind: "tshirt", color: "#1559bd", accent: "#ffffff", motif: "cruzeiro" },
  { id: "tee-naruto", name: "Camiseta Naruto", slot: "body", kind: "tshirt", color: "#f88728", accent: "#303743", motif: "naruto" },
  { id: "wig-anya", name: "Peruca da Anya", slot: "head", kind: "anya", color: "#f5a4b7", accent: "#e8bd65", motif: "none" },
  { id: "hair-naruto", name: "Naruto: cabelo e bandana", slot: "head", kind: "ninja", color: "#ffda43", accent: "#283448", motif: "none" },
  { id: "helmet-vader", name: "Capacete do Vader", slot: "head", kind: "helmet", color: "#252a35", accent: "#8898aa", motif: "none" },
  { id: "cowl-batman", name: "Máscara do Batman", slot: "head", kind: "cowl", color: "#252d40", accent: "#53637c", motif: "none" },
  { id: "wig-clown", name: "Peruca de circo", slot: "head", kind: "wig", color: "#f0704a", accent: "#ffdc49", motif: "none" },
  { id: "hat-viking", name: "Viking do gelo", slot: "head", kind: "viking", color: "#8da6b8", accent: "#ffe9ac", motif: "none" },
  { id: "beanie-berry", name: "Gorrinho framboesa", slot: "head", kind: "beanie", color: "#d85882", accent: "#ffe7a3", motif: "none" },
  { id: "beanie-mint", name: "Gorrinho aurora", slot: "head", kind: "beanie", color: "#47b8a4", accent: "#e6fff7", motif: "none" },
  { id: "headphones-neon", name: "DJ do iceberg", slot: "head", kind: "headphones", color: "#7552d8", accent: "#65f3dc", motif: "none" },
  { id: "hat-duck", name: "Patinho na cabeça", slot: "head", kind: "duck", color: "#ffdc42", accent: "#ff9638", motif: "none" },
].map((item) => Object.freeze(item as Accessory)));

/** Paid pieces from the previous collection keep an equivalent entitlement. */
export const legacyAccessoryIds: Readonly<Record<string, string>> = Object.freeze({
  "tee-ocean": "suit-vader", "tee-berry": "suit-clown", "tee-mint": "suit-batman",
  "cap-ocean": "helmet-vader", "cap-berry": "wig-clown", "cap-sun": "hat-duck",
});
