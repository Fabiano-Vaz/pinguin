import { WardrobeStore } from "../wardrobe/wardrobe-store.ts";
import { bindWardrobeSelect } from "../wardrobe/wardrobe-controls.ts";
import { createArtwork } from "./artwork.ts";
import { artworkTemplates } from "./artwork-templates.ts";

const labels: Record<string, string> = {
  idle: "Sentado", default: "Em pé", running: "Correndo", runningCrouched: "Correndo abaixado",
  flying: "Voando", dancing: "Dançando", sleeping: "Dormindo", scared: "Assustado",
  crying: "Chorando", beaten: "Apanhando", angry: "Com raiva", scratching: "Coçando a cabeça",
  waving: "Dando tchau", shy: "Envergonhado", peeking: "Espiando", laughing: "Gargalhando",
  thinking: "Apaixonado", eating: "Comendo peixe", full: "Barriga cheia", fishing: "Pescando",
  turningBack: "De costas", umbrella: "Guarda-chuva", caveirinha: "Caveirinha",
  deadLying: "Deitado", trace: "Pulo do Runner", snowman: "Boneco de neve", cruzeiro: "Cruzeiro",
  pondering: "Pensando", happyJump: "Pulando feliz",
};
const fittingRoom = new WardrobeStore();
fittingRoom.catalog.forEach((item) => fittingRoom.grant(item.id));
const gallery = document.querySelector("#poses")!;
function renderGallery() {
  gallery.replaceChildren(...Object.keys(artworkTemplates).map((pose) => {
    const card = document.createElement("article");
    const title = document.createElement("h2");
    title.textContent = labels[pose] || pose;
    card.append(createArtwork(`css:${pose}`, fittingRoom), title);
    return card;
  }));
}
renderGallery();
document.querySelector<HTMLInputElement>("#size")!.addEventListener("input", (event) => {
  const size = (event.target as HTMLInputElement).value;
  document.documentElement.style.setProperty("--preview-size", `${size}px`);
  document.querySelector("#size-value")!.textContent = `${size} px`;
});
document.querySelector("#pause")!.addEventListener("click", (event) => {
  const paused = document.body.classList.toggle("paused");
  const button = event.currentTarget as HTMLButtonElement;
  button.setAttribute("aria-pressed", String(paused));
  button.textContent = paused ? "Retomar animações" : "Pausar animações";
});
document.querySelector("#restart")!.addEventListener("click", renderGallery);

bindWardrobeSelect(document.querySelector<HTMLSelectElement>("#shirt")!, "body", undefined, fittingRoom);
bindWardrobeSelect(document.querySelector<HTMLSelectElement>("#cap")!, "head", undefined, fittingRoom);
document.querySelector("#flip")!.addEventListener("click", (event) => {
  const flipped = document.body.classList.toggle("flipped");
  (event.currentTarget as HTMLButtonElement).setAttribute("aria-pressed", String(flipped));
});
