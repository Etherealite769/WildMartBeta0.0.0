import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import '../styles/Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    fetchUserInfo();
    fetchCart();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [cartItems]);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/user/account', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUserInfo(response.data);
      setShippingAddress(response.data.shippingAddress || '');
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/cart', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Checkout - Cart response:', response.data);
      const items = response.data.items || [];
      console.log('Checkout - Items array:', items);
      console.log('Checkout - Items length:', items.length);
      
      setCartItems(items);
      
      // Check after setting items, not before
      if (items.length === 0) {
        console.log('Checkout - Cart is empty, redirecting...');
        toast.info('Your cart is empty');
        setTimeout(() => navigate('/cart'), 100);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      console.error('Error details:', error.response?.data);
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

  const handlePlaceOrder = async () => {
    // Validation
    if (!shippingAddress || shippingAddress.trim() === '') {
      toast.error('Please enter a shipping address');
      return;
    }

    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setProcessing(true);

    try {
      const response = await axios.post('http://localhost:8080/api/orders/checkout', 
        {
          shippingAddress: shippingAddress.trim(),
          paymentMethod: paymentMethod
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );

      toast.success('Order placed successfully!');
      navigate('/success', { state: { orderData: response.data } });
    } catch (error) {
      console.error('Error placing order:', error);
      
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to place order. Please try again.');
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <Navbar />
        <div className="checkout-container">
          <h2>Checkout</h2>
          <div className="loading-checkout">Loading checkout...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Navbar />
      
      <div className="checkout-container">
        <h2>Checkout</h2>

        <div className="checkout-content">
          {/* Order Summary */}
          <div className="checkout-section order-summary-section">
            <h3>Order Summary</h3>
            <div className="order-items">
              {cartItems.map(item => {
                const productName = item.product?.productName || item.product?.name || 'Product';
                const productImage = item.product?.imageUrl || '/placeholder.png';
                const itemPrice = Number(item.priceAtAddition || item.product?.price || 0);
                const itemTotal = itemPrice * item.quantity;
                
                return (
                  <div key={item.id} className="order-item">
                    <div className="order-item-image">
                      <img 
                        src={productImage} 
                        alt={productName}
                        onError={(e) => {
                          e.target.src = '/placeholder.png';
                          e.target.onerror = null;
                        }}
                      />
                    </div>
                    <div className="order-item-details">
                      <h4>{productName}</h4>
                      <p className="order-item-price">₱{itemPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })} × {item.quantity}</p>
                    </div>
                    <div className="order-item-total">
                      <p>₱{itemTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="order-summary-total">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>₱0.00</span>
              </div>
              <div className="summary-row total-row">
                <strong>Total:</strong>
                <strong>₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>
          </div>

          {/* Shipping & Payment */}
          <div className="checkout-section checkout-form-section">
            <div className="form-section">
              <h3>Shipping Address</h3>
              <div className="address-options">
                <label className="address-option">
                  <input
                    type="radio"
                    name="addressType"
                    value="meetup"
                    checked={shippingAddress === 'Meet up at school'}
                    onChange={() => setShippingAddress('Meet up at school')}
                  />
                  <span className="address-label">
                    <strong>Meet up at school</strong>
                    <small>Pick up your order at school</small>
                  </span>
                </label>
                
                <label className="address-option">
                  <input
                    type="radio"
                    name="addressType"
                    value="custom"
                    checked={shippingAddress !== 'Meet up at school'}
                    onChange={() => setShippingAddress(userInfo?.shippingAddress || '')}
                  />
                  <span className="address-label">
                    <strong>Deliver to address</strong>
                    <small>Enter your delivery address below</small>
                  </span>
                </label>
              </div>
              
              {shippingAddress !== 'Meet up at school' && (
                <textarea
                  className="address-input"
                  placeholder="Enter your complete shipping address"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  rows="4"
                  required
                />
              )}
            </div>

            <div className="form-section">
              <h3>Payment Method</h3>
              <div className="payment-methods">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={paymentMethod === 'Cash on Delivery'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="payment-label">
                    <strong>Cash on Delivery</strong>
                    <small>Pay when you receive your order</small>
                  </span>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="GCash"
                    checked={paymentMethod === 'GCash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="payment-label">
                    <strong>GCash</strong>
                    <small>Digital wallet payment</small>
                  </span>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Bank Transfer"
                    checked={paymentMethod === 'Bank Transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="payment-label">
                    <strong>Bank Transfer</strong>
                    <small>Direct bank-to-bank transfer</small>
                  </span>
                </label>
              </div>
            </div>

            <div className="checkout-actions">
              <button 
                className="btn-back"
                onClick={() => navigate('/cart')}
                disabled={processing}
              >
                Back to Cart
              </button>
              <button 
                className="btn-place-order"
                onClick={handlePlaceOrder}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
