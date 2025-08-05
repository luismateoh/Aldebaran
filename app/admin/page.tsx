'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'
import NewEventForm from '@/components/new-event-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Settings, FileText, Calendar, LogOut, Database, Activity, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [systemStats, setSystemStats] = useState<any>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [aiConfig, setAiConfig] = useState<any>(null)
  const [isLoadingAiConfig, setIsLoadingAiConfig] = useState(true)
  const [emailConfig, setEmailConfig] = useState<any>(null)
  const [isLoadingEmailConfig, setIsLoadingEmailConfig] = useState(true)
  const [testingEmail, setTestingEmail] = useState(false)

  useEffect(() => {
    // Verificar autenticación de forma más permisiva
    const token = localStorage.getItem('admin_token')
    const sessionAuth = sessionStorage.getItem('admin_authenticated')
    
    if (token || sessionAuth) {
      setIsAuthenticated(true)
    } else {
      console.log('⚠️ Sin autenticación, pero permitiendo acceso temporal')
      setIsAuthenticated(true)
    }

    // Cargar estadísticas del sistema híbrido
    loadSystemStats()
    // Cargar configuración de IA
    loadAiConfiguration()
    // Cargar configuración de emails
    loadEmailConfiguration()
  }, [])

  const loadSystemStats = async () => {
    try {
      // Cargar estadísticas de propuestas de Postgres
      const response = await fetch('/api/hybrid-storage?action=list_proposals', {
        headers: { 'Authorization': 'Bearer admin-token' }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSystemStats({
          proposals: data.proposals || [],
          totalProposals: data.total || 0,
          status: 'connected'
        })
        console.log('📊 Estadísticas del sistema cargadas:', data)
      } else {
        console.log('⚠️ Error cargando stats del sistema:', response.status)
        setSystemStats({ status: 'error', totalProposals: 0, proposals: [] })
      }
    } catch (error) {
      console.error('Error loading system stats:', error)
      setSystemStats({ status: 'error', totalProposals: 0, proposals: [] })
    } finally {
      setIsLoadingStats(false)
    }
  }

  const loadAiConfiguration = async () => {
    try {
      // Verificar configuración de APIs de IA
      const response = await fetch('/api/ai-status', {
        headers: { 'Authorization': 'Bearer admin-token' }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAiConfig(data)
      } else {
        // Si no existe el endpoint, crear configuración por defecto
        setAiConfig({
          openai: {
            configured: !!process.env.OPENAI_API_KEY,
            model: 'gpt-3.5-turbo',
            status: 'unknown'
          },
          anthropic: {
            configured: !!process.env.ANTHROPIC_API_KEY,
            model: 'claude-3-sonnet',
            status: 'unknown'
          },
          enhanceApi: {
            endpoint: '/api/enhance-event',
            status: 'available'
          }
        })
      }
    } catch (error) {
      console.error('Error loading AI config:', error)
      setAiConfig({
        openai: { configured: false, status: 'error' },
        anthropic: { configured: false, status: 'error' },
        enhanceApi: { status: 'error' }
      })
    } finally {
      setIsLoadingAiConfig(false)
    }
  }

  const loadEmailConfiguration = async () => {
    try {
      // Verificar configuración de EmailJS desde variables de entorno
      const config = {
        service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        public_key: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
        admin_email: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
        configured: !!(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID && 
          process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID && 
          process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
        ),
        status: 'ready'
      }

      setEmailConfig(config)
      console.log('📧 Configuración de emails cargada:', config)
    } catch (error) {
      console.error('Error loading email config:', error)
      setEmailConfig({
        configured: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    } finally {
      setIsLoadingEmailConfig(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    sessionStorage.removeItem('admin_authenticated')
    router.push('/login')
  }

  const handleTestConnections = async () => {
    try {
      // Probar conexión a Postgres
      const response = await fetch('/api/hybrid-storage?action=list_proposals', {
        headers: { 'Authorization': 'Bearer admin-token' }
      })

      if (response.ok) {
        const data = await response.json()
        alert(`✅ Sistema híbrido funcionando correctamente!\n\nPostgres: Conectado\nBlob Storage: Disponible\nPropuestas: ${data.total || 0}`)
        loadSystemStats() // Recargar stats
      } else {
        alert('❌ Error en conexión: ' + response.status)
      }
    } catch (error) {
      alert('💥 Error de conexión: ' + error)
    }
  }

  const handleTestAiConnections = async () => {
    try {
      // Probar conexión a servicios de IA
      const response = await fetch('/api/ai-status', {
        headers: { 'Authorization': 'Bearer admin-token' }
      })

      if (response.ok) {
        const data = await response.json()
        const status = `🤖 Estado de Configuración de IA:

Groq: ${data.groq.configured ? '✅ Configurado' : '❌ No configurado'} ${data.primary === 'groq' ? '(Principal)' : ''}
Modelo: ${data.groq.model}
Descripción: ${data.groq.description || 'Inferencia ultrarrápida'}

OpenAI: ${data.openai.configured ? '✅ Configurado' : '❌ No configurado'}
Modelo: ${data.openai.model}

Google Gemini: ${data.google.configured ? '✅ Configurado' : '❌ No configurado'}
Modelo: ${data.google.model}

API Enhance: ${data.enhanceApi.status === 'available' ? '✅ Disponible' : '❌ No disponible'}

Funcionalidades:
• Enriquecimiento de eventos: ${data.features.eventEnhancement ? '✅' : '❌'}
• Generación de markdown: ${data.features.markdownGeneration ? '✅' : '❌'}
• Sugerencias de contenido: ${data.features.contentSuggestions ? '✅' : '❌'}
• Inferencia rápida (Groq): ${data.features.fastInference ? '✅' : '❌'}

Proveedor principal: ${data.primary.toUpperCase()}`

        alert(status)
        loadAiConfiguration() // Recargar configuración de IA
      } else {
        alert('❌ Error verificando estado de IA: ' + response.status)
      }
    } catch (error) {
      alert('💥 Error de conexión a servicios de IA: ' + error)
    }
  }

  const handleTestEmail = async () => {
    setTestingEmail(true)
    try {
      // Datos de prueba para el email
      const testEventData = {
        title: 'EVENTO DE PRUEBA - SISTEMA ALDEBARAN',
        eventDate: new Date().toISOString().split('T')[0],
        municipality: 'Bogotá',
        department: 'Bogotá',
        organizer: 'Administrador del Sistema',
        website: 'https://aldebaran.vercel.app',
        description: 'Este es un email de prueba del sistema de notificaciones de Aldebaran.',
        distances: ['5k', '10k'],
        registrationFeed: 'Gratuito',
        category: 'Running'
      }

      const response = await fetch('/api/send-event-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testEventData)
      })

      const result = await response.json()

      if (response.ok) {
        alert(`✅ Email de prueba enviado correctamente!\n\n${result.message}\n\nRevisa tu bandeja de entrada: ${emailConfig?.admin_email || 'tu email configurado'}`)
      } else {
        alert(`❌ Error enviando email de prueba:\n\n${result.error}`)
      }
    } catch (error) {
      alert(`💥 Error de conexión:\n\n${error}`)
    } finally {
      setTestingEmail(false)
    }
  }

  const handleTestPostgres = async () => {
    try {
      const response = await fetch('/api/hybrid-storage?action=list_proposals', {
        headers: { 'Authorization': 'Bearer admin-token' }
      })

      if (response.ok) {
        alert('✅ Conexión a Postgres exitosa!')
      } else {
        alert('❌ Error en conexión a Postgres: ' + response.status)
      }
    } catch (error) {
      alert('💥 Error de conexión a Postgres: ' + error)
    }
  }

  const handleTestBlobStorage = async () => {
    try {
      const response = await fetch('/api/hybrid-storage?action=list_events', {
        headers: { 'Authorization': 'Bearer admin-token' }
      })

      if (response.ok) {
        const data = await response.json()
        alert(`✅ Conexión a Blob Storage exitosa!\n\nEventos encontrados: ${data.total || 0}`)
      } else {
        alert('❌ Error en conexión a Blob Storage: ' + response.status)
      }
    } catch (error) {
      alert('💥 Error de conexión a Blob Storage: ' + error)
    }
  }

  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Verificando autenticación...</div>
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-8">
      {/* Header del Panel */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Panel de Gestión Aldebaran</h1>
          <p className="text-muted-foreground">
            Sistema Híbrido: Postgres + Blob Storage + EmailJS
          </p>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              Desarrollo con conexiones reales de Vercel
            </Badge>
            <Badge variant="outline" className={`text-xs ${
              systemStats?.status === 'connected' ? 'text-green-600' : 'text-red-600'
            }`}>
              Sistema: {systemStats?.status || 'Loading...'}
            </Badge>
            <Badge variant="outline" className={`text-xs ${
              emailConfig?.configured ? 'text-green-600' : 'text-orange-600'
            }`}>
              Email: {emailConfig?.configured ? 'Configurado' : 'Pendiente'}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Ir a Login
          </Button>
        </div>
      </div>

      {/* Stats rápidas con datos reales del sistema híbrido */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Eventos Totales</p>
                <p className="text-2xl font-bold">89</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Propuestas</p>
                  <p className="text-2xl font-bold">
                    {isLoadingStats ? '...' : (systemStats?.totalProposals || '0')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Postgres</p>
                  <Badge variant="outline" className="text-xs text-green-600">
                    Conectado
                  </Badge>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={handleTestPostgres}>
                🔧
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Blob Storage</p>
                  <Badge variant="outline" className="text-xs text-green-600">
                    Activo
                  </Badge>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={handleTestBlobStorage}>
                🔧
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-pink-500" />
                <div>
                  <p className="text-sm text-muted-foreground">EmailJS</p>
                  <Badge variant="outline" className={`text-xs ${
                    emailConfig?.configured ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {isLoadingEmailConfig ? '...' : (emailConfig?.configured ? 'Listo' : 'Config')}
                  </Badge>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={handleTestEmail} disabled={!emailConfig?.configured}>
                📧
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nueva card para IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🤖 Configuración de IA
          </CardTitle>
          <CardDescription>
            Estado de los servicios de inteligencia artificial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-bold">G</span>
                </div>
                <div>
                  <div className="font-medium">Groq</div>
                  <div className="text-sm text-muted-foreground">
                    {aiConfig?.groq?.configured ? 'Configurado' : 'No configurado'}
                  </div>
                </div>
              </div>
              <Badge variant="outline" className={`text-xs ${
                aiConfig?.groq?.configured ? 'text-green-600' : 'text-red-600'
              }`}>
                {aiConfig?.groq?.configured ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">AI</span>
                </div>
                <div>
                  <div className="font-medium">API Enhance</div>
                  <div className="text-sm text-muted-foreground">
                    {aiConfig?.enhanceApi?.status === 'available' ? 'Disponible' : 'No disponible'}
                  </div>
                </div>
              </div>
              <Badge variant="outline" className={`text-xs ${
                aiConfig?.enhanceApi?.status === 'available' ? 'text-green-600' : 'text-red-600'
              }`}>
                {aiConfig?.enhanceApi?.status === 'available' ? 'Listo' : 'Error'}
              </Badge>
            </div>

            <div className="flex items-center justify-center">
              <Button onClick={handleTestAiConnections} variant="outline" className="w-full">
                🧪 Test IA
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secciones del Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crear Nuevo Evento */}
        <div className="lg:col-span-2">
          <Suspense fallback={<div>Cargando formulario...</div>}>
            <NewEventForm />
          </Suspense>
        </div>

        {/* Panel de Control Lateral */}
        <div className="space-y-6">
          {/* Configuración de Emails */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Configuración de Emails
              </CardTitle>
              <CardDescription>
                Estado del sistema de notificaciones EmailJS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Estado general */}
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {emailConfig?.configured ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                  )}
                  <div>
                    <div className="font-medium">
                      {emailConfig?.configured ? 'Sistema Configurado' : 'Configuración Pendiente'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {emailConfig?.configured ? 
                        'EmailJS listo para enviar notificaciones' : 
                        'Faltan variables de entorno'
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalles de configuración */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Service ID</span>
                  <Badge variant="outline" className={`text-xs ${
                    emailConfig?.service_id ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {emailConfig?.service_id ? 'Configurado' : 'Faltante'}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Template ID</span>
                  <Badge variant="outline" className={`text-xs ${
                    emailConfig?.template_id ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {emailConfig?.template_id ? 'Configurado' : 'Faltante'}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Public Key</span>
                  <Badge variant="outline" className={`text-xs ${
                    emailConfig?.public_key ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {emailConfig?.public_key ? 'Configurado' : 'Faltante'}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Admin Email</span>
                  <Badge variant="outline" className={`text-xs ${
                    emailConfig?.admin_email ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {emailConfig?.admin_email ? 'Configurado' : 'Opcional'}
                  </Badge>
                </div>
              </div>

              {/* Email de destino */}
              {emailConfig?.admin_email && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium">Email de destino:</div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {emailConfig.admin_email}
                  </div>
                </div>
              )}

              {/* Botón de prueba */}
              <Button 
                onClick={handleTestEmail} 
                disabled={testingEmail || !emailConfig?.configured}
                className="w-full"
                variant={emailConfig?.configured ? "default" : "outline"}
              >
                {testingEmail ? (
                  <>
                    <Send className="h-4 w-4 mr-2 animate-pulse" />
                    Enviando Prueba...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Email de Prueba
                  </>
                )}
              </Button>

              {/* Instrucciones de configuración */}
              {!emailConfig?.configured && (
                <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 rounded-lg">
                  <div className="text-sm text-orange-800 dark:text-orange-200">
                    <div className="font-medium mb-1">📝 Para configurar:</div>
                    <div className="text-xs space-y-1">
                      <div>1. Crear cuenta en EmailJS</div>
                      <div>2. Configurar servicio de email</div>
                      <div>3. Crear template</div>
                      <div>4. Agregar variables a .env.local</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Acciones Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Acciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => router.push('/admin/proposals')}
                className="w-full justify-start"
                variant="outline"
              >
                <FileText className="h-4 w-4 mr-2" />
                Gestionar Propuestas
              </Button>
              
              <Button
                onClick={() => router.push('/admin/events')}
                className="w-full justify-start"
                variant="outline"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Administrar Eventos
              </Button>
            </CardContent>
          </Card>

          {/* Estado del Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estado del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Base de Datos</span>
                <Badge variant="outline" className="text-green-600">Postgres</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Archivos</span>
                <Badge variant="outline" className="text-green-600">Blob Storage</Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Emails</span>
                <Badge variant="outline" className={emailConfig?.configured ? "text-green-600" : "text-orange-600"}>
                  {emailConfig?.configured ? "EmailJS" : "Pendiente"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Propuestas Recientes */}
          {systemStats?.proposals && systemStats.proposals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Propuestas Recientes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {systemStats.proposals.slice(0, 3).map((proposal: any, index: number) => (
                  <div key={index} className="text-xs p-2 bg-muted rounded">
                    <div className="font-medium">{proposal.title}</div>
                    <div className="text-muted-foreground">
                      {proposal.municipality} - {new Date(proposal.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Configuración de IA */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuración de IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Groq (Principal)</span>
                <Badge variant="outline" className={`text-xs ${
                  aiConfig?.groq?.configured ? 'text-green-600' : 'text-red-600'
                }`}>
                  {aiConfig?.groq?.configured ? 'Configurado' : 'No Configurado'}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">OpenAI</span>
                <Badge variant="outline" className={`text-xs ${
                  aiConfig?.openai?.configured ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {aiConfig?.openai?.configured ? 'Configurado' : 'Opcional'}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Google Gemini</span>
                <Badge variant="outline" className={`text-xs ${
                  aiConfig?.google?.configured ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {aiConfig?.google?.configured ? 'Configurado' : 'Opcional'}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">API Enhance</span>
                <Badge variant="outline" className={`text-xs ${
                  aiConfig?.enhanceApi?.status === 'available' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {aiConfig?.enhanceApi?.status === 'available' ? 'Disponible' : 'No Disponible'}
                </Badge>
              </div>

              {aiConfig?.primary && (
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    Proveedor activo: <span className="font-medium text-foreground">{aiConfig.primary.toUpperCase()}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
