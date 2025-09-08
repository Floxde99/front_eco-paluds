import axios from "axios";

// Utilisation des variables d'environnement Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.eco-paluds.fr";
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;

const api = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
	timeout: parseInt(API_TIMEOUT),
});

// Add request interceptor to include auth token
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('authToken')
		if (token && config.url !== '/logout') {
			// Don't send Authorization header for logout since it uses cookies
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	},
	(error) => {
		return Promise.reject(error)
	}
)

// Centralized API helpers
export async function registerUser(payload) {
	// payload expected to match backend (firstName, lastName, email, password, confirmPassword, ...)
	const res = await api.post('/addUser', payload)
	return res.data
}

export async function loginUser({ email, password }) {
	const res = await api.post('/login', { email, password })
	return res.data
}

export async function logoutUser() {
	try {
		// Your backend logout expects refreshToken from cookies, not Authorization header
		// Since withCredentials: true is set, cookies will be sent automatically
		const res = await api.post('/logout')
		return res.data
	} catch (err) {
		// Handle various logout errors gracefully
		if (err?.response?.status === 500 || err?.response?.status === 401 || err?.response?.status === 403) {
			// If server error, no token, or forbidden - treat as successful logout
			// The user wants to logout anyway, so clear their session locally
			return { message: 'Déconnecté localement' }
		}
		// Re-throw other errors
		throw err
	}
}

// Profile & User API functions
export async function getCurrentUser() {
	const res = await api.get('/user/profile')
	return res.data
}

export async function updateUserProfile(profileData) {
	const res = await api.put('/user/profile', profileData)
	return res.data
}

export async function uploadAvatar(file) {
	console.log('📤 Upload avatar - fichier:', file)
	const formData = new FormData()
	// Important: inclure le nom de fichier pour certains middlewares multer/busboy
	formData.append('avatar', file, file.name)
	
	// Vérification debug
	console.log('📤 FormData créé:', formData.get('avatar'))
	
	// Utiliser fetch au lieu d'axios pour éviter les problèmes de transformation
	const token = localStorage.getItem('authToken')
	const response = await fetch(`${API_BASE_URL}/user/avatar`, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${token}`,
			// Pas de Content-Type - le navigateur l'ajoutera automatiquement avec boundary
		},
		credentials: 'include',
		body: formData
	})
	
	if (!response.ok) {
		const errorText = await response.text()
		console.error('❌ Erreur upload:', response.status, errorText)
		throw new Error(`HTTP ${response.status}: ${errorText}`)
	}
	
	const data = await response.json()
	return data
}

export async function getProfileCompletion() {
	const res = await api.get('/user/completion')
	return res.data
}

export async function getDashboardStats() {
	const res = await api.get('/dashboard/stats')
	return res.data
}

export async function getUserCompanies() {
	const res = await api.get('/user/companies')
	return res.data
}

export default api;

