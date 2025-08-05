import NewEventForm from '@/components/new-event-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, Mail } from 'lucide-react'

export default function ProposeEventPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-8">
      {/* Header Público */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
            <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Proponer Nuevo Evento</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          ¿Conoces un evento de atletismo que debería estar en Aldebaran? 
          Compártelo con la comunidad y ayúdanos a mantener actualizado 
          el calendario más completo de Colombia.
        </p>
      </div>

      {/* Información para usuarios públicos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto text-blue-500 mb-2" />
            <h3 className="font-medium">Para la Comunidad</h3>
            <p className="text-sm text-muted-foreground">
              Tu propuesta ayuda a miles de corredores
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Mail className="h-6 w-6 mx-auto text-green-500 mb-2" />
            <h3 className="font-medium">Revisión Rápida</h3>
            <p className="text-sm text-muted-foreground">
              Revisamos y publicamos en 24-48 horas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 mx-auto text-purple-500 mb-2" />
            <h3 className="font-medium">Siempre Actualizado</h3>
            <p className="text-sm text-muted-foreground">
              Información verificada y confiable
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Formulario público (simplificado) */}
      <NewEventForm isPublic={true} />

      {/* Nota informativa */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100">
                ¿Cómo funciona el proceso?
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                1. Completas el formulario con la información del evento<br/>
                2. Tu propuesta se envía para revisión<br/>
                3. Verificamos los datos y publicamos el evento<br/>
                4. ¡Miles de corredores pueden descubrir el evento!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}