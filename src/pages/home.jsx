import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { logoutUser } from '@/services/Api'
import { useNavigate } from 'react-router-dom'

export default function Home() {
	const navigate = useNavigate()

	// Exemple d'utilisation des variables d'environnement
	const appName = import.meta.env.VITE_APP_NAME || 'EcoPaluds'
	const apiUrl = import.meta.env.VITE_API_BASE_URL || 'localhost'
	const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0'

	const handleLogout = async () => {
		try {
			await logoutUser()
			// Clear local token
			localStorage.removeItem('authToken')
			toast.success('Déconnexion réussie')
			// Navigate to login page
			navigate('/login')
		} catch (err) {
			console.error('Logout error', err)
			
			// Always allow user to logout locally even if server fails
			localStorage.removeItem('authToken')
			
			// Show appropriate message based on error
			if (err?.response?.status >= 500) {
				toast.info('Déconnecté localement (erreur serveur)')
			} else if (err?.response?.status === 401 || err?.response?.status === 403) {
				toast.info('Session expirée, redirection vers la connexion')
			} else {
				toast.info('Déconnecté localement')
			}
			
			// Always redirect to login
			navigate('/login')
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-slate-50">
			<div className="w-full max-w-2xl px-4">
				<Card>
					<CardHeader>
						<CardTitle>{appName} - Bienvenue</CardTitle>
						<CardDescription>Tableau de bord (v{appVersion})</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="mb-4">Vous êtes connecté. Utilisez le bouton ci-dessous pour vous déconnecter.</p>
						<p className="text-sm text-gray-500 mb-4">API: {apiUrl}</p>
						<div className="flex gap-2">
							<Button variant="default" onClick={() => navigate('/profile')}>Mon profil</Button>
							<Button variant="destructive" onClick={handleLogout}>Se déconnecter</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}

