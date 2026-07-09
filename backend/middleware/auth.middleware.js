import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Middleware to protect routes - only accessible with valid JWT
export const protectRoute = async (req, res, next) => {
	try {
		// Get token from cookies
		const accessToken = req.cookies.accessToken;

		// If no token, return error
		if (!accessToken) {
			return res.status(401).json({ message: "Unauthorized - No access token provided" });
		}

		try {
			// Verify token
			const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
			// Find user by ID from token payload
			const user = await User.findById(decoded.userId).select("-password");

			// If user not found, return error
			if (!user) {
				return res.status(401).json({ message: "User not found" });
			}

			// Attach user to request object
			req.user = user;

			// Proceed to next middleware
			next();
		} catch (error) {
			// If token is expired, return error
			if (error.name === "TokenExpiredError") {
				return res.status(401).json({ message: "Unauthorized - Access token expired" });
			}
			// For other token errors, re-throw error
			throw error;
		}
	} catch (error) {
		console.log("Error in protectRoute middleware", error.message);
		return res.status(401).json({ message: "Unauthorized - Invalid access token" });
	}
};

// Middleware to check if user is admin
export const adminRoute = (req, res, next) => {
	// Check if user role is admin
	if (req.user && req.user.role === "admin") {
		// Proceed to next middleware
		next();
	} else {
		// If not admin, return error
		return res.status(403).json({ message: "Access denied - Admin only" });
	}
};
