'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle2, 
  Trophy, 
  Star, 
  Calendar,
  Award
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useAuthApi } from '@/hooks/use-auth-api'
import { cn } from '@/lib/utils'

interface EventAttendanceButtonProps {
  eventId: string
  eventTitle?: string
  eventDate?: string
  className?: string
}

export default function EventAttendanceButton({
  eventId,
  eventTitle,
  eventDate,
  className
}: EventAttendanceButtonProps) {
  const { user } = useAuth()
  const { makeAuthenticatedRequest } = useAuthApi()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentInteraction, setCurrentInteraction] = useState<any>(null)
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    attended: false,
    rating: '',
    notes: '',
    completedDate: eventDate || ''
  })

  useEffect(() => {
    if (user) {
      loadInteraction()
    }
  }, [user, eventId])

  const loadInteraction = async () => {
    if (!user) return

    try {
      const response = await makeAuthenticatedRequest(`/api/user/interactions?eventId=${eventId}`)
      if (response.ok) {
        const data = await response.json()
        const interaction = data.interactions?.find((i: any) => i.eventId === eventId)
        if (interaction) {
          setCurrentInteraction(interaction)
          setFormData({
            attended: interaction.attended || false,
            rating: interaction.rating ? interaction.rating.toString() : '',
            notes: interaction.notes || '',
            completedDate: interaction.completedDate || eventDate || ''
          })
        }
      }
    } catch (error) {
      console.error('Error loading interaction:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const response = await makeAuthenticatedRequest('/api/user/interactions', {
        method: 'POST',
        body: JSON.stringify({
          eventId,
          attended: formData.attended,
          rating: formData.rating ? parseInt(formData.rating) : null,
          notes: formData.notes,
          completedDate: formData.completedDate
        })
      })

      if (response.ok) {
        const updatedInteraction = await response.json()
        setCurrentInteraction(updatedInteraction)
        setIsOpen(false)
      } else {
        throw new Error('Failed to update interaction')
      }
    } catch (error) {
      console.error('Error updating interaction:', error)
    } finally {
      setLoading(false)
    }
  }

  const isAttended = currentInteraction?.attended

  if (!user) {
    return null // Solo mostrar para usuarios autenticados
  }

  const buttonContent = isAttended ? (
    <>
      <CheckCircle2 className="h-4 w-4 text-green-500" />
      <span className="text-sm font-medium">Completado</span>
      {currentInteraction.rating && (
        <Badge variant="secondary" className="ml-1">
          <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
          {currentInteraction.rating}
        </Badge>
      )}
    </>
  ) : (
    <>
      <Trophy className="h-4 w-4" />
      <span className="text-sm">Marcar como Asistido</span>
    </>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isAttended ? "default" : "outline"}
          size="sm"
          className={cn(
            "flex items-center gap-1.5",
            isAttended && "bg-green-100 text-green-700 hover:bg-green-200",
            className
          )}
        >
          {buttonContent}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            {eventTitle ? `Marcar "${eventTitle}"` : 'Marcar Evento'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.attended}
              onChange={(e) => setFormData(prev => ({ ...prev, attended: e.target.checked }))}
              className="h-4 w-4"
              id="attended"
            />
            <Label htmlFor="attended" className="text-sm font-medium">
              Asistí a este evento
            </Label>
          </div>

          {formData.attended && (
            <>
              <div>
                <Label className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Fecha de participación
                </Label>
                <Input
                  type="date"
                  value={formData.completedDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, completedDate: e.target.value }))}
                  className="text-sm mt-2"
                />
              </div>

              <div>
                <Label className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  Calificación (opcional)
                </Label>
                <Select
                  value={formData.rating}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, rating: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecciona una calificación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ Excelente</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ Muy bueno</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ Bueno</SelectItem>
                    <SelectItem value="2">⭐⭐ Regular</SelectItem>
                    <SelectItem value="1">⭐ Malo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notas (opcional)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="¿Cómo fue tu experiencia? ¿Lograste tu objetivo?"
                  className="text-sm mt-2"
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Comparte tu experiencia en el evento
                </p>
              </div>
            </>
          )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={loading}
                className="flex items-center gap-1.5"
              >
                {loading && (
                  <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                )}
                Guardar
              </Button>
            </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}