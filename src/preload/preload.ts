import { contextBridge, ipcRenderer } from "electron"

export interface ElectronAPI {
  isLoggedIn: () => Promise<boolean>
  startLogin: () => Promise<void>
  logout: () => Promise<void>
  reauth: () => Promise<void>

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

  fetchEpitestData: () => ipcRenderer.invoke("api:fetch-data"),
  fetchProjectDetails: (testRunId: number) =>
    ipcRenderer.invoke("api:fetch-details", testRunId),
  fetchProjectHistory: (moduleCode: string, projectSlug: string) =>
    ipcRenderer.invoke("api:fetch-history", moduleCode, projectSlug)
}

contextBridge.exposeInMainWorld("electronAPI", electronAPI)
