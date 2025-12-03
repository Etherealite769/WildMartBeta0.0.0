import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import '../styles/Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

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
    if (newQuantity < 1) return;
    try {
      await axios.put(`http://localhost:8080/api/cart/items/${itemId}`, 
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await axios.delete(`http://localhost:8080/api/cart/items/${itemId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCheckout = async () => {
    try {
      await axios.post('http://localhost:8080/api/orders/checkout', 
        { cartItems },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      navigate('/success');
    } catch (error) {
      console.error('Error during checkout:', error);
    }
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
                
                return (
                  <div key={item.id} className="cart-item">
                    <div className="item-image">
                      <img src={productImage} alt={productName} />
                    </div>
                    <div className="item-details">
                      <h3>{productName}</h3>
                      <p className="item-price">₱{itemPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="item-quantity">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <div className="item-total">
                      <p>₱{itemTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <button 
                      className="btn-remove"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>₱0.00</span>
              </div>
              <div className="summary-row total">
                <strong>Total:</strong>
                <strong>₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong>
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
    </div>
  );
};

export default Cart;
