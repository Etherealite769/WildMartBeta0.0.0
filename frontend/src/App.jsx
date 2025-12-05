import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import EditProfile from './pages/EditProfile';
import SellerPage from './pages/SellerPage';
import MyProducts from './pages/MyProducts';
import MyPurchases from './pages/MyPurchases';
import MyLikes from './pages/MyLikes';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import SuccessfulBuy from './pages/SuccessfulBuy';
import ProductDetails from './pages/ProductDetails';
import RecentlyViewed from './pages/RecentlyViewed';
import AccountInformation from './pages/AccountInformation';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Verify the token with the backend
          await axios.get('http://localhost:8080/api/auth/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Session expired or invalid token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Show loading state while checking auth
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/edit-profile" 
            element={isAuthenticated ? <EditProfile /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/seller/:id" 
            element={<SellerPage />} 
          />
          <Route 
            path="/my-products" 
            element={isAuthenticated ? <MyProducts /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/my-purchases" 
            element={isAuthenticated ? <MyPurchases /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/my-likes" 
            element={isAuthenticated ? <MyLikes /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/my-orders" 
            element={isAuthenticated ? <MyOrders /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/order-details/:orderId" 
            element={isAuthenticated ? <OrderDetails /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/cart" 
            element={isAuthenticated ? <Cart /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/checkout" 
            element={isAuthenticated ? <Checkout /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/success" 
            element={isAuthenticated ? <SuccessfulBuy /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/product/:id" 
            element={<ProductDetails />} 
          />
          <Route 
            path="/recently-viewed" 
            element={isAuthenticated ? <RecentlyViewed /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/account" 
            element={isAuthenticated ? <AccountInformation /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/add-product" 
            element={isAuthenticated ? <AddProduct /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/edit-product/:productId" 
            element={isAuthenticated ? <EditProduct /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
