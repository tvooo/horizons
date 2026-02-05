import {
  Building2,
  ChevronDown,
  ChevronRight,
  Copy,
  Pencil,
  Plus,
  Trash2,
  UserMinus,
  X,
} from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import type { BackendWorkspaceInvite, BackendWorkspaceMember } from 'shared'
import { useRootStore } from '../models/RootStoreContext'
import { AddWorkspaceModal } from './AddWorkspaceModal'

const WORKSPACE_COLORS = [
  '#6166aa',
  '#7c5ea5',
  '#437659',
  '#9c595e',
  '#5985a5',
  '#8a6840',
  '#6a8a5a',
  '#a0527a',
  '#5a7a8a',
  '#aa7c44',
]

interface WorkspaceDetails {
  members: BackendWorkspaceMember[]
  invites: BackendWorkspaceInvite[]
  loading: boolean
}

export const WorkspaceManager = observer(() => {
  const store = useRootStore()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [expandedWorkspaceId, setExpandedWorkspaceId] = useState<string | null>(null)
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [workspaceDetails, setWorkspaceDetails] = useState<Record<string, WorkspaceDetails>>({})
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null)

  const handleToggleExpand = async (workspaceId: string) => {
    if (expandedWorkspaceId === workspaceId) {
      setExpandedWorkspaceId(null)
      return
    }

    setExpandedWorkspaceId(workspaceId)

    // Load details if not already loaded
    if (!workspaceDetails[workspaceId]) {
      setWorkspaceDetails((prev) => ({
        ...prev,
        [workspaceId]: { members: [], invites: [], loading: true },
      }))

      try {
        const [members, invites] = await Promise.all([
          store.getWorkspaceMembers(workspaceId),
          store.getWorkspaceInvites(workspaceId),
        ])
        setWorkspaceDetails((prev) => ({
          ...prev,
          [workspaceId]: { members, invites, loading: false },
        }))
      } catch (error) {
        console.error('Failed to load workspace details:', error)
        setWorkspaceDetails((prev) => ({
          ...prev,
          [workspaceId]: { members: [], invites: [], loading: false },
        }))
      }
    }
  }

  const handleStartEdit = (workspaceId: string, currentName: string) => {
    setEditingWorkspaceId(workspaceId)
    setEditName(currentName)
  }

  const handleSaveEdit = async (workspaceId: string) => {
    if (!editName.trim()) return

    try {
      await store.updateWorkspace(workspaceId, { name: editName.trim() })
      setEditingWorkspaceId(null)
      setEditName('')
    } catch (error) {
      console.error('Failed to update workspace:', error)
      alert('Failed to update workspace')
    }
  }

  const handleCancelEdit = () => {
    setEditingWorkspaceId(null)
    setEditName('')
  }

  const handleDelete = async (workspaceId: string, workspaceName: string) => {
    if (!confirm(`Are you sure you want to delete "${workspaceName}"? This cannot be undone.`)) {
      return
    }

    try {
      await store.deleteWorkspace(workspaceId)
    } catch (error) {
      console.error('Failed to delete workspace:', error)
      alert('Failed to delete workspace')
    }
  }

  const handleRemoveMember = async (workspaceId: string, userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName} from this workspace?`)) {
      return
    }

    try {
      await store.removeWorkspaceMember(workspaceId, userId)
      setWorkspaceDetails((prev) => ({
        ...prev,
        [workspaceId]: {
          ...prev[workspaceId],
          members: prev[workspaceId].members.filter((m) => m.userId !== userId),
        },
      }))
    } catch (error) {
      console.error('Failed to remove member:', error)
      alert('Failed to remove member')
    }
  }

  const handleCreateInvite = async (workspaceId: string) => {
    try {
      const invite = await store.createWorkspaceInvite(workspaceId)
      setWorkspaceDetails((prev) => ({
        ...prev,
        [workspaceId]: {
          ...prev[workspaceId],
          invites: [...prev[workspaceId].invites, invite],
        },
      }))
    } catch (error) {
      console.error('Failed to create invite:', error)
      alert('Failed to create invite')
    }
  }

  const handleCopyInvite = async (code: string, inviteId: string) => {
    const inviteUrl = `${window.location.origin}/join/${code}`
    await navigator.clipboard.writeText(inviteUrl)
    setCopiedInviteId(inviteId)
    setTimeout(() => setCopiedInviteId(null), 2000)
  }

  const handleRevokeInvite = async (workspaceId: string, inviteId: string) => {
    if (!confirm('Are you sure you want to revoke this invite?')) {
      return
    }

    try {
      await store.deleteWorkspaceInvite(workspaceId, inviteId)
      setWorkspaceDetails((prev) => ({
        ...prev,
        [workspaceId]: {
          ...prev[workspaceId],
          invites: prev[workspaceId].invites.filter((i) => i.id !== inviteId),
        },
      }))
    } catch (error) {
      console.error('Failed to revoke invite:', error)
      alert('Failed to revoke invite')
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Workspace Section */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Workspace
        </button>
      </div>

      {/* Workspace List */}
      <div className="space-y-3">
        <h3 className="font-medium">Your Workspaces</h3>
        {store.workspaces.length === 0 ? (
          <div className="text-gray-500 text-sm">No workspaces yet.</div>
        ) : (
          <div className="space-y-2">
            {store.workspaces.map((workspace) => {
              const isPersonal = workspace.type === 'personal'
              const isOwner = workspace.role === 'owner'
              const isExpanded = expandedWorkspaceId === workspace.id
              const isEditing = editingWorkspaceId === workspace.id
              const details = workspaceDetails[workspace.id]

              return (
                <div key={workspace.id} className="rounded-lg border border-gray-200 bg-white">
                  {/* Workspace Header */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Building2 size={20} className="text-gray-400" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEdit(workspace.id)
                            } else if (e.key === 'Escape') {
                              handleCancelEdit()
                            }
                          }}
                          onBlur={() => handleSaveEdit(workspace.id)}
                          className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{workspace.name}</span>
                          {isOwner && (
                            <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-700 text-xs">
                              Owner
                            </span>
                          )}
                          {isPersonal && (
                            <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600 text-xs">
                              Personal
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {isOwner && !isEditing && (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(workspace.id, workspace.name)}
                          className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          title="Rename workspace"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      {isOwner && !isPersonal && (
                        <button
                          type="button"
                          onClick={() => handleDelete(workspace.id, workspace.name)}
                          className="rounded p-2 text-red-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete workspace"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      {!isPersonal && (
                        <button
                          type="button"
                          onClick={() => handleToggleExpand(workspace.id)}
                          className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Color Swatches */}
                  {isOwner && (
                    <div className="flex items-center gap-1.5 border-gray-200 border-t px-4 py-2">
                      <span className="mr-1 text-gray-500 text-xs">Color</span>
                      {WORKSPACE_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => store.updateWorkspace(workspace.id, { color })}
                          className="flex size-5 items-center justify-center rounded-full border-2 transition-transform hover:scale-110"
                          style={{
                            backgroundColor: color,
                            borderColor: workspace.color === color ? 'currentColor' : 'transparent',
                            color,
                          }}
                          title={color}
                        >
                          {workspace.color === color && (
                            <span className="block size-1.5 rounded-full bg-white" />
                          )}
                        </button>
                      ))}
                      {workspace.color && (
                        <button
                          type="button"
                          onClick={() => store.updateWorkspace(workspace.id, { color: null })}
                          className="flex size-5 items-center justify-center rounded-full border border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600"
                          title="Clear color"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Expanded Details (shared workspaces only) */}
                  {isExpanded && !isPersonal && (
                    <div className="border-gray-200 border-t px-4 py-3">
                      {details?.loading ? (
                        <div className="text-gray-500 text-sm">Loading...</div>
                      ) : (
                        <div className="space-y-4">
                          {/* Members Section */}
                          <div>
                            <h4 className="mb-2 font-medium text-gray-700 text-sm">Members</h4>
                            <div className="space-y-2">
                              {details?.members.map((member) => (
                                <div
                                  key={member.id}
                                  className="flex items-center justify-between rounded bg-gray-50 px-3 py-2"
                                >
                                  <div>
                                    <span className="text-sm">{member.userEmail}</span>
                                    <span className="ml-2 text-gray-500 text-xs">
                                      {member.role === 'owner' ? 'Owner' : 'Member'}
                                    </span>
                                  </div>
                                  {isOwner && member.role !== 'owner' && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveMember(
                                          workspace.id,
                                          member.userId,
                                          member.userEmail,
                                        )
                                      }
                                      className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                                      title="Remove member"
                                    >
                                      <UserMinus size={14} />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Invites Section */}
                          <div>
                            <div className="mb-2 flex items-center justify-between">
                              <h4 className="font-medium text-gray-700 text-sm">Invites</h4>
                              <button
                                type="button"
                                onClick={() => handleCreateInvite(workspace.id)}
                                className="flex items-center gap-1 rounded px-2 py-1 text-blue-600 text-xs hover:bg-blue-50"
                              >
                                <Plus size={12} />
                                Create Invite
                              </button>
                            </div>
                            {details?.invites.length === 0 ? (
                              <div className="text-gray-500 text-sm">No active invites.</div>
                            ) : (
                              <div className="space-y-2">
                                {details?.invites.map((invite) => (
                                  <div
                                    key={invite.id}
                                    className="flex items-center justify-between rounded bg-gray-50 px-3 py-2"
                                  >
                                    <div className="flex items-center gap-2">
                                      <code className="text-gray-600 text-xs">
                                        {invite.code.slice(0, 8)}...
                                      </code>
                                      <span className="text-gray-500 text-xs">
                                        {invite.usageCount}
                                        {invite.usageLimit ? `/${invite.usageLimit}` : ''} uses
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleCopyInvite(invite.code, invite.id)}
                                        className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                                        title="Copy invite link"
                                      >
                                        <Copy size={14} />
                                      </button>
                                      {copiedInviteId === invite.id && (
                                        <span className="text-green-600 text-xs">Copied!</span>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => handleRevokeInvite(workspace.id, invite.id)}
                                        className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                                        title="Revoke invite"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <AddWorkspaceModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  )
})
