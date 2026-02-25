const vscode = require("vscode");

let panel;

function activate(context) {
  const openCommand = vscode.commands.registerCommand("pinguin.openPet", () => {
    openPenguinPanel(context);
  });

  context.subscriptions.push(openCommand);

  const config = vscode.workspace.getConfiguration();
  const autoOpen = config.get("pinguin.autoOpenOnStartup", true);

  if (autoOpen) {
    openPenguinPanel(context);
  }
}

function openPenguinPanel(context) {
  if (panel) {
    panel.reveal(vscode.ViewColumn.Beside, true);
    return;
  }

  panel = vscode.window.createWebviewPanel(
    "pinguinPet",
    "Pinguim Pet",
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [
        vscode.Uri.joinPath(context.extensionUri, "assets"),
        vscode.Uri.joinPath(context.extensionUri, "css"),
        vscode.Uri.joinPath(context.extensionUri, "js"),
      ],
    },
  );

  panel.webview.html = getWebviewContent(panel.webview, context.extensionUri);

  panel.onDidDispose(() => {
    panel = undefined;
  });
}

function getWebviewContent(webview, extensionUri) {
  const cssUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "css", "style.css"),
  );
  const jsUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "js", "script.js"),
  );
  const backgroundUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "assets", "backgroung.png"),
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
    shy: "pinguin envergonhado.svg",
    peeking: "pinguin espiando curioso.svg",
    laughing: "pinguin gargalhando.svg",
    thinking: "pinguin pensando.svg",
    flying: "pinguin voando.svg",
  };

  const webviewAssets = {};
  for (const [state, fileName] of Object.entries(assets)) {
    webviewAssets[state] = webview
      .asWebviewUri(vscode.Uri.joinPath(extensionUri, "assets", fileName))
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
      size: 48,
      groundRatio: 0.74,
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
