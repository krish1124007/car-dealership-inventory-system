import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Home, ShoppingBag, Warehouse, LogOut } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
    isActive
      ? 'bg-blue-600 text-white shadow-sm'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  }`

/** App sidebar: brand, navigation and the signed-in user footer. */
export function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const initials = (user?.name ?? '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <aside className="fixed inset-y-0 left-0 z-20 w-16 lg:w-64 bg-white border-r border-gray-200 flex flex-col">
      <Link
        to="/"
        className="flex items-center gap-3 h-16 px-3.5 lg:px-5 border-b border-gray-100"
      >
        <img
          src="/logo/logo_cars.png"
          alt=""
          className="shrink-0 w-9 h-9 rounded-xl object-cover"
        />
        <span className="hidden lg:block font-bold text-gray-900 tracking-tight">
          Car Dealership
        </span>
      </Link>

      <nav className="flex-1 px-2.5 lg:px-3 py-4 space-y-1">
        <NavLink to="/" end className={navLinkClasses}>
          <Home size={18} className="shrink-0" />
          <span className="hidden lg:inline">Home</span>
        </NavLink>
        <NavLink to="/purchases" className={navLinkClasses}>
          <ShoppingBag size={18} className="shrink-0" />
          <span className="hidden lg:inline">My purchases</span>
        </NavLink>
        {isAdmin && (
          <NavLink to="/admin" className={navLinkClasses}>
            <Warehouse size={18} className="shrink-0" />
            <span className="hidden lg:inline">Admin</span>
          </NavLink>
        )}
      </nav>

      <div className="border-t border-gray-100 p-3 lg:p-4">
        <div className="flex items-center gap-3">
          <span className="shrink-0 w-9 h-9 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold flex items-center justify-center">
            {initials}
          </span>
          <div className="hidden lg:block min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
            className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  )
}
