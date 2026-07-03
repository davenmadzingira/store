import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded border border-ink-200 bg-paper px-3 py-2 text-sm text-ink-900',
        'placeholder:text-ink-300 focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded border border-ink-200 bg-paper px-3 py-2 text-sm text-ink-900',
        'placeholder:text-ink-300 focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal',
        className
      )}
      {...props}
    />
  )
)
Textarea.displayName = 'Textarea'

export const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn('mb-1.5 block text-sm font-medium text-ink-700', className)} {...props} />
)
