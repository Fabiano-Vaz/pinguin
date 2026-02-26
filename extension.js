const vscode = require("vscode");
const penguinShared = require("./js/pet-shared");

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
        vscode.Uri.joinPath(this.extensionUri, "js"),
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
  const sharedJsUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "js", "pet-shared.js"),
  );
  const configJsUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "js", "pet-config.js"),
  );
  const contentJsUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "js", "pet-content.js"),
  );
  const effectsJsUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "js", "pet-effects.js"),
  );
  const penguinStateJsUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "js", "pet-penguin-state.js"),
  );
  const penguinSpeechJsUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "js", "pet-penguin-speech.js"),
  );
  const penguinMotionJsUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "js", "pet-penguin-motion.js"),
  );
  const penguinAiJsUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "js", "pet-penguin-ai.js"),
  );
  const penguinInteractionsJsUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "js", "pet-penguin-interactions.js"),
  );
  const penguinJsUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "js", "pet-penguin.js"),
  );
  const bootstrapJsUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "js", "script.js"),
  );
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

  const nonce = createNonce();

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
  <script nonce="${nonce}" src="${sharedJsUri}"></script>
  <script nonce="${nonce}" src="${configJsUri}"></script>
  <script nonce="${nonce}" src="${contentJsUri}"></script>
  <script nonce="${nonce}" src="${effectsJsUri}"></script>
  <script nonce="${nonce}" src="${penguinStateJsUri}"></script>
  <script nonce="${nonce}" src="${penguinSpeechJsUri}"></script>
  <script nonce="${nonce}" src="${penguinMotionJsUri}"></script>
  <script nonce="${nonce}" src="${penguinAiJsUri}"></script>
  <script nonce="${nonce}" src="${penguinInteractionsJsUri}"></script>
  <script nonce="${nonce}" src="${penguinJsUri}"></script>
  <script nonce="${nonce}" src="${bootstrapJsUri}"></script>
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
