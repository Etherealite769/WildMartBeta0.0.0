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
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherCode, setVoucherCode] = useState('');

  useEffect(() => {
    fetchUserInfo();
    fetchCart();
    fetchVouchers();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [cartItems, selectedVoucher]);

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

  const fetchVouchers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/vouchers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setVouchers(response.data);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    }
  };

  const calculateTotal = () => {
    const sum = cartItems.reduce((acc, item) => {
      const price = item.priceAtAddition || item.product?.price || 0;
      return acc + (Number(price) * item.quantity);
    }, 0);
    
    setTotal(sum);
  };

  const calculateShippingFee = () => {
    // 5% shipping fee based on subtotal
    return total * 0.05;
  };

  const calculateDiscount = () => {
    if (!selectedVoucher) return 0;
    
    const subtotal = cartItems.reduce((acc, item) => {
      const price = item.priceAtAddition || item.product?.price || 0;
      return acc + (Number(price) * item.quantity);
    }, 0);
    
    const shippingFee = calculateShippingFee();
    
    let discount = 0;
    
    switch (selectedVoucher.discountType) {
      case 'PERCENTAGE':
        discount = subtotal * (selectedVoucher.discountValue / 100);
        break;
      case 'FIXED_AMOUNT':
        discount = selectedVoucher.discountValue;
        break;
      case 'SHIPPING':
        discount = shippingFee; // Free shipping
        break;
      default:
        discount = 0;
    }
    
    // Ensure discount doesn't exceed subtotal + shipping
    const maxDiscount = subtotal + shippingFee;
    return Math.min(discount, maxDiscount);
  };

  const getGrandTotal = () => {
    const subtotal = cartItems.reduce((acc, item) => {
      const price = item.priceAtAddition || item.product?.price || 0;
      return acc + (Number(price) * item.quantity);
    }, 0);
    
    const shippingFee = calculateShippingFee();
    return subtotal + shippingFee - calculateDiscount();
  };

  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) {
      toast.error('Please enter a voucher code');
      return;
    }
    
    const voucher = vouchers.find(v => v.discountCode === voucherCode.toUpperCase());
    if (!voucher) {
      toast.error('Invalid voucher code');
      return;
    }
    
    // Check minimum order amount
    if (voucher.minimumOrderAmount && total < voucher.minimumOrderAmount) {
      toast.error(`Minimum order amount is ₱${voucher.minimumOrderAmount.toFixed(2)}`);
      return;
    }
    
    setSelectedVoucher(voucher);
    toast.success(`Voucher applied: ${voucher.discountCode}`);
  };

  const handleRemoveVoucher = () => {
    setSelectedVoucher(null);
    setVoucherCode('');
    toast.info('Voucher removed');
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
      const orderData = {
        shippingAddress: shippingAddress.trim(),
        paymentMethod: paymentMethod
      };
      
      // Add voucher code if selected
      if (selectedVoucher) {
        orderData.voucherCode = selectedVoucher.discountCode;
      }
      
      const response = await axios.post('http://localhost:8080/api/orders/checkout', 
        orderData,
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

  const discountAmount = calculateDiscount();
  const shippingFee = calculateShippingFee();
  const grandTotal = getGrandTotal();

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
                      <p className="order-item-price">₱{itemPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × {item.quantity}</p>
                    </div>
                    <div className="order-item-total">
                      <p>₱{itemTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="order-summary-total">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              
              <div className="summary-row">
                <span>Shipping (5%):</span>
                <span>₱{shippingFee.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              
              {selectedVoucher && (
                <div className="summary-row discount-row">
                  <span>Discount ({selectedVoucher.discountCode}):</span>
                  <span>-₱{discountAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              
              <div className="summary-row total-row">
                <strong>Total:</strong>
                <strong>₱{grandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
            </div>
          </div>

          {/* Shipping & Payment */}
          <div className="checkout-section checkout-form-section">
            {/* Voucher Section */}
            <div className="form-section">
              <h3>Voucher</h3>
              {selectedVoucher ? (
                <div className="voucher-applied">
                  <div className="voucher-info">
                    <span className="voucher-code">{selectedVoucher.discountCode}</span>
                    <span className="voucher-discount">
                      {selectedVoucher.discountType === 'PERCENTAGE' && `${selectedVoucher.discountValue}% OFF`}
                      {selectedVoucher.discountType === 'FIXED_AMOUNT' && `₱${selectedVoucher.discountValue.toFixed(2)} OFF`}
                      {selectedVoucher.discountType === 'SHIPPING' && 'FREE SHIPPING'}
                    </span>
                  </div>
                  <button 
                    className="btn-remove-voucher"
                    onClick={handleRemoveVoucher}
                    disabled={processing}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="voucher-input-container">
                  <input
                    type="text"
                    className="voucher-input"
                    placeholder="Enter voucher code"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    disabled={processing}
                  />
                  <button 
                    className="btn-apply-voucher"
                    onClick={handleApplyVoucher}
                    disabled={processing}
                  >
                    Apply
                  </button>
                </div>
              )}
              
              {vouchers.length > 0 && (
                <div className="available-vouchers">
                  <h4>Available Vouchers:</h4>
                  <div className="voucher-list">
                    {vouchers.map(voucher => (
                      <div key={voucher.discountId} className="voucher-card">
                        <div className="voucher-card-header">
                          <span className="voucher-card-code">{voucher.discountCode}</span>
                          <span className="voucher-card-type">
                            {voucher.discountType === 'PERCENTAGE' && `${voucher.discountValue}% OFF`}
                            {voucher.discountType === 'FIXED_AMOUNT' && `₱${voucher.discountValue.toFixed(2)} OFF`}
                            {voucher.discountType === 'SHIPPING' && 'FREE SHIPPING'}
                          </span>
                        </div>
                        <div className="voucher-card-details">
                          {voucher.minimumOrderAmount && (
                            <small>Min. order: ₱{voucher.minimumOrderAmount.toFixed(2)}</small>
                          )}
                          <small>Valid until: {new Date(voucher.validUntil).toLocaleDateString()}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
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