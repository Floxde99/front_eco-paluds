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
		// If body is FormData, don't let any transformRequest change it
		if (config.data instanceof FormData) {
			// ensure Content-Type is not manually set so browser sets boundary
			if (config.headers && config.headers['Content-Type']) {
				delete config.headers['Content-Type']
			}
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

	// Always clear local session on logout attempt
	if (typeof localStorage !== 'undefined') localStorage.removeItem('authToken')

		return { ok: true, status: res.status, data: res.data }
	} catch (err) {
	// Always clear local session even if server returns an error
	if (typeof localStorage !== 'undefined') localStorage.removeItem('authToken')

		// If server responded, return structured info; otherwise propagate network error
		if (err?.response) {
			const status = err.response.status
			const body = err.response.data
			return { ok: false, status, body }
		}

		// network / unexpected error - rethrow for caller to handle
		throw err
	}
}

// Confirmer l'email avec le token
export async function confirmEmail(token) {
	const res = await api.post('/confirm-email', { token })
	return res.data
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
	formData.append('avatar', file, file.name)

	console.log('📤 FormData créé:', formData.get('avatar'))

	try {
		// Use axios instance which already sets baseURL and withCredentials
		const res = await api.post('/user/avatar', formData, {
			headers: {
				// let the browser set Content-Type (multipart + boundary)
				// Authorization header is already injected by interceptor, but set here as fallback
				Authorization: localStorage.getItem('authToken') ? `Bearer ${localStorage.getItem('authToken')}` : undefined
			},
			maxBodyLength: Infinity,
			maxContentLength: Infinity,
		})

		return res.data
	} catch (err) {
		// Normalize axios error to match previous structured error shape
		const status = err?.response?.status
		const body = err?.response?.data
		console.error('❌ Erreur upload (axios):', status, body)
		const e = new Error(body?.message || err.message || `HTTP ${status || 'ERR'}`)
		e.status = status
		e.body = body
		throw e
	}
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

