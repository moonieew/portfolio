import { onMounted, onUnmounted } from 'vue'
import { useCommandPalette } from '~/composables/useCommandPalette'
import { useOS } from '~/composables/useOS'

/**
 * Global keyboard model for the desktop shell.
 *   ⌘/Ctrl + K → toggle command palette
 *   Esc        → close palette (when open)
 *   ⌘/Ctrl + W → close the active window
 * Call once from the desktop environment.
 */
export function useShortcuts() {
  const palette = useCommandPalette()
  const { activeId, closeApp } = useOS()

  function onKey(e: KeyboardEvent) {
    const mod = e.metaKey || e.ctrlKey

    if (mod && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      palette.toggle()
      return
    }
    if (e.key === 'Escape' && palette.open.value) {
      palette.hide()
      return
    }
    if (mod && e.key.toLowerCase() === 'w' && activeId.value) {
      e.preventDefault()
      closeApp(activeId.value)
    }
  }

  onMounted(() => window.addEventListener('keydown', onKey))
  onUnmounted(() => window.removeEventListener('keydown', onKey))
}
