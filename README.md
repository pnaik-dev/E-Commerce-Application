# E-Commerce Application

A full-stack e-commerce platform featuring secure authentication, product management, online payments, and an admin dashboard.

## Overview
This application demonstrates real-world MERN stack development with a focus on scalability, security, and performance.

## Key Features
- User authentication and authorization using JWT
- Role-based access control (Admin / User)
- Product catalog with cart and checkout functionality
- Secure payment integration using Stripe
- Admin dashboard for product and order management
- Responsive UI for all screen sizes

## Tech Stack
Frontend:
- React.js
- Tailwind CSS
- JavaScript (ES6+)

Backend:
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Stripe API

## System Design
- RESTful API architecture
- Secure authentication middleware
- MongoDB schema validation
- Centralized error handling

## Architecture Overview
- REST-based backend using Express and MongoDB
- JWT authentication with access and refresh tokens
- Redis (Upstash) for token/session management
- Cloudinary for image storage and optimization
- Stripe for secure payment processing

## Environment Variables
Create a `.env` file in the backend directory:

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

## Setup Instructions
```bash
git clone https://github.com/your-username/E-Commerce-Application.git
cd backend && npm install
cd ../frontend && npm install
npm run dev
```
