// Re-exports for compatibility.
// Some imports target `useAuth` (no extension). The real implementation lives in `useAuth.jsx`.
export { AuthProvider } from './useAuth.jsx'
export * from './useAuth.jsx'

// Default export for convenience (if any module imports default)
import { AuthProvider as _AuthProvider } from './useAuth.jsx'
export default _AuthProvider
