import { useState, useRef, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Search,
  CircleUserRound,
  ShoppingBag,
  Warehouse,
  LogOut,
  LogIn,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

/** Public top navigation: brand, name search, Cars link and the
 * login/account area. */
export function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Close the account dropdown when clicking anywhere else.
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    const q = query.trim()
    navigate(q ? `/cars?q=${encodeURIComponent(q)}` : '/cars')
  }

  function handleLogout() {
    setMenuOpen(false)
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src="/logo/logo_cars.png"
            alt=""
            className="w-9 h-9 rounded-xl object-cover"
          />
          <span className="hidden sm:block font-bold text-gray-900 tracking-tight">
            Car Dealership
          </span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <label htmlFor="navbar-search" className="sr-only">
              Search
            </label>
            <input
              id="navbar-search"
              type="search"
              placeholder="Search cars by name…"
              className="w-full rounded-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:bg-white transition"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </form>

        <nav className="flex items-center gap-2 shrink-0">
          <NavLink
            to="/cars"
            className={({ isActive }) =>
              `px-4 py-2 rounded-full text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`
            }
          >
            Cars
          </NavLink>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((open) => !open)}
                aria-label="Account"
                className="flex items-center justify-center w-10 h-10 rounded-full text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition"
              >
                <CircleUserRound size={24} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="py-1.5">
                    <Link
                      to="/purchases"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition"
                    >
                      <ShoppingBag size={16} />
                      My purchases
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition"
                      >
                        <Warehouse size={16} />
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2 shadow-sm transition"
            >
              <LogIn size={15} />
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
