'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from '@/lib/auth-context'

interface ModernLoginFormProps extends React.ComponentProps<"div"> {
  onLoginSuccess?: () => void
}

export function ModernLoginForm({
  className,
  onLoginSuccess,
  ...props
}: ModernLoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { signInWithGoogleForComments } = useAuth()

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      await signInWithGoogleForComments()
      
      // Call the callback if provided, otherwise let parent component handle redirect
      if (onLoginSuccess) {
        onLoginSuccess()
      }
      
    } catch (error) {
      console.error('Error signing in with Google:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Accede a tu cuenta para gestionar eventos favoritos y más funciones
        </p>
      </div>
      <div className="grid gap-6">
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Continúa con
          </span>
        </div>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <svg className="mr-2 size-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión con Google'}
        </Button>
      </div>
      <div className="text-center text-sm">
        ¿No tienes una cuenta?{" "}
        <span className="text-muted-foreground">
          Se creará automáticamente al iniciar sesión
        </span>
      </div>
    </div>
  )
}