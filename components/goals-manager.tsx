'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { 
  Target,
  Plus,
  Trophy,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Trash2,
  Edit
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useAuthApi } from '@/hooks/use-auth-api'

interface Goal {
  id?: string
  title: string
  description: string
  category: 'distance' | 'time' | 'frequency' | 'event' | 'personal'
  targetValue?: number
  targetUnit?: string
  targetDate?: string
  currentProgress?: number
  status: 'active' | 'completed' | 'paused'
  createdAt?: Date
  completedAt?: Date
}

interface GoalsManagerProps {
  className?: string
}

export default function GoalsManager({ className }: GoalsManagerProps) {
  const { user } = useAuth()
  const { makeAuthenticatedRequest } = useAuthApi()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  // Estado del formulario
  const [formData, setFormData] = useState<Goal>({
    title: '',
    description: '',
    category: 'personal',
    targetValue: undefined,
    targetUnit: '',
    targetDate: '',
    currentProgress: 0,
    status: 'active'
  })

  useEffect(() => {
    if (user) {
      loadGoals()
    }
  }, [user])

  const loadGoals = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await makeAuthenticatedRequest('/api/user/goals')
      if (response.ok) {
        const data = await response.json()
        setGoals(data.goals || [])
      }
    } catch (error) {
      console.error('Error loading goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const url = editingGoal 
        ? `/api/user/goals/${editingGoal.id}` 
        : '/api/user/goals'
      
      const method = editingGoal ? 'PUT' : 'POST'
      
      const response = await makeAuthenticatedRequest(url, {
        method,
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await loadGoals()
        resetForm()
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error('Error saving goal:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setFormData(goal)
    setIsDialogOpen(true)
  }

  const handleDelete = async (goalId: string) => {
    if (!user || !confirm('¿Estás seguro de eliminar esta meta?')) return

    try {
      const response = await makeAuthenticatedRequest(`/api/user/goals/${goalId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadGoals()
      }
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'personal',
      targetValue: undefined,
      targetUnit: '',
      targetDate: '',
      currentProgress: 0,
      status: 'active'
    })
    setEditingGoal(null)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'distance': return '🏃‍♂️'
      case 'time': return '⏱️'
      case 'frequency': return '📅'
      case 'event': return '🏆'
      default: return '🎯'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'distance': return 'Distancia'
      case 'time': return 'Tiempo'
      case 'frequency': return 'Frecuencia'
      case 'event': return 'Evento'
      default: return 'Personal'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Inicia sesión para gestionar tus metas
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5" />
          Mis Metas ({goals.length})
        </h3>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-1" />
              Nueva Meta
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingGoal ? 'Editar Meta' : 'Nueva Meta'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Correr mi primera 10K"
                  required
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe tu meta en detalle..."
                  required
                  maxLength={500}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">🏃‍♂️ Distancia</SelectItem>
                    <SelectItem value="time">⏱️ Tiempo</SelectItem>
                    <SelectItem value="frequency">📅 Frecuencia</SelectItem>
                    <SelectItem value="event">🏆 Evento Específico</SelectItem>
                    <SelectItem value="personal">🎯 Meta Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="targetValue">Valor Meta</Label>
                  <Input
                    id="targetValue"
                    type="number"
                    value={formData.targetValue || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      targetValue: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    placeholder="42"
                  />
                </div>
                <div>
                  <Label htmlFor="targetUnit">Unidad</Label>
                  <Input
                    id="targetUnit"
                    value={formData.targetUnit || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetUnit: e.target.value }))}
                    placeholder="km, min, veces"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="targetDate">Fecha Objetivo</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={formData.targetDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={loading}>
                  {loading && (
                    <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-2" />
                  )}
                  {editingGoal ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading && goals.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Cargando metas...</p>
        </div>
      ) : goals.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">
              Aún no tienes metas definidas
            </p>
            <p className="text-sm text-muted-foreground">
              Establece objetivos para motivarte en tu entrenamiento
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal) => (
            <Card key={goal.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCategoryIcon(goal.category)}</span>
                    <h4 className="font-semibold">{goal.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={getStatusColor(goal.status)}>
                      {goal.status === 'active' ? 'Activa' : 
                       goal.status === 'completed' ? 'Completada' : 'Pausada'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(goal)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => goal.id && handleDelete(goal.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {goal.description}
                </p>
                
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">
                    {getCategoryLabel(goal.category)}
                  </Badge>
                  {goal.targetValue && goal.targetUnit && (
                    <Badge variant="outline">
                      Meta: {goal.targetValue} {goal.targetUnit}
                    </Badge>
                  )}
                  {goal.targetDate && (
                    <Badge variant="outline">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(goal.targetDate).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}