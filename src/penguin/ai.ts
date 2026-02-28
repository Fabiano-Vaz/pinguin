import { createCoreMethods } from "./ai/core";
import { createFoodMethods } from "./ai/food";
import { createSocialMethods } from "./ai/social";
import { createPlannerMethods } from "./ai/planner";
import { createWalkAction } from "./ai/actions/walk";
import { createJumpMoveAction } from "./ai/actions/jump-move";
import { createFlyMoveAction } from "./ai/actions/fly-move";
import { createSequenceAction } from "./ai/actions/sequence";
import { createActAction } from "./ai/actions/act";

(() => {
  const modules = (window.PenguinPetModules = window.PenguinPetModules || {});

  modules.ai = (deps) =>
    Object.assign(
      {},
      createCoreMethods(deps),
      createFoodMethods(deps),
      createSocialMethods(deps),
      createPlannerMethods(deps),
      createWalkAction(deps),
      createJumpMoveAction(deps),
      createFlyMoveAction(deps),
      createSequenceAction(deps),
      createActAction(deps),
    );
})();
