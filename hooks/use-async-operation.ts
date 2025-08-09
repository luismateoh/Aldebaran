import { useState, useCallback } from 'react'

interface UseAsyncOperationOptions {
  onSuccess?: (result: any) => void
  onError?: (error: Error) => void
}

export function useAsyncOperation<T = any>(options: UseAsyncOperationOptions = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<T | null>(null)

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await asyncFn()
      setData(result)
      options.onSuccess?.(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred')
      setError(error)
      options.onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [options])

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setData(null)
  }, [])

  return {
    loading,
    error,
    data,
    execute,
    reset
  }
}