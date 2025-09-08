import React from 'react'

export function ProgressBar({ percentage = 0, loading = false, className = '' }) {
  // Clamp percentage between 0 and 100
  const clampedPercentage = Math.max(0, Math.min(100, percentage))
  
  if (loading) {
    return (
      <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
        <div className="bg-gray-300 h-2 rounded-full animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${clampedPercentage}%` }}
      ></div>
    </div>
  )
}
