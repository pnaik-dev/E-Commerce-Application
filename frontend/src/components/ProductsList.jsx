import { motion } from "framer-motion";
import { Trash, Star } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";

// INR formatter
const formatPrice = (price) => {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 0,
	}).format(price); 
};

const ProductsList = () => {
	// Get products from the store
	const { deleteProduct, toggleFeaturedProduct, products } = useProductStore();

	return (
		<motion.div
  		className='bg-gray-800 shadow-lg rounded-lg w-full overflow-x-auto'

			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8 }}
		>
			<table className="min-w-full divide-y divide-gray-700">
				<thead className="bg-gray-700">
					<tr>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
							Product
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
							Price
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
							Category
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
							Featured
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
							Actions
						</th>
					</tr>
				</thead>

				<tbody className="bg-gray-800 divide-y divide-gray-700">
					{products?.map((product) => (
						<tr key={product._id} className="hover:bg-gray-700">
							{/* PRODUCT */}
							<td className="px-6 py-4 whitespace-nowrap">
								<div className="flex items-center gap-4">
									<img
										src={product.image}
										alt={product.name}
										className="h-10 w-10 rounded-full object-cover"
									/>
									<span className="text-sm font-medium text-white">
										{product.name}
									</span>
								</div>
							</td>

							{/* PRICE */}
							<td className="px-6 py-4 whitespace-nowrap">
								<div className="text-sm text-gray-300">
  								{formatPrice(product.price)}
								</div>

							</td>

							{/* CATEGORY */}
							<td className="px-6 py-4 whitespace-nowrap">
								<div className="text-sm text-gray-300">
									{product.category}
								</div>
							</td>

							{/* FEATURED */}
							<td className="px-6 py-4 whitespace-nowrap">
								<div className="flex items-center">
									<button
										onClick={() => toggleFeaturedProduct(product._id)}
										className={`p-2 rounded-full transition ${
											product.isFeatured
												? "bg-yellow-400 text-black"
												: "bg-gray-600 text-white"
										} hover:scale-110`}
									>
										<Star className="h-5 w-5" />
									</button>
								</div>
							</td>

							{/* ACTIONS */}
							<td className="px-6 py-4 whitespace-nowrap">
								<div className="flex items-center gap-3">
									<button
										onClick={() => deleteProduct(product._id)}
										className="p-2 rounded-full border border-red-400 text-red-400
										hover:bg-red-500 hover:text-white transition"
									>
										<Trash className="h-5 w-5" />
									</button>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</motion.div>
	);
};

export default ProductsList;
