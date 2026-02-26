# 🛒 E-Commerce Application

A full-stack e-commerce application built using the MERN stack, featuring secure authentication, role-based access control, product management, cart functionality, checkout flow, Stripe payment integration, and an admin dashboard.

This project demonstrates scalable backend architecture, secure payment processing, session management with Redis, and real-world production design patterns.

---

# 🚀 Features

### 👤 Authentication & Authorization
- JWT-based authentication (Access + Refresh Tokens)
- Role-based access control (Admin / User)
- Secure password hashing using bcrypt
- Protected routes using middleware
- Token/session management with Redis (Upstash)

### 🛍️ User Functionality
- Browse products with dynamic catalog
- Add to cart / remove from cart
- Quantity management
- Secure checkout flow
- Stripe-powered online payment integration
- Order history tracking

### 🛠️ Admin Functionality
- Admin dashboard
- Create, update, delete products
- Image upload and optimization via Cloudinary
- View and manage orders
- Role-based route protection

### 🎨 UI/UX
- Fully responsive design
- Clean, modern UI built with Tailwind CSS
- Optimized state updates and API integration

---

# 🏗️ System Architecture

## Backend Architecture

- RESTful API built with Express.js
- MongoDB for persistent data storage
- JWT authentication using access and refresh tokens
- Redis (Upstash) for refresh token/session management
- Cloudinary for image storage and optimization
- Stripe API for secure payment processing
- Centralized error handling middleware
- Schema validation and data modeling with Mongoose

## Frontend Architecture

- React.js Single Page Application
- Component-based architecture
- API integration using secure token-based requests
- Responsive UI using Tailwind CSS
- Structured state handling for cart and authentication

---

# 🔄 Application Flow

### Authentication Flow
1. User registers or logs in  
2. Access and Refresh tokens are generated  
3. Access token used for protected API calls  
4. Refresh token stored securely and managed via Redis  

### Product & Cart Flow
1. Products fetched from MongoDB  
2. User adds products to cart  
3. Cart updates dynamically  
4. Checkout initiates Stripe session  

### Payment Flow
1. Stripe Checkout session created  
2. User completes payment securely  
3. Stripe verifies payment  
4. Order stored in database  
5. Cart cleared after successful transaction  

---

# 🧠 Tech Stack

## Frontend
- React.js  
- Tailwind CSS  
- JavaScript (ES6+)  

## Backend
- Node.js  
- Express.js  
- MongoDB  
- Mongoose  
- JWT (Access & Refresh Tokens)  
- bcrypt  
- Redis (Upstash)  
- Stripe API  
- Cloudinary  

---

# 🔐 Security Features

- Password hashing with bcrypt + salt  
- Stateless JWT authentication  
- Refresh token rotation  
- Redis-backed session control  
- Role-based access middleware  
- Protected admin routes  
- Secure Stripe payment handling  
- Environment variable protection  
- Centralized error handling  

---

# ⚙️ Environment Variables

Create a `.env` file inside the backend directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=your_mongo_uri

# Authentication
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Redis
UPSTASH_REDIS_URL=your_redis_url

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
CLIENT_URL=http://localhost:5173
```

Create a `.env` file inside the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

---

# 🛠️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/e-commerce-application.git
cd e-commerce-application
```

## 2️⃣ Install Backend Dependencies

```bash
cd backend
npm install
```

## 3️⃣ Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## 4️⃣ Run Application

Start backend:

```bash
cd ../backend
npm run dev
```

Start frontend:

```bash
cd ../frontend
npm run dev
```

---

# 🌍 Deployment

- Frontend deployed on Vercel
- Backend deployed on Render 
