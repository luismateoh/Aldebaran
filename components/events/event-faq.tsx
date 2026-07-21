"use client"

import { motion } from "framer-motion"
import { HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { EventData } from "@/lib/types"

export interface EventFAQProps {
  event: EventData
  className?: string
}

const FAQ_ITEMS = [
  {
    id: "llegar",
    question: "¿Cómo llegar al evento?",
    answer:
      "Las indicaciones exactas de llegada dependen de la ubicación del evento. Generalmente se recomienda usar Google Maps o Waze para llegar al punto de partida. Algunos eventos ofrecen transporte opcional desde puntos céntricos de la ciudad. Te sugerimos llegar con al menos 45 minutos de anticipación para evitar contratiempos y disfrutar del ambiente previo a la carrera.",
  },
  {
    id: "incluye",
    question: "¿Qué incluye la inscripción?",
    answer:
      "La inscripción generalmente incluye: número de competidor, chip de cronometraje, camiseta conmemorativa del evento, medalla para quienes completen la distancia, hidratación durante la ruta y en la meta, seguro de accidentes, y acceso a la bolsa del corredor. Algunos eventos también incluyen fotografía oficial, refrigerio post-carrera y estacionamiento preferencial.",
  },
  {
    id: "guardarropa",
    question: "¿Hay guardarropa?",
    answer:
      "Muchos eventos ofrecen servicio de guardarropa gratuito o por un costo adicional. Te recomendamos confirmar esta información directamente con la organización del evento, ya que la disponibilidad varía. Si el evento no ofrece guardarropa, procura llevar solo lo necesario y dejar tus pertenencias de valor en casa o con algún acompañante.",
  },
  {
    id: "lluvia",
    question: "¿Qué pasa si llueve el día del evento?",
    answer:
      "Los eventos de atletismo en Colombia se realizan bajo cualquier condición climática, a menos que la organización determine que hay riesgos de seguridad (tormentas eléctricas, granizo, etc.). Te recomendamos prepararte para cualquier clima: lleva un impermeable ligero, gorra, y ropa adecuada. Recuerda que correr bajo la lluvia puede ser una experiencia refrescante y divertida.",
  },
  {
    id: "mascotas",
    question: "¿Se permiten mascotas?",
    answer:
      "Generalmente no se permiten mascotas en las rutas de competencia por razones de seguridad y logística. Sin embargo, algunos eventos tienen categorías especiales o actividades paralelas donde sí se permite acompañar con mascotas. Te recomendamos consultar directamente con los organizadores. Si tu mascota se queda en casa, asegúrate de dejarle agua y un espacio cómodo.",
  },
  {
    id: "devolucion",
    question: "¿Hay reembolso si no puedo asistir?",
    answer:
      "Las políticas de reembolso varían según cada evento. Algunos permiten la transferencia del cupo a otra persona hasta cierta fecha, mientras que otros no ofrecen reembolsos. Revisa los términos y condiciones al momento de inscribirte. En caso de cancelación por parte de la organización, generalmente se coordina el reembolso total del valor de la inscripción.",
  },
]

export function EventFAQ({ event, className }: EventFAQProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn("space-y-6", className)}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <HelpCircle className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-heading text-heading-3 font-semibold text-foreground">
            Preguntas Frecuentes
          </h2>
          <p className="text-sm text-muted-foreground">
            Todo lo que necesitas saber sobre este evento
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Accordion type="single" collapsible className="w-full">
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className={cn(
                "border-border px-4 transition-colors hover:bg-surface/50",
                index === 0 && "border-t-0",
              )}
            >
              <AccordionTrigger className="py-4 text-left text-sm font-medium text-foreground hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </motion.section>
  )
}
