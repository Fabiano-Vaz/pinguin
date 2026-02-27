(() => {
  const modules = window.PenguinPetModules || {};
  if (typeof modules.bootstrapPetApp === "function") {
    modules.bootstrapPetApp();
  }
})();
