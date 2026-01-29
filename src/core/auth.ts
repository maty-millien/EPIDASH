import { app, BaseWindow, WebContentsView, session } from "electron";
import {
  setToken,
  setTokenExtracted,
  isTokenExtracted,
  clearState,
  setAuthInProgress,
} from "@/core/state";
import { notifyAuthStateChange } from "@/core/ipc";
import { getMainWindow } from "@/core/window";

let authView: WebContentsView | null = null;
let authViewVisible = false;

function updateAuthViewBounds(): void {
  const mainWindow = getMainWindow();
  if (!mainWindow || !authView) return;
  const bounds = mainWindow.getContentBounds();
  authView.setBounds({
    x: 0,
    y: 0,
    width: bounds.width,
    height: bounds.height,
  });
}

function showAuthView(): void {
  const mainWindow = getMainWindow();
  if (!mainWindow) return;

  if (!authView) {
    authView = new WebContentsView({
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });
    setupNavigationHandlers(authView.webContents);
  }

  if (!authViewVisible) {
    mainWindow.contentView.addChildView(authView);
    updateAuthViewBounds();
    mainWindow.on("resize", updateAuthViewBounds);
    authViewVisible = true;
  }
}

function hideAuthView(): void {
  const mainWindow = getMainWindow();
  if (!mainWindow || !authView || !authViewVisible) return;
  mainWindow.contentView.removeChildView(authView);
  mainWindow.off("resize", updateAuthViewBounds);
  authViewVisible = false;
}

export function registerProtocolHandler(): void {
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient("epidash", process.execPath, [
        process.argv[1],
      ]);
    }
  } else {
    app.setAsDefaultProtocolClient("epidash");
  }

  app.on("open-url", (event, url) => {
    event.preventDefault();
    handleProtocolUrl(url);
  });

  app.on("second-instance", (_event, commandLine) => {
    const url = commandLine.find((arg) => arg.startsWith("epidash://"));
    if (url) {
      handleProtocolUrl(url);
    }

    const window = BaseWindow.getAllWindows()[0];
    if (window) {
      if (window.isMinimized()) window.restore();
      window.focus();
    }
  });
}

function handleProtocolUrl(url: string): void {
  try {
    const parsed = new URL(url);

    if (parsed.protocol === "epidash:" && parsed.host === "token") {
      const encodedToken = parsed.pathname.slice(1); // Remove leading /
      const token = decodeURIComponent(encodedToken);

      if (token) {
        setToken(token);
        navigateBackToApp();
      }
    }

    if (parsed.protocol === "epidash:" && parsed.host === "show-window") {
      setTokenExtracted(false);
    }
  } catch {
    console.error("Failed to parse protocol URL:", url);
  }
}

function navigateBackToApp(): void {
  hideAuthView();
  setAuthInProgress(false);
  notifyAuthStateChange(false);
}

export function setupNavigationHandlers(
  webContents: Electron.WebContents,
): void {
  webContents.on("will-navigate", (event, url) => {
    const parsed = new URL(url);
    if (parsed.protocol === "epidash:") {
      event.preventDefault();
      handleProtocolUrl(url);
    }
  });

  webContents.on("did-navigate", (_event, url) => {
    handleDidNavigate(url);
  });

  webContents.on("did-navigate-in-page", (_event, url) => {
    handleDidNavigate(url);
  });
}

function handleDidNavigate(url: string): void {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("login.microsoftonline.com")) {
      setTokenExtracted(false);
    }

    if (parsed.hostname === "myresults.epitest.eu") {
      if (!isTokenExtracted() && authView) {
        setTokenExtracted(true);
        const webContents = authView.webContents;
        setTimeout(() => extractToken(webContents), 200);
      }
    }
  } catch {
    // Ignore invalid URLs
  }
}

async function extractToken(webContents: Electron.WebContents): Promise<void> {
  const extractJs = `
    (function() {
      const token = localStorage.getItem('argos-api.oidc-token');
      if (token) {
        const cleanToken = token.replace(/^"|"$/g, '');
        window.location.href = 'epidash://token/' + encodeURIComponent(cleanToken);
        return;
      }

      const loginLink = document.querySelector('a.mdl-button--raised');
      if (loginLink && loginLink.textContent.toLowerCase().includes('log in')) {
        loginLink.click();
        return;
      }

      window.location.href = 'epidash://show-window';
    })()
  `;

  try {
    await webContents.executeJavaScript(extractJs);
  } catch (error) {
    console.error("Failed to extract token:", error);
  }
}

export async function startLogin(): Promise<void> {
  setAuthInProgress(true);
  setTokenExtracted(false);
  notifyAuthStateChange(true);

  showAuthView();
  if (!authView) return;

  try {
    await authView.webContents.loadURL("https://myresults.epitest.eu");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ERR_ABORTED") {
      throw error;
    }
  }
}

export async function logout(): Promise<void> {
  clearState();
}

export async function reauth(): Promise<void> {
  setToken(null);
  setAuthInProgress(true);
  setTokenExtracted(true);
  notifyAuthStateChange(true);

  showAuthView();
  if (!authView) return;

  try {
    await authView.webContents.loadURL("https://myresults.epitest.eu");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ERR_ABORTED") {
      throw error;
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 500));
  const webContents = authView.webContents;
  await webContents.executeJavaScript(
    "localStorage.removeItem('argos-api.oidc-token');",
  );

  setTokenExtracted(false);
  setTimeout(() => extractToken(webContents), 200);
}

export async function clearSessionData(): Promise<void> {
  clearState();

  const ses = session.defaultSession;
  await ses.clearStorageData();
  await ses.clearCache();

  await startLogin();
}
