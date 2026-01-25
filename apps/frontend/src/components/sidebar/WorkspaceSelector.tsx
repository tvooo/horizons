import { ChevronDown } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../models/RootStoreContext'

export const WorkspaceSelector = observer(() => {
  const store = useRootStore()
  const { workspaces, currentWorkspaceId, currentWorkspace } = store

  // Don't show selector if there's only one workspace
  if (workspaces.length <= 1) {
    return (
      <div className="mb-4 px-2">
        <div className="text-gray-500 text-xs">{currentWorkspace?.name || 'Personal'}</div>
      </div>
    )
  }

  return (
    <div className="relative mb-4">
      <select
        value={currentWorkspaceId || ''}
        onChange={(e) => store.setCurrentWorkspace(e.target.value)}
        className="w-full cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 font-medium text-gray-700 text-sm hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {workspaces.map((workspace) => (
          <option key={workspace.id} value={workspace.id}>
            {workspace.name}
            {workspace.type === 'personal' ? ' (Personal)' : ''}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 text-gray-400"
      />
    </div>
  )
})
