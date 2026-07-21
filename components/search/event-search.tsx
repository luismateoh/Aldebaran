"use client"

import * as React from "react"
import { Search, X, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"

export interface EventSearchProps {
  /** Valor controlado del input */
  value?: string
  /** Callback al presionar Enter o seleccionar una sugerencia */
  onSearch: (query: string) => void
  /** Callback en cada cambio del input */
  onChange?: (query: string) => void
  /** Placeholder del input */
  placeholder?: string
  /** Muestra spinner de carga */
  loading?: boolean
  /** Lista de sugerencias para el dropdown de autocomplete */
  suggestions?: string[]
  /** Clases adicionales */
  className?: string
}

/**
 * EventSearch — Barra de búsqueda prominente con autocomplete.
 *
 * - Input grande con border-radius 18px
 * - Icono de búsqueda (Lucide Search) a la izquierda
 * - Botón de limpiar (X) cuando hay texto
 * - Spinner de carga cuando `loading` es true
 * - Dropdown animado de sugerencias de autocomplete
 * - Fondo `bg-surface`, borde `border-border`, sombra suave
 */
export function EventSearch({
  value = "",
  onSearch,
  onChange,
  placeholder = "Buscar carreras, lugares, distancias...",
  loading = false,
  suggestions = [],
  className,
}: EventSearchProps) {
  const [inputValue, setInputValue] = React.useState(value)
  const [isFocused, setIsFocused] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Sincronizar con prop controlada
  React.useEffect(() => {
    setInputValue(value)
  }, [value])

  // Cerrar dropdown al hacer clic fuera
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange?.(newValue)
  }

  const handleClear = () => {
    setInputValue("")
    onChange?.("")
    onSearch("")
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch(inputValue)
      setIsFocused(false)
    }
    if (e.key === "Escape") {
      setIsFocused(false)
      inputRef.current?.blur()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    onChange?.(suggestion)
    onSearch(suggestion)
    setIsFocused(false)
  }

  // Filtrar sugerencias según lo que el usuario escribe
  const filteredSuggestions = React.useMemo(() => {
    if (!inputValue.trim()) return suggestions
    const query = inputValue.toLowerCase().trim()
    return suggestions.filter((s) =>
      s.toLowerCase().includes(query)
    )
  }, [inputValue, suggestions])

  const showSuggestions =
    isFocused && filteredSuggestions.length > 0 && !loading

  // Separar sugerencia activa para resaltado
  const [activeIndex, setActiveIndex] = React.useState(-1)

  const handleKeyDownWithNav = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      )
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      )
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault()
      handleSuggestionClick(filteredSuggestions[activeIndex])
    } else {
      setActiveIndex(-1)
    }
    handleKeyDown(e)
  }

  // Resaltar texto coincidente en sugerencias
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    const parts = text.split(regex)
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-primary/20 text-foreground rounded-sm px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Input wrapper */}
      <div
        className={cn(
          "relative flex items-center rounded-[18px] border bg-surface px-4 py-2.5 transition-all duration-200 ease-out",
          "shadow-sm hover:shadow-md",
          isFocused
            ? "border-primary ring-1 ring-primary shadow-md"
            : "border-border",
        )}
      >
        {/* Icono de búsqueda */}
        <Search
          className={cn(
            "size-5 shrink-0 transition-colors duration-200",
            isFocused ? "text-primary" : "text-muted-foreground",
          )}
        />

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDownWithNav}
          placeholder={placeholder}
          aria-label="Buscar eventos"
          autoComplete="off"
          className={cn(
            "ml-3 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/70",
            "md:text-base",
          )}
        />

        {/* Loading spinner o botón de limpiar */}
        <div className="ml-2 flex items-center gap-1">
          {loading ? (
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          ) : inputValue ? (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                "flex items-center justify-center rounded-full p-1",
                "text-muted-foreground hover:text-foreground hover:bg-surface-hover",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              )}
              aria-label="Limpiar búsqueda"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Dropdown de sugerencias con Framer Motion */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.ul
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border bg-surface py-1 shadow-xl",
              "border-border",
            )}
            role="listbox"
            aria-label="Sugerencias de búsqueda"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <motion.li
                key={suggestion}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-100",
                  "text-foreground",
                  index === activeIndex
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-surface-hover",
                )}
                role="option"
                aria-selected={index === activeIndex}
              >
                <Search className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">
                  {highlightMatch(suggestion, inputValue)}
                </span>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
