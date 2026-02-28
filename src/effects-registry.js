(() => {
  const pet = window.PenguinPet || {};
  const modules = window.PenguinPetEffects || {};

  window.PenguinPet = {
    ...pet,
    effects: {
      ...(pet.effects || {}),
      createClickEffect: modules.createClickEffect,
      createFoodDrops: modules.createFoodDrops,
      createBackgroundParticles: modules.createBackgroundParticles,
      createShootingStar: modules.createShootingStar,
      startSnowCycle: modules.startSnowCycle,
      startRainCycle: modules.startRainCycle,
      stopSnowCycle: modules.stopSnowCycle,
      stopRainCycle: modules.stopRainCycle,
      isSnowing: modules.isSnowing,
      isRaining: modules.isRaining,
      spawnExtraSnow: modules.spawnExtraSnow,
      createLightningFlash: modules.createLightningFlash,
      createLightningBolt: modules.createLightningBolt,
      createWindGust: modules.createWindGust,
      triggerShootingStarEvent: modules.triggerShootingStarEvent,
      startShootingStarCycle: modules.startShootingStarCycle,
      stopShootingStarCycle: modules.stopShootingStarCycle,
    },
  };
})();
