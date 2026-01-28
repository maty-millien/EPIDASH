// IPC handlers (replaces Tauri #[tauri::command] functions)

import { BrowserWindow, ipcMain } from "electron"
import { getToken, isLoggedIn, getAuthInProgress } from "@/core/state"
import { startLogin, logout, reauth } from "@/core/auth"
import {
  fetchEpitestData,
  fetchProjectDetails,
  fetchProjectHistory
} from "@/core/api"

export function notifyAuthStateChange(inProgress: boolean): void {
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send("auth:state-changed", { inProgress })
  })
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
  ipcMain.handle("api:fetch-data", async () => {
    const token = getToken()
    if (!token) throw new Error("Not logged in")
    return fetchEpitestData(token)
  })

  ipcMain.handle("api:fetch-details", async (_event, testRunId: number) => {
    const token = getToken()
    if (!token) throw new Error("Not logged in")
    return fetchProjectDetails(token, testRunId)
  })

  ipcMain.handle(
    "api:fetch-history",
    async (_event, moduleCode: string, projectSlug: string) => {
      const token = getToken()
      if (!token) throw new Error("Not logged in")
      return fetchProjectHistory(token, moduleCode, projectSlug)
    }
  )
}
