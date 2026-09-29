import type { RoutineIntent } from "./personality-brain.ts";
export type BehaviorStep = {
  type: string; state?: string; duration?: number; line?: string; quiet?: boolean;
  deliberate?: boolean; holdAfterMs?: number; [key: string]: unknown;
};
export type PersonalityRoutine = { id: string; intent: RoutineIntent; label: string; steps: BehaviorStep[] };
const act = (state: string, duration: number, line?: string): BehaviorStep => ({ type: "act", state, duration, line, quiet: !line, deliberate: true });
export const PERSONALITY_ROUTINES: PersonalityRoutine[] = [
  { id: "little-expedition", intent: "explore", label: "investigando o cantinho", steps: [act("peeking", 1400, "licença, inspeção de fofura chegando"), { type: "walkShort", holdAfterMs: 350 }, act("pondering", 2200), act("idle", 1800)] },
  { id: "detective", intent: "explore", label: "seguindo uma pista imaginária", steps: [act("scratching", 1600), { type: "walkEdge", holdAfterMs: 450 }, act("peeking", 2400, "achei! ...era minha própria sombra"), act("idle", 2400)] },
  { id: "tiny-disco", intent: "play", label: "ensaiando um passinho", steps: [act("default", 700), act("dancing", 3500, "duas patinhas, zero vergonha ✨"), act("shy", 1500), act("idle", 1800)] },
  { id: "flight-school", intent: "play", label: "treinando um voo pequenininho", steps: [act("pondering", 1400, "hoje eu voo. nem que seja dois centímetros"), { type: "jumpMove", duration: 550 }, act("waving", 1800, "pouso perfeito. ninguém viu nada"), act("idle", 1800)] },
  { id: "hello-human", intent: "bond", label: "fazendo companhia", steps: [act("waving", 2300, "oi, humano! trouxe minha presença ilustre"), act("thinking", 2400), act("idle", 3500)] },
  { id: "little-secret", intent: "bond", label: "dividindo um segredo", steps: [act("peeking", 1500), act("shy", 2300, "segredinho: gosto de ficar aqui com você"), act("thinking", 1800), act("idle", 3000)] },
  { id: "power-nap", intent: "rest", label: "recarregando as patinhas", steps: [act("default", 900, "vou fechar os olhinhos. cuida dos peixes?"), act("idle", 1700), act("sleeping", 18000), act("default", 1300), act("waving", 1900, "voltei! versão fofinha recarregada") ] },
  { id: "cozy-break", intent: "relax", label: "curtindo uma pausa", steps: [act("default", 900), act("idle", 6000, "sem pressa. até pinguim precisa de um respiro"), act("pondering", 2200), act("idle", 2400)] },
  { id: "gone-fishing", intent: "fish", label: "buscando um lanchinho", steps: [act("pondering", 1200, "missão do dia: um peixinho pra chamar de meu"), { type: "walkEdge", holdAfterMs: 450 }, { type: "act", state: "fishing", duration: 15000, deliberate: true }, act("waving", 1800)] },
];
