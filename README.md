# Pinguim Pet

Projeto com comportamento legacy preservado (pet passivo, interacoes de mouse, cursor de peixe, contador e runner no Space), agora com pipeline `Vite + TypeScript + Phaser`.

## Como funciona

- O runtime agora fica na raiz: `legacy/`, `phaser/`, `runtime/`, `styles/` e `main.ts`.
- A logica legacy foi modularizada por camada em `legacy/layers/**`.
- `main.ts` sobe o framework Phaser e inicializa o bootstrap legacy em TS.
- `Phaser` segue disponivel em `window.Phaser` sem mudar o comportamento final.
- Na extensao, o webview roda exclusivamente o bundle Vite (`dist/web/app.js`).

## Comandos

```bash
npm install
npm run dev
npm run build:web
npm run preview
```

## Extensao VS Code

1. Rode `npm run build:web`.
2. Recarregue o VS Code (`Developer: Reload Window`).
3. Abra `Pinguim: Mostrar no Explorador`.
