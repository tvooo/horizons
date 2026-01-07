import { ChevronDown, ChevronUp } from 'lucide-react'
import { type ReactNode, useEffect, useState } from 'react'

interface CollapsibleSectionProps {
  title: string
  children: ReactNode
  defaultCollapsed?: boolean
  storageKey?: string
  count?: number
}

export function CollapsibleSection({
  title,
  children,
  defaultCollapsed = false,
  storageKey,
  count,
}: CollapsibleSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (storageKey) {
      const stored = localStorage.getItem(storageKey)
      if (stored !== null) {
        return stored === 'true'
      }
    }
    return defaultCollapsed
  })

  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, String(isCollapsed))
    }
  }, [isCollapsed, storageKey])

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={toggleCollapsed}
        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-gray-400 text-sm hover:bg-gray-50"
      >
        <span className="flex-1 font-semibold">{title}</span>
        {count !== undefined && count > 0 && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-400 text-xs">
            {count}
          </span>
        )}
        {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </button>
      {!isCollapsed && <div className="space-y-1">{children}</div>}
    </div>
  )
}
