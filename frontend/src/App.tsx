import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

/** Placeholder until the dashboard module lands in the second half. */
function DashboardPlaceholder() {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center gap-4 bg-[radial-gradient(ellipse_at_top_left,_rgba(59,130,246,0.08),_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(16,185,129,0.08),_transparent_50%)]">
      <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 text-3xl shadow-lg shadow-blue-200">
        🚗
      </span>
      <h1 className="text-2xl font-semibold">
        Welcome, {user?.name ?? 'driver'}
      </h1>
      <p className="text-gray-500">The showroom dashboard is coming soon.</p>
      <button
        onClick={logout}
        className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:border-blue-300 hover:text-blue-600 shadow-sm transition"
      >
        Log out
      </button>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPlaceholder />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
