import { app, BaseWindow, WebContentsView, screen } from "electron"
import started from "electron-squirrel-startup"
import path from "node:path"
import { registerProtocolHandler } from "@/core/auth"
import { setupIpcHandlers } from "@/core/ipc"
import { createMenu } from "@/core/menu"
import {
  initializeUpdater,
  checkForUpdates,
  startPeriodicChecks
} from "@/core/updater"
import {
  setMainWindow,
  setAppView,
  updateViewBounds
} from "@/core/window"

app.commandLine.appendSwitch("log-level", "3")

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string
declare const MAIN_WINDOW_VITE_NAME: string

if (started) {
  app.quit()
}

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
}

function createWindow(): void {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width: screenWidth, height: screenHeight } =
    primaryDisplay.workAreaSize

  const windowWidth = Math.round(screenWidth * 0.8)
  const windowHeight = Math.round(screenHeight * 0.85)

  const window = new BaseWindow({
    width: windowWidth,
    height: windowHeight,
    minWidth: 800,
    minHeight: 600,
    center: true,
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 15, y: 20 },
    backgroundColor: "#0a0a0c"
  })

  const view = new WebContentsView({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  setMainWindow(window)
  setAppView(view)

  window.contentView.addChildView(view)
  updateViewBounds()

  window.on("resize", updateViewBounds)

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    view.webContents.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    view.webContents.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    )
  }

  window.on("closed", () => {
    setMainWindow(null)
    setAppView(null)
  })
}

app.whenReady().then(() => {
  registerProtocolHandler()
  setupIpcHandlers()
  createMenu()
  createWindow()

  if (!MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    initializeUpdater()
    setTimeout(() => {
      checkForUpdates()
      startPeriodicChecks()
    }, 3000)
  }
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (BaseWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
