import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useRootStore } from '../models/RootStoreContext'

export const JoinWorkspace = observer(() => {
  const { code } = useParams<{ code: string }>()
  const store = useRootStore()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [workspaceName, setWorkspaceName] = useState<string | null>(null)

  useEffect(() => {
    if (!code) {
      setStatus('error')
      setError('Invalid invite link')
      return
    }

    const joinWorkspace = async () => {
      try {
        const workspace = await store.joinWorkspace(code)
        setWorkspaceName(workspace.name)
        setStatus('success')
        // Reload data to get the new workspace's lists
        await store.loadData()
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/')
        }, 2000)
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Failed to join workspace')
      }
    }

    joinWorkspace()
  }, [code, store, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        {status === 'loading' && (
          <div className="text-center">
            <div className="mb-4 text-gray-500">Joining workspace...</div>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mb-2 text-2xl text-green-600">Welcome!</div>
            <div className="mb-4 text-gray-600">
              You've joined <span className="font-semibold">{workspaceName}</span>
            </div>
            <div className="text-gray-500 text-sm">Redirecting...</div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="mb-2 text-2xl text-red-600">Unable to Join</div>
            <div className="mb-4 text-gray-600">{error}</div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Go to Home
            </button>
          </div>
        )}
      </div>
    </div>
  )
})
