const fs = require("node:fs");
const vscode = require("vscode");

const ASSET_FILES = {
  idle: "pinguin sentado balançando os pezinhos.svg",
  default: "pinguin.svg",
  running: "pinguin correndo.svg",
  runningCrouched: "pinguin correndo abaixado.svg",
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
  thinking: "pinguin-apaixonado.svg",
  eating: "pinguin comendo peixe.svg",
  fishing: "pinguin pescando no gelo.svg",
  flying: "pinguin voando.svg",
  turningBack: "pinguin de costas.svg",
  umbrella: "umbrella.svg",
  caveirinha: "pinguin caveirinha.svg",
  trace: "trace.svg",
  runnerBackground: "backgroung.png",
  runnerBackgroundDark: "backgroung-dark.png",
  runnerBackgroundDarkB: "backgroung-darkB.png",
  helicopterA: "helicopterA.gif",
  helicopterB: "helicopterB.gif",
  snowman: "snowman.svg",
};

const buildAssetPaths = (assetResolver) => {
  const resolve =
    typeof assetResolver === "function"
      ? assetResolver
      : (fileName) => `assets/${fileName}`;
  const assets = {};
  for (const [state, fileName] of Object.entries(ASSET_FILES)) {
    assets[state] = resolve(fileName, state);
  }
  return assets;
};

const getMergedConfig = (overrides = {}) => ({
  size:
    Number.isFinite(overrides.size) && overrides.size > 0 ? overrides.size : 120,
  groundRatio:
    Number.isFinite(overrides.groundRatio) &&
    overrides.groundRatio > 0 &&
    overrides.groundRatio <= 1
      ? overrides.groundRatio
      : 0.86,
  backgroundImage:
    typeof overrides.backgroundImage === "string" &&
    overrides.backgroundImage.trim().length > 0
      ? overrides.backgroundImage
      : "assets/backgroung-dark.png",
});

const SIDEBAR_VIEW_ID = "pinguinPet.sidebar";

function activate(context) {
  const provider = new PenguinSidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(SIDEBAR_VIEW_ID, provider, {
      webviewOptions: { retainContextWhenHidden: true },
    }),
  );
  registerHotReloadWatchers(context, provider);

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
    this.currentView = null;
  }

  resolveWebviewView(webviewView) {
    this.currentView = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.extensionUri, "assets"),
        vscode.Uri.joinPath(this.extensionUri, "dist", "web"),
      ],
    };
    this.refresh();
  }

  refresh() {
    if (!this.currentView) return;
    const webview = this.currentView.webview;
    const bundle = resolveViteBundleFiles(this.extensionUri);
    const scriptSegments = bundle.scriptPath.replace(/^\.\//, "").split("/");
    const appJsPath = bundle
      ? vscode.Uri.joinPath(
          this.extensionUri,
          "dist",
          "web",
          ...scriptSegments,
        ).fsPath
      : null;
    const useViteBundle = Boolean(appJsPath && fs.existsSync(appJsPath));
    this.currentView.webview.html = useViteBundle
      ? getViteWebviewContent(webview, this.extensionUri, bundle, Date.now())
      : getMissingBuildWebviewContent();
  }
}

function resolveViteBundleFiles(extensionUri) {
  const indexPath = vscode.Uri.joinPath(
    extensionUri,
    "dist",
    "web",
    "index.html",
  ).fsPath;

  if (!fs.existsSync(indexPath)) {
    return { scriptPath: "app.js", cssPath: "assets/style.css" };
  }

  try {
    const html = fs.readFileSync(indexPath, "utf8");
    const scriptMatch = html.match(
      /<script[^>]+type=["']module["'][^>]+src=["']([^"']+)["']/i,
    );
    const cssMatch = html.match(
      /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/i,
    );

    return {
      scriptPath: scriptMatch ? scriptMatch[1].replace(/^\//, "") : "app.js",
      cssPath: cssMatch ? cssMatch[1].replace(/^\//, "") : "assets/style.css",
    };
  } catch {
    return { scriptPath: "app.js", cssPath: "assets/style.css" };
  }
}

function getViteWebviewContent(webview, extensionUri, bundle, version = 0) {
  const nonce = createNonce();
  const withVersion = (uri) => `${uri.toString()}?v=${version}`;

  const scriptSegments = bundle.scriptPath.replace(/^\.\//, "").split("/");
  const cssSegments = bundle.cssPath.replace(/^\.\//, "").split("/");

  const appJsUri = withVersion(
    webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, "dist", "web", ...scriptSegments),
    ),
  );
  const cssUri = withVersion(
    webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, "dist", "web", ...cssSegments),
    ),
  );

  const backgroundUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "assets", "backgroung-dark.png"),
  );

  const webviewAssets = buildAssetPaths((fileName) =>
    webview
      .asWebviewUri(vscode.Uri.joinPath(extensionUri, "assets", fileName))
      .toString(),
  );

  const webviewConfig = getMergedConfig({
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
</head>
<body>
  <div id="app"></div>
  <script nonce="${nonce}">
    window.PINGUIN_RUNTIME = {
      nonce: ${JSON.stringify(nonce)},
      cssHref: ${JSON.stringify(cssUri)},
      penguinAssets: ${JSON.stringify(webviewAssets)},
      penguinConfig: ${JSON.stringify(webviewConfig)}
    };
  </script>
  <script nonce="${nonce}" type="module" src="${appJsUri}"></script>
</body>
</html>`;
}

function getMissingBuildWebviewContent() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pinguim Pet</title>
</head>
<body style="font-family: sans-serif; padding: 12px;">
  <h3>Bundle nao encontrado</h3>
  <p>Execute <code>npm run build:web</code> na raiz do projeto e recarregue a janela.</p>
</body>
</html>`;
}

function registerHotReloadWatchers(context, provider) {
  let refreshTimer = null;
  const queueRefresh = () => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }
    refreshTimer = setTimeout(() => {
      provider.refresh();
    }, 120);
  };

  const patterns = [
    "assets/**/*",
    "src/**/*",
    "legacy/**/*.ts",
    "phaser/**/*.ts",
    "runtime/**/*.ts",
    "styles/**/*.css",
    "main.ts",
    "dist/web/**/*",
    "index.html",
  ];

  for (const pattern of patterns) {
    const watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(provider.extensionUri.fsPath, pattern),
    );
    watcher.onDidChange(queueRefresh);
    watcher.onDidCreate(queueRefresh);
    watcher.onDidDelete(queueRefresh);
    context.subscriptions.push(watcher);
  }
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
