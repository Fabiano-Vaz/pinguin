import * as vscode from "vscode";
import * as fs from "node:fs";
import * as path from "node:path";
import { buildAssetPaths, getMergedConfig } from "./manifest";
import { GitProductivityTracker, PRODUCTIVITY_KEY, type ProductivityState } from "./services/git-productivity-tracker";

import { FISH_STOCK_KEY, FishStockLedger, parseFishStock } from "./runtime/fish-stock-ledger";

const SIDEBAR_VIEW_ID = "pinguinPet.sidebar";
type RuntimeFlags = {
  debugPanel: boolean;
  runnerDebug: boolean;
};

export function activate(context: vscode.ExtensionContext) {
  const runtimeFlags = loadRuntimeFlags(context.extensionPath);
  const provider = new PenguinSidebarProvider(
    context,
    runtimeFlags,
  );
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
    private readonly context: vscode.ExtensionContext,
    private readonly runtimeFlags: RuntimeFlags,
  ) {
    this.ledger = new FishStockLedger(context.globalState.get(FISH_STOCK_KEY));
    this.persistStock();
    const tracker = new GitProductivityTracker({
      load: () => context.globalState.get<ProductivityState>(PRODUCTIVITY_KEY),
      save: (state) => context.globalState.update(PRODUCTIVITY_KEY, state),
      award: (amount) => {
        this.ledger.add(amount);
        this.persistStock();
        this.publishStock();
      },
    });
    const scan = () => tracker.scan(
      (vscode.workspace.workspaceFolders ?? [])
        .filter(folder => folder.uri.scheme === "file")
        .map(folder => folder.uri.fsPath),
    );
    void scan();
    const timer = setInterval(() => { void scan(); }, 10000);
    context.subscriptions.push({ dispose: () => { clearInterval(timer); tracker.dispose(); } });
  }

  private readonly ledger: FishStockLedger;
  private view: vscode.WebviewView | undefined;
  private acknowledgedRequestId = 0;

  private persistStock(): void {
    void this.context.globalState.update(FISH_STOCK_KEY, this.ledger.snapshot);
  }

  private publishStock(): void {
    void this.view?.webview.postMessage({
      type: "penguin:fish-stock",
      snapshot: this.ledger.snapshot,
      requestId: this.acknowledgedRequestId,
    });
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    const extensionUri = this.context.extensionUri;
    this.view = webviewView;
    this.acknowledgedRequestId = 0;
    const listener = webviewView.webview.onDidReceiveMessage((message: unknown) => {
      if (!message || typeof message !== "object") return;
      const incoming = message as { type?: string; amount?: number; requestId?: number };
      if (incoming.type === "penguin:request-fish-stock") {
        this.publishStock();
        return;
      }
      if (incoming.type !== "penguin:change-fish-stock") return;
      const { amount, requestId } = incoming;
      if (!Number.isSafeInteger(amount) || !amount || !Number.isSafeInteger(requestId) ||
          requestId! <= this.acknowledgedRequestId) return;
      if (amount > 0) this.ledger.add(amount);
      else this.ledger.spend(-amount);
      this.acknowledgedRequestId = requestId!;
      this.persistStock();
      this.publishStock();
    });
    this.context.subscriptions.push(listener);
    webviewView.onDidDispose(() => {
      listener.dispose();
      if (this.view === webviewView) this.view = undefined;
    });
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(extensionUri, "assets"),
        vscode.Uri.joinPath(extensionUri, "css"),
        vscode.Uri.joinPath(extensionUri, "dist", "webview"),
      ],
    };
    webviewView.webview.html = getWebviewContent(
      webviewView.webview,
      extensionUri,
      this.runtimeFlags,
      this.ledger.snapshot,
    );
  }
}

function getWebviewContent(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  runtimeFlags: RuntimeFlags,
  fishStock: ReturnType<typeof parseFishStock> | null,
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
<body tabindex="0" data-keyboard-surface="penguin-pet">
  <script nonce="${nonce}">
    window.PENGUIN_FISH_STOCK = ${JSON.stringify(fishStock)};
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
