import { forwardRef } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CSS_CLASSES } from '@/lib/constants'
import type { LucideIcon } from 'lucide-react'

export interface ActionButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  icon?: LucideIcon
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  className?: string
  compact?: boolean
  iconSize?: 'sm' | 'md' | 'lg'
}

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ 
    variant = 'outline',
    size = 'sm',
    icon: Icon,
    children,
    onClick,
    disabled = false,
    loading = false,
    className,
    compact = false,
    iconSize = 'md',
    ...props
  }, ref) => {
    const iconSizeClass = CSS_CLASSES.ICON_SIZE[iconSize.toUpperCase() as keyof typeof CSS_CLASSES.ICON_SIZE]
    
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        onClick={onClick}
        disabled={disabled || loading}
        className={cn(
          CSS_CLASSES.BUTTON_ACTION,
          compact && CSS_CLASSES.BUTTON_COMPACT,
          className
        )}
        {...props}
      >
        {loading ? (
          <div className={cn('animate-spin rounded-full border-2 border-current border-t-transparent', iconSizeClass)} />
        ) : Icon ? (
          <Icon className={iconSizeClass} />
        ) : null}
        <span className={compact ? 'text-xs' : 'text-sm'}>
          {children}
        </span>
      </Button>
    )
  }
)

ActionButton.displayName = 'ActionButton'