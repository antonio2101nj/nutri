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
  const getDefaultRoute = () => {
    if (profile?.role === 'admin') {
      return '/admin'
    }
    return '/user'
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
      
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminPanel />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/user" 
        element={
          <ProtectedRoute>
            <UserPanel />
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
    </Routes>
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
