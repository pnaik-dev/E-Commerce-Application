import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

// Fetch overall analytics data
export const getAnalyticsData = async () => {
	// Total users
	const totalUsers = await User.countDocuments();
	// Total products
	const totalProducts = await Product.countDocuments();

	// Total sales and revenue
	const salesData = await Order.aggregate([
		{
			$group: {
				_id: null, // it groups all documents together,
				totalSales: { $sum: 1 },
				totalRevenue: { $sum: "$totalAmount" },
			},
		},
	]);
	// Destructure with default values
	const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

	// Return analytics data
	return {
		users: totalUsers,
		products: totalProducts,
		totalSales,
		totalRevenue,
	};
};

// Fetch daily sales data within a date range
export const getDailySalesData = async (startDate, endDate) => {
	try {
		// Aggregate orders to get daily sales and revenue
		const dailySalesData = await Order.aggregate([
			{
				// filter orders within the date range
				$match: {
					createdAt: {
						// $gte = greater than or equal to
						$gte: startDate,
						// $lte = less than or equal to
						$lte: endDate,
					},
				},
			},
			{
				// group by date and calculate sales and revenue
				$group: {
					_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
					sales: { $sum: 1 },
					revenue: { $sum: "$totalAmount" },
				},
			},
			// sort by date ascending
			{ $sort: { _id: 1 } },
		]);

		// example of dailySalesData
		// [
		// 	{
		// 		_id: "2026-01-28",
		// 		sales: 12,
		// 		revenue: 1450.75
		// 	},
		// ]

		// Create a complete date array within the range
		const dateArray = getDatesInRange(startDate, endDate);
		// console.log(dateArray) // ['2026-01-28', '2026-01-29', ... ]

		// Map through dateArray to ensure all dates are represented
		return dateArray.map((date) => {
			// Find matching data for the date
			const foundData = dailySalesData.find((item) => item._id === date);

			// Return data with defaults if not found
			return {
				date,
				sales: foundData?.sales || 0,
				revenue: foundData?.revenue || 0,
			};
		});
	} catch (error) {
		throw error;
	}
};

// Helper function to get all dates in a range
function getDatesInRange(startDate, endDate) {
	// Generate array of dates between startDate and endDate
	const dates = [];
	// Initialize currentDate to startDate
	let currentDate = new Date(startDate);

	// Loop until currentDate exceeds endDate
	while (currentDate <= endDate) {
		// Push formatted date string (YYYY-MM-DD) to dates array
		dates.push(currentDate.toISOString().split("T")[0]);
		// Increment currentDate by one day
		currentDate.setDate(currentDate.getDate() + 1);
	}

	// Return array of formatted date strings
	return dates;
}
