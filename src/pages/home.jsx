import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ProfileCard, SuggestionsCard, NetworkCard, ActivityCard } from '@/components/DashboardCards'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    )
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  const getFirstName = () => {
    return user?.firstName || 'Utilisateur'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="flex-1">
        <main className="px-6 py-8 max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {getGreeting()} {getFirstName()} !
            </h2>
            <p className="text-slate-600">Voici un aperçu de votre activité sur Ecopaluds</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <ProfileCard />
            <SuggestionsCard />
            <NetworkCard />
            <ActivityCard />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Accès rapide</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link to="/profile">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <div className="w-6 h-6 text-blue-600">🏢</div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-1">Ma fiche entreprise</h4>
                        <p className="text-sm text-slate-600">Gérer productions, besoins et déchets</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/annuaire">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <div className="w-6 h-6 text-emerald-600">🔍</div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-1">Rechercher des partenaires</h4>
                        <p className="text-sm text-slate-600">Explorer l'annuaire et la carte</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/annuaire?view=map">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <div className="w-6 h-6 text-blue-600">🗺️</div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-1">Carte interactive</h4>
                        <p className="text-sm text-slate-600">Visualiser les entreprises proches</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
