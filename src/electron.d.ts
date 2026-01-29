import type { ElectronAPI } from "@/preload/preload";

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }

  const __APP_VERSION__: string | undefined;
}

export {};
