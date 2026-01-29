import axios from "axios";

// Create an Axios instance with default configuration
const axiosInstance = axios.create({
	// Set baseURL based on the environment
	baseURL: import.meta.mode === "development" ? "http://localhost:5000/api" : "/api",
	withCredentials: true, // send cookies to the server
});

export default axiosInstance;
