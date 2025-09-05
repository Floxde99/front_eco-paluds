import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { logoutUser } from '@/services/Api'
import { useNavigate } from 'react-router-dom'

export default function Home() {
	const navigate = useNavigate()
	const [currentTime, setCurrentTime] = useState(new Date())
	const [userName] = useState(() => {
		// Simuler un nom d'utilisateur depuis le localStorage ou autre
		return localStorage.getItem('userName') || 'Utilisateur'
	})

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date())
		}, 1000)
		return () => clearInterval(timer)
	}, [])

	const handleLogout = async () => {
		try {
			await logoutUser()
			localStorage.removeItem('authToken')
			toast.success('Déconnexion réussie')
			navigate('/login')
		} catch (err) {
			console.error('Logout error', err)
			localStorage.removeItem('authToken')
			
			if (err?.response?.status >= 500) {
				toast.info('Déconnecté localement (erreur serveur)')
			} else if (err?.response?.status === 401 || err?.response?.status === 403) {
				toast.info('Session expirée, redirection vers la connexion')
			} else {
				toast.info('Déconnecté localement')
			}
			
			navigate('/login')
		}
	}

	const getGreeting = () => {
		const hour = currentTime.getHours()
		if (hour < 12) return 'Bonjour'
		if (hour < 18) return 'Bon après-midi'
		return 'Bonsoir'
	}

	const features = [
		{
			icon: '📊',
			title: 'Analytics',
			description: 'Suivez vos performances en temps réel',
			action: () => toast.info('Module Analytics bientôt disponible')
		},
		{
			icon: '🛡️',
			title: 'Sécurité',
			description: 'Gérez la sécurité de votre compte',
			action: () => toast.info('Paramètres de sécurité')
		},
		{
			icon: '📱',
			title: 'Mobile',
			description: 'Application mobile disponible',
			action: () => toast.info('Téléchargez notre app mobile')
		},
		{
			icon: '🎨',
			title: 'Personnalisation',
			description: 'Customisez votre expérience',
			action: () => toast.info('Thèmes et préférences')
		}
	]

	const quickActions = [
		{ label: 'Nouveau projet', icon: '➕', variant: 'default' },
		{ label: 'Parcourir', icon: '🔍', variant: 'outline' },
		{ label: 'Aide', icon: '❓', variant: 'ghost' }
	]

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
			{/* Header */}
			<header className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
								EcoPaluds
							</h1>
							<p className="text-sm text-gray-600">
								{getGreeting()}, {userName} 👋
							</p>
						</div>
						<div className="flex items-center gap-4">
							<div className="text-right">
								<p className="text-sm text-gray-600">
									{currentTime.toLocaleDateString('fr-FR', { 
										weekday: 'long', 
										year: 'numeric', 
										month: 'long', 
										day: 'numeric' 
									})}
								</p>
								<p className="text-xs text-gray-500">
									{currentTime.toLocaleTimeString('fr-FR')}
								</p>
							</div>
							<Button variant="outline" size="sm" onClick={handleLogout}>
								Se déconnecter
							</Button>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Welcome Section */}
				<div className="mb-8">
					<Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white">
						<CardContent className="p-8">
							<div className="flex items-center justify-between">
								<div>
									<h2 className="text-3xl font-bold mb-2">
										Bienvenue sur votre tableau de bord !
									</h2>
									<p className="text-blue-100 text-lg">
										Découvrez toutes les fonctionnalités à votre disposition
									</p>
								</div>
								<div className="text-6xl opacity-20">
									🌟
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Quick Actions */}
				<div className="mb-8">
					<h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
					<div className="flex gap-3 flex-wrap">
						{quickActions.map((action, index) => (
							<Button 
								key={index}
								variant={action.variant}
								className="flex items-center gap-2"
								onClick={() => toast.info(`${action.label} - Bientôt disponible`)}
							>
								<span>{action.icon}</span>
								{action.label}
							</Button>
						))}
					</div>
				</div>

				{/* Features Grid */}
				<div className="mb-8">
					<h3 className="text-lg font-semibold mb-4">Fonctionnalités</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{features.map((feature, index) => (
							<Card 
								key={index} 
								className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-0 shadow-md"
								onClick={feature.action}
							>
								<CardContent className="p-6 text-center">
									<div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
										{feature.icon}
									</div>
									<h4 className="font-semibold mb-2">{feature.title}</h4>
									<p className="text-sm text-gray-600">{feature.description}</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>

				{/* Stats Section */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<Card className="border-0 shadow-md">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600">Projets actifs</p>
									<p className="text-2xl font-bold text-green-600">12</p>
								</div>
								<div className="text-2xl">📈</div>
							</div>
						</CardContent>
					</Card>
					
					<Card className="border-0 shadow-md">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600">Tâches complétées</p>
									<p className="text-2xl font-bold text-blue-600">87%</p>
								</div>
								<div className="text-2xl">✅</div>
							</div>
						</CardContent>
					</Card>
					
					<Card className="border-0 shadow-md">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600">Temps économisé</p>
									<p className="text-2xl font-bold text-purple-600">2.5h</p>
								</div>
								<div className="text-2xl">⏰</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Recent Activity */}
				<Card className="border-0 shadow-md">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<span>📋</span>
							Activité récente
						</CardTitle>
						<CardDescription>
							Vos dernières actions sur la plateforme
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{[
								{ action: 'Connexion réussie', time: 'Il y a 2 minutes', icon: '🔐' },
								{ action: 'Projet "EcoPaluds" mis à jour', time: 'Il y a 1 heure', icon: '📝' },
								{ action: 'Nouveau message reçu', time: 'Il y a 3 heures', icon: '💬' },
								{ action: 'Sauvegarde automatique', time: 'Il y a 5 heures', icon: '💾' }
							].map((activity, index) => (
								<div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
									<span className="text-xl">{activity.icon}</span>
									<div className="flex-1">
										<p className="font-medium">{activity.action}</p>
										<p className="text-sm text-gray-600">{activity.time}</p>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</main>
		</div>
	)
}

