import Product from "../models/product.model.js";

// Get all products in the cart
export const getCartProducts = async (req, res) => {
	try {
		// fetch products based on cart item IDs
		const products = await Product.find({ _id: { $in: req.user.cartItems } });

		// map products to include quantity from cartItems
		const cartItems = products.map((product) => {
			// find the corresponding cart item to get quantity
			const item = req.user.cartItems.find((cartItem) => cartItem.id === product.id);
			// return product details along with quantity
			return { ...product.toJSON(), quantity: item.quantity };
		});

		// return cart items
		res.json(cartItems);

	} catch (error) {
		console.log("Error in getCartProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Add a product to the cart
export const addToCart = async (req, res) => {
	try {
		// extract productId from request body
		const { productId } = req.body;
		// get user from request
		const user = req.user;

		// check if product already exists in cart
		const existingItem = user.cartItems.find((item) => item.id === productId);
		// if it exists, increment quantity, else add new item
		if (existingItem) {
			existingItem.quantity += 1;
		} else {
			// add new product to cart with quantity 1
			user.cartItems.push(productId);
		}

		// save updated user cart
		await user.save();
		// return updated cart items
		res.json(user.cartItems);

	} catch (error) {
		console.log("Error in addToCart controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Remove all or specific product from the cart
export const removeAllFromCart = async (req, res) => {
	try {
		// extract productId from request body
		const { productId } = req.body;
		// get user from request
		const user = req.user;
		// if no productId, clear entire cart, else remove specific product
		if (!productId) {
			user.cartItems = [];
		} else {
			// filter out the product to be removed
			user.cartItems = user.cartItems.filter((item) => item.id !== productId);
		}
		// save updated user cart
		await user.save();
		// return updated cart items
		res.json(user.cartItems);

	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Update quantity of a specific product in the cart
export const updateQuantity = async (req, res) => {
	try {
		// extract productId from request params and quantity from request body
		const { id: productId } = req.params;
		const { quantity } = req.body;

		// get user from request
		const user = req.user;
		// find the cart item to update
		const existingItem = user.cartItems.find((item) => item.id === productId);

		// if item exists, update quantity or remove if quantity is 0
		if (existingItem) {
			// if quantity is 0, remove item from cart
			if (quantity === 0) {
				// filter out the product to be removed
				user.cartItems = user.cartItems.filter((item) => item.id !== productId);
				// save updated user cart
				await user.save();
				// return updated cart items
				return res.json(user.cartItems);
			}

			// update quantity
			existingItem.quantity = quantity;
			// save updated user cart
			await user.save();
			// return updated cart items
			res.json(user.cartItems);

		} else {
			res.status(404).json({ message: "Product not found" });
		}
		
	} catch (error) {
		console.log("Error in updateQuantity controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
