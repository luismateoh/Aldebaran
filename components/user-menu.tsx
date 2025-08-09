'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut, Settings, User, Shield } from 'lucide-react'

export function UserMenu() {
  const { user, isAdmin, logout } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  if (!user) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => router.push('/login')}
      >
        Iniciar sesión
      </Button>
    )
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const getUserInitials = (email: string | null) => {
    if (!email) return 'U'
    return email.charAt(0).toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative size-9 rounded-full">
          <Avatar className="size-8 border-2 border-border/50 hover:border-border transition-colors">
            <AvatarImage 
              src={user.photoURL || undefined} 
              alt={user.displayName || user.email || 'Usuario'} 
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {getUserInitials(user.email)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex items-center space-x-3">
            <Avatar className="size-10">
              <AvatarImage 
                src={user.photoURL || undefined} 
                alt={user.displayName || user.email || 'Usuario'} 
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {getUserInitials(user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold leading-none">
                {user.displayName || 'Usuario'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
              {isAdmin && (
                <div className="flex items-center gap-1 mt-1">
                  <Shield className="size-3 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">
                    Administrador
                  </span>
                </div>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => router.push('/perfil')}
          className="cursor-pointer px-3 py-2 focus:bg-purple-50 dark:focus:bg-purple-950/50"
        >
          <User className="mr-2 size-4 text-purple-600" />
          <span className="font-medium">Mi Perfil</span>
        </DropdownMenuItem>
        
        {isAdmin && (
          <>
            <DropdownMenuItem 
              onClick={() => router.push('/admin')}
              className="cursor-pointer px-3 py-2 focus:bg-blue-50 dark:focus:bg-blue-950/50"
            >
              <Settings className="mr-2 size-4 text-blue-600" />
              <span className="font-medium">Panel de Admin</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer px-3 py-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
          disabled={isLoggingOut}
        >
          <LogOut className="mr-2 size-4" />
          <span className="font-medium">
            {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
          </span>
          {isLoggingOut && (
            <div className="ml-auto size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}