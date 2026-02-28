import { chance, pickRandom } from "../helpers/random";

const EXPRESSIVE_STATES = Object.freeze([
  "thinking",
  "peeking",
  "waving",
  "dancing",
  "scratching",
  "turningBack",
]);

type BehaviorStep = {
  type?: string;
  state?: string;
};

type BehaviorBuilder = () => BehaviorStep[];

type BehaviorSelectionServiceDeps = {
  behaviors?: BehaviorBuilder[];
  getFishStock?: () => number | null;
};

export class BehaviorSelectionService {
  behaviors: BehaviorBuilder[];
  getFishStock: () => number | null;

  constructor({ behaviors = [], getFishStock = () => null }: BehaviorSelectionServiceDeps = {}) {
    this.behaviors = Array.isArray(behaviors) ? behaviors : [];
    this.getFishStock = typeof getFishStock === "function" ? getFishStock : () => null;
  }

  hasActState(steps: BehaviorStep[], state: string): boolean {
    return (
      Array.isArray(steps) &&
      steps.some(
        (step) =>
          step &&
          step.type === "act" &&
          typeof step.state === "string" &&
          step.state === state,
      )
    );
  }

  hasAnyActState(steps: BehaviorStep[], states: readonly string[]): boolean {
    return (
      Array.isArray(steps) &&
      steps.some(
        (step) =>
          step &&
          step.type === "act" &&
          typeof step.state === "string" &&
          states.includes(step.state),
      )
    );
  }

  hasFlyMove(steps: BehaviorStep[]): boolean {
    return Array.isArray(steps) && steps.some((step) => step && step.type === "flyMove");
  }

  buildEntries() {
    return this.behaviors
      .filter((builder) => typeof builder === "function")
      .map((builder) => ({ builder, steps: builder() }));
  }

  chooseNextBehavior(): BehaviorBuilder | null {
    const entries = this.buildEntries();
    const allBuilders = entries.map(({ builder }) => builder);
    const fallbackBehavior = pickRandom(allBuilders, null);

    const fishingBehaviorEntry = entries.find(({ steps }) => this.hasActState(steps, "fishing"));
    const fishingBehavior = fishingBehaviorEntry ? fishingBehaviorEntry.builder : null;
    const flyBehaviors = entries
      .filter(({ steps }) => this.hasFlyMove(steps))
      .map(({ builder }) => builder);
    const sleepBehaviors = entries
      .filter(({ steps }) => this.hasActState(steps, "sleeping"))
      .map(({ builder }) => builder);
    const expressiveBehaviors = entries
      .filter(({ steps }) => this.hasAnyActState(steps, EXPRESSIVE_STATES))
      .map(({ builder }) => builder);

    const fishStock = this.getFishStock();
    const shouldPrioritizeFishing = fishStock !== null && fishStock <= 0 && chance(0.9);
    const shouldRandomlyPickFishing =
      !shouldPrioritizeFishing &&
      fishingBehavior &&
      fishStock !== null &&
      fishStock > 0 &&
      chance(0.24);
    const shouldPreferSleepBehavior =
      !shouldPrioritizeFishing &&
      !shouldRandomlyPickFishing &&
      sleepBehaviors.length > 0 &&
      chance(0.34);
    const shouldPreferExpressiveBehavior =
      !shouldPrioritizeFishing &&
      !shouldRandomlyPickFishing &&
      !shouldPreferSleepBehavior &&
      expressiveBehaviors.length > 0 &&
      chance(0.48);
    const shouldPreferFlyBehavior =
      !shouldPrioritizeFishing &&
      !shouldRandomlyPickFishing &&
      !shouldPreferSleepBehavior &&
      !shouldPreferExpressiveBehavior &&
      flyBehaviors.length > 0 &&
      chance(0.34);

    if (shouldPrioritizeFishing && fishingBehavior) return fishingBehavior;
    if (shouldRandomlyPickFishing && fishingBehavior) return fishingBehavior;
    if (shouldPreferSleepBehavior) return pickRandom(sleepBehaviors, fallbackBehavior);
    if (shouldPreferExpressiveBehavior) return pickRandom(expressiveBehaviors, fallbackBehavior);
    if (shouldPreferFlyBehavior) return pickRandom(flyBehaviors, fallbackBehavior);
    return fallbackBehavior;
  }
}
