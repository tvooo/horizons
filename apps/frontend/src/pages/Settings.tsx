import { Download, Upload } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { ApiTokenManager } from '../components/ApiTokenManager'
import { WorkspaceManager } from '../components/WorkspaceManager'
import { useRootStore } from '../models/RootStoreContext'
import { ListPage } from './ListPage'

export const Settings = observer(() => {
  const store = useRootStore()
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const { blob, filename } = await store.exportData()

      // Download the file
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export data. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportError(null)

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      const result = await store.importData(data)

      alert(
        `Import successful! Imported ${result.imported.lists} lists and ${result.imported.tasks} tasks.${result.conflicts ? ' (Some IDs were remapped due to conflicts.)' : ''}`,
      )

      // Reload data from server
      await store.loadData()
    } catch (error) {
      console.error('Import failed:', error)
      setImportError(error instanceof Error ? error.message : 'Failed to import data')
    } finally {
      setIsImporting(false)
      // Reset the input so the same file can be selected again
      event.target.value = ''
    }
  }

  return (
    <ListPage title="Settings">
      <div className="space-y-8">
        {/* Workspaces Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-2 font-semibold text-lg">Workspaces</h2>
          <p className="mb-4 text-gray-600 text-sm">
            Manage your workspaces and invite others to collaborate.
          </p>
          <WorkspaceManager />
        </div>

        {/* Export Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-2 font-semibold text-lg">Export Data</h2>
          <p className="mb-4 text-gray-600 text-sm">
            Download all your lists and tasks as a JSON file. This file can be used for backup or to
            import into another account.
          </p>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} />
            {isExporting ? 'Exporting...' : 'Export Data'}
          </button>
        </div>

        {/* Import Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-2 font-semibold text-lg">Import Data</h2>
          <p className="mb-4 text-gray-600 text-sm">
            Import lists and tasks from a previously exported JSON file. This will add the data to
            your existing lists and tasks.
          </p>
          {importError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-red-600 text-sm">{importError}</div>
          )}
          <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50">
            <Upload size={16} />
            <span>{isImporting ? 'Importing...' : 'Import Data'}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={isImporting}
              className="hidden"
            />
          </label>
        </div>

        {/* API Tokens Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-2 font-semibold text-lg">API Tokens</h2>
          <p className="mb-4 text-gray-600 text-sm">
            Create tokens to allow external services to add tasks to your inbox via webhooks.
          </p>
          <ApiTokenManager />
        </div>
      </div>
    </ListPage>
  )
})
