'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  FileText, 
  Archive, 
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { useAuthApi } from '@/hooks/use-auth-api'

export default function BatchOperations() {
  const { makeAuthenticatedRequest } = useAuthApi()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleMarkAllDraft = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await makeAuthenticatedRequest('/api/admin/events/batch-update', {
        method: 'POST',
        body: JSON.stringify({
          operation: 'mark_all_draft'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setResult({
          success: true,
          message: data.message,
          updatedCount: data.updatedCount
        })
      } else {
        const error = await response.json()
        setResult({
          success: false,
          message: error.error || 'Error desconocido'
        })
      }
    } catch (error) {
      console.error('Error marking all events as draft:', error)
      setResult({
        success: false,
        message: 'Error de conexión'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="size-5" />
          Operaciones por Lotes
        </CardTitle>
        <CardDescription>
          Administrar eventos de forma masiva
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Resultado de la operación */}
        {result && (
          <div className={`rounded-lg border p-4 ${
            result.success 
              ? 'border-green-200 bg-green-50 text-green-800' 
              : 'border-red-200 bg-red-50 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="size-5" />
              ) : (
                <AlertTriangle className="size-5" />
              )}
              <div>
                <p className="font-medium">
                  {result.success ? 'Operación exitosa' : 'Error en la operación'}
                </p>
                <p className="text-sm">{result.message}</p>
                {result.success && result.updatedCount && (
                  <Badge variant="secondary" className="mt-2">
                    {result.updatedCount} eventos actualizados
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Marcar todos como draft */}
        <div className="rounded-lg border p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="flex items-center gap-2 font-medium">
                <FileText className="size-4" />
                Marcar Todos como Draft
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Convierte todos los eventos públicos en borradores (draft=true)
              </p>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={loading}
                  className="ml-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Archive className="mr-2 size-4" />
                      Marcar como Draft
                    </>
                  )}
                </Button>
              </DialogTrigger>
              
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="size-5 text-orange-500" />
                    Confirmar Operación
                  </DialogTitle>
                  <DialogDescription>
                    Esta acción marcará <strong>todos los eventos públicos</strong> como borradores (draft).
                    Los eventos no aparecerán en el sitio web hasta que se publiquen nuevamente.
                    <br /><br />
                    <strong>Esta operación no se puede deshacer fácilmente.</strong>
                  </DialogDescription>
                </DialogHeader>
                
                <DialogFooter>
                  <Button variant="outline">Cancelar</Button>
                  <Button onClick={handleMarkAllDraft}>
                    Sí, marcar todos como draft
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Información adicional */}
        <div className="rounded-lg bg-muted/50 p-4">
          <h4 className="mb-2 text-sm font-medium">ℹ️ Información importante:</h4>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• Los eventos draft no aparecen en el sitio público</li>
            <li>• Solo los administradores pueden ver eventos draft</li>
            <li>• Se puede revertir editando cada evento individualmente</li>
            <li>• La operación se ejecuta de forma asíncrona</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}