import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ToastProvider } from './components/Toast'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { AdminRegisterPage } from './pages/AdminRegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { CarsPage } from './pages/CarsPage'
import { VehicleDetailPage } from './pages/VehicleDetailPage'
import { MyPurchasesPage } from './pages/MyPurchasesPage'
import { AdminPage } from './pages/AdminPage'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin/register" element={<AdminRegisterPage />} />

            {/* Browsing is public — anyone can window-shop. */}
            <Route path="/" element={<DashboardPage />} />
            <Route path="/cars" element={<CarsPage />} />
            <Route path="/vehicles/:id" element={<VehicleDetailPage />} />

            {/* Personal and management areas stay protected. */}
            <Route
              path="/purchases"
              element={
                <ProtectedRoute>
                  <MyPurchasesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
