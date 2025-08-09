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
          <div className={`p-4 rounded-lg border ${
            result.success 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
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
        <div className="border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium flex items-center gap-2">
                <FileText className="size-4" />
                Marcar Todos como Draft
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
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
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Archive className="size-4 mr-2" />
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
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium text-sm mb-2">ℹ️ Información importante:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
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