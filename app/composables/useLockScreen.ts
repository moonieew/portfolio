import { ref } from 'vue'

/**
 * Singleton lock-screen state — the OS boots "locked" on every visit
 * (like macOS after startup) and unlocks via the Get Started button.
 * Only mutated on the client (rendered inside <ClientOnly>).
 */
const locked = ref(true)

export function useLockScreen() {
  function unlock() {
    locked.value = false
  }
  return { locked, unlock }
}
