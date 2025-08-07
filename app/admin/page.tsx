'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'
import NewEventForm from '@/components/new-event-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Calendar, LogOut, Mail, Send, CheckCircle, AlertCircle, Zap } from 'lucide-react'
import { eventsService } from '@/lib/events-firebase'

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [systemStats, setSystemStats] = useState<any>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [emailConfig, setEmailConfig] = useState<any>(null)
  const [isLoadingEmailConfig, setIsLoadingEmailConfig] = useState(true)
  const [testingEmail, setTestingEmail] = useState(false)

  useEffect(() => {
    const checkAuthentication = async () => {
      console.log('🔍 Verificando autenticación en AdminPage...')
      
      // Verificar token en localStorage primero
      const token = localStorage.getItem('admin_token')
      const sessionAuth = sessionStorage.getItem('admin_authenticated')
      
      console.log('🎯 Token en localStorage:', !!token)
      console.log('🎯 Session auth:', !!sessionAuth)
      
      if (!token && !sessionAuth) {
        console.log('❌ No hay autenticación, redirigiendo a login')
        router.push('/login')
        return
      }
      
      // Si hay token, verificar que sea válido
      if (token) {
        try {
          const response = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ token })
          })
          
          if (response.ok) {
            console.log('✅ Token válido, permitiendo acceso')
            setIsAuthenticated(true)
          } else {
            console.log('❌ Token inválido, redirigiendo a login')
            localStorage.removeItem('admin_token')
            sessionStorage.removeItem('admin_authenticated')
            router.push('/login')
          }
        } catch (error) {
          console.error('💥 Error verificando token:', error)
          setIsAuthenticated(true) // Permitir acceso temporal si hay error de red
        }
      } else {
        setIsAuthenticated(true) // Permitir acceso si hay session auth
      }
      
      setIsCheckingAuth(false)
    }

    checkAuthentication()
    loadSystemStats()
    loadEmailConfiguration()
  }, [router])

  const loadSystemStats = async () => {
    try {
      // Cargar estadísticas desde Firebase
      const events = await eventsService.getAllEvents()
      
      setSystemStats({
        totalEvents: events.length,
        publishedEvents: events.filter(e => e.status === 'published').length,
        draftEvents: events.filter(e => e.status === 'draft').length,
        status: 'connected'
      })
      
      console.log('📊 Estadísticas del sistema cargadas desde Firebase:', events.length, 'eventos')
    } catch (error) {
      console.error('Error loading system stats:', error)
      setSystemStats({ status: 'error', totalEvents: 0, publishedEvents: 0, draftEvents: 0 })
    } finally {
      setIsLoadingStats(false)
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
        registrationUrl: 'https://aldebaran.vercel.app',
        description: 'Este es un email de prueba del sistema de notificaciones de Aldebaran.',
        distances: ['5k', '10k'],
        price: 'Gratuito',
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

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Redirigiendo...</div>
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-8">
      {/* Header del Panel */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Panel de Gestión Aldebaran</h1>
          <p className="text-muted-foreground">
            Sistema basado en Firebase + EmailJS
          </p>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              Firebase como base de datos principal
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
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Stats del sistema Firebase */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Eventos Totales</p>
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
              <AlertCircle className="h-5 w-5 text-orange-500" />
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
              <Mail className="h-5 w-5 text-pink-500" />
              <div>
                <p className="text-sm text-muted-foreground">Email Status</p>
                <Badge variant="outline" className={`text-xs ${
                  emailConfig?.configured ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {isLoadingEmailConfig ? '...' : (emailConfig?.configured ? 'Configurado' : 'Pendiente')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
            </CardContent>
          </Card>

          {/* Acciones Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
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
                <Badge variant="outline" className="text-green-600">Firebase</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Autenticación</span>
                <Badge variant="outline" className="text-green-600">Firebase Auth</Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Emails</span>
                <Badge variant="outline" className={emailConfig?.configured ? "text-green-600" : "text-orange-600"}>
                  {emailConfig?.configured ? "EmailJS" : "Pendiente"}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Tiempo Real</span>
                <Badge variant="outline" className="text-green-600">Firestore</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas de Eventos */}
          {systemStats && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estadísticas de Eventos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total de Eventos</span>
                  <Badge variant="outline" className="text-blue-600">
                    {systemStats.totalEvents}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Publicados</span>
                  <Badge variant="outline" className="text-green-600">
                    {systemStats.publishedEvents}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Borradores</span>
                  <Badge variant="outline" className="text-orange-600">
                    {systemStats.draftEvents}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
