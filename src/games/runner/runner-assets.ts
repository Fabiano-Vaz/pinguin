(() => {
  const modules = (window.PenguinRunnerModules = window.PenguinRunnerModules || {});

  modules.createRunnerAssets = ({ actionStates }) => {
    const resolveSprite = (assetKey, fallbackPath) => {
      const byKey = actionStates[assetKey];
      if (typeof byKey === "string" && byKey.length > 0) return byKey;
      return fallbackPath;
    };

    const sprites = {
      running: resolveSprite("running", "assets/pinguin correndo.svg"),
      crouching: resolveSprite(
        "runningCrouched",
        "assets/pinguin correndo abaixado.svg",
      ),
      jumping: resolveSprite("trace", "assets/trace.svg"),
      front: resolveSprite("default", "assets/pinguin.svg"),
      crying: resolveSprite("crying", "assets/pinguin chorando.svg"),
      angry: resolveSprite("angry", "assets/pinguin com raiva.svg"),
      flying: resolveSprite("flying", "assets/pinguin voando.svg"),
      caveirinha: resolveSprite("caveirinha", "assets/pinguin caveirinha.svg"),
    };

    const runnerBackgroundDarkBImage = resolveSprite(
      "runnerBackgroundDarkB",
      "assets/backgroung-darkB.png",
    );
    const runnerMoonImage = resolveSprite("moon", "assets/lua.png");
    const snowmanObstacleImage = resolveSprite("snowman", "assets/snowman.svg");

    const helicopterVariants = [
      {
        key: "A",
        src: resolveSprite("helicopterA", "assets/helicopterA.gif"),
        scale: 4,
        hitboxInsetRatios: {
          left: 0.37,
          right: 0.39,
          top: 0.34,
          bottom: 0.34,
        },
      },
      {
        key: "B",
        src: resolveSprite("helicopterB", "assets/helicopterB.gif"),
        scale: 8,
        hitboxInsetRatios: {
          left: 0.4,
          right: 0.42,
          top: 0.37,
          bottom: 0.35,
        },
      },
    ];

    return {
      sprites,
      runnerBackgroundDarkBImage,
      runnerMoonImage,
      snowmanObstacleImage,
      helicopterVariants,
    };
  };
})();
