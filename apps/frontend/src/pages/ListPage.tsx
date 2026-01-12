import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import type { ListModel } from '../../../../packages/shared/src/models/ListModel'
import { NewTaskInput } from '../components/NewTaskInput'

export type ListPageProps = {
  title: string
  children?: React.ReactNode
  onCreateTask?: (title: string) => Promise<unknown>
  icon?: React.ReactNode
  list?: ListModel
  afterInput?: React.ReactNode
}

export const ListPage = observer(
  ({ children, title, icon, onCreateTask, list, afterInput }: ListPageProps) => {
    const [notes, setNotes] = useState(list?.notes || '')

    // Update notes when list changes (e.g., navigating between lists)
    useEffect(() => {
      setNotes(list?.notes || '')
    }, [list?.notes])

    const handleNotesBlur = async () => {
      if (list && notes !== (list.notes || '')) {
        await list.updateNotes(notes || null)
      }
    }

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNotes(e.target.value)
    }

    return (
      <div className="h-full w-full overflow-y-auto p-8">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-8 flex items-center gap-4">
            {icon && <div className="text-project">{icon}</div>}
            <h1 className="font-bold font-heading text-3xl">{title}</h1>
          </div>

          {list && (
            <div className="mb-6">
              <textarea
                value={notes}
                onChange={handleNotesChange}
                onBlur={handleNotesBlur}
                placeholder="Add notes..."
                className="min-h-20 w-full resize-y rounded-md border border-transparent bg-background p-3 text-sm transition-colors hover:border-gray-300 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="space-y-2">
            {children}

            {onCreateTask && <NewTaskInput onCreateTask={onCreateTask} />}

            {afterInput && <div className="mt-8">{afterInput}</div>}
          </div>
        </div>
      </div>
    )
  },
)
