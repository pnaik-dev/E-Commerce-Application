import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";

// Get all products
export const getAllProducts = async (req, res) => {
	try {
		// fetch all products
		const products = await Product.find({}); 
		res.json({ products }); // return as json response
	} catch (error) {
		console.log("Error in getAllProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Get featured products
export const getFeaturedProducts = async (req, res) => {
	try {
		// check in redis first
		let featuredProducts = await redis.get("featured_products");
		// if in redis, return from redis
		if (featuredProducts) {
			return res.json(JSON.parse(featuredProducts));
		}

		// if not in redis, fetch from mongodb
		// .lean() is gonna return a plain javascript object instead of a mongodb document
		// which is good for performance
		featuredProducts = await Product.find({ isFeatured: true }).lean();

		// if no featured products found
		if (!featuredProducts) {
			return res.status(404).json({ message: "No featured products found" });
		}

		// store in redis for future quick access
		await redis.set("featured_products", JSON.stringify(featuredProducts));

		// return featured products
		res.json(featuredProducts);

	} catch (error) {
		console.log("Error in getFeaturedProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Create a new product
export const createProduct = async (req, res) => {
	try {
		// destructure product details from request body
		const { name, description, price, image, category } = req.body;

		//initialize cloudinary response
		let cloudinaryResponse = null;

		// if image is present
		if (image) {
			// upload to cloudinary
			cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
		}

		// create new product
		const product = await Product.create({
			name,
			description,
			price,
			image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "",
			category,
		});

		// respond with created product
		res.status(201).json(product);

	} catch (error) {
		console.log("Error in createProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Delete a product
export const deleteProduct = async (req, res) => {
	try {
		// find product by id
		const product = await Product.findById(req.params.id);

		// if product not found
		if (!product) {
			// respond with not found
			return res.status(404).json({ message: "Product not found" });
		}

		// if product has an image, delete from cloudinary
		if (product.image) {
			// extract public id from image url
			const publicId = product.image.split("/").pop().split(".")[0];
			try {
				// delete image from cloudinary
				await cloudinary.uploader.destroy(`products/${publicId}`);
				console.log("deleted image from cloduinary");
			} catch (error) {
				console.log("error deleting image from cloduinary", error);
			}
		}

		// delete product from database
		await Product.findByIdAndDelete(req.params.id);

		res.json({ message: "Product deleted successfully" });

	} catch (error) {
		console.log("Error in deleteProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Get recommended products
export const getRecommendedProducts = async (req, res) => {
	try {
		// aggregate to get random 4 products
		const products = await Product.aggregate([
			{
				$sample: { size: 4 }, // randomly select 4 products
			},
			{
				// project only required fields
				$project: {
					_id: 1,
					name: 1,
					description: 1,
					image: 1,
					price: 1,
				},
			},
		]);

		// return products
		res.json(products);

	} catch (error) {
		console.log("Error in getRecommendedProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
	// destructure category from request params
	const { category } = req.params;
	try {
		// find products by category
		const products = await Product.find({ category });
		// return products
		res.json({ products });

	} catch (error) {
		console.log("Error in getProductsByCategory controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Toggle featured status of a product
export const toggleFeaturedProduct = async (req, res) => {
	try {
		// find product by id
		const product = await Product.findById(req.params.id);
		// if product found
		if (product) {
			// toggle isFeatured field
			product.isFeatured = !product.isFeatured;
			// save updated product
			const updatedProduct = await product.save();
			// update featured products cache in redis
			await updateFeaturedProductsCache();
			// return updated product
			res.json(updatedProduct);

		} else {
			res.status(404).json({ message: "Product not found" });
		}

	} catch (error) {
		console.log("Error in toggleFeaturedProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Function to update featured products cache in redis
async function updateFeaturedProductsCache() {
	try {
		// fetch featured products from database
		const featuredProducts = await Product.find({ isFeatured: true }).lean();
		// update in redis
		await redis.set("featured_products", JSON.stringify(featuredProducts));
		
	} catch (error) {
		console.log("error in update cache function");
	}
}
