'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useAuthApi } from '@/hooks/use-auth-api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Calendar, Mail, Send, CheckCircle, AlertCircle, Zap, User, Plus, Settings, Database, Brain, UserPlus, PenTool, Copy, Search, Filter, MapPin, Clock, Download } from 'lucide-react'
import { toast } from "sonner"

export default function AdminPage() {
  const router = useRouter()
  const { user, isAdmin, loading } = useAuth()
  const { makeAuthenticatedRequest } = useAuthApi()
  const [systemStats, setSystemStats] = useState<any>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [emailConfig, setEmailConfig] = useState<any>(null)
  const [isLoadingEmailConfig, setIsLoadingEmailConfig] = useState(true)
  const [firebaseConfig, setFirebaseConfig] = useState<any>(null)
  const [aiConfig, setAiConfig] = useState<any>(null)
  const [testingEmail, setTestingEmail] = useState(false)
  const [testingFirebase, setTestingFirebase] = useState(false)
  const [testingAi, setTestingAi] = useState(false)
  const [exportingEvents, setExportingEvents] = useState(false)

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/login')
    }
  }, [user, isAdmin, loading, router])

  useEffect(() => {
    if (user && isAdmin) {
      loadSystemStats()
      loadEmailConfiguration()
      loadFirebaseConfiguration()
      loadAiConfiguration()
    }
  }, [user, isAdmin])

  const loadSystemStats = async () => {
    try {
      // Usar el nuevo endpoint de estadísticas unificado
      const statsResponse = await makeAuthenticatedRequest('/api/stats')
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        
        if (statsData.success && statsData.stats) {
          setSystemStats({
            ...statsData.stats
          })
        } else {
          throw new Error('Invalid stats response format')
        }
      } else {
        throw new Error(`Stats API returned ${statsResponse.status}`)
      }
    } catch (error) {
      console.error('Error loading system stats:', error)
      
      // Fallback to original method if new endpoint fails
      try {
        console.log('Intentando método de estadísticas alternativo...')
        
        // Cargar eventos
        const eventsResponse = await makeAuthenticatedRequest('/api/events/list')
        let eventStats = { totalEvents: 0, publishedEvents: 0, draftEvents: 0, deletedEvents: 0 }
        
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json()
          eventStats = {
            totalEvents: eventsData.events?.length || 0,
            publishedEvents: eventsData.events?.filter((e: any) => e.status === 'published' && !e.draft).length || 0,
            draftEvents: eventsData.events?.filter((e: any) => e.status === 'draft' || e.draft).length || 0,
            deletedEvents: eventsData.events?.filter((e: any) => e.status === 'deleted').length || 0,
          }
        }

        // Cargar propuestas
        let proposalsCount = 0
        try {
          const proposalsResponse = await makeAuthenticatedRequest('/api/proposals')
          if (proposalsResponse.ok) {
            const proposalsData = await proposalsResponse.json()
            proposalsCount = proposalsData.proposals?.length || 0
          }
        } catch (proposalsError) {
          console.log('No se pudieron cargar propuestas:', proposalsError)
        }

        setSystemStats({
          ...eventStats,
          proposals: proposalsCount,
          status: 'connected'
        })
      } catch (fallbackError) {
        console.error('Error en método alternativo:', fallbackError)
        setSystemStats({ 
          status: 'error', 
          totalEvents: 0, 
          publishedEvents: 0, 
          draftEvents: 0, 
          proposals: 0, 
          deletedEvents: 0 
        })
      }
    } finally {
      setIsLoadingStats(false)
    }
  }

  const loadEmailConfiguration = async () => {
    try {
      const config = {
        service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        public_key: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
        admin_email: process.env.NEXT_PUBLIC_ADMIN_EMAIL
      }

      const isConfigured = !!(config.service_id && config.template_id && config.public_key && config.admin_email)
      
      setEmailConfig({
        ...config,
        configured: isConfigured,
        status: isConfigured ? 'configured' : 'missing_vars'
      })
    } catch (error) {
      console.error('Error loading email config:', error)
      setEmailConfig({ configured: false, status: 'error' })
    } finally {
      setIsLoadingEmailConfig(false)
    }
  }

  const loadFirebaseConfiguration = async () => {
    try {
      const config = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      }

      const isConfigured = !!(config.projectId && config.apiKey && config.authDomain)
      
      setFirebaseConfig({
        ...config,
        configured: isConfigured,
        status: isConfigured ? 'configured' : 'missing_vars'
      })
    } catch (error) {
      console.error('Error loading Firebase config:', error)
      setFirebaseConfig({ configured: false, status: 'error' })
    }
  }

  const loadAiConfiguration = async () => {
    try {
      const response = await fetch('/api/ai-status')
      const data = await response.json()
      
      if (response.ok) {
        const hasActiveProvider = data.primary !== 'none'
        setAiConfig({
          configured: hasActiveProvider,
          status: hasActiveProvider ? 'configured' : 'missing_vars',
          primary: data.primary,
          providers: data
        })
      } else {
        setAiConfig({ configured: false, status: 'error' })
      }
    } catch (error) {
      console.error('Error loading AI config:', error)
      setAiConfig({ configured: false, status: 'error' })
    }
  }


  const handleTestEmail = async () => {
    setTestingEmail(true)
    try {
      const testEventData = {
        title: 'Test Event - Aldebaran System',
        eventDate: new Date().toISOString().split('T')[0],
        municipality: 'Bogotá',
        department: 'Bogotá',
        organizer: 'Sistema Aldebaran',
        registrationUrl: 'https://aldebaran.vercel.app',
        description: 'Este es un email de prueba del sistema de notificaciones de Aldebaran.',
        distances: ['5k', '10k'],
        price: 'Gratuito',
        category: 'Running'
      }

      const response = await fetch('/api/send-event-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testEventData)
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Email de prueba enviado exitosamente')
      } else {
        const errorData = await response.json()
        toast.error(`Error enviando email: ${errorData.error}`)
      }
    } catch (error) {
      toast.error(`Error de conexión: ${error}`)
    } finally {
      setTestingEmail(false)
    }
  }

  const handleTestFirebase = async () => {
    setTestingFirebase(true)
    try {
      const response = await makeAuthenticatedRequest('/api/events/status')
      if (response.ok) {
        toast.success('Conexión a Firebase exitosa!')
      } else {
        toast.error('Error conectando a Firebase')
      }
    } catch (error) {
      toast.error(`Error de conexión a Firebase: ${error}`)
    } finally {
      setTestingFirebase(false)
    }
  }

  const handleTestAi = async () => {
    setTestingAi(true)
    try {
      const response = await fetch('/api/ai-status')
      const data = await response.json()
      
      if (response.ok) {
        const hasActiveProvider = data.primary !== 'none'
        if (hasActiveProvider) {
          toast.success(`IA configurada correctamente!\n\nProveedor activo: ${data.primary}\nModelo: ${data[data.primary]?.model}\nEstado: ${data[data.primary]?.status}`)
        } else {
          toast.error('No hay proveedores de IA configurados.\n\nConfigura al menos una API key (GROQ_API_KEY, OPENAI_API_KEY, o GOOGLE_API_KEY) en las variables de entorno.')
        }
      } else {
        toast.error('Error verificando configuración de IA')
      }
    } catch (error) {
      toast.error(`Error probando AI: ${error}`)
    } finally {
      setTestingAi(false)
    }
  }

  const handleExportEvents = async () => {
    setExportingEvents(true)
    try {
      toast.info('Iniciando exportación de eventos...')
      
      const response = await makeAuthenticatedRequest('/api/admin/export-events')
      
      if (response.ok) {
        // Descargar el archivo Excel
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        
        // Crear enlace de descarga
        const a = document.createElement('a')
        a.href = url
        
        // Obtener nombre del archivo desde los headers
        const contentDisposition = response.headers.get('Content-Disposition')
        let filename = 'eventos-aldebaran.xlsx'
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
          if (filenameMatch) {
            filename = filenameMatch[1]
          }
        }
        
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        toast.success(`Archivo ${filename} descargado exitosamente`)
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(`Error exportando eventos: ${errorData.error || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error('Error exporting events:', error)
      toast.error(`Error de conexión: ${error}`)
    } finally {
      setExportingEvents(false)
    }
  }


  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <p>Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="container relative py-6 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="text-muted-foreground">
            Dashboard de gestión de eventos Aldebaran
          </p>
          <Badge variant="outline" className="w-fit text-xs">
            <User className="mr-1 size-3" />
            {user.email}
          </Badge>
        </div>

        {/* Acciones Rápidas - Mobile Optimized */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-6">
          <Button 
            onClick={() => router.push('/admin/events/new')}
            size="sm"
            className="flex h-12 flex-col gap-1 text-xs"
          >
            <Plus className="size-4" />
            Nuevo Evento
          </Button>
          
          <Button 
            onClick={() => router.push('/admin/templates')}
            size="sm"
            variant="outline"
            className="flex h-12 flex-col gap-1 text-xs border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950"
          >
            <Zap className="size-4" />
            Templates
          </Button>
          
          <Button 
            onClick={() => router.push('/admin/events')}
            size="sm"
            variant="outline"
            className="flex h-12 flex-col gap-1 text-xs"
          >
            <Search className="size-4" />
            Buscar
          </Button>
          
          <Button 
            onClick={() => router.push('/admin/proposals')}
            size="sm"
            variant="outline"
            className="relative flex h-12 flex-col gap-1 text-xs"
          >
            <Mail className="size-4" />
            Propuestas
            {systemStats?.proposals > 0 && (
              <div className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {systemStats.proposals}
              </div>
            )}
          </Button>
          
          <Button 
            onClick={() => router.push('/admin/events?filter=draft')}
            size="sm"
            variant="outline"
            className="flex h-12 flex-col gap-1 text-xs"
          >
            <FileText className="size-4" />
            Borradores
          </Button>

          <Button 
            onClick={handleExportEvents}
            disabled={exportingEvents}
            size="sm"
            variant="outline"
            className="flex h-12 flex-col gap-1 text-xs border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950"
          >
            {exportingEvents ? (
              <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Download className="size-4" />
            )}
            {exportingEvents ? 'Exportando...' : 'Exportar Excel'}
          </Button>
        </div>
      </div>

      {/* Resumen de Eventos */}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="size-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">
                  {isLoadingStats ? '...' : (systemStats?.totalEvents || '0')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="size-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Publicados</p>
                <p className="text-2xl font-bold">
                  {isLoadingStats ? '...' : (systemStats?.publishedEvents || '0')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="size-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Borradores</p>
                <p className="text-2xl font-bold">
                  {isLoadingStats ? '...' : (systemStats?.draftEvents || '0')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="size-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Propuestas</p>
                <p className="text-2xl font-bold">
                  {isLoadingStats ? '...' : (systemStats?.proposals || '0')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="size-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Eliminados</p>
                <p className="text-2xl font-bold">
                  {isLoadingStats ? '...' : (systemStats?.deletedEvents || '0')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuraciones del Sistema */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Firebase Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="size-5" />
              Firebase
            </CardTitle>
            <CardDescription>Base de datos y autenticación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`size-3 rounded-full ${
                  firebaseConfig?.configured ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div>
                  <p className="text-sm font-medium">
                    {firebaseConfig?.configured ? 'Configurado' : 'Sin configurar'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {firebaseConfig?.projectId || 'No configurado'}
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleTestFirebase}
                disabled={testingFirebase || !firebaseConfig?.configured}
                size="sm"
                variant="outline"
              >
                {testingFirebase ? (
                  <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Settings className="size-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="size-5" />
              EmailJS
            </CardTitle>
            <CardDescription>Notificaciones por correo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`size-3 rounded-full ${
                  isLoadingEmailConfig ? 'bg-gray-400' :
                  emailConfig?.configured ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div>
                  <p className="text-sm font-medium">
                    {isLoadingEmailConfig ? 'Verificando...' :
                     emailConfig?.configured ? 'Configurado' : 'Sin configurar'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {emailConfig?.admin_email || 'No configurado'}
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleTestEmail}
                disabled={testingEmail || !emailConfig?.configured}
                size="sm"
                variant="outline"
              >
                {testingEmail ? (
                  <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="size-5" />
              IA (Groq)
            </CardTitle>
            <CardDescription>Mejora automática de eventos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`size-3 rounded-full ${
                  aiConfig?.configured ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div>
                  <p className="text-sm font-medium">
                    {aiConfig?.configured ? 'Configurado' : 'Sin configurar'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {aiConfig?.configured ? `Proveedor: ${aiConfig.primary}` : 'API Key faltante'}
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleTestAi}
                disabled={testingAi || !aiConfig?.configured}
                size="sm"
                variant="outline"
              >
                {testingAi ? (
                  <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Brain className="size-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gestión de Contenido */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Gestión de Eventos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5" />
              Gestión de Eventos
            </CardTitle>
            <CardDescription>
              Crear, editar y administrar eventos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => router.push('/admin/events/new')}
              className="w-full justify-start"
            >
              <Plus className="mr-2 size-4" />
              Crear Nuevo Evento
            </Button>
            
            <Button 
              onClick={() => router.push('/admin/events')}
              className="w-full justify-start" 
              variant="outline"
            >
              <PenTool className="mr-2 size-4" />
              Administrar Eventos
            </Button>
          </CardContent>
        </Card>

        {/* Gestión de Propuestas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="size-5" />
              Propuestas de Eventos
            </CardTitle>
            <CardDescription>
              Revisar y aprobar eventos propuestos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => router.push('/admin/proposals')}
              className="w-full justify-start"
            >
              <Mail className="mr-2 size-4" />
              Gestionar Propuestas
              {systemStats?.proposals > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {systemStats.proposals}
                </Badge>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Configuración Avanzada */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Administradores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="size-5" />
              Administradores
            </CardTitle>
            <CardDescription>
              Gestionar usuarios con acceso administrativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => router.push('/admin/administrators')}
              className="w-full justify-start"
              variant="outline"
            >
              <UserPlus className="mr-2 size-4" />
              Gestionar Administradores
            </Button>
            
            <div className="text-sm text-muted-foreground">
              <p>Administrador actual: {user.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Configuración Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="size-5" />
              Configuración
            </CardTitle>
            <CardDescription>
              Ajustes y configuración del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => router.push('/admin/settings')}
              className="w-full justify-start"
              variant="outline"
            >
              <Settings className="mr-2 size-4" />
              Configuración Avanzada
            </Button>
            
            <div className="text-sm text-muted-foreground">
              <p>Versión: Next.js 15 + Firebase</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}