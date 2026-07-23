import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

interface ThemeValue {
  theme: Theme
  toggleTheme: () => void
}

/**
 * The default is a working light theme rather than null, so a component
 * rendered outside the provider (in a unit test, say) still behaves instead
 * of throwing. The real app always wraps everything in ThemeProvider.
 */
const ThemeContext = createContext<ThemeValue>({
  theme: 'light',
  toggleTheme: () => {},
})

/** Saved choice first; otherwise follow whatever the operating system says. */
function initialTheme(): Theme {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  // The class on <html> is what the dark variant keys off.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  function toggleTheme() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeValue {
  return useContext(ThemeContext)
}
