import { contextBridge, ipcRenderer } from "electron"

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
    ipcRenderer.invoke("api:fetch-history", moduleCode, projectSlug)
}

contextBridge.exposeInMainWorld("electronAPI", electronAPI)
