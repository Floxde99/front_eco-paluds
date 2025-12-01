/**
 * Centralized logging service
 * 
 * Usage:
 *   import { logger } from '@/lib/logger'
 *   logger.debug('Debug info', data)
 *   logger.info('Info message')
 *   logger.warn('Warning message')
 *   logger.error('Error occurred', error)
 */

const isDevelopment = import.meta.env.DEV

class Logger {
  /**
   * Debug logs - only shown in development
   * Use for detailed debugging information
   */
  debug(...args) {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args)
    }
  }

  /**
   * Info logs - only shown in development
   * Use for general information
   */
  info(...args) {
    if (isDevelopment) {
      console.info('[INFO]', ...args)
    }
  }

  /**
   * Warning logs - shown in all environments
   * Use for non-critical issues
   */
  warn(...args) {
    console.warn('[WARN]', ...args)
  }

  /**
   * Error logs - shown in all environments
   * Use for errors and exceptions
   * In production, these should be sent to an error tracking service
   */
  error(...args) {
    console.error('[ERROR]', ...args)
    
    // TODO: In production, send to error tracking service (e.g., Sentry)
    // if (!isDevelopment) {
    //   Sentry.captureException(args[0])
    // }
  }

  /**
   * API request logs - only shown in development
   * Use for logging API requests and responses
   */
  api(method, url, data) {
    if (isDevelopment) {
      const emoji = method === 'GET' ? '📥' : '📤'
      console.log(`${emoji} [API] ${method} ${url}`, data || '')
    }
  }
}

export const logger = new Logger()
