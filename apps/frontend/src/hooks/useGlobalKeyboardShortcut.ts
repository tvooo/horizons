import { useEffect } from 'react'

interface ShortcutOptions {
  key: string
  ctrl?: boolean
  shift?: boolean
  meta?: boolean
  alt?: boolean
}

export function useGlobalKeyboardShortcut(options: ShortcutOptions, callback: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

      // Check modifier keys
      const modifierKey = isMac ? event.metaKey : event.ctrlKey
      const ctrlOrMeta = options.ctrl || options.meta

      if (ctrlOrMeta && !modifierKey) return
      if (options.shift && !event.shiftKey) return
      if (options.alt && !event.altKey) return

      // Check the key
      if (event.key.toLowerCase() !== options.key.toLowerCase()) return

      event.preventDefault()
      callback()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [options.key, options.ctrl, options.shift, options.meta, options.alt, callback])
}
