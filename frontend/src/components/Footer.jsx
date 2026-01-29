const Footer = () => {
	return (
		<footer className="w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg border-t border-emerald-800">
			<div className="container mx-auto px-4 py-3">
				<div className="flex justify-center items-center">
					<p className="text-sm sm:text-base font-medium text-gray-300 text-center">
						© {new Date().getFullYear()} E-Commerce Store. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
