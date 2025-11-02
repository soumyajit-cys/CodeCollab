import React from 'react'

const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    extraLarge: 'w-16 h-16'
  }

  return (
    <div className={`loading-spinner ${sizeClasses[size]} ${className}`} />
  )
}

export default LoadingSpinner