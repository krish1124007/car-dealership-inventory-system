import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded-full text-sm font-medium transition ${
    isActive
      ? 'bg-blue-50 text-blue-700'
      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
  }`

export function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-lg">
            🚗
          </span>
          <span className="font-bold text-gray-900 tracking-tight">
            Car Dealership
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={navLinkClasses}>
            Showroom
          </NavLink>
          <NavLink to="/purchases" className={navLinkClasses}>
            My purchases
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={navLinkClasses}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-gray-500">
            {user?.name}
          </span>
          <button
            onClick={handleLogout}
            className="rounded-full border border-gray-200 px-4 py-1.5 text-sm text-gray-700 hover:border-blue-300 hover:text-blue-600 transition"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}
