// Token state management (replaces Rust AppState with Mutex)

interface AppState {
  token: string | null
  tokenExtracted: boolean
}

const state: AppState = {
  token: null,
  tokenExtracted: false
}

export function getToken(): string | null {
  return state.token
}

export function setToken(token: string | null): void {
  state.token = token
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
}
