const state = { enabled: false }

export function isFailureModeEnabled(): boolean {
  return state.enabled
}

export function setFailureMode(enabled: boolean): void {
  state.enabled = enabled
}
