import Coupon from "../models/coupon.model.js";

// Controller to get the active coupon for the authenticated user
export const getCoupon = async (req, res) => {
	try {
		// Find the active coupon for the user
		const coupon = await Coupon.findOne({ userId: req.user._id, isActive: true });
		// Return the coupon or null if not found
		res.json(coupon || null);
	} catch (error) {
		console.log("Error in getCoupon controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Controller to validate a coupon code for the authenticated user
export const validateCoupon = async (req, res) => {
	try {
		// Extract coupon code from request body
		const { code } = req.body;
		// Find the coupon by code and user ID
		const coupon = await Coupon.findOne({ code: code, userId: req.user._id, isActive: true });

		// If coupon not found, return error
		if (!coupon) {
			return res.status(404).json({ message: "Coupon not found" });
		}

		// Check if the coupon has expired
		if (coupon.expirationDate < new Date()) {
			// Set the coupon as inactive
			coupon.isActive = false;
			// Save the updated coupon
			await coupon.save();
			// Return expiration message
			return res.status(404).json({ message: "Coupon expired" });
		}

		// If coupon is valid, return success message with coupon details
		res.json({
			message: "Coupon is valid",
			code: coupon.code,
			discountPercentage: coupon.discountPercentage,
		});
		
	} catch (error) {
		console.log("Error in validateCoupon controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
