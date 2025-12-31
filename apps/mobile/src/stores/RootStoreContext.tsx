import { createContext, useContext } from 'react'
import type { RootStore } from 'shared'

const RootStoreContext = createContext<RootStore | null>(null)

export const RootStoreProvider = RootStoreContext.Provider

export function useRootStore() {
  const context = useContext(RootStoreContext)
  if (!context) {
    throw new Error('useRootStore must be used within RootStoreProvider')
  }
  return context
}
