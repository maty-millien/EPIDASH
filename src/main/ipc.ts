// IPC handlers (replaces Tauri #[tauri::command] functions)

import { ipcMain } from "electron"
import { getToken, isLoggedIn } from "./state"
import { startLogin, logout, reauth } from "./auth"
import {
  fetchEpitestData,
  fetchProjectDetails,
  fetchProjectHistory
} from "./api"

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
