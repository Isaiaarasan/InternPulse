import { cn } from '../../utils/cn'
import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  prefixIcon?: React.ReactNode
  suffixIcon?: React.ReactNode
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefixIcon, suffixIcon, hint, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-primaryText opacity-80">
            {label}
          </label>
        )}
        <div className="relative">
          {prefixIcon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-60">
              {prefixIcon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              'input-base',
              prefixIcon && 'pl-11',
              suffixIcon && 'pr-11',
              error && '!border-red-500/50 !ring-red-500/20',
              className
            )}
            {...props}
          />
          {suffixIcon && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary opacity-60">
              {suffixIcon}
            </span>
          )}
        </div>
        {hint && !error && <p className="text-xs text-muted opacity-60">{hint}</p>}
        {error && (
          <p className="text-xs flex items-center gap-1" style={{ color: '#EF233C' }}>
            <span>⚠</span> {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
