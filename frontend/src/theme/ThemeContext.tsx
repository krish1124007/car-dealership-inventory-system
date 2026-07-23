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

/**
 * Everyone starts in light mode. Dark is opt-in — the system preference is
 * deliberately ignored so a first-time visitor always sees the site the way
 * it was designed, and only their own choice is remembered.
 */
function initialTheme(): Theme {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved === 'dark' ? 'dark' : 'light'
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
