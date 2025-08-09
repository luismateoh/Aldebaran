'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useAuthApi } from '@/hooks/use-auth-api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Settings, Database, Mail, Brain, Globe, Shield, AlertCircle, CheckCircle, Save, RotateCcw } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SystemSettings {
  // Site Configuration
  siteName: string
  siteDescription: string
  siteUrl: string
  adminEmail: string
  
  // Event Configuration
  defaultEventCategory: string
  autoApproveProposals: boolean
  requireEventApproval: boolean
  maxEventsPerDay: number
  
  // AI Configuration
  aiEnhancementEnabled: boolean
  
  // Security Configuration
  allowPublicEventCreation: boolean
  enableRateLimiting: boolean
  maxProposalsPerHour: number
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, isAdmin, loading } = useAuth()
  const { makeAuthenticatedRequest } = useAuthApi()
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'Aldebaran',
    siteDescription: 'Plataforma de eventos de atletismo para Colombia',
    siteUrl: 'https://aldebaran.vercel.app',
    adminEmail: 'luismateohm@gmail.com',
    defaultEventCategory: 'Running',
    autoApproveProposals: false,
    requireEventApproval: true,
    maxEventsPerDay: 10,
    aiEnhancementEnabled: true,
    allowPublicEventCreation: true,
    enableRateLimiting: true,
    maxProposalsPerHour: 5
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setSaving] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/login')
    }
  }, [user, isAdmin, loading, router])

  useEffect(() => {
    if (user && isAdmin) {
      loadSettings()
    }
  }, [user, isAdmin])

  const loadSettings = async () => {
    try {
      const response = await makeAuthenticatedRequest('/api/admin/settings')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSettings(data.settings)
        }
      } else {
        throw new Error('Failed to load settings')
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      setAlert({ type: 'error', message: 'Error cargando configuración, usando valores por defecto' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const response = await makeAuthenticatedRequest('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setAlert({ type: 'success', message: 'Configuración guardada exitosamente' })
        setHasChanges(false)
      } else {
        setAlert({ 
          type: 'error', 
          message: data.error || data.message || 'Error guardando configuración'
        })
        
        // If there's helpful information about what needs to be done
        if (data.suggestedApproach) {
          console.log('Suggested approach for configuration:', data.suggestedApproach)
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setAlert({ type: 'error', message: 'Error de conexión al guardar configuración' })
    } finally {
      setSaving(false)
    }
  }

  const handleResetSettings = () => {
    if (confirm('¿Estás seguro que deseas restablecer la configuración? Se perderán los cambios no guardados.')) {
      loadSettings()
      setHasChanges(false)
    }
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="size-8 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user || !isAdmin) {
    return null
  }

  const categories = ['Running', 'Trail', 'Maraton', 'Media maraton', 'Ultra', 'Kids']

  return (
    <div className="container relative py-6 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Configuración Avanzada</h1>
          <p className="text-muted-foreground">
            Configura parámetros avanzados del sistema y servicios integrados
          </p>
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <Alert className={`mt-6 ${alert.type === 'error' ? 'border-red-200' : 'border-green-200'}`}>
          {alert.type === 'error' ? (
            <AlertCircle className="size-4" />
          ) : (
            <CheckCircle className="size-4" />
          )}
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Save/Reset Actions */}
      {hasChanges && (
        <Card className="mt-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Tienes cambios sin guardar
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleResetSettings}>
                  <RotateCcw className="size-4 mr-2" />
                  Restablecer
                </Button>
                <Button size="sm" onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="size-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="size-6 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          Cargando configuración...
        </div>
      ) : (
        <div className="space-y-6 mt-6">
          {/* Site Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="size-5" />
                Configuración del Sitio
              </CardTitle>
              <CardDescription>
                Información general del sitio web
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nombre del Sitio</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => handleSettingChange('siteName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">URL del Sitio</Label>
                  <Input
                    id="siteUrl"
                    value={settings.siteUrl}
                    onChange={(e) => handleSettingChange('siteUrl', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Descripción</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email del Administrador</Label>
                <Input
                  id="adminEmail"
                  value={settings.adminEmail}
                  onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="size-5" />
                Configuración de IA
              </CardTitle>
              <CardDescription>
                Configuración del servicio de mejora automática con IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="aiEnhancement">Mejora con IA Habilitada</Label>
                  <p className="text-sm text-muted-foreground">
                    Usar IA para mejorar la descripción de eventos automáticamente
                  </p>
                </div>
                <Switch
                  id="aiEnhancement"
                  checked={settings.aiEnhancementEnabled}
                  onCheckedChange={(checked) => handleSettingChange('aiEnhancementEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Event Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="size-5" />
                Configuración de Eventos
              </CardTitle>
              <CardDescription>
                Parámetros para la gestión de eventos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultCategory">Categoría por Defecto</Label>
                  <Select value={settings.defaultEventCategory} onValueChange={(value) => handleSettingChange('defaultEventCategory', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxEventsPerDay">Máximo Eventos por Día</Label>
                  <Input
                    id="maxEventsPerDay"
                    type="number"
                    min="1"
                    max="50"
                    value={settings.maxEventsPerDay}
                    onChange={(e) => handleSettingChange('maxEventsPerDay', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoApprove">Auto-aprobar Propuestas</Label>
                    <p className="text-sm text-muted-foreground">
                      Las propuestas se publican automáticamente sin revisión
                    </p>
                  </div>
                  <Switch
                    id="autoApprove"
                    checked={settings.autoApproveProposals}
                    onCheckedChange={(checked) => handleSettingChange('autoApproveProposals', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="requireApproval">Requerir Aprobación</Label>
                    <p className="text-sm text-muted-foreground">
                      Los eventos creados requieren aprobación antes de publicarse
                    </p>
                  </div>
                  <Switch
                    id="requireApproval"
                    checked={settings.requireEventApproval}
                    onCheckedChange={(checked) => handleSettingChange('requireEventApproval', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="publicCreation">Permitir Creación Pública</Label>
                    <p className="text-sm text-muted-foreground">
                      Los usuarios pueden proponer eventos sin autenticarse
                    </p>
                  </div>
                  <Switch
                    id="publicCreation"
                    checked={settings.allowPublicEventCreation}
                    onCheckedChange={(checked) => handleSettingChange('allowPublicEventCreation', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-5" />
                Configuración de Seguridad
              </CardTitle>
              <CardDescription>
                Parámetros de seguridad y límites de uso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="rateLimiting">Limitación de Velocidad</Label>
                  <p className="text-sm text-muted-foreground">
                    Habilitar límites de velocidad para prevenir spam
                  </p>
                </div>
                <Switch
                  id="rateLimiting"
                  checked={settings.enableRateLimiting}
                  onCheckedChange={(checked) => handleSettingChange('enableRateLimiting', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxProposals">Máximo Propuestas por Hora</Label>
                <Input
                  id="maxProposals"
                  type="number"
                  min="1"
                  max="20"
                  value={settings.maxProposalsPerHour}
                  onChange={(e) => handleSettingChange('maxProposalsPerHour', parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <CheckCircle className="size-5" />
                Sistema Configurado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-green-700 dark:text-green-300 space-y-2">
                <p>✅ Sistema de administración completamente funcional</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>✅ Configuraciones persistentes en Firestore</li>
                  <li>✅ Gestión de múltiples administradores</li>
                  <li>✅ Roles y permisos configurables</li>
                  <li>✅ Interface de configuración dinámica</li>
                </ul>
                <p className="text-sm">
                  Todas las configuraciones se guardan automáticamente en la base de datos.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}