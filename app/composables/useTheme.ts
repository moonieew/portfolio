import { ref, watch } from 'vue'

export type Theme = 'dark' | 'light'

const KEY = 'mn-os:theme'

/** Singleton theme state — defaults to the OS preference, persisted on change. */
const theme = ref<Theme>('dark')
let booted = false

export function useTheme() {
  if (import.meta.client && !booted) {
    booted = true

    // Priority: ?theme= URL override → saved choice → OS preference.
    const fromUrl = location.search.match(/[?&]theme=(light|dark)/)?.[1]
    let saved: string | null = null
    try {
      saved = localStorage.getItem(KEY)
    } catch {
      /* storage unavailable */
    }
    if (fromUrl === 'light' || fromUrl === 'dark') theme.value = fromUrl
    else if (saved === 'light' || saved === 'dark') theme.value = saved
    else if (window.matchMedia('(prefers-color-scheme: light)').matches)
      theme.value = 'light'

    watch(
      theme,
      (t) => {
        const cl = document.documentElement.classList
        cl.toggle('light', t === 'light')
        cl.toggle('dark', t === 'dark')
        document
          .querySelector('meta[name="theme-color"]')
          ?.setAttribute('content', t === 'light' ? '#e3e8ef' : '#0e1116')
        try {
          localStorage.setItem(KEY, t)
        } catch {
          /* ignore */
        }
      },
      { immediate: true },
    )
  }

  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return { theme, toggle }
}
