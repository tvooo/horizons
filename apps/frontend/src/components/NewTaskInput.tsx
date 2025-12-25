import { Plus } from 'lucide-react'
import { useState } from 'react'

interface NewTaskInputProps {
  onCreateTask: (title: string) => Promise<unknown>
  placeholder?: string
}

export function NewTaskInput({ onCreateTask, placeholder = 'Add a task...' }: NewTaskInputProps) {
  const [title, setTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) return

    setIsAdding(true)
    try {
      await onCreateTask(title.trim())
      setTitle('')
    } catch (err) {
      console.error('Failed to create task:', err)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg p-3">
      <Plus size={20} className="flex-shrink-0 text-gray-400" />
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
          }
        }}
        placeholder={placeholder}
        disabled={isAdding}
        className="flex-1 border-none bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none"
      />
    </div>
  )
}
