// Convert frontend list ID to backend (string to number)
export function toBackendListId(id: string): number {
  return Number.parseInt(id, 10)
}

// Convert frontend task ID to backend (string to number)
export function toBackendTaskId(id: string): number {
  return Number.parseInt(id, 10)
}
