import { cn } from '@/lib/utils'
import { CSS_CLASSES } from '@/lib/constants'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

const sizeClasses = {
  sm: 'size-4',
  md: 'size-6', 
  lg: 'size-8'
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <div 
        className={cn(
          'animate-spin rounded-full border-2 border-current border-t-transparent',
          sizeClasses[size]
        )}
      />
      {text && (
        <span className="text-sm text-muted-foreground">{text}</span>
      )}
    </div>
  )
}

export function LoadingCard({ children }: { children?: React.ReactNode }) {
  return (
    <div className={cn(CSS_CLASSES.CARD, 'flex items-center justify-center p-8')}>
      <LoadingSpinner size="lg" text="Cargando..." />
      {children}
    </div>
  )
}

export function LoadingPage({ text = "Cargando página..." }: { text?: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}