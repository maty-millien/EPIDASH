// TypeScript declarations for window.electronAPI

import type { ElectronAPI } from "./preload/index"

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
