import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme: Theme) => {
        set({ theme })
        applyTheme(theme)
      },
      toggleTheme: () => {
        set((state) => {
          const next = state.theme === 'dark' ? 'light' : 'dark'
          applyTheme(next)
          return { theme: next }
        })
      },
    }),
    {
      name: 'theme-storage',
    }
  )
)

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function initTheme() {
  const stored = localStorage.getItem('theme-storage')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      const theme = parsed?.state?.theme || 'dark'
      applyTheme(theme)
      return
    } catch {}
  }
  applyTheme('dark')
}
