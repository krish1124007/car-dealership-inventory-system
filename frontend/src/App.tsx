import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

/** Placeholder until the dashboard module lands in the second half. */
function DashboardPlaceholder() {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-4">
      <span className="text-4xl">🚗</span>
      <h1 className="text-2xl font-semibold">
        Welcome, {user?.name ?? 'driver'}
      </h1>
      <p className="text-slate-400">The showroom dashboard is coming soon.</p>
      <button
        onClick={logout}
        className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 transition"
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
