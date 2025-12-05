import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import ConfirmModal from '../components/ConfirmModal';
import '../styles/Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [cartItems]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/cart', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Cart response:', response.data);
      setCartItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const sum = cartItems.reduce((acc, item) => {
      const price = item.priceAtAddition || item.product?.price || 0;
      return acc + (Number(price) * item.quantity);
    }, 0);
    setTotal(sum);
  };

  const updateQuantity = async (itemId, newQuantity) => {
    // If quantity reaches 0, show confirmation modal
    if (newQuantity === 0) {
      setItemToRemove(itemId);
      setShowRemoveModal(true);
      return;
    }
    
    if (newQuantity < 0) return;
    
    try {
      await axios.put(`http://localhost:8080/api/cart/items/${itemId}`, 
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      fetchCart();
      toast.success('Quantity updated successfully');
    } catch (error) {
      console.error('Error updating quantity:', error);
      
      if (error.response?.status === 403) {
        toast.error('Authorization failed. Your session may have expired. Please log in again.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        toast.error('Failed to update quantity. Please try again.');
      }
    }
  };

  const confirmRemoveItem = async () => {
    if (!itemToRemove) return;
    
    try {
      await axios.put(`http://localhost:8080/api/cart/items/${itemToRemove}`, 
        { quantity: 0 },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      setShowRemoveModal(false);
      setItemToRemove(null);
      fetchCart();
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item. Please try again.');
      setShowRemoveModal(false);
      setItemToRemove(null);
    }
  };

  const cancelRemove = () => {
    setShowRemoveModal(false);
    setItemToRemove(null);
  };



  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="cart-page">
        <Navbar />
        <div className="cart-container">
          <h2>Shopping Cart</h2>
          <div className="loading-cart">Loading cart...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Navbar />
      
      <div className="cart-container">
        <h2>Shopping Cart</h2>

        {cartItems.length > 0 ? (
          <>
            <div className="cart-items">
              {cartItems.map(item => {
                const productName = item.product?.productName || item.product?.name || 'Product';
                const productImage = item.product?.imageUrl || '/placeholder.png';
                const itemPrice = Number(item.priceAtAddition || item.product?.price || 0);
                const itemTotal = itemPrice * item.quantity;
                
                // Enhanced seller name extraction to get full name
                let sellerName = 'Unknown Seller';
                const seller = item.product?.seller;
                
                if (item.product?.sellerName) {
                  sellerName = item.product.sellerName;
                } else if (item.product?.fullName) { // Check for fullName field
                  sellerName = item.product.fullName;
                } else if (item.product?.full_name) { // Check for full_name field
                  sellerName = item.product.full_name;
                } else if (seller) {
                  // Try to get full name from various possible fields
                  if (seller.firstName && seller.lastName) {
                    sellerName = `${seller.firstName} ${seller.lastName}`;
                  } else if (seller.fullName) { // Check for fullName in seller object
                    sellerName = seller.fullName;
                  } else if (seller.full_name) { // Check for full_name in seller object
                    sellerName = seller.full_name;
                  } else if (seller.firstName) {
                    sellerName = seller.firstName;
                  } else if (seller.lastName) {
                    sellerName = seller.lastName;
                  } else if (seller.name) {
                    sellerName = seller.name;
                  } else if (seller.username) {
                    sellerName = seller.username;
                  } else if (seller.email) {
                    // Extract name from email if no other name is available
                    const emailName = seller.email.split('@')[0];
                    // Convert dots/hyphens/underscores to spaces and capitalize
                    sellerName = emailName.replace(/[-_.]/g, ' ')
                      .split(' ')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                      .join(' ');
                  }
                }
                
                return (
                  <div key={item.id} className="cart-item">
                    <div className="item-image">
                      <img 
                        src={productImage} 
                        alt={productName}
                        onError={(e) => {
                          e.target.src = '/placeholder.png';
                          e.target.onerror = null;
                        }}
                      />
                    </div>
                    <div className="item-details">
                      <h3>{productName}</h3>
                      <p className="item-seller">by {sellerName}</p>
                      <p className="unit-price">Unit Price: ₱{itemPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="item-quantity-controls">
                      <button 
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button 
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <div className="cart-item-actions">
                      <div className="item-total">
                        <p>₱{itemTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>₱0.00</span>
              </div>
              <div className="summary-row total">
                <strong>Total:</strong>
                <strong>₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
              <button 
                className="btn-checkout"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        ) : (
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <p className="empty-cart-text">Your cart is empty</p>
            <button 
              className="btn-shopping-now"
              onClick={() => navigate('/dashboard')}
            >
              Go Shopping Now
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showRemoveModal}
        title="Remove Item"
        message="Are you sure you want to remove this item from your cart?"
        onConfirm={confirmRemoveItem}
        onCancel={cancelRemove}
        confirmText="Yes, Remove"
        cancelText="No, Keep It"
        type="danger"
      />
    </div>
  );
};

export default Cart;