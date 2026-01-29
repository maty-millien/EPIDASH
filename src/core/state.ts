// Token state management (replaces Rust AppState with Mutex)

interface AppState {
  token: string | null
  tokenExtracted: boolean
  authInProgress: boolean
}

const state: AppState = {
  token: null,
  tokenExtracted: false,
  authInProgress: false
}

let tokenWaiters: Array<(token: string | null) => void> = []

export function getToken(): string | null {
  return state.token
}

export function setToken(token: string | null): void {
  state.token = token
  const waiters = tokenWaiters
  tokenWaiters = []
  waiters.forEach((resolve) => resolve(token))
}

export function waitForTokenChange(timeoutMs: number): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      tokenWaiters = tokenWaiters.filter((w) => w !== resolver)
      reject(new Error("Token wait timeout"))
    }, timeoutMs)

    const resolver = (token: string | null) => {
      clearTimeout(timeout)
      resolve(token)
    }

    tokenWaiters.push(resolver)
  })
}

export function isLoggedIn(): boolean {
  return state.token !== null
}

export function isTokenExtracted(): boolean {
  return state.tokenExtracted
}

export function setTokenExtracted(value: boolean): void {
  state.tokenExtracted = value
}

export function clearState(): void {
  state.token = null
  state.tokenExtracted = false
  state.authInProgress = false
}

export function getAuthInProgress(): boolean {
  return state.authInProgress
}

export function setAuthInProgress(value: boolean): void {
  state.authInProgress = value
}
