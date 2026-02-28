(() => {
  const effects = window.PenguinPetEffects || {};

  effects.getPet = () => window.PenguinPet || {};
  effects.getConstants = () => effects.getPet().constants || {};
  effects.getPhrases = () => effects.getPet().phrases || {};

  effects.state = effects.state || {
    snowSpawnIntervalId: null,
    snowCooldownTimeoutId: null,
    snowActiveTimeoutId: null,
    snowManualMode: false,
    snowmanSpawnIntervalId: null,
    snowmanDespawnTimeoutId: null,
    snowmanApproachPollIntervalId: null,
    snowmanFlirtIntervalId: null,
    activeSnowmanEl: null,
    isSnowmanEncounterActive: false,
    rainSpawnIntervalId: null,
    rainCooldownTimeoutId: null,
    rainActiveTimeoutId: null,
    rainManualMode: false,
    rainLightningTimeoutId: null,
    lastLightningScareAt: 0,
    shootingStarTimeoutId: null,
    shootingStarReactionTimeoutId: null,
  };

  window.PenguinPetEffects = effects;
})();
