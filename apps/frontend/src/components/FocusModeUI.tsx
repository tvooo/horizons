import { X } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../models/RootStoreContext'

export const FocusModeUI = observer(() => {
  const store = useRootStore()

  if (!store.focusedAreaId || !store.focusedArea) {
    return null
  }

  return (
    <>
      {/* Thick border around viewport */}
      <div
        className="pointer-events-none fixed inset-0 z-50 overflow-hidden border-8"
        style={{ borderColor: 'var(--color-project)' }}
      />

      {/* Exit button in top right */}
      <button
        type="button"
        onClick={() => store.setFocusedArea(null)}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-sm text-white shadow-lg transition-opacity hover:opacity-90"
        style={{ backgroundColor: 'var(--color-project)' }}
        aria-label="Exit focus mode"
      >
        <span>Exit Focus: {store.focusedArea.name}</span>
        <X size={16} />
      </button>
    </>
  )
})
