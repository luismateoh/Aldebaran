'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAuth } from '@/lib/auth-context'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
}

export function LoginModal({ 
  isOpen, 
  onClose, 
  title = "Inicia sesión para dar like a este evento",
  description = "Necesitas una cuenta para poder guardar eventos como favoritos y acceder a más funciones."
}: LoginModalProps) {
  const { signInWithGoogle } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      await signInWithGoogle()
      onClose() // Close modal after successful login
    } catch (error) {
      console.error('Error signing in with Google:', error)
      // You could add error handling here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-semibold">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 mt-6">
          <Button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-[#4285f4] hover:bg-[#3367d6] text-white"
            size="lg"
          >
            <svg className="size-5 mr-3" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full"
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Al iniciar sesión, aceptas nuestros términos de servicio y política de privacidad.
        </p>
      </DialogContent>
    </Dialog>
  )
}