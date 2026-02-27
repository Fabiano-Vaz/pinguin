# Pinguim Pet

Projeto Phaser-only em `Vite + TypeScript + Phaser`.

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

## Fluxo de Renderização

1. `GameFramework` cria canvas Phaser.
2. `BootScene` sobe `UIScene` e `MainScene`.
3. `MainScene` instancia pet e sistemas Phaser (`PetState`, `PetMotion`, `PetInteractions`, `PetAI`).
4. `PetBridgeSystem` sincroniza estado com runtime/event bus.
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
