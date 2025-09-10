import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './globals.css'
import App from './App.jsx'
import { QueryProvider } from '@/providers/QueryProvider'
import { AuthProvider } from '@/hooks/useAuth'
import ErrorBoundary from '@/components/ErrorBoundary'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryProvider>
      <AuthProvider>
        <ErrorBoundary fallbackMessage="Erreur lors du chargement de l'application">
          <App />
        </ErrorBoundary>
      </AuthProvider>
    </QueryProvider>
  </StrictMode>,
)
