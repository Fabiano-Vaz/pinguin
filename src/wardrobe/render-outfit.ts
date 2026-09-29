import type { Accessory } from "./catalog.ts";
import { poseRigs } from "./pose-rigs.ts";
import type { WardrobeStore } from "./wardrobe-store.ts";

const nodeClass = (pose: string, node: number | "view") => `art-${pose}-${node}`;
function layer(root: HTMLElement, pose: string, node: number | "view") {
  return root.querySelector<HTMLElement>(`.${nodeClass(pose, node)}`)!;
}
function outer(node: HTMLElement, pose: string, id: number) {
  const prefix = `${nodeClass(pose, id)}-`;
  while (node.parentElement && Array.from(node.parentElement.classList).some((c) => c.startsWith(prefix))) node = node.parentElement;
  return node;
}
function part(className: string, item: Accessory) {
  const element = document.createElement("div");
  element.className = `wardrobe-piece ${className}`;
  element.dataset.accessory = item.id;
  element.dataset.design = item.motif;
  element.style.setProperty("--cloth-color", item.color);
  element.style.setProperty("--cloth-accent", item.accent);
  return element;
}
function detail(className: string) {
  const element = document.createElement("i");
  element.className = className;
  return element;
}
function motif(item: Accessory) {
  const element = document.createElement("i");
  element.className = `wardrobe-design wardrobe-design--${item.motif}`;
  for (const name of ["badge", "trim", "detail", "extra"]) element.append(detail(`costume-${name}`));
  return element;
}
function clippedSurface(root: HTMLElement, pose: string, id: number, item: Accessory) {
  // Reuse the exact CSS contour. Never clone the animated parent or restart its clock.
  const source = layer(root, pose, id).querySelector<HTMLElement>(`.${nodeClass(pose, id)}-fill, .${nodeClass(pose, id)}-shape`)!;
  const surface = part(`${source.className} wardrobe-surface`, item);
  surface.style.background = "transparent";
  return surface;
}

/** Update equipment only: the original pose nodes and CSS animation phases survive. */
export function renderOutfit(root: HTMLElement, store: WardrobeStore) {
  root.querySelectorAll(".wardrobe-piece").forEach((element) => element.remove());
  root.querySelectorAll("[data-wardrobe-hidden]").forEach((element) => element.removeAttribute("data-wardrobe-hidden"));
  root.removeAttribute("data-wardrobe-overflow");
  const pose = root.dataset.pose || "";
  const rig = poseRigs[pose];
  if (!rig) return; // Environmental props and external artwork have no clothing rig.
  const equipped = store.snapshot.equipped;
  const shirt = equipped.body && store.getItem(equipped.body);
  const cap = equipped.head && store.getItem(equipped.head);

  if (shirt) {
    const profile = rig.body.profile || "front";
    const surface = profile === "side" ? part(`wardrobe-side-surface${rig.body.contour ? ` wardrobe-side-surface--${rig.body.contour}` : ""}`, shirt) : clippedSurface(root, pose, rig.body.shape, shirt);
    const fabric = document.createElement("div");
    fabric.className = `wardrobe-shirt wardrobe-shirt--${profile}`;
    if (rig.body.hem) fabric.style.height = `${rig.body.hem}%`;
    const collar = document.createElement("i");
    collar.className = "wardrobe-collar";
    fabric.append(collar, motif(shirt));
    surface.append(fabric);
    if (rig.body.followShape) {
      // These original poses breathe through the torso alone. Dress inside that
      // animated node, carrying a copy of the exposed lower belly with it.
      const belly = layer(root, pose, rig.body.after);
      const underlay = belly.cloneNode(true) as HTMLElement;
      underlay.classList.add("wardrobe-piece");
      belly.setAttribute("data-wardrobe-hidden", "");
      layer(root, pose, rig.body.shape).append(underlay, surface);
    } else {
      outer(layer(root, pose, rig.body.after), pose, rig.body.after).after(surface);
    }
    if (rig.body.neck) {
      // The crouched artwork splits a single outline into head/body crops.
      // Dress the leftover shoulder inside the head crop as well, otherwise
      // its opaque rectangular edge covers the shirt when the head rotates.
      const neck = part("wardrobe-side-surface wardrobe-side-neck", shirt);
      layer(root, pose, rig.body.neck).append(neck);
    }
    if (profile === "side" && rig.body.contour !== "fishing") {
      const cuff = document.createElement("div");
      cuff.className = "wardrobe-rear-sleeve";
      surface.append(cuff);
    }
    if (rig.body.sideSleeve) {
      const sleeve = part("wardrobe-side-sleeve", shirt);
      const fabric = document.createElement("div");
      fabric.className = "wardrobe-sleeve";
      sleeve.append(fabric);
      surface.after(sleeve);
    }
    if (rig.body.shoulder) {
      const shoulder = clippedSurface(root, pose, rig.body.shoulder, shirt);
      // The contour's local origin differs from the pose origin.
      // Use a parent-space mask outside it so both coordinate systems align.
      const wrapper = part("wardrobe-fishing-shoulder", shirt);
      shoulder.style.background = shirt.color;
      wrapper.append(shoulder);
      outer(layer(root, pose, rig.body.shoulder), pose, rig.body.shoulder).after(wrapper);
    }
    for (const sleeve of rig.sleeves) {
      const surface = clippedSurface(root, pose, sleeve.node, shirt);
      const fabric = document.createElement("div");
      fabric.className = `wardrobe-sleeve${sleeve.bottom ? " wardrobe-sleeve--bottom" : ""}`;
      surface.append(fabric);
      layer(root, pose, sleeve.node).append(surface);
    }
  }
  if (cap) {
    root.setAttribute("data-wardrobe-overflow", "");
    const head = rig.head;
    const element = part(`wardrobe-cap wardrobe-cap--${head.profile || "front"}`, cap);
    Object.assign(element.style, { left: `${head.x}px`, top: `${head.y}px`, width: `${head.width}px`, height: `${head.height}px` });
    element.classList.add("wardrobe-headwear", `wardrobe-headwear--${cap.kind}`);
    for (const name of ["left", "right", "crown", "band", "badge", "top"]) {
      element.append(detail(`headwear-${name}`));
    }
    const parent = layer(root, pose, head.parent);
    const anchor = outer(layer(root, pose, head.after), pose, head.after);
    if (anchor.parentElement === parent) anchor.after(element);
    else parent.append(element);
    if (head.hair && cap.kind !== "headphones") layer(root, pose, head.hair).setAttribute("data-wardrobe-hidden", "");
  }
}
