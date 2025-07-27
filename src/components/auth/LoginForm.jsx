import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import logoImage from '../../assets/logo.png'

export const LoginForm = ({ onToggleMode }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  
  const { signIn } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResetMessage('')

    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error.message)
    }
    
    setLoading(false)
  }

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Por favor, digite seu email primeiro')
      return
    }

    setResetLoading(true)
    setError('')
    setResetMessage('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) {
      setError(error.message)
    } else {
      setResetMessage('Email de recuperação enviado! Verifique sua caixa de entrada.')
    }

    setResetLoading(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-4">
        <div className="flex flex-col items-center space-y-3">
          <img 
            src={logoImage} 
            alt="PLAN DE VITALIDAD Logo" 
            className="w-16 h-16 object-contain"
          />
          <div className="text-center">
            <CardTitle className="text-2xl font-bold text-green-700">PLAN DE VITALIDAD</CardTitle>
            <CardDescription className="text-green-600 mt-1">
              Sua jornada para uma vida mais saudável
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || resetLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || resetLoading}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading || resetLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {resetMessage && (
            <Alert>
              <AlertDescription>{resetMessage}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading || resetLoading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Entrar
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handlePasswordReset}
            disabled={loading || resetLoading}
          >
            {resetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Esqueci minha senha
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Button
            variant="link"
            onClick={onToggleMode}
            className="text-sm"
            disabled={loading || resetLoading}
          >
            Não tem uma conta? Registre-se
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

