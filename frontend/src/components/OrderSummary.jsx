import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link } from "react-router-dom";
import { MoveRight } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "../lib/axios";

// Stripe public key
const stripePromise = loadStripe(
	("pk_test_51Scj2F2KtpO1YwDv5OsoOfGKYOPbYA2nbCavCCGP8YI8a5tiPr5mxshjMDdya5umPmkQdPDkmOpmtKD8AAUjafze00KVEm4FUm")
);

// INR formatter
const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};

// Order Summary
const OrderSummary = () => {
	// Get cart and coupon from the store
	const { total, subtotal, coupon, isCouponApplied, cart } = useCartStore();

	// Calculate savings
	const savings = subtotal - total;

	// Handle payment
	const handlePayment = async () => {
		// Get Stripe instance
		const stripe = await stripePromise;
		// Create checkout session
		const res = await axios.post("/payments/create-checkout-session", {
			products: cart,
			couponCode: coupon ? coupon.code : null,
		});

		// Redirect to checkout
		const session = res.data;
		const result = await stripe.redirectToCheckout({
			sessionId: session.id,
		});

		// Handle errors
		if (result.error) {
			console.error("Error:", result.error);
		}
	};

	return (
		<motion.div
			className='space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<p className='text-xl font-semibold text-[burlywood]'>Order summary</p>

			<div className='space-y-4'>
				<div className='space-y-2'>
					<dl className='flex items-center justify-between gap-4'>
						<dt className='text-base font-normal text-gray-300'>Original price</dt>
						<dd className='text-base font-medium text-white'>
  						{formatPrice(subtotal)}
						</dd>

					</dl>

					{savings > 0 && (
						<dl className='flex items-center justify-between gap-4'>
							<dt className='text-base font-normal text-gray-300'>Savings</dt>
							<dd className='text-base font-medium text-emerald-400'>
  							-{formatPrice(savings)}
							</dd>

						</dl>
					)}

					{coupon && isCouponApplied && (
						<dl className='flex items-center justify-between gap-4'>
							<dt className='text-base font-normal text-gray-300'>Coupon ({coupon.code})</dt>
							<dd className='text-base font-medium text-emerald-400'>-{coupon.discountPercentage}%</dd>
						</dl>
					)}
					<dl className='flex items-center justify-between gap-4 border-t border-gray-600 pt-2'>
						<dt className='text-base font-bold text-white'>Total</dt>
						<dd className='text-base font-bold text-emerald-400'>
  						{formatPrice(total)}
						</dd>

					</dl>
				</div>

				<motion.button
					className='flex w-full items-center justify-center rounded-lg bg-[#e80b30] px-5 py-2.5 text-sm font-medium text-white hover:bg-pink-900 focus:outline-none focus:ring-4 focus:ring-emerald-300'
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={handlePayment}
				>
					Proceed to Checkout
				</motion.button>

				<div className='flex items-center justify-center gap-2'>
					<span className='text-sm font-normal text-gray-400'>or</span>
					<Link
						to='/'
						className='inline-flex items-center gap-2 text-sm font-medium text-[lime] underline hover:text-[#3ce03c] hover:no-underline'
					>
						Continue Shopping
						<MoveRight size={16} />
					</Link>
				</div>
			</div>
		</motion.div>
	);
};
export default OrderSummary;
