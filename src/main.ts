import { app, BrowserWindow, screen } from "electron"
import started from "electron-squirrel-startup"
import path from "node:path"
import { registerProtocolHandler, setupNavigationHandlers } from "./auth"
import { setupIpcHandlers } from "./ipc"
import { createMenu } from "./menu"

// Suppress Chromium GPU errors from stderr (log-level 3 = fatal only)
app.commandLine.appendSwitch("log-level", "3")

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string
declare const MAIN_WINDOW_VITE_NAME: string

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit()
}

// Ensure single instance (needed for protocol handling on Windows)
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
}

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  // Get primary display for dynamic sizing (matches Tauri behavior: 80% x 85%)
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width: screenWidth, height: screenHeight } =
    primaryDisplay.workAreaSize

  const windowWidth = Math.round(screenWidth * 0.8)
  const windowHeight = Math.round(screenHeight * 0.85)

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    minWidth: 800,
    minHeight: 600,
    center: true,
    titleBarStyle: "hiddenInset", // macOS traffic lights
    trafficLightPosition: { x: 15, y: 20 },
    backgroundColor: "#0a0a0c", // --color-void
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  // Set up navigation handlers for auth flow
  setupNavigationHandlers(mainWindow)

  // Load the renderer
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    )
  }

  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  registerProtocolHandler()
  setupIpcHandlers()
  createMenu()
  createWindow()
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

export { mainWindow }
