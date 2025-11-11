# WildMart E-commerce Frontend

A modern React-based e-commerce frontend application for WildMart, designed to work with a Spring Boot backend.

## Features

- **Landing Page**: Welcome page with brand introduction
- **Authentication**: Login and Signup pages
- **Dashboard**: Browse products with search and category filters
- **Profile Management**: View and edit user profile
- **Product Management**: Add, edit, and manage products
- **Shopping Cart**: Add products to cart and checkout
- **Orders**: View order history and status
- **Seller Pages**: View seller profiles and their products
- **Likes**: Save favorite products
- **Recently Viewed**: Track browsing history

## Tech Stack

- **React 18**: Modern React with hooks
- **React Router v6**: Client-side routing
- **Axios**: HTTP client for API calls
- **CSS3**: Custom styling with modern CSS features

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Spring Boot backend running on `http://localhost:8080`

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── placeholder.png
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── ProductCard.jsx
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Profile.jsx
│   │   ├── EditProfile.jsx
│   │   ├── SellerPage.jsx
│   │   ├── MyProducts.jsx
│   │   ├── MyPurchases.jsx
│   │   ├── MyLikes.jsx
│   │   ├── MyOrders.jsx
│   │   ├── Cart.jsx
│   │   ├── SuccessfulBuy.jsx
│   │   ├── ProductDetails.jsx
│   │   ├── RecentlyViewed.jsx
│   │   └── AccountInformation.jsx
│   ├── styles/
│   │   └── [CSS files for each component]
│   ├── App.jsx
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## API Endpoints Expected

The frontend expects the following API endpoints from the Spring Boot backend:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/account` - Get account information
- `PUT /api/user/account` - Update account information
- `GET /api/user/products` - Get user's products
- `GET /api/user/purchases` - Get user's purchases
- `GET /api/user/orders` - Get user's orders
- `GET /api/user/likes` - Get liked products
- `POST /api/user/likes/{id}` - Like a product
- `DELETE /api/user/likes/{id}` - Unlike a product
- `GET /api/user/recently-viewed` - Get recently viewed products

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/items/{id}` - Update cart item
- `DELETE /api/cart/items/{id}` - Remove cart item

### Orders
- `POST /api/orders/checkout` - Checkout cart

### Sellers
- `GET /api/sellers/{id}` - Get seller information
- `GET /api/sellers/{id}/products` - Get seller's products

## Configuration

To change the backend API URL, update the axios base URL in each component or create a central API configuration file.

Default backend URL: `http://localhost:8080`

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Features to Implement in Backend

To fully support this frontend, your Spring Boot backend should implement:

1. **User Authentication & Authorization**
   - JWT token-based authentication
   - User registration and login
   - Password encryption

2. **User Management**
   - Profile CRUD operations
   - Account settings
   - User statistics

3. **Product Management**
   - Product CRUD operations
   - Image upload support
   - Category filtering
   - Search functionality

4. **Shopping Cart**
   - Cart item management
   - Quantity updates

5. **Order Management**
   - Order creation
   - Order status tracking
   - Order history

6. **Wishlist/Likes**
   - Like/unlike products
   - View liked products

7. **Seller Features**
   - Seller profiles
   - Seller product listings

## Styling

The application uses custom CSS with a modern, clean design:
- Color scheme: Purple gradient (#667eea, #764ba2) for primary elements
- Responsive design for mobile and desktop
- Smooth animations and transitions
- Card-based layouts

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is part of the WildMart e-commerce platform.
