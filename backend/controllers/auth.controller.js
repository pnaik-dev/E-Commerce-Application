import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

// Generate access token and refresh token
const generateTokens = (userId) => {
	// Access token valid for 15 minutes
	const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: "15m",
	});

	// Refresh token valid for 7 days
	const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: "7d",
	});

	// Return tokens
	return { accessToken, refreshToken };
};

// Store refresh token in Redis with expiration
const storeRefreshToken = async (userId, refreshToken) => {
	// Set refresh token in Redis with 7 days expiration
	await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); // 7days
};

// Set cookies for access and refresh tokens
const setCookies = (res, accessToken, refreshToken) => {
	// Set access token cookie
	res.cookie("accessToken", accessToken, {
		httpOnly: true, // prevent XSS attacks, cross site scripting attack
		secure: process.env.NODE_ENV === "production", // only send cookie over HTTPS in production
		sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
		maxAge: 15 * 60 * 1000, // 15 minutes
	});
	// Set refresh token cookie
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true, // prevent XSS attacks, cross site scripting attack
		secure: process.env.NODE_ENV === "production", // only send cookie over HTTPS in production
		sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
	});
};

// User signup
export const signup = async (req, res) => {
	// Get data from request body
	let { name, email, password } = req.body;
	try {
		// Normalize inputs
		name = name.trim();
		email = email.trim().toLowerCase();
		password = password.trim();

		// Required fields validation
		if (!name || !email || !password ) {
			return res.status(400).json({ message: "All fields are required" });
		}

		// Check if user already exists
		const userExists = await User.findOne({ email });
		// If user already exists
		if (userExists) {
			return res.status(400).json({ message: "User already exists" });
		}
		// Create new user
		const user = await User.create({ name, email, password });

		// Generate tokens
		const { accessToken, refreshToken } = generateTokens(user._id);
		// Store refresh token in Redis
		await storeRefreshToken(user._id, refreshToken);

		// Set cookies
		setCookies(res, accessToken, refreshToken);

		// Return user data
		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
		});
	
  } catch (error) {
		// Duplicate email error (MongoDB unique)
		if (error.code === 11000) {
			return res.status(400).json({ message: "Email already exists" });
		}

		// Mongoose validation error
		if (error.name === "ValidationError") {
			return res.status(400).json({
			message: Object.values(error.errors)[0].message,
			});
		}

		console.log("Signup Error:", error);
		return res.status(500).json({ message: "Something went wrong" });
		}
};

// User login
export const login = async (req, res) => {
	try {
		// Get email and password from request body
		let { email, password } = req.body;

		// Validate input
		if (!email || !password) {
			return res.status(400).json({ message: "Email and password are required" });
		}

		// Normalize email
		email = email.toLowerCase().trim();

		// Find user by email and select password field
		const user = await User.findOne({ email }).select("+password");

		// If user exists and password matches
		if (user && (await user.comparePassword(password))) {
			// Generate tokens
			const { accessToken, refreshToken } = generateTokens(user._id);
			// Store refresh token in Redis
			await storeRefreshToken(user._id, refreshToken);
			// Set cookies
			setCookies(res, accessToken, refreshToken);

			// Return user data
			res.json({
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			});
		} else {
			// Invalid credentials
			res.status(400).json({ message: "Invalid email or password" });
		}
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ message: error.message });
	}
};

// User logout
export const logout = async (req, res) => {
	try {
		// Get refresh token from cookies
		const refreshToken = req.cookies.refreshToken;
		// If refresh token exists
		if (refreshToken) {
			// Verify token to get userId
			const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
			// Delete refresh token from Redis
			await redis.del(`refresh_token:${decoded.userId}`);
		}

		// Clear cookies
		res.clearCookie("accessToken");
		res.clearCookie("refreshToken");
		res.json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// this will refresh the access token
export const refreshToken = async (req, res) => {
	try {
		// Get refresh token from cookies
		const refreshToken = req.cookies.refreshToken;

		// If no refresh token, return 401
		if (!refreshToken) {
			return res.status(401).json({ message: "No refresh token provided" });
		}

		// Verify refresh token
		const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
		// Get stored refresh token from Redis
		const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

		// If tokens don't match, return 401
		if (storedToken !== refreshToken) {
			return res.status(401).json({ message: "Invalid refresh token" });
		}

		// Generate new access token
		const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

		// Set new access token cookie
		res.cookie("accessToken", accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 15 * 60 * 1000,
		});

		res.json({ message: "Token refreshed successfully" });
	} catch (error) {
		console.log("Error in refreshToken controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Get user profile
export const getProfile = async (req, res) => {
	try {
		// req.user is set in auth middleware
		res.json(req.user);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
