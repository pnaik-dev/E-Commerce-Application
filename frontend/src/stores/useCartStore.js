import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

// Cart Store
export const useCartStore = create((set, get) => ({
	cart: [],
	coupon: null,
	total: 0,
	subtotal: 0,
	isCouponApplied: false,

	// Coupon Methods
	getMyCoupon: async () => {
		try {
			// Fetch available coupons from the server
			const response = await axios.get("/coupons");
			// For simplicity, we assume the first coupon is the user's coupon
			set({ coupon: response.data });

		} catch (error) {
			console.error("Error fetching coupon:", error);
		}
	},
	// Coupon Methods
	applyCoupon: async (code) => {
		try {
			// Validate coupon code with the server
			const response = await axios.post("/coupons/validate", { code });
			// If valid, set the coupon in the store
			set({ coupon: response.data, isCouponApplied: true });
			// Recalculate totals
			get().calculateTotals();
			// Show success message
			toast.success("Coupon applied successfully");

		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to apply coupon");
		}
	},
	// Coupon Methods
	removeCoupon: () => {
		// Remove coupon from the store
		set({ coupon: null, isCouponApplied: false });
		// Recalculate totals
		get().calculateTotals();
		// Show success message
		toast.success("Coupon removed");
	},

	// Cart Methods
	getCartItems: async () => {
		try {
			// Fetch cart items from the server
			const res = await axios.get("/cart");
			// Update cart in the store
			set({ cart: res.data });
			// Recalculate totals
			get().calculateTotals();

		} catch (error) {
			set({ cart: [] }); // Clear cart on error
			toast.error(error.response.data.message || "An error occurred");
		}
	},
	// Cart Methods
	clearCart: async () => {
		// Clear cart on the server
		set({ cart: [], coupon: null, total: 0, subtotal: 0 });
	},
	// Cart Methods
	addToCart: async (product) => {
		try {
			// Add product to cart on the server
			await axios.post("/cart", { productId: product._id });
			// Show success message
			toast.success("Product added to cart");

			// Update cart in the store
			set((prevState) => {
				// Check if product already exists in cart
				const existingItem = prevState.cart.find((item) => item._id === product._id);
				// If it exists, increase quantity, else add new item
				const newCart = existingItem
					// If exists, increase quantity
					? prevState.cart.map((item) =>
							item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
					  )
					  // If not exists, add new product with quantity 1
					: [...prevState.cart, { ...product, quantity: 1 }];
				// Update cart
				return { cart: newCart };
			});
			// Recalculate totals
			get().calculateTotals();

		} catch (error) {
			toast.error(error.response.data.message || "An error occurred");
		}
	},
	// Cart Methods
	removeFromCart: async (productId) => {
		// Remove product from cart on the server
		await axios.delete(`/cart`, { data: { productId } });
		// Update cart in the store
		set((prevState) => ({ cart: prevState.cart.filter((item) => item._id !== productId) }));
		// Recalculate totals
		get().calculateTotals();
	},
	// Cart Methods
	updateQuantity: async (productId, quantity) => {
		// If quantity is zero, remove the item from cart
		if (quantity === 0) {
			get().removeFromCart(productId);
			return;
		}

		// Update product quantity on the server
		await axios.put(`/cart/${productId}`, { quantity });
		// Update cart in the store
		set((prevState) => ({
			// Update the quantity of the specified product
			cart: prevState.cart.map((item) => (item._id === productId ? { ...item, quantity } : item)),
		}));
		// Recalculate totals
		get().calculateTotals();
	},
	// Cart Methods
	calculateTotals: () => {
		// Get cart and coupon from the store
		const { cart, coupon } = get();
		// Calculate subtotal
		const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
		// Initialize total as subtotal
		let total = subtotal;

		// If coupon is applied, calculate discount
		if (coupon) {
			const discount = subtotal * (coupon.discountPercentage / 100);
			// Calculate total after discount
			total = subtotal - discount;
		}

		// Update subtotal and total in the store
		set({ subtotal, total });
	},
}));
