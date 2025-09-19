import React from 'react'
import { useAvatar } from '@/hooks/useAvatar'

export function Avatar({ size = 'md', showName = false, className = '' }) {
  const { avatarBlobUrl, avatarLoading, getInitials, getDisplayName } = useAvatar()

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden`}>
        {avatarLoading ? (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : avatarBlobUrl ? (
          <img
            src={avatarBlobUrl}
            alt={getDisplayName()}
            className="w-full h-full object-cover"
            onError={() => {}}
          />
        ) : (
          <div className="w-full h-full bg-blue-500 flex items-center justify-center">
            <span className={`text-white font-medium ${textSizeClasses[size]}`}>
              {getInitials()}
            </span>
          </div>
        )}
      </div>
      
      {showName && (
        <span className={`font-medium text-gray-700 ${textSizeClasses[size]}`}>
          {getDisplayName()}
        </span>
      )}
    </div>
  )
}