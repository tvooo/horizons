import { Command } from 'cmdk'
import fuzzysort from 'fuzzysort'
import { CheckCircle2, CircleDot, HexagonIcon, ListIcon } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ListModel } from 'shared'
import { useGlobalKeyboardShortcut } from '../hooks/useGlobalKeyboardShortcut'
import { useRootStore } from '../models/RootStoreContext'

import './CommandPalette.css'

export const CommandPalette = observer(() => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const store = useRootStore()
  const navigate = useNavigate()

  const toggle = useCallback(() => {
    setOpen((prev) => {
      if (prev) setSearch('')
      return !prev
    })
  }, [])

  useGlobalKeyboardShortcut({ key: 'p', meta: true }, toggle)

  const activeTasks = useMemo(
    () => store.tasks.filter((t) => !t.completed && !t.onIce),
    [store.tasks],
  )

  const activeLists = useMemo(
    () => store.lists.filter((l) => !l.archived && !l.onIce),
    [store.lists],
  )

  const results = useMemo(() => {
    if (!search.trim()) return { tasks: activeTasks, lists: activeLists }

    const taskResults = fuzzysort.go(search, activeTasks, {
      key: 'title',
      threshold: 0.2,
    })
    const listResults = fuzzysort.go(search, activeLists, {
      key: 'name',
      threshold: 0.2,
    })

    return {
      tasks: taskResults.map((r) => r.obj),
      lists: listResults.map((r) => r.obj),
    }
  }, [search, activeTasks, activeLists])

  const handleSelect = useCallback(
    (value: string) => {
      const [type, id] = value.split(':')
      setOpen(false)
      setSearch('')

      if (type === 'list') {
        navigate(`/list/${id}`)
      } else if (type === 'task') {
        const task = store.tasks.find((t) => t.id === id)
        if (task?.listId) {
          navigate(`/list/${task.listId}`)
        } else {
          navigate('/inbox')
        }
      }
    },
    [navigate, store.tasks],
  )

  const close = useCallback(() => {
    setOpen(false)
    setSearch('')
  }, [])

  const listIcon = (list: ListModel) => {
    if (list.isArea) return <HexagonIcon size={14} className="shrink-0 text-area" />
    if (list.isProject) return <CircleDot size={14} className="shrink-0 text-project" />
    return <ListIcon size={14} className="shrink-0 text-neutral-medium" />
  }

  if (!open) return null

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: overlay dismiss handled by cmdk
    // biome-ignore lint/a11y/noStaticElementInteractions: overlay dismiss
    <div className="cmdp-overlay" onClick={close}>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: wrapper */}
      <div className="cmdp-wrapper" onClick={(e) => e.stopPropagation()}>
        <Command className="cmdp-root" shouldFilter={false}>
          <Command.Input
            className="cmdp-input"
            placeholder="Search tasks and lists..."
            value={search}
            onValueChange={setSearch}
          />

          <Command.List className="cmdp-list">
            <Command.Empty className="cmdp-empty">No results found.</Command.Empty>

            {results.lists.length > 0 && (
              <Command.Group heading="Lists" className="cmdp-group">
                {results.lists.map((list) => (
                  <Command.Item
                    key={`list:${list.id}`}
                    value={`list:${list.id}`}
                    onSelect={handleSelect}
                    className="cmdp-item"
                  >
                    {listIcon(list)}
                    <span className="cmdp-item-text">{list.name}</span>
                    <span className="cmdp-item-meta">{list.numberOfOpenTasks} tasks</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {results.tasks.length > 0 && (
              <Command.Group heading="Tasks" className="cmdp-group">
                {results.tasks.slice(0, 50).map((task) => (
                  <Command.Item
                    key={`task:${task.id}`}
                    value={`task:${task.id}`}
                    onSelect={handleSelect}
                    className="cmdp-item"
                  >
                    <CheckCircle2 size={14} className="shrink-0 text-neutral-medium" />
                    <span className="cmdp-item-text">{task.title}</span>
                    {task.list && <span className="cmdp-item-meta">{task.list.name}</span>}
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  )
})
