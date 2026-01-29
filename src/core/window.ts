import type { BaseWindow, WebContentsView } from "electron";

let mainWindow: BaseWindow | null = null;
let appView: WebContentsView | null = null;

export function getMainWindow(): BaseWindow | null {
  return mainWindow;
}

export function setMainWindow(window: BaseWindow | null): void {
  mainWindow = window;
}

export function getAppView(): WebContentsView | null {
  return appView;
}

export function setAppView(view: WebContentsView | null): void {
  appView = view;
}

export function updateViewBounds(): void {
  if (!mainWindow || !appView) return;
  const bounds = mainWindow.getContentBounds();
  appView.setBounds({ x: 0, y: 0, width: bounds.width, height: bounds.height });
}
