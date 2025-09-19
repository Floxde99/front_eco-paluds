import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { logoutUser } from '@/services/Api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ProfileCard, SuggestionsCard, NetworkCard, ActivityCard } from '@/components/DashboardCards'

export default function Home() {
	const navigate = useNavigate()
	const { user, logout, loading } = useAuth()

	// Si on est en cours de chargement, afficher un loader
	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-gray-600">Chargement...</p>
				</div>
			</div>
		)
	}

	const handleLogout = async () => {
		try {
			const res = await logoutUser()
			// clear local auth context regardless
			logout()

			if (res?.ok) {
				toast.success('Déconnexion réussie côté serveur')
			} else if (res?.status === 401 || res?.status === 403) {
				toast.info('Session déjà expirée côté serveur — déconnecté localement')
			} else if (res?.status >= 500) {
				toast.info('Déconnecté localement (erreur serveur lors de la révocation)')
			} else {
				toast.info('Déconnecté localement')
			}

			navigate('/login')
		} catch (err) {
			// Network or unexpected error — still clear local session
			console.error('Logout error', err)
			logout()
			toast.info('Déconnecté localement')
			navigate('/login')
		}
	}

	const getGreeting = () => {
		const hour = new Date().getHours()
		if (hour < 12) return 'Bonjour'
		if (hour < 18) return 'Bon après-midi'
		return 'Bonsoir'
	}

	const getFirstName = () => {
		// Utiliser le bon champ depuis le backend (firstName avec F majuscule)
		return user?.firstName || 'Utilisateur'
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Main Content */}
			<main className="px-6 py-8">
				{/* Welcome Section */}
				<div className="mb-8">
					<h2 className="text-3xl font-bold text-gray-900 mb-2">
						{getGreeting()} {getFirstName()} !
					</h2>
					<p className="text-gray-600">Voici un aperçu de votre activité sur EcoConnect</p>
				</div>

				{/* Dashboard Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
					<ProfileCard />
					<SuggestionsCard />
					<NetworkCard />
					<ActivityCard />
				</div>

				{/* Quick Access Section */}
				<div>
					<h3 className="text-xl font-semibold text-gray-900 mb-4">Accès rapide</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{/* Ma fiche entreprise */}
						<Card className="cursor-pointer hover:shadow-md transition-shadow">
							<CardContent className="p-6">
								<div className="flex items-start space-x-4">
									<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
										<div className="w-6 h-6 text-blue-600">🏢</div>
									</div>
									<div className="flex-1">
										<h4 className="font-semibold text-gray-900 mb-1">Ma fiche entreprise</h4>
										<p className="text-sm text-gray-600">Gérer productions, besoins et déchets</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Rechercher des partenaires */}
						<Card className="cursor-pointer hover:shadow-md transition-shadow">
							<CardContent className="p-6">
								<div className="flex items-start space-x-4">
									<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
										<div className="w-6 h-6 text-green-600">🔍</div>
									</div>
									<div className="flex-1">
										<h4 className="font-semibold text-gray-900 mb-1">Rechercher des partenaires</h4>
										<p className="text-sm text-gray-600">Explorer l'annuaire et la carte</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Carte interactive */}
						<Card className="cursor-pointer hover:shadow-md transition-shadow">
							<CardContent className="p-6">
								<div className="flex items-start space-x-4">
									<div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
										<div className="w-6 h-6 text-orange-600">🗺️</div>
									</div>
									<div className="flex-1">
										<h4 className="font-semibold text-gray-900 mb-1">Carte interactive</h4>
										<p className="text-sm text-gray-600">Visualiser les entreprises proches</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Hidden logout button for functionality */}
				<div className="fixed bottom-4 right-4">
					<Button 
						variant="outline" 
						size="sm"
						onClick={handleLogout}
						className="bg-white shadow-lg"
					>
						Se déconnecter
					</Button>
				</div>
			</main>
		</div>
	)
}

