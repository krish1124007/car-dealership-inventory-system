import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../theme/ThemeContext'

/** Switches the site between light and dark. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const goingDark = theme === 'light'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={goingDark ? 'Switch to dark mode' : 'Switch to light mode'}
      title={goingDark ? 'Dark mode' : 'Light mode'}
      className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-900/5 transition"
    >
      {goingDark ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  )
}
