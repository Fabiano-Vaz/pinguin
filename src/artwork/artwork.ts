import { getWardrobe, type WardrobeStore } from "../wardrobe/wardrobe-store.ts";
import { renderOutfit } from "../wardrobe/render-outfit.ts";
import { artworkTemplates } from "./artwork-templates.ts";

/** A pose is HTML + CSS. JavaScript only selects it and fits its coordinate system. */
const templates = new Map<string, HTMLTemplateElement>();
const tagName = "penguin-artwork";
const wardrobes = new WeakMap<HTMLElement, WardrobeStore>();
const wardrobeFor = (element: HTMLElement) => wardrobes.get(element) || getWardrobe();

function fitArtwork(element: HTMLElement) {
  const canvas = element.firstElementChild as HTMLElement | null;
  const pose = artworkTemplates[element.dataset.pose || ""];
  if (!canvas || !pose) return;
  const width = element.clientWidth;
  const height = element.clientHeight;
  const scale = Math.min(width / pose.width, height / pose.height);
  // CSS zoom paints curves at their final size, avoiding a blurred scaled texture.
  canvas.style.zoom = String(scale || 1);
  canvas.style.left = `${scale ? (width / scale - pose.width) / 2 : 0}px`;
  canvas.style.top = `${scale ? (height / scale - pose.height) / 2 : 0}px`;
}

function registerArtwork() {
  if (customElements.get(tagName)) return;
  customElements.define(tagName, class extends HTMLElement {
    private resizeObserver?: ResizeObserver;
    private unsubscribe?: () => void;

    connectedCallback() {
      this.unsubscribe?.();
      const wardrobe = wardrobeFor(this);
      this.unsubscribe = wardrobe.subscribe(() => renderOutfit(this, wardrobe));
      renderOutfit(this, wardrobe);
      this.resizeObserver ||= new ResizeObserver(() => fitArtwork(this));
      this.resizeObserver.observe(this);
      fitArtwork(this);
    }

    disconnectedCallback() {
      this.resizeObserver?.disconnect();
      this.unsubscribe?.();
      this.unsubscribe = undefined;
    }
  });
}

export function createArtwork(asset = "css:default", wardrobe: WardrobeStore = getWardrobe()): HTMLElement {
  registerArtwork();
  const element = document.createElement(tagName);
  wardrobes.set(element, wardrobe);
  element.classList.add("css-artwork");
  element.setAttribute("role", "img");
  element.draggable = false;
  setArtwork(element, asset);
  return element;
}

export function setArtwork(element: HTMLElement, asset: string) {
  if (element.dataset.artwork === asset) return;
  element.dataset.artwork = asset;
  const requestedPose = asset.startsWith("css:") ? asset.slice(4) : "";
  const poseName = requestedPose === "jumping" ? "flying" : requestedPose;
  const pose = artworkTemplates[poseName];
  if (!pose) {
    // Preserve the public asset-override API for user-supplied images.
    if (!requestedPose && asset) {
      const image = document.createElement("img");
      image.src = asset;
      image.alt = "";
      image.draggable = false;
      element.removeAttribute("data-pose");
      element.replaceChildren(image);
      return;
    }
    setArtwork(element, "css:default");
    return;
  }
  let template = templates.get(poseName);
  if (!template) {
    template = document.createElement("template");
    template.innerHTML = `<div class="art-canvas" aria-hidden="true">${pose.html}</div>`;
    templates.set(poseName, template);
  }
  element.dataset.pose = poseName;
  element.style.aspectRatio = `${pose.width} / ${pose.height}`;
  element.setAttribute("aria-label", poseName === "umbrella" ? "Guarda-chuva" : poseName === "snowman" ? "Boneco de neve" : "Pinguim");
  element.replaceChildren(template.content.cloneNode(true));
  const canvas = element.firstElementChild as HTMLElement;
  canvas.style.width = `${pose.width}px`;
  canvas.style.height = `${pose.height}px`;
  renderOutfit(element, wardrobeFor(element));
  fitArtwork(element);
}
