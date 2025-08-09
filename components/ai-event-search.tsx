'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  ExternalLink,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Globe
} from 'lucide-react'

interface EventFormData {
  title: string
  eventDate: string
  municipality: string
  department: string
  organizer: string
  registrationUrl: string
  description: string
  distances: string[]
  price: string
  category: string
  cover: string
}

interface AIEventSearchProps {
  onEventFound: (eventData: Partial<EventFormData>) => void
}

export default function AIEventSearch({ onEventFound }: AIEventSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchUrls, setSearchUrls] = useState('')
  const [enableWebSearch, setEnableWebSearch] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAISearch = async () => {
    if (!searchQuery.trim()) {
      setError('Por favor ingresa información sobre la carrera')
      return
    }

    setIsSearching(true)
    setError(null)
    setSearchResult(null)

    try {
      const response = await fetch('/api/ai-event-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          urls: searchUrls.split('\n').filter(url => url.trim()),
          enableWebSearch: enableWebSearch
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSearchResult(data)
      } else {
        setError(data.error || 'Error en la búsqueda')
      }
    } catch (error) {
      console.error('Error en búsqueda IA:', error)
      setError('Error de conexión. Verifica tu configuración de IA.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleUseResult = () => {
    if (searchResult?.eventData) {
      onEventFound(searchResult.eventData)
    }
  }

  const handleClear = () => {
    setSearchQuery('')
    setSearchUrls('')
    setSearchResult(null)
    setError(null)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Búsqueda Automática con IA
        </CardTitle>
        <CardDescription>
          Describe la carrera o proporciona enlaces para que la IA complete automáticamente el formulario
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="space-y-2">
          <Label htmlFor="search-query">
            Información de la Carrera
          </Label>
          <Textarea
            id="search-query"
            placeholder="Ej: Maratón de Medellín 2024, organizado por Atletismo Antioquia, 21K y 10K, en septiembre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            rows={3}
            disabled={isSearching}
          />
        </div>

        {/* URLs Input */}
        <div className="space-y-2">
          <Label htmlFor="search-urls">
            Enlaces (opcional)
          </Label>
          <Textarea
            id="search-urls"
            placeholder="https://ejemplo.com/carrera1&#10;https://ejemplo.com/carrera2"
            value={searchUrls}
            onChange={(e) => setSearchUrls(e.target.value)}
            rows={2}
            disabled={isSearching}
          />
          <p className="text-xs text-muted-foreground">
            Un enlace por línea. La IA revisará estos sitios para obtener información adicional.
          </p>
        </div>

        {/* Web Search Toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="enable-web-search"
            checked={enableWebSearch}
            onChange={(e) => setEnableWebSearch(e.target.checked)}
            className="rounded border-gray-300"
            disabled={isSearching}
          />
          <Label htmlFor="enable-web-search" className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4" />
            Habilitar búsqueda web inteligente
          </Label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleAISearch}
            disabled={isSearching || !searchQuery.trim()}
            className="flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Buscando con IA...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                {enableWebSearch ? 'Buscar con IA + Web' : 'Buscar con IA'}
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={isSearching}
          >
            Limpiar
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Search Result */}
        {searchResult && (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-700">
                ¡IA encontró información! Revisa los datos y haz clic en "Usar Datos" para completar el formulario.
              </AlertDescription>
            </Alert>

            {/* Preview Card */}
            <Card className="border-2 border-green-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {searchResult.eventData?.title || 'Sin título'}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      {searchResult.eventData?.eventDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(searchResult.eventData.eventDate).toLocaleDateString('es-CO')}
                        </div>
                      )}
                      {searchResult.eventData?.municipality && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {searchResult.eventData.municipality}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {searchResult.eventData?.category || 'Running'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Organizador:</strong> {searchResult.eventData?.organizer || 'No especificado'}
                  </div>
                  <div>
                    <strong>Precio:</strong> {searchResult.eventData?.price || 'No especificado'}
                  </div>
                  {searchResult.eventData?.distances && searchResult.eventData.distances.length > 0 && (
                    <div className="col-span-2">
                      <strong>Distancias:</strong> {searchResult.eventData.distances.join(', ')}
                    </div>
                  )}
                  {searchResult.eventData?.registrationUrl && (
                    <div className="col-span-2">
                      <a 
                        href={searchResult.eventData.registrationUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Sitio de registro
                      </a>
                    </div>
                  )}
                </div>

                {searchResult.eventData?.description && (
                  <div className="mt-4">
                    <strong>Descripción:</strong>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                      {searchResult.eventData.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Use Result Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleUseResult}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Usar Estos Datos
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}