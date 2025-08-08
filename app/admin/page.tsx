'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useAuthApi } from '@/hooks/use-auth-api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Calendar, Mail, Send, CheckCircle, AlertCircle, Zap, User, Plus, Settings, Database, Brain, UserPlus, PenTool } from 'lucide-react'

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
      const response = await makeAuthenticatedRequest('/api/events/list')
      
      if (response.ok) {
        const data = await response.json()
        setSystemStats({
          totalEvents: data.events?.length || 0,
          publishedEvents: data.events?.filter((e: any) => e.status === 'published').length || 0,
          draftEvents: data.events?.filter((e: any) => e.status === 'draft').length || 0,
          proposals: data.events?.filter((e: any) => e.status === 'proposal').length || 0,
          deletedEvents: data.events?.filter((e: any) => e.status === 'deleted').length || 0,
          status: 'connected'
        })
      } else {
        setSystemStats({ status: 'error', totalEvents: 0, publishedEvents: 0, draftEvents: 0, proposals: 0, deletedEvents: 0 })
      }
    } catch (error) {
      console.error('Error loading system stats:', error)
      setSystemStats({ status: 'error', totalEvents: 0, publishedEvents: 0, draftEvents: 0, proposals: 0, deletedEvents: 0 })
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
      const config = {
        groqApiKey: process.env.GROQ_API_KEY ? '***configured***' : null,
        hasKey: !!process.env.GROQ_API_KEY
      }

      setAiConfig({
        ...config,
        configured: config.hasKey,
        status: config.hasKey ? 'configured' : 'missing_vars'
      })
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
        alert(`✅ Email de prueba enviado exitosamente!\n\nPequeña vista previa:\n${data.preview?.substring(0, 200)}...`)
      } else {
        const errorData = await response.json()
        alert(`❌ Error enviando email: ${errorData.error}`)
      }
    } catch (error) {
      alert(`💥 Error de conexión: ${error}`)
    } finally {
      setTestingEmail(false)
    }
  }

  const handleTestFirebase = async () => {
    setTestingFirebase(true)
    try {
      const response = await makeAuthenticatedRequest('/api/events/status')
      if (response.ok) {
        alert('✅ Conexión a Firebase exitosa!')
      } else {
        alert('❌ Error conectando a Firebase')
      }
    } catch (error) {
      alert(`💥 Error de conexión a Firebase: ${error}`)
    } finally {
      setTestingFirebase(false)
    }
  }

  const handleTestAi = async () => {
    setTestingAi(true)
    try {
      // Test AI functionality - this would need an actual AI test endpoint
      alert('🤖 Función de prueba AI no implementada aún')
    } catch (error) {
      alert(`💥 Error probando AI: ${error}`)
    } finally {
      setTestingAi(false)
    }
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
          <Badge variant="outline" className="text-xs w-fit">
            <User className="h-3 w-3 mr-1" />
            {user.email}
          </Badge>
        </div>
      </div>

      {/* Resumen de Eventos */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
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
              <CheckCircle className="h-5 w-5 text-green-500" />
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
              <FileText className="h-5 w-5 text-yellow-500" />
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
              <Mail className="h-5 w-5 text-blue-500" />
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
              <AlertCircle className="h-5 w-5 text-red-500" />
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {/* Firebase Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-5 w-5" />
              Firebase
            </CardTitle>
            <CardDescription>Base de datos y autenticación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  firebaseConfig?.configured ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div>
                  <p className="font-medium text-sm">
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
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Settings className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-5 w-5" />
              EmailJS
            </CardTitle>
            <CardDescription>Notificaciones por correo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  isLoadingEmailConfig ? 'bg-gray-400' :
                  emailConfig?.configured ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div>
                  <p className="font-medium text-sm">
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
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-5 w-5" />
              IA (Groq)
            </CardTitle>
            <CardDescription>Mejora automática de eventos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  aiConfig?.configured ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div>
                  <p className="font-medium text-sm">
                    {aiConfig?.configured ? 'Configurado' : 'Sin configurar'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {aiConfig?.configured ? 'API Key configurada' : 'API Key faltante'}
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
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gestión de Contenido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Gestión de Eventos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
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
              <Plus className="h-4 w-4 mr-2" />
              Crear Nuevo Evento
            </Button>
            
            <Button 
              onClick={() => router.push('/admin/events')}
              className="w-full justify-start" 
              variant="outline"
            >
              <PenTool className="h-4 w-4 mr-2" />
              Administrar Eventos
            </Button>
          </CardContent>
        </Card>

        {/* Gestión de Propuestas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
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
              <Mail className="h-4 w-4 mr-2" />
              Gestionar Propuestas
              {systemStats?.proposals > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {systemStats.proposals}
                </Badge>
              )}
            </Button>
            
            <Button 
              onClick={() => router.push('/admin/proposals/pending')}
              className="w-full justify-start" 
              variant="outline"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Revisar Pendientes
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Configuración Avanzada */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Administradores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
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
              <UserPlus className="h-4 w-4 mr-2" />
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
              <Settings className="h-5 w-5" />
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
              <Settings className="h-4 w-4 mr-2" />
              Configuración Avanzada
            </Button>
            
            <div className="text-sm text-muted-foreground">
              <p>Versión: Next.js 14 + Firebase</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}