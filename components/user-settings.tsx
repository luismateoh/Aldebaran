'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useAuthApi } from '@/hooks/use-auth-api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  Settings,
  User,
  Bell,
  Shield,
  Globe,
  Moon,
  Sun,
  Save,
  ArrowLeft
} from 'lucide-react'

export default function UserSettings() {
  const { user, logout } = useAuth()
  const { makeAuthenticatedRequest } = useAuthApi()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    location: '',
    runnerLevel: 'beginner',
    favoriteDistance: '',
    notifications: {
      newEvents: true,
      eventReminders: true,
      comments: true,
      marketing: false
    },
    privacy: {
      profileVisibility: 'public',
      showStats: true,
      showGoals: true
    },
    preferences: {
      theme: 'system',
      language: 'es',
      units: 'metric'
    }
  })

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    try {
      const response = await makeAuthenticatedRequest('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(prev => ({
          ...prev,
          displayName: data.displayName || user.displayName || '',
          email: data.email || user.email || '',
          location: data.location || '',
          runnerLevel: data.runnerProfile?.level || 'beginner',
          favoriteDistance: data.runnerProfile?.favoriteDistance || '',
          notifications: data.preferences?.notifications || prev.notifications,
          privacy: data.preferences?.privacy || prev.privacy,
          preferences: data.preferences?.general || prev.preferences
        }))
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await makeAuthenticatedRequest('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify({
          displayName: profile.displayName,
          location: profile.location,
          runnerProfile: {
            level: profile.runnerLevel,
            favoriteDistance: profile.favoriteDistance
          },
          preferences: {
            notifications: profile.notifications,
            privacy: profile.privacy,
            general: profile.preferences
          }
        })
      })

      if (response.ok) {
        // Mostrar mensaje de éxito
        alert('Configuración guardada correctamente')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error guardando la configuración')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container max-w-2xl mx-auto py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="size-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Inicia sesión para acceder a la configuración
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/perfil')}
        >
          <ArrowLeft className="size-4 mr-2" />
          Volver al Perfil
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="size-6" />
            Configuración
          </h1>
        </div>
      </div>

      {/* Perfil Personal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="displayName">Nombre a mostrar</Label>
              <Input
                id="displayName"
                value={profile.displayName}
                onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              value={profile.location}
              onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Ciudad, País"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="runnerLevel">Nivel de Runner</Label>
              <Select
                value={profile.runnerLevel}
                onValueChange={(value) => setProfile(prev => ({ ...prev, runnerLevel: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">🏃‍♂️ Principiante</SelectItem>
                  <SelectItem value="intermediate">🏃‍♂️ Intermedio</SelectItem>
                  <SelectItem value="advanced">🏃‍♂️ Avanzado</SelectItem>
                  <SelectItem value="expert">🏃‍♂️ Experto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="favoriteDistance">Distancia Favorita</Label>
              <Select
                value={profile.favoriteDistance}
                onValueChange={(value) => setProfile(prev => ({ ...prev, favoriteDistance: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5k">5K</SelectItem>
                  <SelectItem value="10k">10K</SelectItem>
                  <SelectItem value="15k">15K</SelectItem>
                  <SelectItem value="21k">Media Maratón (21K)</SelectItem>
                  <SelectItem value="42k">Maratón (42K)</SelectItem>
                  <SelectItem value="trail">Trail Running</SelectItem>
                  <SelectItem value="ultra">Ultra Distancia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-5" />
            Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Nuevos eventos</Label>
              <p className="text-sm text-muted-foreground">Notificarme sobre eventos nuevos</p>
            </div>
            <input
              type="checkbox"
              checked={profile.notifications.newEvents}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                notifications: { ...prev.notifications, newEvents: e.target.checked }
              }))}
              className="size-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Recordatorios de eventos</Label>
              <p className="text-sm text-muted-foreground">Recordar eventos próximos</p>
            </div>
            <input
              type="checkbox"
              checked={profile.notifications.eventReminders}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                notifications: { ...prev.notifications, eventReminders: e.target.checked }
              }))}
              className="size-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Comentarios</Label>
              <p className="text-sm text-muted-foreground">Notificarme sobre respuestas a mis comentarios</p>
            </div>
            <input
              type="checkbox"
              checked={profile.notifications.comments}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                notifications: { ...prev.notifications, comments: e.target.checked }
              }))}
              className="size-4"
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacidad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            Privacidad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Visibilidad del perfil</Label>
            <Select
              value={profile.privacy.profileVisibility}
              onValueChange={(value) => setProfile(prev => ({
                ...prev,
                privacy: { ...prev.privacy, profileVisibility: value }
              }))}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">🌍 Público</SelectItem>
                <SelectItem value="private">🔒 Privado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Mostrar estadísticas</Label>
              <p className="text-sm text-muted-foreground">Permitir que otros vean mis stats</p>
            </div>
            <input
              type="checkbox"
              checked={profile.privacy.showStats}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                privacy: { ...prev.privacy, showStats: e.target.checked }
              }))}
              className="size-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Mostrar metas</Label>
              <p className="text-sm text-muted-foreground">Permitir que otros vean mis metas</p>
            </div>
            <input
              type="checkbox"
              checked={profile.privacy.showGoals}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                privacy: { ...prev.privacy, showGoals: e.target.checked }
              }))}
              className="size-4"
            />
          </div>
        </CardContent>
      </Card>

      {/* Preferencias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="size-5" />
            Preferencias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Unidades</Label>
              <Select
                value={profile.preferences.units}
                onValueChange={(value) => setProfile(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, units: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Métricas (km, kg)</SelectItem>
                  <SelectItem value="imperial">Imperiales (mi, lb)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Idioma</Label>
              <Select
                value={profile.preferences.language}
                onValueChange={(value) => setProfile(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, language: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">🇪🇸 Español</SelectItem>
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guardar */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Guardar Cambios
        </Button>
      </div>
    </div>
  )
}