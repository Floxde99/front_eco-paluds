import axios from "axios";

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
			config.headers.Authorization = `Bearer ${token}`
		}
		if (config.data instanceof FormData) {
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
	const res = await api.post('/addUser', payload)
	return res.data
}

export async function loginUser({ email, password }) {
	const res = await api.post('/login', { email, password })
	return res.data
}

export async function logoutUser() {
	try {
		const res = await api.post('/logout')

	if (typeof localStorage !== 'undefined') localStorage.removeItem('authToken')

		return { ok: true, status: res.status, data: res.data }
	} catch (err) {
	if (typeof localStorage !== 'undefined') localStorage.removeItem('authToken')

		if (err?.response) {
			const status = err.response.status
			const body = err.response.data
			return { ok: false, status, body }
		}

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
	const formData = new FormData()
	formData.append('avatar', file, file.name)

	try {
		const res = await api.post('/user/avatar', formData, {
			headers: {
				Authorization: localStorage.getItem('authToken') ? `Bearer ${localStorage.getItem('authToken')}` : undefined
			},
			maxBodyLength: Infinity,
			maxContentLength: Infinity,
		})

		return res.data
	} catch (err) {
		const status = err?.response?.status
		const body = err?.response?.data
		const e = new Error(body?.message || err.message || `HTTP ${status || 'ERR'}`)
		e.status = status
		e.body = body
		throw e
	}
}

export async function deleteAvatar() {
	try {
		const res = await api.delete('/user/avatar')
		return res.data
	} catch (err) {
		if (err?.response?.status === 404) {
			return { message: 'Aucun avatar à supprimer' }
		}
		throw err
	}
}

export async function getAvatar() {
	try {
		const res = await api.get('/user/avatar', {
			responseType: 'blob',
			timeout: 30000,
		})
		return res.data
	} catch (err) {
		const status = err?.response?.status
		const body = err?.response?.data
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

export * from './CompanyProfileApi.js'

export default api;

