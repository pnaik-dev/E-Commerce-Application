import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

// Product Store
export const useProductStore = create((set) => ({
	// Initial State
	products: [],
	// Loading State
	loading: false,

	setProducts: (products) => set({ products }), // Set products directly

	// Product Methods
	createProduct: async (productData) => {
		set({ loading: true }); // Start loading
		try {
			// Create product on the server
			const res = await axios.post("/products", productData);

			// Update products in the store
			set((prevState) => ({
				// Append the newly created product to the existing products array
				products: [...prevState.products, res.data],
				loading: false,
			}));

		} catch (error) {
			toast.error(error.response.data.error);
			set({ loading: false });
		}
	},

	// Product Methods
	fetchAllProducts: async () => {
		// Set loading to true
		set({ loading: true });
		try {
			// Fetch all products from the server
			const response = await axios.get("/products");
			// Update products in the store and set loading to false
			set({ products: response.data.products, loading: false });

		} catch (error) {
			// Set error and loading to false
			set({ error: "Failed to fetch products", loading: false });
			toast.error(error.response.data.error || "Failed to fetch products");
		}
	},
	// Product Methods
	fetchProductsByCategory: async (category) => {
		// Set loading to true
		set({ loading: true });
		try {
			// Fetch products by category from the server
			const response = await axios.get(`/products/category/${category}`);
			// Update products in the store and set loading to false
			set({ products: response.data.products, loading: false });

		} catch (error) {
			// Set error and loading to false
			set({ error: "Failed to fetch products", loading: false });
			toast.error(error.response.data.error || "Failed to fetch products");
		}
	},
	// Product Methods
	deleteProduct: async (productId) => {
		// Set loading to true
		set({ loading: true });
		try {
			// Delete product on the server
			await axios.delete(`/products/${productId}`);
			// Remove product from the store
			set((prevProducts) => ({
				// Filter out the deleted product from the products array
				products: prevProducts.products.filter((product) => product._id !== productId),
				loading: false,
			}));

		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.error || "Failed to delete product");
		}
	},
	// Product Methods
	toggleFeaturedProduct: async (productId) => {
		// Set loading to true
		set({ loading: true });
		try {
			// Toggle featured status on the server
			const response = await axios.patch(`/products/${productId}`);
			// this will update the isFeatured prop of the product
			set((prevProducts) => ({
				// Map through products and update the isFeatured status of the specified product
				products: prevProducts.products.map((product) =>
					product._id === productId ? { ...product, isFeatured: response.data.isFeatured } : product
				),
				loading: false,
			}));

		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.error || "Failed to update product");
		}
	},
	// Product Methods
	fetchFeaturedProducts: async () => {
		// Set loading to true
		set({ loading: true });
		try {
			// Fetch featured products from the server
			const response = await axios.get("/products/featured");
			// Update products in the store and set loading to false
			set({ products: response.data, loading: false });
			
		} catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			console.log("Error fetching featured products:", error);
		}
	},
}));
