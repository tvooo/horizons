import { useEffect, useRef, useState } from 'react'
import type { ListModel } from 'shared'

export function useListItemEditing(list: ListModel) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(list.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      // Small delay to ensure context menu is fully closed before focusing
      const timer = setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [isEditing])

  const handleSave = async () => {
    const trimmedValue = editValue.trim()
    if (trimmedValue && trimmedValue !== list.name) {
      await list.updateName(trimmedValue)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(list.name)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  const handleStartRename = () => {
    setEditValue(list.name)
    setIsEditing(true)
  }

  return {
    isEditing,
    editValue,
    setEditValue,
    inputRef,
    handleSave,
    handleCancel,
    handleKeyDown,
    handleStartRename,
  }
}
