const vscode = require("vscode");

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
  const jsUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "js", "script.js"),
  );
  const backgroundUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "assets", "backgroung-dark.png"),
  );

  const assets = {
    idle: "pinguin.svg",
    running: "pinguin correndo.svg",
    jumping: "pinguin pulando feliz.svg",
    dancing: "pinguin dançando.svg",
    sleeping: "pinguin dormindo.svg",
    scared: "pinguin assustado.svg",
    crying: "pinguin chorando.svg",
    angry: "pinguin com raiva.svg",
    scratching: "pinguin coçando a cabecinha.svg",
    waving: "pinguin dando tchau.svg",
    shy: "pinguin-apaixonado.svg",
    peeking: "pinguin espiando curioso.svg",
    laughing: "pinguin gargalhando.svg",
    thinking: "pinguin-apaixonado.svg",
    flying: "pinguin voando.svg",
  };

  const webviewAssets = {};
  for (const [state, filePath] of Object.entries(assets)) {
    const segments = filePath.split("/");
    const assetUri =
      segments.length > 1
        ? vscode.Uri.joinPath(extensionUri, ...segments)
        : vscode.Uri.joinPath(extensionUri, "assets", filePath);

    webviewAssets[state] = webview
      .asWebviewUri(assetUri)
      .toString();
  }

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
    window.PENGUIN_CONFIG = {
      size: 40,
      groundRatio: 0.86,
      backgroundImage: "${backgroundUri}",
    };
  </script>
  <script nonce="${nonce}" src="${jsUri}"></script>
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
