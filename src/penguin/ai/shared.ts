export const AI_ACTION_REGISTRY = Object.freeze({
  walk: "Walk to a random target using normal speed.",
  walkFast: "Walk to a random target using fast speed.",
  walkEdge: "Walk close to screen edge.",
  walkShort: "Short walk around current area.",
  jumpMove: "Vertical jump arc and continue behavior sequence.",
  flyMove: "Short boosted vertical hop (fly-like) and continue sequence.",
  sequence: "Play a custom visual state sequence.",
  act: "Perform a state action for a duration.",
  "act:fishing": "Fishing action loop with timed fish rewards.",
  "act:laughing": "Special laugh sequence before continuing.",
});

export const pickRandomLine = (lines, fallback = "") => {
  if (!Array.isArray(lines) || lines.length === 0) return fallback;
  return lines[Math.floor(Math.random() * lines.length)] || fallback;
};
