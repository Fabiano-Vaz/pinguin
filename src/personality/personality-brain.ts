export type PersonalityEvent = "affection" | "play" | "fed" | "startled" | "overwhelmed";
export type PersonalityMood = "sleepy" | "shy" | "affectionate" | "playful" | "curious" | "content";
export type PersonalityContext = {
  state: string;
  moving?: boolean;
  raining?: boolean;
  pointerNearby?: boolean;
  fishStock?: number | null;
};
export type PersonalityNeeds = { energy: number; curiosity: number; affection: number; calm: number };
export type PersonalitySnapshot = PersonalityNeeds & { mood: PersonalityMood; intention: string };
export type RoutineIntent = "rest" | "explore" | "play" | "bond" | "relax" | "fish";
const clamp = (n: number) => Math.max(0, Math.min(100, n));

/** Local utility AI: needs change with experience; memory discourages repetition. */
export class PersonalityBrain {
  private needs: PersonalityNeeds;
  private recent: string[] = [];
  private lastEvents = new Map<PersonalityEvent, number>();
  private lastLine = "";
  private random: () => number;
  intention = "fazendo companhia";

  constructor(initial: Partial<PersonalityNeeds> = {}, random = Math.random) {
    this.random = random;
    this.needs = { energy: 78, curiosity: 62, affection: 55, calm: 85 };
    for (const key of Object.keys(this.needs) as (keyof PersonalityNeeds)[]) {
      if (Number.isFinite(initial[key])) this.needs[key] = clamp(initial[key]!);
    }
  }

  update(seconds: number, context: PersonalityContext) {
    const dt = Math.max(0, Math.min(1, Number.isFinite(seconds) ? seconds : 0));
    const sleeping = context.state === "sleeping";
    const energetic = context.moving || ["dancing", "jumping", "flying", "happyJump"].includes(context.state);
    this.needs.energy = clamp(this.needs.energy + dt * (sleeping ? 2.8 : energetic ? -0.65 : -0.08));
    this.needs.curiosity = clamp(this.needs.curiosity + dt * (context.moving || context.state === "peeking" ? -1.2 : 0.3));
    this.needs.calm = clamp(this.needs.calm + dt * (sleeping ? 1.5 : 0.65));
    this.needs.affection = clamp(this.needs.affection - dt * 0.015);
  }

  react(event: PersonalityEvent, now = Date.now()): boolean {
    if (now - (this.lastEvents.get(event) ?? -Infinity) < 1800) return false;
    this.lastEvents.set(event, now);
    const changes: Record<PersonalityEvent, Partial<PersonalityNeeds>> = {
      affection: { affection: 9, calm: 9 },
      play: { affection: 5, curiosity: -14, energy: -3 },
      fed: { energy: 14, affection: 6, calm: 7 },
      startled: { calm: -18 },
      overwhelmed: { calm: -24, affection: -3 },
    };
    for (const [key, amount] of Object.entries(changes[event])) {
      this.needs[key] = clamp(this.needs[key] + amount);
    }
    return true;
  }

  get snapshot(): PersonalitySnapshot {
    const { energy, calm, affection, curiosity } = this.needs;
    let mood: PersonalityMood = "content";
    if (energy < 28) mood = "sleepy";
    else if (calm < 40) mood = "shy";
    else if (affection > 73) mood = "affectionate";
    else if (energy > 60 && curiosity > 42) mood = "playful";
    else if (curiosity > 58) mood = "curious";
    return { ...this.needs, mood, intention: this.intention };
  }

  score(intent: RoutineIntent, context: PersonalityContext) {
    const n = this.needs;
    const scores: Record<RoutineIntent, number> = {
      rest: n.energy < 28 ? 220 : Math.max(0.2, (55 - n.energy) * 1.2),
      explore: 5 + n.curiosity * 0.45,
      play: n.energy > 40 && n.calm > 40 ? 12 + n.energy * 0.35 : 0.1,
      bond: 12 + n.affection * 0.2 + (context.pointerNearby ? 30 : 0),
      relax: 9 + (100 - n.calm) * 0.8 + (context.raining ? 25 : 0),
      fish: context.fishStock === 0 ? 1000 : context.fishStock != null && context.fishStock < 10 ? 80 : 22,
    };
    return scores[intent];
  }

  choose<T extends { id: string; intent: RoutineIntent; label: string }>(routines: T[], context: PersonalityContext): T | null {
    if (!routines.length) return null;
    const urgent = context.fishStock === 0 ? "fish" : this.needs.energy < 18 ? "rest" : null;
    const candidates = urgent ? routines.filter(r => r.intent === urgent) : routines;
    const pool = candidates.length ? candidates : routines;
    const entries = pool.map(routine => {
      const index = this.recent.indexOf(routine.id);
      const novelty = index === 0 ? 0.03 : index > 0 ? 0.4 : 1;
      return { routine, weight: this.score(routine.intent, context) * (urgent ? 1 : novelty) };
    });
    let roll = Math.max(0, Math.min(0.999999, this.random())) * entries.reduce((sum, e) => sum + e.weight, 0);
    const selected = entries.find(e => (roll -= e.weight) < 0)?.routine || entries[entries.length - 1].routine;
    this.recent = [selected.id, ...this.recent.filter(id => id !== selected.id)].slice(0, 4);
    this.intention = selected.label;
    return selected;
  }

  pickLine(lines: readonly string[]): string {
    const fresh = lines.filter(line => line !== this.lastLine);
    const pool = fresh.length ? fresh : lines;
    this.lastLine = pool[Math.min(pool.length - 1, Math.floor(this.random() * pool.length))] || "";
    return this.lastLine;
  }
}
