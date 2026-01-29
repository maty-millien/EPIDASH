import { ipcMain } from "electron"
import {
  getToken,
  isLoggedIn,
  getAuthInProgress,
  waitForTokenChange
} from "@/core/state"
import { startLogin, logout, reauth } from "@/core/auth"
import {
  fetchEpitestData,
  fetchProjectDetails,
  fetchProjectHistory
} from "@/core/api"
import {
  checkForUpdates,
  installUpdate,
  getUpdateState,
  simulateUpdate
} from "@/core/updater"
import { getAppView } from "@/core/window"

const REAUTH_TIMEOUT_MS = 60000

async function withReauthOn403<T>(
  apiCallFn: (token: string) => Promise<T>
): Promise<T> {
  const token = getToken()
  if (!token) throw new Error("Not logged in")

  try {
    return await apiCallFn(token)
  } catch (error) {
    if (String(error).includes("403")) {
      await reauth()
      const newToken = await waitForTokenChange(REAUTH_TIMEOUT_MS)

      if (!newToken) {
        throw new Error("Session expired")
      }

      return await apiCallFn(newToken)
    }
    throw error
  }
}

export function notifyAuthStateChange(inProgress: boolean): void {
  const appView = getAppView()
  if (appView) {
    appView.webContents.send("auth:state-changed", { inProgress })
  }
}

export function setupIpcHandlers(): void {
  // Auth handlers
  ipcMain.handle("auth:is-logged-in", () => {
    return isLoggedIn()
  })

  ipcMain.handle("auth:start-login", async () => {
    await startLogin()
  })

  ipcMain.handle("auth:logout", async () => {
    await logout()
  })

  ipcMain.handle("auth:reauth", async () => {
    await reauth()
  })

  ipcMain.handle("auth:get-state", () => {
    return { inProgress: getAuthInProgress() }
  })

  // API handlers
  ipcMain.handle("api:fetch-data", async (_event, year: number) => {
    return withReauthOn403((token) => fetchEpitestData(token, year))
  })

  ipcMain.handle("api:fetch-details", async (_event, testRunId: number) => {
    return withReauthOn403((token) => fetchProjectDetails(token, testRunId))
  })

  ipcMain.handle(
    "api:fetch-history",
    async (_event, moduleCode: string, projectSlug: string, year: number) => {
      return withReauthOn403((token) =>
        fetchProjectHistory(token, moduleCode, projectSlug, year)
      )
    }
  )

  ipcMain.handle("update:get-state", () => {
    return getUpdateState()
  })

  ipcMain.handle("update:check", () => {
    checkForUpdates()
  })

  ipcMain.handle("update:install", () => {
    installUpdate()
  })

  ipcMain.handle("update:simulate", () => {
    simulateUpdate()
  })
}
