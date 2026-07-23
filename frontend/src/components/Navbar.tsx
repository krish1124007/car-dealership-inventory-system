import { useState, useRef, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  CarFront,
  Search,
  X,
  ChevronDown,
  ShoppingBag,
  Warehouse,
  LogOut,
  LogIn,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

const navLinks = [
  { label: 'Cars', to: '/cars', match: (search: string) => search === '' },
  {
    label: 'Electric cars',
    to: '/cars?category=EV',
    match: (search: string) => search.includes('category=EV'),
  },
  {
    label: 'Petrol cars',
    to: '/cars?fuel=petrol',
    match: (search: string) => search.includes('fuel=petrol'),
  },
  {
    label: 'Pre-launch cars',
    to: '/cars?type=pre-launch',
    match: (search: string) => search.includes('type=pre-launch'),
  },
]

/** Public top navigation: blends into the page at the top and turns
 * solid white once the user scrolls. */
export function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [query, setQuery] = useState('')
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

  // Transparent over the hero at the top, solid once scrolling starts.
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 16)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
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
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-sm shadow-gray-100/80'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 group-hover:from-blue-600 group-hover:to-blue-500 transition-all duration-300">
            <CarFront size={18} />
          </span>
          <span className="font-hero hidden sm:block text-2xl text-gray-900 tracking-wide leading-none pt-0.5">
            Car Dealership
          </span>
        </Link>

        <nav className="mx-auto flex items-center gap-1">
          {navLinks.map((link) => {
            const active =
              location.pathname === '/cars' && link.match(location.search)
            return (
              <Link
                key={link.label}
                to={link.to}
                className={`px-3 sm:px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                  active
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-900/5'
                } ${link.label === 'Cars' ? '' : 'hidden sm:inline-flex'}`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Search sits between the nav links and the account area. */}
        <form
          onSubmit={handleSearch}
          className="hidden md:block ml-auto w-44 lg:w-60 shrink-0"
        >
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <label htmlFor="navbar-search" className="sr-only">
              Search
            </label>
            <input
              id="navbar-search"
              ref={searchRef}
              type="search"
              placeholder="Search cars…"
              className="w-full h-10 rounded-full bg-gray-900/5 border border-transparent pl-10 pr-9 text-sm text-gray-900 placeholder-gray-500 hover:bg-gray-900/10 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:bg-white focus:shadow-md focus:shadow-blue-100/60 transition-all [&::-webkit-search-cancel-button]:hidden"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery('')
                  searchRef.current?.focus()
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </form>

        <div className="ml-auto md:ml-0 shrink-0">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((open) => !open)}
                aria-label="Account"
                className={`flex items-center gap-1.5 rounded-full p-1 pr-2 transition ${
                  menuOpen ? 'bg-gray-900/5' : 'hover:bg-gray-900/5'
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
        </div>
      </div>
    </header>
  )
}
