// TypeScript declarations for window.electronAPI

import type { ElectronAPI } from "./preload/preload"

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
