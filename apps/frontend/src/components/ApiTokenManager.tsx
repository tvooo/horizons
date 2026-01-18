import { Copy, Key, Plus, Trash2 } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import type { ApiTokenInfo } from 'shared'
import { useRootStore } from '../models/RootStoreContext'

export const ApiTokenManager = observer(() => {
  const store = useRootStore()
  const [tokens, setTokens] = useState<ApiTokenInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newTokenName, setNewTokenName] = useState('')
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const loadTokens = async () => {
      try {
        const data = await store.getTokens()
        setTokens(data)
      } catch (error) {
        console.error('Failed to load tokens:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadTokens()
  }, [store])

  const handleCreate = async () => {
    if (!newTokenName.trim()) return

    setIsCreating(true)
    try {
      const result = await store.createToken(newTokenName)
      setNewlyCreatedToken(result.token)
      setTokens([...tokens, result])
      setNewTokenName('')
    } catch (error) {
      console.error('Failed to create token:', error)
      alert('Failed to create token')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this token? This cannot be undone.')) {
      return
    }

    try {
      await store.deleteToken(id)
      setTokens(tokens.filter((t) => t.id !== id))
    } catch (error) {
      console.error('Failed to delete token:', error)
      alert('Failed to delete token')
    }
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never'
    return new Date(dateStr).toLocaleDateString()
  }

  if (isLoading) {
    return <div className="text-gray-500">Loading tokens...</div>
  }

  return (
    <div className="space-y-6">
      {/* Newly Created Token Alert */}
      {newlyCreatedToken && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="mb-2 font-medium text-yellow-800">
            Token created! Copy it now - you won't see it again.
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 overflow-auto rounded bg-yellow-100 px-3 py-2 font-mono text-sm">
              {newlyCreatedToken}
            </code>
            <button
              type="button"
              onClick={() => copyToClipboard(newlyCreatedToken)}
              className="rounded-lg bg-yellow-600 p-2 text-white hover:bg-yellow-700"
            >
              <Copy size={16} />
            </button>
          </div>
          {copied && <div className="mt-2 text-green-600 text-sm">Copied!</div>}
          <button
            type="button"
            onClick={() => setNewlyCreatedToken(null)}
            className="mt-3 text-sm text-yellow-700 underline"
          >
            I've copied the token
          </button>
        </div>
      )}

      {/* Create New Token */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-3 font-medium">Create New Token</h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={newTokenName}
            onChange={(e) => setNewTokenName(e.target.value)}
            placeholder="Token name (e.g., Zapier, iOS Shortcuts)"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newTokenName.trim()) {
                handleCreate()
              }
            }}
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={isCreating || !newTokenName.trim()}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus size={16} />
            Create
          </button>
        </div>
      </div>

      {/* Token List */}
      <div className="space-y-3">
        <h3 className="font-medium">Your Tokens</h3>
        {tokens.length === 0 ? (
          <div className="text-gray-500 text-sm">No tokens yet. Create one to get started.</div>
        ) : (
          <div className="space-y-2">
            {tokens.map((token) => (
              <div
                key={token.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex items-center gap-3">
                  <Key size={20} className="text-gray-400" />
                  <div>
                    <div className="font-medium">{token.name}</div>
                    <div className="text-gray-500 text-sm">
                      <code>{token.tokenPrefix}...</code>
                      <span className="mx-2">·</span>
                      Last used: {formatDate(token.lastUsedAt)}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(token.id)}
                  className="rounded p-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage Instructions */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-2 font-medium">Webhook Usage</h3>
        <p className="mb-3 text-gray-600 text-sm">
          Use your token to create inbox tasks via HTTP POST:
        </p>
        <pre className="overflow-x-auto rounded bg-gray-100 p-3 text-xs">
          {`curl -X POST ${window.location.origin}/api/webhook/inbox \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"title": "Task title", "notes": "Optional notes"}'`}
        </pre>
      </div>
    </div>
  )
})
