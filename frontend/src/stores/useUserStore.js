import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

// User Store
export const useUserStore = create((set, get) => ({
	user: null,
	loading: false,
	checkingAuth: true,

	// Auth Methods
	signup: async ({ name, email, password, confirmPassword }) => {
		// Start loading
		set({ loading: true });

		// Basic validation
		if (password !== confirmPassword) {
			set({ loading: false });
			return toast.error("Passwords do not match");
		}

		try {
			// Signup user on the server
			const res = await axios.post("/auth/signup", { name, email, password });
			// Update user in the store
			set({ user: res.data, loading: false });

		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.message || "An error occurred");
		}
	},
	// Auth Methods
	login: async (email, password) => {
		// Start loading
		set({ loading: true });

		try {
			// Login user on the server
			const res = await axios.post("/auth/login", { email, password });

			// Update user in the store
			set({ user: res.data, loading: false });

		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.message || "An error occurred");
		}
	},

	// Auth Methods
	logout: async () => {
		try {
			// Logout user on the server
			await axios.post("/auth/logout");
			// Clear user from the store
			set({ user: null });

		} catch (error) {
			toast.error(error.response?.data?.message || "An error occurred during logout");
		}
	},

	// Auth Methods
	checkAuth: async () => {
		// Prevent multiple simultaneous checks
		set({ checkingAuth: true });
		try {
			// Fetch user profile from the server
			const response = await axios.get("/auth/profile");
			// Update user in the store
			set({ user: response.data, checkingAuth: false });

		} catch (error) {
			console.log(error.message);
			set({ checkingAuth: false, user: null });
		}
	},

	// Auth Methods
	refreshToken: async () => {
		// Prevent multiple simultaneous refresh attempts
		if (get().checkingAuth) return;

		// Indicate that a token refresh is in progress
		set({ checkingAuth: true });
		try {
			// Request a new token from the server
			const response = await axios.post("/auth/refresh-token");
			// Update user in the store
			set({ checkingAuth: false });
			// Return the new token
			return response.data;

		} catch (error) {
			set({ user: null, checkingAuth: false });
			throw error;
		}
	},
}));

// Axios interceptor for token refresh
// To prevent multiple simultaneous refresh attempts
let refreshPromise = null;

// Add a response interceptor
axios.interceptors.response.use(
	(response) => response,
	async (error) => {
		// Check for token refresh error
		const originalRequest = error.config;
		// If 401 error and not already retried
		if (error.response?.status === 401 && !originalRequest._retry) {
			// Mark the request as retried
			originalRequest._retry = true;

			try {
				// If a refresh is already in progress, wait for it to complete
				if (refreshPromise) {
					// Wait for the refresh promise to resolve
					await refreshPromise;
					// Retry the original request
					return axios(originalRequest);
				}

				// Start a new refresh process
				refreshPromise = useUserStore.getState().refreshToken();
				await refreshPromise; // Wait for the token to be refreshed
				refreshPromise = null; // Clear the refresh promise

				// Retry the original request
				return axios(originalRequest);

			} catch (refreshError) {
				// If refresh fails, redirect to login or handle as needed
				// Logout the user
				useUserStore.getState().logout();
				// Clear the refresh promise
				return Promise.reject(refreshError);
			}
		}
		// If the error is not due to authentication, reject the promise
		return Promise.reject(error);
	}
);
