import { ShoppingCart, UserPlus, LogIn, LogOut, Lock, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";

const Navbar = () => {
  const { user, logout } = useUserStore();
  const isAdmin = user?.role === "admin";
  const { cart } = useCartStore();

  return (
    <header className="fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 border-b border-emerald-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-nowrap items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            className="text-xl sm:text-2xl font-bold text-[darksalmon] flex items-center"
          >
            E-Commerce Store
          </Link>

          {/* Navigation */}
          <nav className="flex flex-nowrap items-center gap-3 sm:gap-4">

            {/* Home */}
			<Link
			to="/"
			className="text-gray-300 hover:text-emerald-400 transition flex items-center"
			>
			{/* Icon only on mobile */}
			<Home size={20} className="sm:hidden" />

			{/* Text only on desktop */}
			<span className="hidden sm:inline">Home</span>
			</Link>

            {/* Cart */}
            {user && (
              <Link
                to="/cart"
                className="relative text-gray-300 hover:text-emerald-400 transition flex items-center"
              >
                <ShoppingCart size={20} />
                <span className="hidden sm:inline ml-1">Cart</span>

                {cart.length > 0 && (
                  <span className="absolute -top-2 -left-2 bg-[chocolate] text-white rounded-full px-2 py-0.5 text-xs">
                    {cart.length}
                  </span>
                )}
              </Link>
            )}

            {/* Admin Dashboard */}
            {isAdmin && (
              <Link
                to="/secret-dashboard"
                className="bg-[crimson] hover:bg-[darkred] text-white
                py-1.5 px-3 sm:py-2 sm:px-4
                rounded-md transition flex items-center"
              >
                <Lock size={18} />
                <span className="hidden sm:inline ml-2">Dashboard</span>
              </Link>
            )}

            {/* Auth buttons */}
            {user ? (
              <button
                onClick={logout}
                className="bg-[#cd2424] hover:bg-[darkred] text-white
                py-1.5 px-3 sm:py-2 sm:px-4
                rounded-md transition flex items-center"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline ml-2">Log Out</span>
              </button>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="bg-[green] hover:bg-[darkgreen] text-white
                  py-1.5 px-3 sm:py-2 sm:px-4
                  rounded-md transition flex items-center"
                >
                  <UserPlus size={18} />
                  <span className="hidden sm:inline ml-2">Sign Up</span>
                </Link>

                <Link
                  to="/login"
                  className="bg-[green] hover:bg-[darkgreen] text-white
                  py-1.5 px-3 sm:py-2 sm:px-4
                  rounded-md transition flex items-center"
                >
                  <LogIn size={18} />
                  <span className="hidden sm:inline ml-2">Login</span>
                </Link>
              </>
            )}

          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
