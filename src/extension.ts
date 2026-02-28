import * as vscode from "vscode";
import * as fs from "node:fs";
import * as path from "node:path";
import { buildAssetPaths, getMergedConfig } from "./manifest";

const SIDEBAR_VIEW_ID = "pinguinPet.sidebar";
type RuntimeFlags = {
  debugPanel: boolean;
  runnerDebug: boolean;
};

export function activate(context: vscode.ExtensionContext) {
  const runtimeFlags = loadRuntimeFlags(context.extensionPath);
  const provider = new PenguinSidebarProvider(context.extensionUri, runtimeFlags);
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
  const autoOpen = config.get<boolean>("pinguin.autoOpenOnStartup", true);
  if (autoOpen) {
    void vscode.commands.executeCommand("pinguin.openPet");
  }
}

class PenguinSidebarProvider implements vscode.WebviewViewProvider {
  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly runtimeFlags: RuntimeFlags,
  ) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.extensionUri, "assets"),
        vscode.Uri.joinPath(this.extensionUri, "css"),
        vscode.Uri.joinPath(this.extensionUri, "dist", "webview"),
      ],
    };
    webviewView.webview.html = getWebviewContent(
      webviewView.webview,
      this.extensionUri,
      this.runtimeFlags,
    );
  }
}

function getWebviewContent(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  runtimeFlags: RuntimeFlags,
) {
  const cssUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "css", "style.css"),
  );
  const webviewScriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "dist", "webview", "webview.js"),
  );
  const backgroundUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "assets", "backgroung-dark.png"),
  );
  const nonce = createNonce();

  const webviewAssets = buildAssetPaths((fileName) =>
    webview
      .asWebviewUri(vscode.Uri.joinPath(extensionUri, "assets", fileName))
      .toString(),
  );

  const webviewConfig = {
    ...getMergedConfig({
      size: 86,
      groundRatio: 0.86,
      backgroundImage: backgroundUri.toString(),
    }),
    debugPanel: runtimeFlags.debugPanel,
    constants: {
      game: {
        runner: {
          debug: runtimeFlags.runnerDebug,
        },
      },
    },
  };

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
  <script nonce="${nonce}" src="${webviewScriptUri}"></script>
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

function parseEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split(/\r?\n/);
  const values: Record<string, string> = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqPos = trimmed.indexOf("=");
    if (eqPos <= 0) continue;
    const key = trimmed.slice(0, eqPos).trim();
    const value = trimmed.slice(eqPos + 1).trim();
    values[key] = value;
  }

  return values;
}

function readBooleanEnv(
  key: string,
  fallback: boolean,
  fileVars: Record<string, string>,
) {
  const raw = process.env[key] ?? fileVars[key];
  if (typeof raw !== "string") return fallback;
  const normalized = raw.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

function loadRuntimeFlags(extensionPath: string): RuntimeFlags {
  const envPath = path.join(extensionPath, ".env");
  const fileVars = parseEnvFile(envPath);
  return {
    debugPanel: readBooleanEnv("PINGUIN_DEBUG_PANEL", false, fileVars),
    runnerDebug: readBooleanEnv("PINGUIN_RUNNER_DEBUG", false, fileVars),
  };
}

export function deactivate() {}
