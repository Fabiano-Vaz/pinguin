import { PersonalityBrain, type PersonalityContext } from "../personality/personality-brain.ts";
import { PERSONALITY_ROUTINES, type BehaviorStep } from "../personality/routines.ts";

type BehaviorBuilder = () => BehaviorStep[];
type BehaviorSelectionServiceDeps = {
  getFishStock?: () => number | null;
  personality?: PersonalityBrain;
  getContext?: () => PersonalityContext;
};

/** Picks one complete intention. Builders are evaluated once, when selected. */
export class BehaviorSelectionService {
  private brain: PersonalityBrain;
  private getFishStock: () => number | null;
  private getContext: () => PersonalityContext;

  constructor({ getFishStock = () => null, personality = new PersonalityBrain(), getContext = () => ({ state: "idle" }) }: BehaviorSelectionServiceDeps = {}) {
    this.brain = personality;
    this.getFishStock = getFishStock;
    this.getContext = getContext;
  }

  chooseNextBehavior(): BehaviorBuilder | null {
    const selected = this.brain.choose(PERSONALITY_ROUTINES, { ...this.getContext(), fishStock: this.getFishStock() });
    if (!selected) return null;
    return () => selected.steps.map(step => ({ ...step }));
  }
}
