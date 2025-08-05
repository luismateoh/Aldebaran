'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('🔐 Intentando login con contraseña')
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      console.log('📡 Respuesta del servidor:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Login exitoso, configurando autenticación')
        
        // Guardar token en localStorage
        localStorage.setItem('admin_token', data.token)
        
        // También en sessionStorage como backup
        sessionStorage.setItem('admin_authenticated', 'true')
        
        // Establecer cookie con configuración mejorada
        const expiresDate = new Date()
        expiresDate.setTime(expiresDate.getTime() + (24 * 60 * 60 * 1000)) // 24 horas
        document.cookie = `admin_token=${data.token}; expires=${expiresDate.toUTCString()}; path=/; SameSite=Lax`
        
        console.log('🔄 Redirigiendo al panel de admin...')
        console.log('🍪 Cookie establecida:', document.cookie)
        
        // Usar setTimeout para asegurar que las cookies se establecen
        setTimeout(() => {
          console.log('🚀 Ejecutando redirección...')
          window.location.replace('/admin')
        }, 200)
        
      } else {
        const errorData = await response.json()
        console.log('❌ Error de login:', errorData)
        setError(errorData.error || 'Contraseña incorrecta')
      }
    } catch (error) {
      console.error('💥 Error de conexión:', error)
      setError('Error de conexión. Verifica que el servidor esté corriendo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Lock className="h-6 w-6" />
            Panel de Administración
          </CardTitle>
          <CardDescription>
            Ingresa la contraseña para acceder al panel de gestión de Aldebaran
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !password}
            >
              {isLoading ? 'Verificando...' : 'Acceder'}
            </Button>
          </form>

          {/* Debug temporal para diagnosticar el problema */}
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 mb-2">Debug temporal:</p>
            <Button 
              onClick={() => {
                console.log('🔍 Verificando estado de autenticación...')
                console.log('localStorage admin_token:', localStorage.getItem('admin_token'))
                console.log('sessionStorage:', sessionStorage.getItem('admin_authenticated'))
                console.log('document.cookie:', document.cookie)
                
                // Intentar ir directo al admin
                window.location.href = '/admin'
              }}
              variant="outline"
              size="sm"
              className="w-full"
            >
              🔍 Debug: Ir a Admin
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Panel de gestión para Aldebaran</p>
            <p className="text-xs mt-1">Acceso solo para administradores autorizados</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}