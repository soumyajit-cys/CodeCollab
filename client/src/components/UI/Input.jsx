import React, { forwardRef } from 'react'

const Input = forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const baseClasses = 'input w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors'
  
  const stateClasses = {
    normal: 'border-gray-300 focus:ring-primary-500',
    error: 'border-red-500 focus:ring-red-500'
  }
  
  const classes = [
    baseClasses,
    error ? stateClasses.error : stateClasses.normal,
    Icon ? 'pl-10' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          className={classes}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input