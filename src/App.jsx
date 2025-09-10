import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { Toaster } from '@/components/ui/sonner'
import LoginPage from '@/pages/login'
import Home from '@/pages/home'
import ConfirmEmail from '@/pages/ConfirmEmail'
import RequireAuth from '@/components/protected-route'
import { AuthProvider } from '@/hooks/useAuth'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/confirm-email" element={<ConfirmEmail />} />
          <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
