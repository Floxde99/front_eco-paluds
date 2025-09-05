import axios from "axios";

const api = axios.create({
	baseURL: "http://localhost:3069",
	withCredentials: true,
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

export default api;

