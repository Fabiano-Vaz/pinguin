# Pinguim Pet

Projeto com runtime híbrido em `Vite + TypeScript + Phaser`, mantendo uma camada legacy mínima para compatibilidade de comportamento.

## Arquitetura Final

### Núcleo Phaser

- `phaser/scenes/BootScene.ts`
Inicia `framework:ui` e `framework:main`.
- `phaser/scenes/MainScene.ts`
Orquestra o estado principal e integra `PetBridgeSystem`.
- `phaser/scenes/RunnerScene.ts`
Minigame runner migrado para Phaser.
- `phaser/scenes/UIScene.ts`
Camada de UI e efeitos (speech, neve, chuva, relâmpago, raio, vento).
- `phaser/systems/**`
Sistemas de bridge, estado, movimento, interações e IA em Phaser.

### Runtime/Event Bus

- `runtime/eventBus.ts`
Padroniza `onEvent/offEvent/emitEvent`.
- `runtime/types.ts`
Contrato único de eventos entre legacy e Phaser.
- `main.ts`
Sobe o framework Phaser e depois injeta compatibilidade legacy.

### Legacy (Compatibilidade Mínima)

- `legacy/legacyBootstrap.ts`
Carrega apenas módulos legacy ainda necessários para integração gradual.
- `legacy/layers/environment/pet-effects.ts`
Bridge de efeitos para eventos Phaser.
- `legacy/layers/actor/pet-penguin-speech.ts`
Bridge de falas para `UIScene`.
- `legacy/layers/**`
Módulos ainda não totalmente migrados permanecem funcionando via bootstrap.

## Fluxo de Renderização

1. `GameFramework` cria canvas Phaser.
2. `BootScene` sobe `UIScene` e `MainScene`.
3. `MainScene` sincroniza estado com runtime via `PetBridgeSystem`.
4. Módulos legacy emitem eventos (`effects:*`, `ui:*`) no event bus.
5. `UIScene` renderiza efeitos/UI com Phaser.

## Comandos

```bash
npm install
npm run dev
npm run build:web
npm run preview
```

## Extensao VS Code

1. Rode `npm run build:web`
2. Recarregue o VS Code (`Developer: Reload Window`).
3. Abra `Pinguim: Mostrar no Explorador`.
