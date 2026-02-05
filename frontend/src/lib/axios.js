import axios from "axios";

// Create an Axios instance with default configuration
const axiosInstance = axios.create({
	// Set baseURL based on the environment
	baseURL: import.meta.env.VITE_API_URL,
	withCredentials: true, // send cookies to the server
});

export default axiosInstance;
