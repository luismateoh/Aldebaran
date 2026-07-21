'use client'

import { useState, useEffect } from 'react'
import { User, Shield, ShieldCheck, Trash2, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface Admin {
  uid: string
  email: string
  displayName: string
  photoURL: string
  role: 'admin' | 'super_admin'
  createdAt: string
}

export default function AdministratorsPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'super_admin'>('admin')
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/administrators')
      if (!res.ok) throw new Error('Error al cargar administradores')
      const data = await res.json()
      setAdmins(data.admins || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los administradores',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAdminEmail.trim()) return

    try {
      setAdding(true)
      const res = await fetch('/api/admin/administrators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newAdminEmail.trim(), role: newAdminRole }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al agregar administrador')
      }

      toast({
        title: 'Administrador agregado',
        description: `${newAdminEmail} ahora es administrador`,
      })

      setNewAdminEmail('')
      fetchAdmins()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al agregar administrador',
        variant: 'destructive',
      })
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveAdmin = async (admin: Admin) => {
    if (!confirm(`¿Eliminar a ${admin.displayName || admin.email} como administrador?`)) return

    try {
      setRemoving(admin.uid)
      const res = await fetch('/api/admin/administrators', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: admin.uid }),
      })

      if (!res.ok) throw new Error('Error al eliminar administrador')

      toast({
        title: 'Administrador eliminado',
        description: `${admin.email} ya no es administrador`,
      })

      fetchAdmins()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al eliminar administrador',
        variant: 'destructive',
      })
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Administradores</h1>
        <p className="text-muted-foreground">
          Gestiona quiénes pueden acceder al panel administrativo
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agregar administrador</CardTitle>
          <CardDescription>
            Ingresa el correo electrónico del usuario que deseas agregar como administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddAdmin} className="flex flex-col gap-4 sm:flex-row">
            <Input
              type="email"
              placeholder="correo@ejemplo.com"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              required
              className="sm:flex-1"
            />
            <select
              value={newAdminRole}
              onChange={(e) => setNewAdminRole(e.target.value as 'admin' | 'super_admin')}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            <Button type="submit" disabled={adding}>
              {adding ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Agregando...
                </>
              ) : (
                'Agregar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Administradores actuales</CardTitle>
          <CardDescription>
            {admins.length} administrador{admins.length !== 1 ? 'es' : ''} registrado{admins.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="mr-2 size-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Cargando administradores...
            </div>
          ) : (
            <div className="space-y-4">
              {admins.map((admin) => (
                <div key={admin.email} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-4">
                    {admin.photoURL ? (
                      <div className="relative size-10 overflow-hidden rounded-full">
                        <Image
                          src={admin.photoURL}
                          alt={admin.displayName || admin.email}
                          fill
                          sizes="40px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                        <User className="size-5" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{admin.displayName || admin.email}</p>
                        <Badge variant={admin.role === 'super_admin' ? 'default' : 'secondary'}>
                          {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveAdmin(admin)}
                    disabled={removing === admin.uid}
                    className="text-destructive hover:text-destructive"
                  >
                    {removing === admin.uid ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </Button>
                </div>
              ))}

              {admins.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">
                  No hay administradores registrados
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
