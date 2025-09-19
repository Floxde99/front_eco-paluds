import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { Toaster } from '@/components/ui/sonner'
import LoginPage from '@/pages/login'
import Home from '@/pages/home'
import Landing from '@/pages/landing'
import ConfirmEmail from '@/pages/ConfirmEmail'
import MentionsLegales from '@/pages/legal/MentionsLegales'
import PolitiqueConfidentialite from '@/pages/legal/PolitiqueConfidentialite'
import CGU from '@/pages/legal/CGU'
import RequireAuth from '@/components/protected-route'
import Footer from '@/partials/Footer'
import Navbar from '@/partials/Navbar'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Navbar />
      <div className="min-h-screen flex flex-col bg-white">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/confirm-email" element={<ConfirmEmail />} />
            <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
            <Route path="/cgu" element={<CGU />} />
            {/* Fallback: rediriger vers la landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
