import "./interactions-mouse";
import "./interactions-pointer";
import "./interactions-click";

(() => {
  const modules = (window.PenguinPetModules = window.PenguinPetModules || {});
  const PENGUIN_DOUBLE_CLICK_MS = 450;
  const MOUSE_IDLE_MOVEMENT_THRESHOLD_PX = 10;

  modules.interactions = ({
    runtime,
    phrases,
    SPEED_WALK,
    SPEED_CHASE,
    SPEED_FLEE,
    MOUSE_IDLE_TRIGGER_MS,
    MOUSE_IDLE_REACTION_COOLDOWN_MS,
    halfPenguinSize,
    penguinSize,
  }) => {
    const deps = {
      runtime,
      phrases,
      SPEED_WALK,
      SPEED_CHASE,
      SPEED_FLEE,
      MOUSE_IDLE_TRIGGER_MS,
      MOUSE_IDLE_REACTION_COOLDOWN_MS,
      halfPenguinSize,
      penguinSize,
      PENGUIN_DOUBLE_CLICK_MS,
      MOUSE_IDLE_MOVEMENT_THRESHOLD_PX,
    };

    return {
      ...(modules.interactionsMouse ? modules.interactionsMouse(deps) : {}),
      ...(modules.interactionsPointer ? modules.interactionsPointer(deps) : {}),
      ...(modules.interactionsClick ? modules.interactionsClick(deps) : {}),
    };
  };
})();
