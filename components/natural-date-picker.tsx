"use client"

import * as React from "react"
import { parseDate } from "chrono-node"

// Función auxiliar para convertir palabras en español a inglés
function translateSpanishToEnglish(text: string): string {
  const translations: { [key: string]: string } = {
    'ayer': 'yesterday',
    'hoy': 'today',
    'mañana': 'tomorrow',
    'próximo': 'next',
    'siguiente': 'next',
    'lunes': 'monday',
    'martes': 'tuesday',
    'miércoles': 'wednesday',
    'jueves': 'thursday',
    'viernes': 'friday',
    'sábado': 'saturday',
    'domingo': 'sunday',
    'enero': 'january',
    'febrero': 'february',
    'marzo': 'march',
    'abril': 'april',
    'mayo': 'may',
    'junio': 'june',
    'julio': 'july',
    'agosto': 'august',
    'septiembre': 'september',
    'octubre': 'october',
    'noviembre': 'november',
    'diciembre': 'december'
  }
  
  let translatedText = text.toLowerCase()
  Object.entries(translations).forEach(([spanish, english]) => {
    translatedText = translatedText.replace(new RegExp(spanish, 'g'), english)
  })
  
  return translatedText
}

// Función mejorada de parsing
function parseNaturalDate(text: string): Date | null {
  // Primero intenta con el texto original
  let result = parseDate(text)
  
  // Si no funciona, intenta con la traducción
  if (!result) {
    const translatedText = translateSpanishToEnglish(text)
    result = parseDate(translatedText)
  }
  
  return result
}
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }

  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function formatDateForInput(date: Date | undefined) {
  if (!date) {
    return ""
  }

  return date.toISOString().split('T')[0] // YYYY-MM-DD format
}

interface NaturalDatePickerProps {
  label: string
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  className?: string
  helpText?: string
}

export function NaturalDatePicker({
  label,
  value = "",
  onChange,
  placeholder = "Ej: mañana, próximo viernes, 15 de diciembre",
  required = false,
  className = "",
  helpText
}: NaturalDatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  )
  const [month, setMonth] = React.useState<Date | undefined>(date)

  React.useEffect(() => {
    if (value) {
      const parsedDate = new Date(value)
      setDate(parsedDate)
      setMonth(parsedDate)
      setInputValue(formatDate(parsedDate))
    } else {
      setInputValue("")
      setDate(undefined)
    }
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value
    setInputValue(text)
    
    const parsedDate = parseNaturalDate(text)
    if (parsedDate) {
      setDate(parsedDate)
      setMonth(parsedDate)
      onChange(formatDateForInput(parsedDate))
    } else {
      setDate(undefined)
      onChange("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      // No cambiar el inputValue, solo actualizar la fecha interna si es válida
      const parsedDate = parseNaturalDate(inputValue)
      if (parsedDate) {
        setDate(parsedDate)
        setMonth(parsedDate)
        onChange(formatDateForInput(parsedDate))
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      setOpen(true)
    }
  }

  // Removed handleBlur to keep original text in input

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    setInputValue(formatDate(selectedDate))
    onChange(formatDateForInput(selectedDate))
    setOpen(false)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="date">
        {label} {required && "*"}
      </Label>
      <div className="relative">
        <Input
          id="date"
          value={inputValue}
          placeholder={placeholder}
          className="bg-background pr-10"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 z-10 h-full px-3 hover:bg-transparent"
            >
              <CalendarIcon className="size-4 text-muted-foreground" />
              <span className="sr-only">Seleccionar fecha</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="z-50 w-auto p-0" align="end" side="bottom">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
            />
          </PopoverContent>
        </Popover>
      </div>
      {inputValue && (
        <div className="text-xs">
          {date ? (
            <span className="text-muted-foreground">
              {helpText ? `${helpText} ${formatDate(date)}` : `Fecha seleccionada: ${formatDate(date)}`}
            </span>
          ) : (
            <span className="text-destructive">
              No se pudo interpretar &ldquo;{inputValue}&rdquo;. Intenta con &ldquo;ayer&rdquo;, &ldquo;mañana&rdquo; o una fecha específica.
            </span>
          )}
        </div>
      )}
      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name="eventDate"
        value={formatDateForInput(date)}
      />
    </div>
  )
}