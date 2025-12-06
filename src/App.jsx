import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { Toaster } from '@/components/ui/sonner'
import PageLoader from '@/components/PageLoader'
import RequireAuth from '@/components/protected-route'
import Footer from '@/partials/Footer'
import Navbar from '@/partials/Navbar'

// Eager load: Landing page (critical for FCP)
import Landing from '@/pages/landing'

// Lazy load: All other pages for better initial load performance
const LoginPage = lazy(() => import('@/pages/login'))
const Home = lazy(() => import('@/pages/home'))
const ConfirmEmail = lazy(() => import('@/pages/ConfirmEmail'))
const CompanyProfile = lazy(() => import('@/pages/CompanyProfile'))
const DirectoryPage = lazy(() => import('@/pages/directory'))
const SubscriptionPage = lazy(() => import('@/pages/subscription'))
const SuggestionsPage = lazy(() => import('@/pages/suggestions'))
const ImportPage = lazy(() => import('@/pages/import'))
const AssistantSupportPage = lazy(() => import('@/pages/assistant'))
const ContactsPage = lazy(() => import('@/pages/contacts'))
const AdminDashboardPage = lazy(() => import('@/pages/admin'))
const CompanyPublicProfilePage = lazy(() => import('@/pages/company-public'))
const CompanyMessagesPage = lazy(() => import('@/pages/company-messages'))
const MentionsLegales = lazy(() => import('@/pages/legal/MentionsLegales'))
const PolitiqueConfidentialite = lazy(() => import('@/pages/legal/PolitiqueConfidentialite'))
const CGU = lazy(() => import('@/pages/legal/CGU'))

export default function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Navbar />
      <div className="min-h-screen flex flex-col bg-transparent">
        <div className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/confirm-email" element={<ConfirmEmail />} />
              <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
              <Route path="/annuaire" element={<RequireAuth><DirectoryPage /></RequireAuth>} />
              <Route path="/profile" element={<RequireAuth><CompanyProfile /></RequireAuth>} />
              <Route path="/companies/:companyId" element={<RequireAuth><CompanyPublicProfilePage /></RequireAuth>} />
              <Route path="/suggestions" element={<RequireAuth><SuggestionsPage /></RequireAuth>} />
              <Route path="/import-ia" element={<RequireAuth><ImportPage /></RequireAuth>} />
              <Route path="/assistant" element={<RequireAuth><AssistantSupportPage /></RequireAuth>} />
              <Route path="/abonnement" element={<RequireAuth><SubscriptionPage /></RequireAuth>} />
              <Route path="/contacts" element={<RequireAuth><ContactsPage /></RequireAuth>} />
              <Route path="/contacts/messages" element={<RequireAuth><CompanyMessagesPage /></RequireAuth>} />
              <Route path="/admin" element={<RequireAuth><AdminDashboardPage /></RequireAuth>} />
              <Route path="/mentions-legales" element={<MentionsLegales />} />
              <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
              <Route path="/cgu" element={<CGU />} />
              {/* Fallback: rediriger vers la landing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
