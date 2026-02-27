import Phaser from 'phaser';
import { resolvePenguinAssets, resolvePenguinConfig, resolvePenguinConstants } from '../config/petRuntimeConfig';
import { PetPenguin } from '../entities/PetPenguin';
import { LayerManager } from '../layers/LayerManager';
import { LayerIds } from '../layers/LayerIds';
import { PetAISystem } from '../systems/PetAISystem';
import { PetBridgeSystem } from '../systems/PetBridgeSystem';
import { PetInteractionsSystem } from '../systems/PetInteractionsSystem';
import { PetMotionSystem } from '../systems/PetMotionSystem';
import { PetStateSystem } from '../systems/PetStateSystem';
import type { RuntimeConfig } from '../../runtime/types';

export class MainScene extends Phaser.Scene {
  private layerManager!: LayerManager;
  private petBridgeSystem!: PetBridgeSystem;
  private pet!: PetPenguin;
  private petStateSystem!: PetStateSystem;
  private petMotionSystem!: PetMotionSystem;
  private petInteractionsSystem!: PetInteractionsSystem;
  private petAISystem!: PetAISystem;
  private actionStates!: Record<string, string>;
  private penguinConfig!: { size: number; groundRatio: number; backgroundImage: string };

  constructor() {
    super('framework:main');
  }

  preload(): void {
    const runtime = (window.PINGUIN_RUNTIME ?? {}) as RuntimeConfig;
    this.actionStates = resolvePenguinAssets(runtime);
    this.penguinConfig = resolvePenguinConfig(runtime);
  }

  create(): void {
    this.layerManager = new LayerManager(this);
    this.petBridgeSystem = new PetBridgeSystem(this);
    this.petBridgeSystem.init();

    this.pet = new PetPenguin(
      this,
      this.layerManager.get(LayerIds.Actor),
      {
        idle: this.actionStates.idle,
        default: this.actionStates.default,
        running: this.actionStates.running,
        eating: this.actionStates.eating,
        fishing: this.actionStates.fishing,
        scared: this.actionStates.scared,
        peeking: this.actionStates.peeking,
        flying: this.actionStates.flying,
        thinking: this.actionStates.thinking,
        waving: this.actionStates.waving,
        angry: this.actionStates.angry,
        umbrella: this.actionStates.umbrella,
      },
      {
        size: this.penguinConfig.size,
        groundRatio: this.penguinConfig.groundRatio,
      },
    );
    this.petStateSystem = new PetStateSystem(this, this.pet);
    this.petMotionSystem = new PetMotionSystem(this, this.pet, this.petStateSystem);
    this.petInteractionsSystem = new PetInteractionsSystem(
      this,
      this.pet,
      this.petMotionSystem,
      this.petStateSystem,
    );
    this.petAISystem = new PetAISystem(this, this.pet, this.petMotionSystem, this.petStateSystem);
    this.petInteractionsSystem.init();
    this.petAISystem.init();

    const runtime = (window.PINGUIN_RUNTIME ?? {}) as RuntimeConfig;
    const constants = resolvePenguinConstants(this.penguinConfig);
    const backgroundTargets: Array<HTMLElement> = [];
    if (document.documentElement) backgroundTargets.push(document.documentElement);
    if (document.body) backgroundTargets.push(document.body);
    if (document.body) {
      document.body.style.setProperty('--penguin-size', `${this.penguinConfig.size}px`);
    }
    for (const element of backgroundTargets) {
      element.style.backgroundImage = `url("${this.penguinConfig.backgroundImage}")`;
      element.style.backgroundSize = 'cover';
      element.style.backgroundPosition = 'center bottom';
      element.style.backgroundRepeat = 'no-repeat';
    }

    window.PENGUIN_ASSETS = this.actionStates;
    window.PENGUIN_CONFIG = this.penguinConfig;
    window.PenguinPet = {
      ...(window.PenguinPet ?? {}),
      actionStates: this.actionStates,
      constants: {
        ...(window.PenguinPet?.constants ?? {}),
        ...constants,
      },
      runtime: runtime,
      penguin: this.pet as unknown as Record<string, unknown>,
    };

    const overlayLayer = this.layerManager.get(LayerIds.Overlay);
    overlayLayer.setName('phaser-framework-overlay');

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.petAISystem.destroy();
      this.petBridgeSystem.destroy();
      this.pet.destroy();
    });
  }

  update(_time: number, delta: number): void {
    this.petBridgeSystem.update();
    this.petAISystem.update();
    this.petMotionSystem.update(delta);
    this.petStateSystem.update();
  }
}
