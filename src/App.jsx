import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AuthPage } from './pages/AuthPage'
import { AdminPanel } from './pages/AdminPanel'
import { UserPanel } from './pages/UserPanel'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Loader2 } from 'lucide-react'
import './App.css'

function AppRoutes() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando aplicação...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  // Redirecionar baseado no role do usuário
  if (profile?.role === 'admin') {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    )
  } else if (profile?.role === 'user') {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/user" replace />} />
        <Route 
          path="/user" 
          element={
            <ProtectedRoute>
              <UserPanel />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/user" replace />} />
      </Routes>
    )
  }

  // Fallback, caso o perfil ainda não tenha sido carregado ou a role seja desconhecida
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Carregando perfil...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
