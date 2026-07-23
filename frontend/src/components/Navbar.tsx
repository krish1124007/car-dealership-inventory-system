import { useState, useRef, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Search,
  X,
  ChevronDown,
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
  const searchRef = useRef<HTMLInputElement | null>(null)

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

  // Press "/" anywhere to jump into the search box.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement
      const typing =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      if (event.key === '/' && !typing) {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
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

  const initials = (user?.name ?? '')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-sm shadow-gray-100/80">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-0 sm:h-16 flex flex-wrap sm:flex-nowrap items-center gap-x-4 gap-y-3">
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <img
            src="/logo/logo_cars.png"
            alt=""
            className="w-9 h-9 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
          />
          <span className="font-display hidden sm:block font-bold text-gray-900 tracking-tight">
            Car Dealership
          </span>
        </Link>

        <form
          onSubmit={handleSearch}
          className="order-3 sm:order-none basis-full sm:basis-auto sm:flex-1 max-w-xl sm:mx-auto"
        >
          <div className="relative group/search">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/search:text-blue-500 transition-colors pointer-events-none"
            />
            <label htmlFor="navbar-search" className="sr-only">
              Search
            </label>
            <input
              id="navbar-search"
              ref={searchRef}
              type="search"
              placeholder="Search cars by name…"
              className="w-full h-11 rounded-full bg-gray-100/80 border border-transparent pl-11 pr-12 text-sm text-gray-900 placeholder-gray-400 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-transparent focus:bg-white focus:shadow-md focus:shadow-blue-100/60 transition-all [&::-webkit-search-cancel-button]:hidden"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery('')
                  searchRef.current?.focus()
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition"
              >
                <X size={14} />
              </button>
            ) : (
              <kbd className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 items-center justify-center w-6 h-6 rounded-md border border-gray-200 bg-white text-[11px] font-semibold text-gray-400 pointer-events-none">
                /
              </kbd>
            )}
          </div>
        </form>

        <nav className="ml-auto sm:ml-0 flex items-center gap-2 shrink-0">
          <NavLink
            to="/cars"
            className={({ isActive }) =>
              `px-4 py-2 rounded-full text-sm font-semibold transition ${
                isActive
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
                className={`flex items-center gap-1.5 rounded-full p-1 pr-2 transition ${
                  menuOpen
                    ? 'bg-gray-100'
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                  {initials || '?'}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform duration-200 ${
                    menuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-200/70 overflow-hidden origin-top-right animate-[menu-in_120ms_ease-out]">
                  <div className="px-4 py-3 bg-gray-50/70 border-b border-gray-100">
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
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
                    >
                      <ShoppingBag size={16} />
                      My purchases
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
                      >
                        <Warehouse size={16} />
                        Admin
                      </Link>
                    )}
                    <div className="my-1 border-t border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
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
              className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 hover:bg-blue-600 text-white text-sm font-semibold px-5 py-2 shadow-sm transition-colors duration-300"
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
