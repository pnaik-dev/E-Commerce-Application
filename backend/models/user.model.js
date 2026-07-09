import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Define the User schema
const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
			minlength: [3, "Name must be at least 3 characters long"],
			maxlength: [50, "Name must be at most 50 characters long"],
			match: [/^[a-zA-ZÀ-ž\s.'-]+$/, "Name can only contain letters and valid characters",],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			index:true,
			lowercase: true,
			trim: true,
			match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,"Please enter a valid email address",],
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: [8, "Password must be at least 8 characters long"],
			trim:true,
			match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/,"Password must include uppercase, lowercase, number & special character",],
			select: false,
		},
		cartItems: [
			{
				quantity: {
					type: Number,
					default: 1,
				},
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
				},
			},
		],
		role: {
			type: String,
			enum: ["customer", "admin"],
			default: "customer",
		},
	},
	{
		timestamps: true,
	}
);

// Pre-save hook to hash password before saving to database
userSchema.pre("save", async function (next) {
	// only hash the password if it has been modified
	if (!this.isModified("password")) return next();

	try {
		// generate a salt and hash the password
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		// proceed to the next middleware
		next();
	} catch (error) {
		next(error);
	}
});

// Method to compare entered password with hashed password in database
userSchema.methods.comparePassword = async function (password) {
	return bcrypt.compare(password, this.password);
};

// Create the User model
const User = mongoose.model("User", userSchema);

export default User;
