import { useState, useEffect, useCallback } from 'react'

interface ImageOptimizationStatus {
  isOptimizing: boolean
  isOptimized: boolean
  optimizedUrl: string | null
  error: string | null
  queuePosition: number | null
  estimatedTime: number | null
}

interface UseImageOptimizationOptions {
  autoOptimize?: boolean
  priority?: boolean
  pollInterval?: number
}

export function useImageOptimization(
  imageUrl: string | null,
  eventId: string,
  options: UseImageOptimizationOptions = {}
) {
  const {
    autoOptimize = true,
    priority = false,
    pollInterval = 3000
  } = options

  const [status, setStatus] = useState<ImageOptimizationStatus>({
    isOptimizing: false,
    isOptimized: false,
    optimizedUrl: null,
    error: null,
    queuePosition: null,
    estimatedTime: null
  })

  // Función para verificar el estado actual
  const checkStatus = useCallback(async () => {
    if (!eventId) return

    try {
      const response = await fetch(`/api/image-queue?eventId=${eventId}`)
      const data = await response.json()

      setStatus(prev => ({
        ...prev,
        isOptimizing: data.inQueue && !data.optimized,
        isOptimized: data.optimized,
        optimizedUrl: data.optimizedUrl || null,
        queuePosition: data.queuePosition,
        error: null
      }))

      return data.optimized
    } catch (error) {
      console.error('Error verificando estado de imagen:', error)
      setStatus(prev => ({
        ...prev,
        error: 'Error verificando estado'
      }))
      return false
    }
  }, [eventId])

  // Función para iniciar optimización
  const startOptimization = useCallback(async (url: string) => {
    if (!url || !eventId) return

    try {
      setStatus(prev => ({
        ...prev,
        isOptimizing: true,
        error: null
      }))

      const response = await fetch('/api/image-queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventId,
          imageUrl: url,
          priority
        })
      })

      const data = await response.json()

      if (data.success) {
        setStatus(prev => ({
          ...prev,
          queuePosition: data.queuePosition,
          estimatedTime: data.estimatedTime,
          optimizedUrl: data.optimizedUrl || null,
          isOptimized: !!data.optimizedUrl
        }))
      } else {
        throw new Error(data.error || 'Error iniciando optimización')
      }
    } catch (error) {
      console.error('Error iniciando optimización:', error)
      setStatus(prev => ({
        ...prev,
        isOptimizing: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }))
    }
  }, [eventId, priority])

  // Efecto para verificar estado inicial y auto-optimizar
  useEffect(() => {
    if (!imageUrl || !eventId) return

    let mounted = true

    const initializeOptimization = async () => {
      // Primero verificar si ya está optimizada
      const isOptimized = await checkStatus()
      
      if (!mounted) return

      // Si no está optimizada y auto-optimizar está habilitado, iniciar
      if (!isOptimized && autoOptimize) {
        await startOptimization(imageUrl)
      }
    }

    initializeOptimization()

    return () => {
      mounted = false
    }
  }, [imageUrl, eventId, autoOptimize, checkStatus, startOptimization])

  // Efecto para polling mientras se está optimizando
  useEffect(() => {
    if (!status.isOptimizing) return

    const interval = setInterval(checkStatus, pollInterval)

    return () => clearInterval(interval)
  }, [status.isOptimizing, pollInterval, checkStatus])

  // Función manual para reoptimizar
  const reoptimize = useCallback(() => {
    if (imageUrl) {
      startOptimization(imageUrl)
    }
  }, [imageUrl, startOptimization])

  // Función para obtener la mejor URL disponible
  const getBestImageUrl = useCallback(() => {
    if (status.optimizedUrl) return status.optimizedUrl
    return imageUrl
  }, [status.optimizedUrl, imageUrl])

  return {
    ...status,
    checkStatus,
    reoptimize,
    getBestImageUrl,
    startOptimization
  }
}