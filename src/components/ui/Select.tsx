import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, id, children, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={`w-full px-4 py-2.5 bg-primary-900 border rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer ${
            error ? 'border-red-500' : 'border-primary-700'
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

