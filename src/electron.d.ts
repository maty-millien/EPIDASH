// TypeScript declarations for window.electronAPI

import type { ElectronAPI } from './preload'

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
