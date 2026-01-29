import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import { stripe } from "../lib/stripe.js";

// Create a checkout session
export const createCheckoutSession = async (req, res) => {
	try {
		// Extract products and optional coupon code from request body
		const { products, couponCode } = req.body;

		// Validate products array
		if (!Array.isArray(products) || products.length === 0) {
			// Return error if products array is invalid
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

		// Calculate total amount
		let totalAmount = 0;

		// Create line items for Stripe checkout session
		const lineItems = products.map((product) => {
			// Calculate amount in smallest currency unit
			const amount = Math.round(product.price * 100); // Stripe requires smallest currency unit (paise for INR)

			// Update total amount
			totalAmount += amount * product.quantity;

			// Return line item
			return {
				// Stripe expects price data for each product
				price_data: {
					currency: "inr",
					// Stripe expects product data
					product_data: {
						name: product.name,
						images: [product.image],
					},

					// Convert price to smallest currency unit
					unit_amount: amount,
				},
				// Stripe expects quantity
				quantity: product.quantity || 1,
			};
		});

		// Initialize coupon variable
		let coupon = null;
		// Check if coupon code is provided
		if (couponCode) {
			// Find coupon in database
			coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
			// If coupon is found, apply discount to total amount
			if (coupon) {
				totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
			}
		}

		// Create Stripe checkout session
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: lineItems,
			mode: "payment",
			success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
			discounts: coupon
				? [
						{
							// Stripe expects discount data
							coupon: await createStripeCoupon(coupon.discountPercentage),
						},
				  ]
				: [],
			// Attach metadata to the session
			metadata: {
				// Attach user ID to the session
				userId: req.user._id.toString(),
				// Attach coupon code if used
				couponCode: couponCode || "",
				// Attach products information
				products: JSON.stringify(
					// Map products to include id, quantity, and price
					products.map((p) => ({
						id: p._id,
						quantity: p.quantity,
						price: p.price,
					}))
				),
			},
		});

		if (totalAmount >= 20000) {
			await createNewCoupon(req.user._id);
		}
		
		// Return session ID and total amount to client
		res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
	} catch (error) {
		console.error("Error processing checkout:", error);
		res.status(500).json({ message: "Error processing checkout", error: error.message });
	}
};

// Handle successful checkout
export const checkoutSuccess = async (req, res) => {
	try {
		// Extract session ID from request body
		const { sessionId } = req.body;
		// Retrieve session from Stripe
		const session = await stripe.checkout.sessions.retrieve(sessionId);

		// Check if payment was successful
		if (session.payment_status === "paid") {
			// If a coupon was used
			if (session.metadata.couponCode) {
				// Deactivate the used coupon
				await Coupon.findOneAndUpdate(
					{
						// Find coupon by code and user ID
						code: session.metadata.couponCode,
						userId: session.metadata.userId,
					},
					{
						// Set isActive to false
						isActive: false,
					}
				);
			}

			// Create a new order
			const products = JSON.parse(session.metadata.products);		

			const newOrder = new Order({
				// Attach user ID to the order
				user: session.metadata.userId,
				// Map products to include product ID, quantity, and price
				products: products.map((product) => ({
					product: product.id,
					quantity: product.quantity,
					price: product.price,
				})),
				// Attach total amount and Stripe session ID
				totalAmount: session.amount_total / 100, // convert from cents to dollars,
				stripeSessionId: sessionId,
			});

			// Save the new order to the database
			await newOrder.save();

			// Return success response with order ID
			res.status(200).json({
				success: true,
				message: "Payment successful, order created, and coupon deactivated if used.",
				orderId: newOrder._id,
			});
		}
	} catch (error) {
		console.error("Error processing successful checkout:", error);
		res.status(500).json({ message: "Error processing successful checkout", error: error.message });
	}
};

// Function to create a Stripe coupon
async function createStripeCoupon(discountPercentage) {
	// Create a coupon in Stripe
	const coupon = await stripe.coupons.create({
		// Set the discount percentage
		percent_off: discountPercentage,
		duration: "once", // Coupon is valid for one use
	});

	// Return the coupon ID
	return coupon.id;
}

// Function to create a new coupon for the user
async function createNewCoupon(userId) {
	// Delete any existing coupon for the user
	await Coupon.findOneAndDelete({ userId });

	// Create a new coupon
	const newCoupon = new Coupon({
		// Generate a unique coupon code
		code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
		// Set the discount percentage
		discountPercentage: 10,
		// Set the expiration date (e.g., 30 days from now)
		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
		userId: userId, // Associate coupon with the user
	});

	// Save the new coupon to the database
	await newCoupon.save();

	// Return the new coupon
	return newCoupon;
}
