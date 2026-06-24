import { computed, markRaw, reactive, ref, watch } from 'vue'
import type { Component } from 'vue'
import { persisted } from '~/composables/usePersistentState'
import AppIdentity from '~/components/AppIdentity.vue'
import AppDatagram from '~/components/AppDatagram.vue'
import AppWeb3 from '~/components/AppWeb3.vue'
import AppCreative from '~/components/AppCreative.vue'
import AppExperience from '~/components/AppExperience.vue'
import AppContact from '~/components/AppContact.vue'
import AppResume from '~/components/AppResume.vue'

export type Accent = 'neon' | 'purple' | 'blue' | 'mono'

export interface AppDef {
  id: string
  name: string
  /** Short label shown on the dock / home grid. */
  short: string
  /** Single-glyph icon mark. */
  icon: string
  accent: Accent
  blurb: string
  component: Component
  /** Default window size on desktop. */
  size: { w: number; h: number }
}

export interface WindowState {
  id: string
  x: number
  y: number
  w: number
  h: number
  z: number
  minimized: boolean
  maximized: boolean
}

/* ------------------------------------------------------------------ *
 *  Installed apps — static registry (component refs are markRaw'd so
 *  Vue never tries to make them deeply reactive).
 * ------------------------------------------------------------------ */
const APPS: AppDef[] = [
  {
    id: 'identity',
    name: 'Identity',
    short: 'Identity',
    icon: 'A',
    accent: 'neon',
    blurb: 'whoami — terminal intro',
    component: markRaw(AppIdentity),
    size: { w: 680, h: 480 },
  },
  {
    id: 'resume',
    name: 'Résumé',
    short: 'Résumé',
    icon: '▦',
    accent: 'neon',
    blurb: 'CV · download PDF',
    component: markRaw(AppResume),
    size: { w: 760, h: 620 },
  },
  {
    id: 'datagram',
    name: 'Datagram Network',
    short: 'Datagram',
    icon: '◢',
    accent: 'neon',
    blurb: 'DePIN real-time engine',
    component: markRaw(AppDatagram),
    size: { w: 880, h: 600 },
  },
  {
    id: 'web3',
    name: 'Saros · Chat3',
    short: 'Saros',
    icon: '◈',
    accent: 'purple',
    blurb: 'Multi-chain Web3 state',
    component: markRaw(AppWeb3),
    size: { w: 840, h: 600 },
  },
  {
    id: 'experience',
    name: 'Experience',
    short: 'Work',
    icon: '▤',
    accent: 'blue',
    blurb: 'Work history · Finder',
    component: markRaw(AppExperience),
    size: { w: 880, h: 560 },
  },
  {
    id: 'creative',
    name: 'Atelier',
    short: 'Atelier',
    icon: '✦',
    accent: 'blue',
    blurb: 'Brand identity · the hidden gem',
    component: markRaw(AppCreative),
    size: { w: 840, h: 600 },
  },
  {
    id: 'contact',
    name: 'Mail',
    short: 'Contact',
    icon: '✉',
    accent: 'purple',
    blurb: 'Compose a message',
    component: markRaw(AppContact),
    size: { w: 720, h: 560 },
  },
]

/* ------------------------------------------------------------------ *
 *  Singleton OS state (module scope → shared by every consumer).
 *  Only mutated on the client (the OS is rendered inside <ClientOnly>).
 * ------------------------------------------------------------------ */
interface Session {
  windows: Record<string, WindowState>
  order: string[]
  activeId: string | null
  zTop: number
}

// Restored from localStorage on the client; empty on the server.
const snap = persisted<Session>('anna-os:session', {
  windows: {},
  order: [],
  activeId: null,
  zTop: 10,
})

const windows = reactive<Record<string, WindowState>>(snap.value.windows)
const order = ref<string[]>(snap.value.order)
const activeId = ref<string | null>(snap.value.activeId)
const zTop = ref(snap.value.zTop)

// Mirror live state back into the persisted snapshot on any change.
if (import.meta.client) {
  watch(
    [windows, order, activeId, zTop],
    () => {
      snap.value = {
        windows: JSON.parse(JSON.stringify(windows)),
        order: [...order.value],
        activeId: activeId.value,
        zTop: zTop.value,
      }
    },
    { deep: true },
  )
}

// Mobile only ever shows one full-screen app at a time.
const mobileAppId = ref<string | null>(null)

function getApp(id: string): AppDef | undefined {
  return APPS.find((a) => a.id === id)
}

// Drop any restored windows whose app no longer exists in the registry.
if (import.meta.client) {
  for (const id of Object.keys(windows)) {
    if (!getApp(id)) delete windows[id]
  }
  order.value = order.value.filter((id) => windows[id])
  if (activeId.value && !windows[activeId.value]) activeId.value = null
}

function topmostOpen(exclude?: string): string | null {
  let best: string | null = null
  let bestZ = -1
  for (const id of order.value) {
    const w = windows[id]
    if (!w || w.minimized || id === exclude) continue
    if (w.z > bestZ) {
      bestZ = w.z
      best = id
    }
  }
  return best
}

/* ----- Desktop window actions ----- */
function focusApp(id: string) {
  const w = windows[id]
  if (!w) return
  w.z = ++zTop.value
  w.minimized = false
  activeId.value = id
}

function openApp(id: string) {
  const app = getApp(id)
  if (!app) return
  const existing = windows[id]
  if (existing) {
    focusApp(id)
    return
  }
  const i = order.value.length
  windows[id] = {
    id,
    x: 96 + i * 36,
    y: 84 + i * 30,
    w: app.size.w,
    h: app.size.h,
    z: ++zTop.value,
    minimized: false,
    maximized: false,
  }
  order.value.push(id)
  activeId.value = id
}

function closeApp(id: string) {
  delete windows[id]
  order.value = order.value.filter((x) => x !== id)
  if (activeId.value === id) activeId.value = topmostOpen()
}

function minimizeApp(id: string) {
  const w = windows[id]
  if (!w) return
  w.minimized = true
  if (activeId.value === id) activeId.value = topmostOpen()
}

function toggleMaximize(id: string) {
  const w = windows[id]
  if (!w) return
  w.maximized = !w.maximized
  focusApp(id)
}

/** Dock click behaviour: open → focus → minimize toggle. */
function dockToggle(id: string) {
  const w = windows[id]
  if (!w) {
    openApp(id)
    return
  }
  if (w.minimized) {
    focusApp(id)
    return
  }
  if (activeId.value === id) {
    minimizeApp(id)
    return
  }
  focusApp(id)
}

function isOpen(id: string) {
  return !!windows[id]
}

/* ----- Mobile actions ----- */
function openMobile(id: string) {
  if (getApp(id)) mobileAppId.value = id
}

function closeMobile() {
  mobileAppId.value = null
}

export function useOS() {
  const openWindowIds = computed(() => order.value.filter((id) => windows[id]))
  const mobileApp = computed(() =>
    mobileAppId.value ? getApp(mobileAppId.value) ?? null : null,
  )

  return {
    // state
    apps: APPS,
    windows,
    activeId,
    openWindowIds,
    mobileAppId,
    mobileApp,
    // queries
    getApp,
    isOpen,
    // desktop actions
    openApp,
    closeApp,
    focusApp,
    minimizeApp,
    toggleMaximize,
    dockToggle,
    // mobile actions
    openMobile,
    closeMobile,
  }
}
