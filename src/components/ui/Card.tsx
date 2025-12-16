import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'solid'
}

const variants = {
  default: 'bg-primary-900/50 backdrop-blur-sm border border-primary-800',
  glass: 'bg-white/5 backdrop-blur-md border border-white/10',
  solid: 'bg-primary-900 border border-primary-700',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-xl p-6 ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

