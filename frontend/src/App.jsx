import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import CategoryPage from "./pages/CategoryPage";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./stores/useUserStore";
import { useEffect } from "react";
import LoadingSpinner from "./components/LoadingSpinner";
import CartPage from "./pages/CartPage";
import { useCartStore } from "./stores/useCartStore";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";

// Main application component
function App() {
	// Access user and cart stores
	const { user, checkAuth, checkingAuth } = useUserStore();
	const { getCartItems } = useCartStore();
	// Check authentication status on mount
	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	// Fetch cart items when user changes
	useEffect(() => {
		// If user is not available, don't fetch cart items
		if (!user) return;

		// Fetch cart items for the authenticated user
		getCartItems();
	}, [getCartItems, user]);

	// Show loading spinner while checking authentication
	if (checkingAuth) return <LoadingSpinner />;

	return (
		<div className='min-h-screen bg-purple-900 text-white relative overflow-hidden'>
			{/* Background gradient */}
			<div className='absolute inset-0 overflow-hidden'>
				<div className='absolute inset-0'>
				<div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full 
					bg-[radial-gradient(ellipse_at_top,rgba(255,20,147,0.3)_0%,rgba(199,21,133,0.2)_45%,rgba(128,0,128,0.1)_100%)]' 
				/>
				</div>
			</div>

			<div className='relative z-50 pt-20'>
				<Navbar />
				<Routes>
					<Route path='/' element={<HomePage />} />
					<Route path='/signup' element={!user ? <SignUpPage /> : <Navigate to='/' />} />
					<Route path='/login' element={!user ? <LoginPage /> : <Navigate to='/' />} />
					<Route
						path='/secret-dashboard'
						element={user?.role === "admin" ? <AdminPage /> : <Navigate to='/login' />}
					/>
					<Route path='/category/:category' element={<CategoryPage />} />
					<Route path='/cart' element={user ? <CartPage /> : <Navigate to='/login' />} />
					<Route path='/purchase-success' element={<PurchaseSuccessPage />} />
					<Route path='/purchase-cancel' element={user ? <PurchaseCancelPage /> : <Navigate to='/login' />} />
				</Routes>
			</div>
			<Footer />
			<Toaster />
		</div>
	);
}

export default App;
