// Authentication flow and protocol handler (replaces Tauri's on_navigation)

import { app, BrowserWindow, session } from "electron"
import path from "node:path"
import {
  setToken,
  setTokenExtracted,
  isTokenExtracted,
  clearState,
  setAuthInProgress
} from "@/core/state"
import { notifyAuthStateChange } from "@/core/ipc"

let authWindow: BrowserWindow | null = null

function getMainWindow(): BrowserWindow | null {
  return BrowserWindow.getAllWindows().find((w) => w !== authWindow) ?? null
}

function createAuthWindow(): BrowserWindow {
  if (authWindow && !authWindow.isDestroyed()) {
    return authWindow
  }

  const mainWindow = getMainWindow()
  const mainBounds = mainWindow?.getBounds()

  authWindow = new BrowserWindow({
    width: mainBounds?.width ?? 1000,
    height: mainBounds?.height ?? 800,
    show: false,
    parent: mainWindow ?? undefined,
    modal: false,
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 15, y: 20 },
    backgroundColor: "#0a0a0c",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  setupNavigationHandlers(authWindow)

  authWindow.on("closed", () => {
    authWindow = null
    setAuthInProgress(false)
    notifyAuthStateChange(false)
  })

  return authWindow
}

export function registerProtocolHandler(): void {
  // Register the custom protocol for auth callback
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient("epidash", process.execPath, [
        process.argv[1]
      ])
    }
  } else {
    app.setAsDefaultProtocolClient("epidash")
  }

  // Handle protocol URLs on macOS
  app.on("open-url", (event, url) => {
    event.preventDefault()
    handleProtocolUrl(url)
  })

  // Handle protocol URLs on Windows (second-instance)
  app.on("second-instance", (_event, commandLine) => {
    const url = commandLine.find((arg) => arg.startsWith("epidash://"))
    if (url) {
      handleProtocolUrl(url)
    }

    // Focus the main window
    const mainWindow = BrowserWindow.getAllWindows()[0]
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

function handleProtocolUrl(url: string): void {
  try {
    const parsed = new URL(url)

    if (parsed.protocol === "epidash:" && parsed.host === "token") {
      const encodedToken = parsed.pathname.slice(1) // Remove leading /
      const token = decodeURIComponent(encodedToken)

      if (token) {
        setToken(token)
        navigateBackToApp()
      }
    }

    if (parsed.protocol === "epidash:" && parsed.host === "show-window") {
      setTokenExtracted(false)
    }
  } catch {
    console.error("Failed to parse protocol URL:", url)
  }
}

function navigateBackToApp(): void {
  if (authWindow && !authWindow.isDestroyed()) {
    authWindow.close()
    authWindow = null
  }

  setAuthInProgress(false)
  notifyAuthStateChange(false)

  const mainWindow = getMainWindow()
  if (mainWindow) {
    mainWindow.webContents.send("auth:state-changed", { inProgress: false })
  }
}

export function setupNavigationHandlers(window: BrowserWindow): void {
  // Handle navigation events
  window.webContents.on("will-navigate", (event, url) => {
    const parsed = new URL(url)

    // Block custom protocol navigations (handled separately via open-url)
    if (parsed.protocol === "epidash:") {
      event.preventDefault()
      handleProtocolUrl(url)
    }
  })

  window.webContents.on("did-navigate", (_event, url) => {
    handleDidNavigate(url, window)
  })

  window.webContents.on("did-navigate-in-page", (_event, url) => {
    handleDidNavigate(url, window)
  })
}

function handleDidNavigate(url: string, window: BrowserWindow): void {
  try {
    const parsed = new URL(url)

    const isAuthWindow = window === authWindow

    if (parsed.hostname.includes("login.microsoftonline.com")) {
      setTokenExtracted(false)
      if (isAuthWindow && authWindow && !authWindow.isVisible()) {
        authWindow.show()
        authWindow.focus()
      }
    }

    if (parsed.hostname === "myresults.epitest.eu") {
      if (isAuthWindow && authWindow?.isVisible()) {
        authWindow.hide()
      }
      if (!isTokenExtracted()) {
        setTokenExtracted(true)
        setTimeout(() => extractToken(window), 200)
      }
    }
  } catch {
    // Ignore invalid URLs
  }
}

async function extractToken(window: BrowserWindow): Promise<void> {
  // Same JavaScript injection as Tauri, but with epidash:// protocol
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
  `

  try {
    await window.webContents.executeJavaScript(extractJs)
  } catch (error) {
    console.error("Failed to extract token:", error)
  }
}

export async function startLogin(): Promise<void> {
  setAuthInProgress(true)
  setTokenExtracted(false)
  notifyAuthStateChange(true)

  const window = createAuthWindow()
  try {
    await window.loadURL("https://myresults.epitest.eu")
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ERR_ABORTED") {
      throw error
    }
  }
}

export async function logout(): Promise<void> {
  clearState()
}

export async function reauth(): Promise<void> {
  setToken(null)
  setAuthInProgress(true)
  setTokenExtracted(true)
  notifyAuthStateChange(true)

  const window = createAuthWindow()
  try {
    await window.loadURL("https://myresults.epitest.eu")
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ERR_ABORTED") {
      throw error
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 500))
  await window.webContents.executeJavaScript(
    "localStorage.removeItem('argos-api.oidc-token');"
  )

  setTokenExtracted(false)
}

export async function clearSessionData(): Promise<void> {
  clearState()

  const ses = session.defaultSession
  await ses.clearStorageData()
  await ses.clearCache()

  await startLogin()
}
