export {};

import { getPenguinRunnerModules } from "../../runtime/webview-globals.ts";
import type { RunnerAssetsFactory } from "../../types/webview-runtime.ts";

const modules = getPenguinRunnerModules();

modules.createRunnerAssets = ({
  actionStates,
}: {
  actionStates: Record<string, string>;
}): RunnerAssetsFactory => {
  const resolveSprite = (assetKey: string, fallbackPath: string): string => {
    const byKey = actionStates[assetKey];
    if (typeof byKey === "string" && byKey.length > 0) return byKey;
    return fallbackPath;
  };

  const sprites = {
    running: resolveSprite("running", "css:running"),
    crouching: resolveSprite(
      "runningCrouched",
      "css:runningCrouched",
    ),
    jumping: resolveSprite("trace", "css:trace"),
    front: resolveSprite("default", "css:default"),
    crying: resolveSprite("crying", "css:crying"),
    angry: resolveSprite("angry", "css:angry"),
    flying: resolveSprite("flying", "css:flying"),
    caveirinha: resolveSprite("caveirinha", "css:caveirinha"),
  };

  const runnerBackgroundDarkBImage = resolveSprite(
    "runnerBackgroundDarkB",
    "assets/backgroung-darkB.png",
  );
  const runnerMoonImage = resolveSprite("moon", "assets/lua.png");
  const snowmanObstacleImage = resolveSprite("snowman", "css:snowman");

  const helicopterVariants = [
    {
      key: "A",
      src: resolveSprite("plane", "assets/plane.gif"),
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
