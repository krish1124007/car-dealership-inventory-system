import { Link } from 'react-router-dom'

/** Simple site footer. */
export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo/logo_cars.png"
            alt=""
            className="w-8 h-8 rounded-lg object-cover"
          />
          <span className="font-hero text-xl text-gray-900 tracking-wide leading-none pt-0.5">
            Car Dealership
          </span>
        </div>

        <nav className="flex items-center gap-5 text-sm text-gray-500">
          <Link to="/" className="hover:text-blue-600 transition">
            Home
          </Link>
          <Link to="/cars" className="hover:text-blue-600 transition">
            Cars
          </Link>
          <Link to="/login" className="hover:text-blue-600 transition">
            Login
          </Link>
        </nav>

        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} All rights reserved.
        </p>
      </div>
    </footer>
  )
}
