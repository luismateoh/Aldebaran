'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { searchMunicipalities, getMunicipalitiesByDepartment, getDepartmentByMunicipality } from '@/lib/colombia-municipalities'
import { ChevronDown, MapPin, X } from 'lucide-react'

interface MunicipalityAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onDepartmentChange?: (department: string) => void
  department?: string
  placeholder?: string
  required?: boolean
  label?: string
  id?: string
}

export function MunicipalityAutocomplete({
  value,
  onChange,
  onDepartmentChange,
  department,
  placeholder = "Escriba el nombre del municipio",
  required = false,
  label = "Municipio",
  id = "municipality"
}: MunicipalityAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [filteredMunicipalities, setFilteredMunicipalities] = useState<string[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Actualizar valor del input cuando cambie el prop value
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Filtrar municipios basado en el input y departamento
  useEffect(() => {
    if (inputValue.trim()) {
      let municipalities: string[]
      
      if (department) {
        // Si hay departamento seleccionado, buscar solo en ese departamento
        municipalities = getMunicipalitiesByDepartment(department).filter(municipality =>
          municipality.toLowerCase().includes(inputValue.toLowerCase())
        )
      } else {
        // Si no hay departamento, buscar en todos los municipios
        municipalities = searchMunicipalities(inputValue)
      }
      
      setFilteredMunicipalities(municipalities.slice(0, 10)) // Limitar a 10 resultados
    } else {
      if (department) {
        // Si no hay texto pero hay departamento, mostrar algunos municipios del departamento
        setFilteredMunicipalities(getMunicipalitiesByDepartment(department).slice(0, 10))
      } else {
        setFilteredMunicipalities([])
      }
    }
    setHighlightedIndex(-1)
  }, [inputValue, department])

  // Manejar click fuera del componente
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Manejar cambios en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
    setIsOpen(true)
  }

  // Manejar selección de municipio
  const handleMunicipalitySelect = (municipality: string) => {
    setInputValue(municipality)
    onChange(municipality)
    
    // Auto-completar departamento si se proporciona el callback
    if (onDepartmentChange) {
      const foundDepartment = getDepartmentByMunicipality(municipality)
      if (foundDepartment) {
        onDepartmentChange(foundDepartment)
      }
    }
    
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  // Manejar teclas
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' && filteredMunicipalities.length > 0) {
        setIsOpen(true)
        setHighlightedIndex(0)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < filteredMunicipalities.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && filteredMunicipalities[highlightedIndex]) {
          handleMunicipalitySelect(filteredMunicipalities[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        inputRef.current?.blur()
        break
      case 'Tab':
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  // Manejar focus del input
  const handleInputFocus = () => {
    if (filteredMunicipalities.length > 0 || department) {
      setIsOpen(true)
    }
  }

  // Limpiar input
  const handleClear = () => {
    setInputValue('')
    onChange('')
    setIsOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div className="space-y-2" ref={containerRef}>
      {label && (
        <Label htmlFor={id}>
          {label} {required && '*'}
        </Label>
      )}
      
      <div className="relative">
        <div className="relative">
          <Input
            ref={inputRef}
            id={id}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            required={required}
            className="pr-16"
            autoComplete="off"
          />
          
          <div className="absolute inset-y-0 right-0 flex items-center">
            {inputValue && (
              <button
                type="button"
                onClick={handleClear}
                className="mr-1 rounded-full p-1 hover:bg-gray-100"
                tabIndex={-1}
              >
                <X className="size-4 text-gray-400" />
              </button>
            )}
            
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-r-md p-2 hover:bg-gray-100"
              tabIndex={-1}
            >
              <ChevronDown className={`size-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Lista de municipios */}
        {isOpen && filteredMunicipalities.length > 0 && (
          <ul
            ref={listRef}
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
          >
            {filteredMunicipalities.map((municipality, index) => (
              <li
                key={municipality}
                className={`flex cursor-pointer items-center gap-2 px-3 py-2 ${
                  index === highlightedIndex 
                    ? 'bg-blue-50 text-blue-900' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleMunicipalitySelect(municipality)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <MapPin className="size-4 text-gray-400" />
                <span>{municipality}</span>
                {department && (
                  <span className="ml-auto text-xs text-gray-500">
                    {department}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Mensaje cuando no hay resultados */}
        {isOpen && inputValue.trim() && filteredMunicipalities.length === 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white p-3 shadow-lg">
            <p className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="size-4" />
              No se encontraron municipios
            </p>
          </div>
        )}
      </div>
      
      {department && (
        <p className="text-xs text-gray-500">
          Municipios de {department}
        </p>
      )}
    </div>
  )
}