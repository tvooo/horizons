import { Download, Upload } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { ListPage } from './ListPage'

export const Settings = observer(() => {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('http://localhost:3000/api/export', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Get the filename from Content-Disposition header or use a default
      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const filename = filenameMatch
        ? filenameMatch[1]
        : `horizons-export-${new Date().toISOString().split('T')[0]}.json`

      // Download the file
      const blob = await response.blob()
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

      // TODO: Implement import endpoint
      const response = await fetch('http://localhost:3000/api/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Import failed')
      }

      alert('Data imported successfully! Please refresh the page.')
      window.location.reload()
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
          <p className="mt-2 text-gray-500 text-xs">
            Note: Import is not yet implemented. Please wait for the next update.
          </p>
        </div>
      </div>
    </ListPage>
  )
})
