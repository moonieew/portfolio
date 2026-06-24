import { ref, watch, type Ref } from 'vue'

/**
 * SSR-safe localStorage-backed ref.
 *
 * On the server it just returns `fallback` (no window). On the client it
 * hydrates from storage on first use and writes back on change (debounced so
 * a flurry of window drags doesn't hammer localStorage).
 */
export function persisted<T>(key: string, fallback: T): Ref<T> {
  const state = ref<T>(fallback) as Ref<T>

  if (import.meta.client) {
    try {
      const raw = localStorage.getItem(key)
      if (raw != null) state.value = JSON.parse(raw) as T
    } catch {
      /* corrupt / unavailable storage → keep fallback */
    }

    let t: ReturnType<typeof setTimeout>
    watch(
      state,
      (v) => {
        clearTimeout(t)
        t = setTimeout(() => {
          try {
            localStorage.setItem(key, JSON.stringify(v))
          } catch {
            /* quota / private mode → silently ignore */
          }
        }, 150)
      },
      { deep: true },
    )
  }

  return state
}
