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
import { UserPlus, User, Mail, Shield, Trash2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Admin {
  email: string
  displayName: string | null
  photoURL: string | null
  role: 'super_admin' | 'admin'
  addedBy: string
  addedAt: string
  lastLogin?: string
}

export default function AdministratorsPage() {
  const router = useRouter()
  const { user, isAdmin, loading } = useAuth()
  const { makeAuthenticatedRequest } = useAuthApi()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true)
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [isAddingAdmin, setIsAddingAdmin] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/login')
    }
  }, [user, isAdmin, loading, router])

  useEffect(() => {
    if (user && isAdmin) {
      loadAdministrators()
    }
  }, [user, isAdmin])

  const loadAdministrators = async () => {
    try {
      const response = await makeAuthenticatedRequest('/api/admin/administrators')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAdmins(data.administrators)
        } else {
          // Fallback to current user if API doesn't work yet
          setAdmins([
            {
              email: user?.email || '',
              displayName: user?.displayName || null,
              photoURL: user?.photoURL || null,
              role: 'super_admin',
              addedBy: 'system',
              addedAt: '2024-01-01',
              lastLogin: new Date().toISOString()
            }
          ])
        }
      } else {
        throw new Error('Failed to load administrators')
      }
    } catch (error) {
      console.error('Error loading administrators:', error)
      // Fallback to current user
      setAdmins([
        {
          email: user?.email || '',
          displayName: user?.displayName || null,
          photoURL: user?.photoURL || null,
          role: 'super_admin',
          addedBy: 'system',
          addedAt: '2024-01-01',
          lastLogin: new Date().toISOString()
        }
      ])
      setAlert({ type: 'error', message: 'Error cargando administradores, mostrando datos locales' })
    } finally {
      setIsLoadingAdmins(false)
    }
  }

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      setAlert({ type: 'error', message: 'Por favor ingresa un email válido' })
      return
    }

    setIsAddingAdmin(true)
    try {
      const response = await makeAuthenticatedRequest('/api/admin/administrators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newAdminEmail.trim() })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setAlert({ type: 'success', message: `Administrador ${newAdminEmail} agregado exitosamente` })
        setNewAdminEmail('')
        loadAdministrators() // Reload the list
      } else {
        setAlert({ type: 'error', message: data.error || data.message || 'Error agregando administrador' })
      }
    } catch (error) {
      console.error('Error adding administrator:', error)
      setAlert({ type: 'error', message: 'Error de conexión al agregar administrador' })
    } finally {
      setIsAddingAdmin(false)
    }
  }

  const handleRemoveAdmin = async (adminEmail: string) => {
    if (adminEmail === user?.email) {
      setAlert({ type: 'error', message: 'No puedes removerte a ti mismo como administrador' })
      return
    }

    if (!confirm(`¿Estás seguro que deseas remover a ${adminEmail} como administrador?`)) {
      return
    }

    try {
      const response = await makeAuthenticatedRequest(`/api/admin/administrators?email=${encodeURIComponent(adminEmail)}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setAlert({ type: 'success', message: `Administrador ${adminEmail} removido exitosamente` })
        loadAdministrators() // Reload the list
      } else {
        setAlert({ type: 'error', message: data.error || data.message || 'Error removiendo administrador' })
      }
    } catch (error) {
      console.error('Error removing administrator:', error)
      setAlert({ type: 'error', message: 'Error de conexión al remover administrador' })
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Gestión de Administradores</h1>
          <p className="text-muted-foreground">
            Administra usuarios con acceso al panel de administración
          </p>
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <Alert className={`mt-6 ${alert.type === 'error' ? 'border-red-200' : 'border-green-200'}`}>
          {alert.type === 'error' ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Add New Administrator */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Agregar Nuevo Administrador
          </CardTitle>
          <CardDescription>
            Otorga acceso administrativo a otros usuarios del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="adminEmail">Email del Usuario</Label>
              <Input
                id="adminEmail"
                type="email"
                placeholder="usuario@ejemplo.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleAddAdmin}
                disabled={isAddingAdmin || !newAdminEmail.trim()}
                className="w-full"
              >
                {isAddingAdmin ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Agregando...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Agregar
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Los administradores tendrán acceso completo al sistema, 
              incluyendo la creación, edición y eliminación de eventos, así como la gestión de otros administradores.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Current Administrators */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Administradores Actuales
          </CardTitle>
          <CardDescription>
            Lista de usuarios con acceso administrativo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingAdmins ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Cargando administradores...
            </div>
          ) : (
            <div className="space-y-4">
              {admins.map((admin) => (
                <div key={admin.email} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {admin.photoURL ? (
                      <img 
                        src={admin.photoURL} 
                        alt={admin.displayName || admin.email}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{admin.displayName || admin.email}</p>
                        <Badge variant={admin.role === 'super_admin' ? 'default' : 'secondary'}>
                          {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                        </Badge>
                        {admin.email === user?.email && (
                          <Badge variant="outline">Tú</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {admin.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Agregado por {admin.addedBy} el {new Date(admin.addedAt).toLocaleDateString('es-CO')}
                      </p>
                      {admin.lastLogin && (
                        <p className="text-xs text-muted-foreground">
                          Último acceso: {new Date(admin.lastLogin).toLocaleDateString('es-CO')}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {admin.email !== user?.email && admin.role !== 'super_admin' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveAdmin(admin.email)}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {admins.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No hay administradores configurados
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Development Notice */}
      <Card className="mt-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <AlertCircle className="h-5 w-5" />
            Desarrollo en Progreso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-yellow-700 dark:text-yellow-300 space-y-2">
            <p>Esta funcionalidad está en desarrollo y requiere:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>API endpoints para gestión de administradores</li>
              <li>Sistema de roles y permisos en Firebase</li>
              <li>Actualización del sistema de autenticación</li>
              <li>Validación de emails y permisos</li>
            </ul>
            <p className="text-sm">
              Actualmente solo está configurado el administrador principal: {user?.email}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}