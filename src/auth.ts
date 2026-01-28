// Authentication flow and protocol handler (replaces Tauri's on_navigation)

import { app, BrowserWindow, session } from 'electron'
import {
  setToken,
  setTokenExtracted,
  isTokenExtracted,
  clearState,
} from './state'

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string

export function registerProtocolHandler(): void {
  // Register the custom protocol for auth callback
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('epidash', process.execPath, [
        process.argv[1],
      ])
    }
  } else {
    app.setAsDefaultProtocolClient('epidash')
  }

  // Handle protocol URLs on macOS
  app.on('open-url', (event, url) => {
    event.preventDefault()
    handleProtocolUrl(url)
  })

  // Handle protocol URLs on Windows (second-instance)
  app.on('second-instance', (_event, commandLine) => {
    const url = commandLine.find((arg) => arg.startsWith('epidash://'))
    if (url) {
      handleProtocolUrl(url)
    }

    // Focus the main window
    const mainWindow = BrowserWindow.getAllWindows()[0]
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

function handleProtocolUrl(url: string): void {
  try {
    const parsed = new URL(url)

    if (parsed.protocol === 'epidash:' && parsed.host === 'token') {
      const encodedToken = parsed.pathname.slice(1) // Remove leading /
      const token = decodeURIComponent(encodedToken)

      if (token) {
        setToken(token)
        navigateBackToApp()
      }
    }

    if (parsed.protocol === 'epidash:' && parsed.host === 'show-window') {
      setTokenExtracted(false)
    }
  } catch {
    console.error('Failed to parse protocol URL:', url)
  }
}

function navigateBackToApp(): void {
  const mainWindow = BrowserWindow.getAllWindows()[0]
  if (mainWindow) {
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
    } else {
      mainWindow.loadFile('dist/renderer/main_window/index.html')
    }
  }
}

export function setupNavigationHandlers(window: BrowserWindow): void {
  // Handle navigation events
  window.webContents.on('will-navigate', (event, url) => {
    const parsed = new URL(url)

    // Block custom protocol navigations (handled separately via open-url)
    if (parsed.protocol === 'epidash:') {
      event.preventDefault()
      handleProtocolUrl(url)
    }
  })

  window.webContents.on('did-navigate', (_event, url) => {
    handleDidNavigate(url, window)
  })

  window.webContents.on('did-navigate-in-page', (_event, url) => {
    handleDidNavigate(url, window)
  })
}

function handleDidNavigate(url: string, window: BrowserWindow): void {
  try {
    const parsed = new URL(url)

    // Reset extraction flag when hitting Microsoft login
    if (parsed.hostname.includes('login.microsoftonline.com')) {
      setTokenExtracted(false)
    }

    // Extract token when on epitest.eu
    if (parsed.hostname === 'myresults.epitest.eu') {
      if (!isTokenExtracted()) {
        setTokenExtracted(true)
        setTimeout(() => extractToken(window), 200)
      }
    }
  } catch {
    // Ignore invalid URLs
  }
}

async function extractToken(window: BrowserWindow): Promise<void> {
  // Same JavaScript injection as Tauri, but with epidash:// protocol
  const extractJs = `
    (function() {
      const token = localStorage.getItem('argos-api.oidc-token');
      if (token) {
        const cleanToken = token.replace(/^"|"$/g, '');
        window.location.href = 'epidash://token/' + encodeURIComponent(cleanToken);
        return;
      }

      const loginLink = document.querySelector('a.mdl-button--raised');
      if (loginLink && loginLink.textContent.toLowerCase().includes('log in')) {
        loginLink.click();
        return;
      }

      window.location.href = 'epidash://show-window';
    })()
  `

  try {
    await window.webContents.executeJavaScript(extractJs)
  } catch (error) {
    console.error('Failed to extract token:', error)
  }
}

export async function startLogin(): Promise<void> {
  const mainWindow = BrowserWindow.getAllWindows()[0]
  if (!mainWindow) throw new Error('Main window not found')

  setTokenExtracted(false)
  await mainWindow.loadURL('https://myresults.epitest.eu')
}

export async function logout(): Promise<void> {
  clearState()
}

export async function reauth(): Promise<void> {
  const mainWindow = BrowserWindow.getAllWindows()[0]
  if (!mainWindow) throw new Error('Main window not found')

  setToken(null)
  setTokenExtracted(true) // Prevent extraction of old token

  await mainWindow.loadURL('https://myresults.epitest.eu')

  // Wait and clear expired token from localStorage
  await new Promise((resolve) => setTimeout(resolve, 500))
  await mainWindow.webContents.executeJavaScript(
    "localStorage.removeItem('argos-api.oidc-token');"
  )

  setTokenExtracted(false) // Allow fresh extraction
}

export async function clearSessionData(): Promise<void> {
  // Clear backend state
  clearState()

  // Clear all browsing data (cookies, localStorage, cache)
  const ses = session.defaultSession
  await ses.clearStorageData()
  await ses.clearCache()

  // Navigate to login page
  const mainWindow = BrowserWindow.getAllWindows()[0]
  if (mainWindow) {
    await mainWindow.loadURL('https://myresults.epitest.eu')
  }
}
