'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Image from "next/image"
import { Trophy } from "lucide-react"
import { ModernLoginForm } from "@/components/modern-login-form"

export default function LoginPage() {
  const router = useRouter()
  const { user, isAdmin } = useAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      if (isAdmin) {
        router.push('/admin')
      } else {
        router.push('/perfil')
      }
    }
  }, [user, isAdmin, router])

  // Show loading state while checking auth
  if (user) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <p>Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-8 items-center justify-center">
              <Image
                src="/favicon-light.svg"
                alt="Aldebaran"
                width={32}
                height={32}
                className="dark:hidden"
              />
              <Image
                src="/favicon-dark.svg"
                alt="Aldebaran"
                width={32}
                height={32}
                className="hidden dark:block"
              />
            </div>
            <span className="text-xl font-bold">Aldebaran</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <ModernLoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-blue-600 to-red-600">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative flex h-full flex-col items-center justify-center p-8 text-white">
            <div className="max-w-md space-y-6 text-center">
              <Trophy className="mx-auto size-16 text-white/90" />
              <h2 className="text-3xl font-bold">
                Descubre eventos de running en Colombia
              </h2>
              <p className="text-lg text-white/80">
                Aldebaran es la plataforma más completa para encontrar carreras, 
                maratones y eventos de atletismo en todo el país.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg bg-white/10 p-3 backdrop-blur">
                  <div className="font-semibold">+500</div>
                  <div className="text-white/70">Eventos</div>
                </div>
                <div className="rounded-lg bg-white/10 p-3 backdrop-blur">
                  <div className="font-semibold">32</div>
                  <div className="text-white/70">Departamentos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}