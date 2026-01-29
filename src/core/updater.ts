import { app, BrowserWindow } from "electron"
import {
  autoUpdater,
  type UpdateInfo as ElectronUpdateInfo
} from "electron-updater"
import { spawn } from "child_process"
import fs from "fs"
import path from "path"
import type { UpdateState, UpdateInfo } from "@/shared/types/update"

let updateState: UpdateState = {
  checking: false,
  available: false,
  downloading: false,
  downloaded: false,
  error: null,
  info: null,
  progress: null
}

let periodicCheckInterval: NodeJS.Timeout | null = null

const UPDATE_CHECK_INTERVAL = 3600000

function notifyRenderer(event: string, data?: unknown): void {
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send(event, data)
  })
}

function convertUpdateInfo(info: ElectronUpdateInfo): UpdateInfo {
  return {
    version: info.version,
    releaseName: info.releaseName ?? undefined,
    releaseNotes:
      typeof info.releaseNotes === "string" ? info.releaseNotes : undefined
  }
}

export function initializeUpdater(): void {
  autoUpdater.autoDownload = true

  autoUpdater.on("checking-for-update", () => {
    updateState = { ...updateState, checking: true, error: null }
    notifyRenderer("update:checking")
  })

  autoUpdater.on("update-available", (info: ElectronUpdateInfo) => {
    updateState = {
      ...updateState,
      checking: false,
      available: true,
      info: convertUpdateInfo(info)
    }
    notifyRenderer("update:available", updateState.info)
  })

  autoUpdater.on("update-not-available", () => {
    updateState = { ...updateState, checking: false, available: false }
    notifyRenderer("update:not-available")
  })

  autoUpdater.on("download-progress", (progress) => {
    updateState = {
      ...updateState,
      downloading: true,
      progress: Math.round(progress.percent)
    }
    notifyRenderer("update:progress", updateState.progress)
  })

  autoUpdater.on("update-downloaded", (info: ElectronUpdateInfo) => {
    updateState = {
      ...updateState,
      downloading: false,
      downloaded: true,
      progress: 100,
      info: convertUpdateInfo(info)
    }
    notifyRenderer("update:downloaded", updateState.info)
  })

  autoUpdater.on("error", (error) => {
    updateState = {
      ...updateState,
      checking: false,
      downloading: false,
      error: error.message
    }
    notifyRenderer("update:error", error.message)
  })
}

export function checkForUpdates(): void {
  autoUpdater.checkForUpdates().catch((err) => {
    updateState = {
      ...updateState,
      checking: false,
      downloading: false,
      error: err.message || String(err)
    }
    notifyRenderer("update:error", updateState.error)
  })
}

export function startPeriodicChecks(): void {
  if (periodicCheckInterval) {
    clearInterval(periodicCheckInterval)
  }
  periodicCheckInterval = setInterval(() => {
    checkForUpdates()
  }, UPDATE_CHECK_INTERVAL)
}

export function stopPeriodicChecks(): void {
  if (periodicCheckInterval) {
    clearInterval(periodicCheckInterval)
    periodicCheckInterval = null
  }
}

function getLinuxUpdatePath(version: string): string {
  const arch = process.arch === "x64" ? "amd64" : process.arch
  const cacheDir = path.join(app.getPath("home"), ".cache/epidash/pending")

  const debPath = path.join(cacheDir, `epidash_${version}_${arch}.deb`)
  const rpmPath = path.join(cacheDir, `epidash-${version}.${arch}.rpm`)

  try {
    fs.accessSync(debPath)
    return debPath
  } catch {
    return rpmPath
  }
}

export function installUpdate(): void {
  if (!updateState.info?.version) {
    autoUpdater.quitAndInstall(false, true)
    return
  }

  const version = updateState.info.version
  const scriptPath = path.join(process.resourcesPath, "update.sh")

  let updatePath: string
  let appPath: string

  if (process.platform === "darwin") {
    const arch = process.arch === "arm64" ? "arm64" : "x64"
    updatePath = path.join(
      app.getPath("home"),
      "Library/Caches/epidash/pending",
      `EPIDASH-darwin-${arch}-${version}.zip`
    )
    appPath = app.getPath("exe").replace(/\/Contents\/MacOS\/EPIDASH$/, "")
  } else if (process.platform === "linux") {
    updatePath = getLinuxUpdatePath(version)
    appPath = "/usr/bin/epidash"
  } else {
    autoUpdater.quitAndInstall(false, true)
    return
  }

  const child = spawn("bash", [scriptPath, updatePath, appPath], {
    detached: true,
    stdio: "ignore"
  })
  child.unref()

  app.quit()
}

export function getUpdateState(): UpdateState {
  return { ...updateState }
}

export function simulateUpdate(): void {
  const mockInfo: UpdateInfo = {
    version: "99.0.0",
    releaseName: "Test Release"
  }
  updateState = {
    ...updateState,
    downloaded: true,
    info: mockInfo
  }
  notifyRenderer("update:downloaded", mockInfo)
}
