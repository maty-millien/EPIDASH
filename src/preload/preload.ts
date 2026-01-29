import { contextBridge, ipcRenderer } from "electron"
import type { UpdateInfo, UpdateState } from "@/shared/types/update"

export interface AuthState {
  inProgress: boolean
}

export interface ElectronAPI {
  isLoggedIn: () => Promise<boolean>
  startLogin: () => Promise<void>
  logout: () => Promise<void>
  reauth: () => Promise<void>
  getAuthState: () => Promise<AuthState>
  onAuthStateChange: (callback: (state: AuthState) => void) => () => void

  fetchEpitestData: () => Promise<unknown>
  fetchProjectDetails: (testRunId: number) => Promise<unknown>
  fetchProjectHistory: (
    moduleCode: string,
    projectSlug: string
  ) => Promise<unknown>

  getUpdateState: () => Promise<UpdateState>
  checkForUpdates: () => Promise<void>
  installUpdate: () => Promise<void>
  simulateUpdate: () => Promise<void>
  onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => () => void
  onUpdateProgress: (callback: (progress: number) => void) => () => void
  onUpdateError: (callback: (error: string) => void) => () => void
  onUpdateNotAvailable: (callback: () => void) => () => void
}

const electronAPI: ElectronAPI = {
  isLoggedIn: () => ipcRenderer.invoke("auth:is-logged-in"),
  startLogin: () => ipcRenderer.invoke("auth:start-login"),
  logout: () => ipcRenderer.invoke("auth:logout"),
  reauth: () => ipcRenderer.invoke("auth:reauth"),
  getAuthState: () => ipcRenderer.invoke("auth:get-state"),
  onAuthStateChange: (callback: (state: AuthState) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, state: AuthState) => {
      callback(state)
    }
    ipcRenderer.on("auth:state-changed", handler)
    return () => {
      ipcRenderer.removeListener("auth:state-changed", handler)
    }
  },

  fetchEpitestData: () => ipcRenderer.invoke("api:fetch-data"),
  fetchProjectDetails: (testRunId: number) =>
    ipcRenderer.invoke("api:fetch-details", testRunId),
  fetchProjectHistory: (moduleCode: string, projectSlug: string) =>
    ipcRenderer.invoke("api:fetch-history", moduleCode, projectSlug),

  getUpdateState: () => ipcRenderer.invoke("update:get-state"),
  checkForUpdates: () => ipcRenderer.invoke("update:check"),
  installUpdate: () => ipcRenderer.invoke("update:install"),
  simulateUpdate: () => ipcRenderer.invoke("update:simulate"),
  onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, info: UpdateInfo) => {
      callback(info)
    }
    ipcRenderer.on("update:downloaded", handler)
    return () => {
      ipcRenderer.removeListener("update:downloaded", handler)
    }
  },
  onUpdateProgress: (callback: (progress: number) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, progress: number) => {
      callback(progress)
    }
    ipcRenderer.on("update:progress", handler)
    return () => {
      ipcRenderer.removeListener("update:progress", handler)
    }
  },
  onUpdateError: (callback: (error: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, error: string) => {
      callback(error)
    }
    ipcRenderer.on("update:error", handler)
    return () => {
      ipcRenderer.removeListener("update:error", handler)
    }
  },
  onUpdateNotAvailable: (callback: () => void) => {
    const handler = () => {
      callback()
    }
    ipcRenderer.on("update:not-available", handler)
    return () => {
      ipcRenderer.removeListener("update:not-available", handler)
    }
  }
}

contextBridge.exposeInMainWorld("electronAPI", electronAPI)
