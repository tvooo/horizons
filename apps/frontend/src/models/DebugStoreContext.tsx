import { createContext, useContext } from 'react'
import type { DebugStore } from './DebugStore'

const DebugStoreContext = createContext<DebugStore | null>(null)

export const DebugStoreProvider = DebugStoreContext.Provider

export function useDebugStore() {
  const context = useContext(DebugStoreContext)
  if (!context) {
    throw new Error('useDebugStore must be used within DebugStoreProvider')
  }
  return context
}
