'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useAuthApi } from '@/hooks/use-auth-api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Check, X, Edit, Calendar, MapPin, User, ExternalLink, RefreshCw } from 'lucide-react'

interface Proposal {
  id: string
  title: string
  eventDate: string
  municipality: string
  department: string
  organizer: string
  website: string
  description: string
  distances: string[]
  registrationFee: string
  category: string
  status: 'pending' | 'approved' | 'rejected'
  submittedBy: string
  createdAt: string
  submitterEmail?: string
  userAgent?: string
  reviewedBy?: string
  reviewedAt?: string
  rejectionReason?: string
}

export default function ProposalsPage() {
  const router = useRouter()
  const { user, isAdmin, loading } = useAuth()
  const { makeAuthenticatedRequest } = useAuthApi()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [actionResult, setActionResult] = useState<{success?: boolean, message: string} | null>(null)

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/login')
    }
  }, [user, isAdmin, loading, router])

  useEffect(() => {
    if (user && isAdmin) {
      loadProposals()
    }
  }, [user, isAdmin])

  const loadProposals = async () => {
    try {
      setIsLoading(true)
      setActionResult(null)
      
      console.log('🔍 Cargando propuestas desde Firebase...')
      
      const response = await makeAuthenticatedRequest('/api/proposals')
      
      if (response.ok) {
        const data = await response.json()
        setProposals(data.proposals || [])
        
        if (data.proposals.length === 0) {
          setActionResult({
            success: true,
            message: 'No hay propuestas disponibles. Las propuestas aparecerán aquí cuando los usuarios las envíen.'
          })
        }
      } else {
        const errorData = await response.json()
        setActionResult({
          success: false,
          message: `Error cargando propuestas: ${errorData.error || response.status}`
        })
      }
      
    } catch (error) {
      console.error('Error loading proposals:', error)
      setActionResult({
        success: false,
        message: 'Error de conexión al cargar propuestas'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveProposal = async (proposalId: string) => {
    setIsProcessing(true)
    setActionResult(null)
    
    try {
      const response = await makeAuthenticatedRequest(`/api/proposals/${proposalId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved' })
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Actualizar estado local
        setProposals(proposals.map(p => 
          p.id === proposalId ? { ...p, status: 'approved' } : p
        ))
        
        setActionResult({
          success: true,
          message: data.message || 'Propuesta aprobada exitosamente'
        })
      } else {
        const errorData = await response.json()
        setActionResult({
          success: false,
          message: errorData.error || 'Error aprobando propuesta'
        })
      }
    } catch (error) {
      setActionResult({
        success: false,
        message: 'Error de conexión: ' + (error instanceof Error ? error.message : 'Error desconocido')
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectProposal = async (proposalId: string, rejectionReason?: string) => {
    setIsProcessing(true)
    setActionResult(null)
    
    try {
      const response = await makeAuthenticatedRequest(`/api/proposals/${proposalId}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          status: 'rejected',
          rejectionReason: rejectionReason || 'Sin razón especificada'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Actualizar estado local
        setProposals(proposals.map(p => 
          p.id === proposalId ? { ...p, status: 'rejected', rejectionReason } : p
        ))
        
        setActionResult({
          success: true,
          message: data.message || 'Propuesta rechazada exitosamente'
        })
      } else {
        const errorData = await response.json()
        setActionResult({
          success: false,
          message: errorData.error || 'Error rechazando propuesta'
        })
      }
    } catch (error) {
      setActionResult({
        success: false,
        message: 'Error de conexión: ' + (error instanceof Error ? error.message : 'Error desconocido')
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePublishAsEvent = async (proposal: Proposal) => {
    setIsProcessing(true)
    setActionResult(null)
    
    try {
      const response = await makeAuthenticatedRequest('/api/proposals/publish', {
        method: 'POST',
        body: JSON.stringify({ proposalId: proposal.id })
      })
      
      if (response.ok) {
        const data = await response.json()
        
        setActionResult({
          success: true,
          message: data.message || 'Propuesta publicada como evento exitosamente'
        })
        
        // Recargar propuestas para reflejar cambios
        setTimeout(() => {
          loadProposals()
        }, 1000)
      } else {
        const errorData = await response.json()
        setActionResult({
          success: false,
          message: errorData.error || 'Error publicando propuesta como evento'
        })
      }
    } catch (error) {
      setActionResult({
        success: false,
        message: 'Error de conexión: ' + (error instanceof Error ? error.message : 'Error desconocido')
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Fecha inválida'
    
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: Proposal['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-blue-600">Pendiente</Badge>
      case 'approved':
        return <Badge variant="outline" className="text-green-600">Aprobada</Badge>
      case 'rejected':
        return <Badge variant="outline" className="text-red-600">Rechazada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredProposals = proposals.filter(proposal => 
    filter === 'all' || proposal.status === filter
  )

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <div className="text-center">Verificando autenticación...</div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user || !isAdmin) {
    return null
  }

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <div className="text-center">Cargando propuestas...</div>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div>
            <h1 className="text-3xl font-bold">Gestión de Propuestas</h1>
            <p className="text-muted-foreground">
              Revisa y gestiona propuestas de eventos enviadas por usuarios
            </p>
          </div>
        </div>
        <Button onClick={loadProposals} disabled={isLoading}>
          <RefreshCw className="size-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Action Result */}
      {actionResult && (
        <div className={`p-4 rounded-lg border ${
          actionResult.success 
            ? 'border-green-200 bg-green-50 text-green-700'
            : 'border-red-200 bg-red-50 text-red-700'
        }`}>
          {actionResult.message}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status === 'all' ? 'Todas' : 
             status === 'pending' ? 'Pendientes' :
             status === 'approved' ? 'Aprobadas' : 'Rechazadas'}
            {status !== 'all' && (
              <Badge variant="secondary" className="ml-2">
                {proposals.filter(p => p.status === status).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{proposals.length}</div>
            <div className="text-sm text-muted-foreground">Total Propuestas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {proposals.filter(p => p.status === 'pending').length}
            </div>
            <div className="text-sm text-muted-foreground">Pendientes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {proposals.filter(p => p.status === 'approved').length}
            </div>
            <div className="text-sm text-muted-foreground">Aprobadas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {proposals.filter(p => p.status === 'rejected').length}
            </div>
            <div className="text-sm text-muted-foreground">Rechazadas</div>
          </CardContent>
        </Card>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Propuestas {filter !== 'all' && `(${filter})`}
        </h2>
        {filteredProposals.length === 0 ? (
          <div className="p-8 border rounded-lg text-center">
            <div className="space-y-4">
              <div className="text-6xl">📝</div>
              <h3 className="text-xl font-semibold">Sistema de Propuestas</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                El sistema de propuestas está disponible para implementación futura. 
                Actualmente, los eventos se crean directamente desde el panel de administración.
              </p>
              <Button onClick={() => router.push('/admin')} variant="outline">
                Volver al Panel Principal
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredProposals.map((proposal) => (
              <Card key={proposal.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg line-clamp-2">{proposal.title}</CardTitle>
                    {getStatusBadge(proposal.status)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Enviado el {formatDate(proposal.createdAt)} por {proposal.submittedBy}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4" />
                      {formatDate(proposal.eventDate)}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4" />
                      {proposal.municipality}, {proposal.department}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="size-4" />
                      {proposal.organizer || 'No especificado'}
                    </div>
                    {proposal.website && (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="size-4" />
                        <a href={proposal.website} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-600 hover:underline">
                          {proposal.website}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Distances */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {proposal.distances.slice(0, 3).map((distance, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {distance}
                      </Badge>
                    ))}
                    {proposal.distances.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{proposal.distances.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  {proposal.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {proposal.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {proposal.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleApproveProposal(proposal.id)}
                          disabled={isProcessing}
                          size="sm"
                          className="flex-1"
                        >
                          <Check className="size-4 mr-1" />
                          Aprobar
                        </Button>
                        <Button
                          onClick={() => handleRejectProposal(proposal.id)}
                          disabled={isProcessing}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <X className="size-4 mr-1" />
                          Rechazar
                        </Button>
                      </>
                    )}
                    {proposal.status === 'approved' && (
                      <Button
                        onClick={() => handlePublishAsEvent(proposal)}
                        disabled={isProcessing}
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        📅 Publicar como Evento
                      </Button>
                    )}
                    <Button
                      onClick={() => setSelectedProposal(proposal)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="size-4 mr-1" />
                      Ver Detalle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Proposal Detail Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedProposal.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(selectedProposal.status)}
                    <span className="text-sm text-muted-foreground">
                      ID: {selectedProposal.id}
                    </span>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setSelectedProposal(null)}>
                  <X className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha del Evento</Label>
                  <p>{formatDate(selectedProposal.eventDate)}</p>
                </div>
                <div>
                  <Label>Categoría</Label>
                  <p>{selectedProposal.category}</p>
                </div>
                <div>
                  <Label>Municipio</Label>
                  <p>{selectedProposal.municipality}</p>
                </div>
                <div>
                  <Label>Departamento</Label>
                  <p>{selectedProposal.department}</p>
                </div>
                <div>
                  <Label>Organizador</Label>
                  <p>{selectedProposal.organizer || 'No especificado'}</p>
                </div>
                <div>
                  <Label>Costo de Inscripción</Label>
                  <p>{selectedProposal.registrationFee || 'No especificado'}</p>
                </div>
              </div>

              {selectedProposal.website && (
                <div>
                  <Label>Sitio Web</Label>
                  <p>
                    <a href={selectedProposal.website} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline">
                      {selectedProposal.website}
                    </a>
                  </p>
                </div>
              )}

              <div>
                <Label>Distancias</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedProposal.distances.map((distance, index) => (
                    <Badge key={index} variant="secondary">
                      {distance}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedProposal.description && (
                <div>
                  <Label>Descripción</Label>
                  <p className="mt-1 text-sm">{selectedProposal.description}</p>
                </div>
              )}

              <div className="text-xs text-muted-foreground pt-4 border-t">
                <p>Enviado por: {selectedProposal.submittedBy}</p>
                <p>Fecha de envío: {formatDate(selectedProposal.createdAt)}</p>
                {selectedProposal.userAgent && (
                  <p>Navegador: {selectedProposal.userAgent}</p>
                )}
              </div>

              {/* Actions for selected proposal */}
              <div className="flex gap-2 pt-4">
                {selectedProposal.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => {
                        handleApproveProposal(selectedProposal.id)
                        setSelectedProposal(null)
                      }}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      <Check className="size-4 mr-2" />
                      Aprobar
                    </Button>
                    <Button
                      onClick={() => {
                        handleRejectProposal(selectedProposal.id)
                        setSelectedProposal(null)
                      }}
                      disabled={isProcessing}
                      variant="outline"
                      className="flex-1"
                    >
                      <X className="size-4 mr-2" />
                      Rechazar
                    </Button>
                  </>
                )}
                {selectedProposal.status === 'approved' && (
                  <Button
                    onClick={() => {
                      handlePublishAsEvent(selectedProposal)
                      setSelectedProposal(null)
                    }}
                    disabled={isProcessing}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    📅 Publicar como Evento
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}