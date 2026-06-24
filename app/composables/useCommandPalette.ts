import { ref } from 'vue'

// Module-scope singleton so any component can drive the palette.
const open = ref(false)

export function useCommandPalette() {
  return {
    open,
    toggle: () => (open.value = !open.value),
    show: () => (open.value = true),
    hide: () => (open.value = false),
  }
}
