import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useState } from 'react'
import { useRootStore } from '../models/RootStoreContext'

interface AddListModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddListModal({ isOpen, onClose }: AddListModalProps) {
  const store = useRootStore()
  const [name, setName] = useState('')
  const [type, setType] = useState<'area' | 'project' | 'list'>('list')
  const [workspaceId, setWorkspaceId] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Set default workspace when modal opens
  const defaultWorkspaceId = store.workspaces[0]?.id || ''
  const selectedWorkspaceId = workspaceId || defaultWorkspaceId

  const handleSubmit = async () => {
    if (!name.trim() || !selectedWorkspaceId) return

    setIsSubmitting(true)
    try {
      await store.createList(name.trim(), type, undefined, selectedWorkspaceId)
      setName('')
      setType('list')
      setWorkspaceId('')
      onClose()
    } catch (err) {
      console.error('Failed to create list:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 max-h-[85vh] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg focus:outline-none">
          <Dialog.Title className="mb-4 font-semibold text-gray-900 text-lg">
            Add New List
          </Dialog.Title>

          <div className="space-y-4">
            <div>
              <label htmlFor="list-name" className="mb-1 block font-medium text-gray-700 text-sm">
                Name
              </label>
              <input
                id="list-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                placeholder="Enter list name"
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="list-type" className="mb-1 block font-medium text-gray-700 text-sm">
                Type
              </label>
              <select
                id="list-type"
                value={type}
                onChange={(e) => setType(e.target.value as 'area' | 'project' | 'list')}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="list">List</option>
                <option value="project">Project</option>
                <option value="area">Area</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="list-workspace"
                className="mb-1 block font-medium text-gray-700 text-sm"
              >
                Workspace
              </label>
              <select
                id="list-workspace"
                value={selectedWorkspaceId}
                onChange={(e) => setWorkspaceId(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                {store.workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-gray-300 px-4 py-2 text-gray-700 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!name.trim() || isSubmitting}
              className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isSubmitting ? 'Creating...' : 'Create List'}
            </button>
          </div>

          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute top-4 right-4 inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
