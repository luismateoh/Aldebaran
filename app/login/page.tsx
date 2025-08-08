'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, Mail, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { user, isAdmin, signInWithGoogle } = useAuth()

  // Redirect if already authenticated and admin
  useEffect(() => {
    if (user && isAdmin) {
      router.push('/admin')
    }
  }, [user, isAdmin, router])

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      await signInWithGoogle()
      
      // The useEffect above will handle the redirect
    } catch (error: any) {
      console.error('Error signing in:', error)
      setError(error.message || 'Error al iniciar sesión. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking auth
  if (user && isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p>Redirigiendo al panel de administración...</p>
          </CardContent>
        </Card>
      </div>
    )
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
            Inicia sesión con tu cuenta de Google para acceder al panel de gestión de Aldebaran
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button 
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2" 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Iniciar sesión con Google
                </>
              )}
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Panel de gestión para Aldebaran</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}