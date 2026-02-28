const vscode = require("vscode");
const penguinShared = require("./src/pet-shared");

const SIDEBAR_VIEW_ID = "pinguinPet.sidebar";

function activate(context) {
  const provider = new PenguinSidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(SIDEBAR_VIEW_ID, provider, {
      webviewOptions: { retainContextWhenHidden: true },
    }),
  );

  const openCommand = vscode.commands.registerCommand(
    "pinguin.openPet",
    async () => {
      await vscode.commands.executeCommand("workbench.view.explorer");
      try {
        await vscode.commands.executeCommand(`${SIDEBAR_VIEW_ID}.focus`);
      } catch {
        // Sem foco explícito disponível, abrir o Explorer já torna a view acessível.
      }
    },
  );

  context.subscriptions.push(openCommand);

  const config = vscode.workspace.getConfiguration();
  const autoOpen = config.get("pinguin.autoOpenOnStartup", true);

  if (autoOpen) {
    void vscode.commands.executeCommand("pinguin.openPet");
  }
}

class PenguinSidebarProvider {
  constructor(extensionUri) {
    this.extensionUri = extensionUri;
  }

  resolveWebviewView(webviewView) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.extensionUri, "assets"),
        vscode.Uri.joinPath(this.extensionUri, "image"),
        vscode.Uri.joinPath(this.extensionUri, "css"),
        vscode.Uri.joinPath(this.extensionUri, "src"),
      ],
    };
    webviewView.webview.html = getWebviewContent(
      webviewView.webview,
      this.extensionUri,
    );
  }
}

function getWebviewContent(webview, extensionUri) {
  const cssUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "css", "style.css"),
  );
  const nonce = createNonce();
  const scriptEntries = [
    "pet-shared.js",
    "config/pet-config.js",
    "config/game-config.js",
    "content/pet-content.js",
    "effects/effects-core.js",
    "effects/particle-effects.js",
    "effects/food-effects.js",
    "effects/lightning-effects.js",
    "effects/rain-effects.js",
    "effects/wind-effects.js",
    "effects/weather-cycles.js",
    "pet-effects.js",
    "penguin/penguin-core.js",
    "penguin/state.js",
    "penguin/speech.js",
    "penguin/motion.js",
    "penguin/ai.js",
    "penguin/interactions.js",
    "penguin/penguin.js",
    "runtime/pet-fish-economy.js",
    "runtime/pet-environment-events.js",
    "app/pet-bootstrap.js",
    "script.js",
    "games/runner/runner-context.js",
    "games/runner/runner-obstacles.js",
    "games/runner/penguin-runner-game.js",
  ];
  const scriptTags = scriptEntries
    .map((scriptPath) => {
      const scriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, "src", ...scriptPath.split("/")),
      );
      return `  <script nonce="${nonce}" src="${scriptUri}"></script>`;
    })
    .join("\n");
  const backgroundUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "assets", "backgroung-dark.png"),
  );

  const webviewAssets = penguinShared.buildAssetPaths((fileName) =>
    webview
      .asWebviewUri(vscode.Uri.joinPath(extensionUri, "assets", fileName))
      .toString(),
  );

  const webviewConfig = penguinShared.getMergedConfig({
    size: 86,
    groundRatio: 0.86,
    backgroundImage: backgroundUri.toString(),
  });

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data:; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <title>Pinguim Pet</title>
  <link rel="stylesheet" href="${cssUri}">
</head>
<body>
  <script nonce="${nonce}">
    window.PENGUIN_ASSETS = ${JSON.stringify(webviewAssets)};
    window.PENGUIN_CONFIG = ${JSON.stringify(webviewConfig)};
  </script>
${scriptTags}
</body>
</html>`;
}

function createNonce() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let nonce = "";
  for (let i = 0; i < 32; i += 1) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return nonce;
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
