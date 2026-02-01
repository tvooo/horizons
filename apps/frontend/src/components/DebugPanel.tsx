import { observer } from 'mobx-react-lite'
import { useDebugStore } from '../models/DebugStoreContext'

export const DebugPanel = observer(() => {
  const debugStore = useDebugStore()

  if (!debugStore.isOpen) return null

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const shortcutHint = isMac ? 'Cmd+Shift+D' : 'Ctrl+Shift+D'

  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 flex h-7 items-center gap-4 border-gray-200 border-t bg-gray-100 px-3 text-gray-600 text-xs">
      <span className="font-medium">Debug</span>
      <label className="flex cursor-pointer items-center gap-1.5">
        <input
          type="checkbox"
          checked={debugStore.showTaskListDetails}
          onChange={(e) => debugStore.setShowTaskListDetails(e.target.checked)}
          className="h-3 w-3 rounded border-gray-300"
        />
        Show task order values
      </label>
      <span className="ml-auto text-gray-400">{shortcutHint} to toggle</span>
    </div>
  )
})
