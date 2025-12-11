import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import ConfirmModal from '../components/ConfirmModal';
import '../styles/Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Add this to get navigation state
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedItemsTotal, setSelectedItemsTotal] = useState(0); // New state for selected items total
  const [loading, setLoading] = useState(true);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set()); // For delete selection
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false); // For bulk delete confirmation

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    calculateTotal();
    calculateSelectedItemsTotal(); // Calculate total for selected items
  }, [cartItems, selectedItems]);

  // Add effect to restore selected items when coming back from checkout
  useEffect(() => {
    const previouslySelectedItems = location.state?.selectedItems;
    if (previouslySelectedItems && previouslySelectedItems.length > 0) {
      setSelectedItems(new Set(previouslySelectedItems));
    }
  }, [location.state]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/cart', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Cart - Full cart response:', response.data);
      console.log('Cart - Items array:', response.data.items || []);
      setCartItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total only for selected items
  const calculateSelectedItemsTotal = () => {
    // If no items are selected, total should be zero
    if (selectedItems.size === 0) {
      setSelectedItemsTotal(0);
      return;
    }
    
    // Only calculate total for selected items
    const selectedItemsArray = cartItems.filter(item => selectedItems.has(item.id));
    const sum = selectedItemsArray.reduce((acc, item) => {
      const price = item.priceAtAddition || item.product?.price || 0;
      return acc + (Number(price) * item.quantity);
    }, 0);
    setSelectedItemsTotal(sum);
  };

  // Calculate total for all items (not just selected)
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
    
    // Optimistically update the UI
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
    
    try {
      await axios.put(`http://localhost:8080/api/cart/items/${itemId}`, 
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
    } catch (error) {
      // Revert the optimistic update if the request fails
      fetchCart(); // Refresh the cart to get the actual state
      
      console.error('Error updating quantity:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else if (error.response?.status === 400 && error.response?.data?.error) {
        // Handle specific error messages from backend (e.g., stock validation)
        toast.error(error.response.data.error);
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

  // Selection functions for delete
  const toggleSelectItem = (itemId) => {
    console.log('Cart - Toggling selection for item ID:', itemId, 'Current type:', typeof itemId);
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId);
      console.log('Cart - Item deselected, new selection size:', newSelectedItems.size);
    } else {
      newSelectedItems.add(itemId);
      console.log('Cart - Item selected, new selection size:', newSelectedItems.size);
    }
    setSelectedItems(newSelectedItems);
  };

  const selectAllItems = () => {
    console.log('Cart - Select all clicked, current selection size:', selectedItems.size, 'Total items:', cartItems.length);
    if (selectedItems.size === cartItems.length && cartItems.length > 0) {
      // If all items are selected, deselect all
      setSelectedItems(new Set());
      console.log('Cart - All items deselected');
    } else {
      // Otherwise, select all items
      const allItemIds = cartItems.map(item => item.id);
      console.log('Cart - Selecting all item IDs:', allItemIds);
      setSelectedItems(new Set(allItemIds));
    }
  };

  const confirmBulkDelete = () => {
    if (selectedItems.size === 0) return;
    setShowBulkDeleteModal(true);
  };

  const executeBulkDelete = async () => {
    try {
      // Create array of promises for all delete requests
      const deletePromises = Array.from(selectedItems).map(itemId =>
        axios.put(`http://localhost:8080/api/cart/items/${itemId}`, 
          { quantity: 0 },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
        )
      );
      
      // Execute all delete requests
      await Promise.all(deletePromises);
      
      // Clear selection and refresh cart
      setSelectedItems(new Set());
      setShowBulkDeleteModal(false);
      fetchCart();
      toast.success(`${selectedItems.size} item${selectedItems.size !== 1 ? 's' : ''} removed from cart`);
    } catch (error) {
      console.error('Error removing items:', error);
      toast.error('Failed to remove items. Please try again.');
      setShowBulkDeleteModal(false);
    }
  };

  const handleCheckout = () => {
    // Check if we have selected items
    const selectedItemsArray = selectedItems.size > 0 
      ? Array.from(selectedItems) 
      : cartItems.map(item => item.id);
      
    // If no items are selected, we can't checkout
    if (selectedItemsArray.length === 0) {
      toast.error('Please select at least one item to checkout');
      return;
    }
    
    // Group selected items by seller
    const selectedCartItems = cartItems.filter(item => selectedItemsArray.includes(item.id));
    const sellers = new Map();
    
    selectedCartItems.forEach(item => {
      const seller = item.product?.seller;
      const sellerId = seller?.userId || 'unknown';
      
      if (!sellers.has(sellerId)) {
        sellers.set(sellerId, {
          sellerInfo: seller,
          items: []
        });
      }
      
      sellers.get(sellerId).items.push(item);
    });
    
    // Check if items are from multiple sellers
    if (sellers.size > 1) {
      toast.error('You can only checkout items from a single seller at a time');
      return;
    }
    
    console.log('Cart - Selected items to checkout:', selectedItemsArray);
    console.log('Cart - Selected items set size:', selectedItems.size);
    console.log('Cart - Total cart items:', cartItems.length);
    console.log('Cart - Cart items structure:', cartItems);
      
    navigate('/checkout', { 
      state: { 
        selectedItems: selectedItemsArray
      } 
    });
  };

  // Check if multiple sellers are selected
  const hasMultipleSellersSelected = () => {
    if (selectedItems.size === 0) return false;
    
    const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
    const sellers = new Set();
    
    selectedCartItems.forEach(item => {
      const seller = item.product?.seller;
      const sellerId = seller?.userId || 'unknown';
      sellers.add(sellerId);
    });
    
    return sellers.size > 1;
  };

  const cancelBulkDelete = () => {
    setShowBulkDeleteModal(false);
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

  // Group cart items by seller
  const groupItemsBySeller = (items) => {
    const sellers = new Map();
    
    items.forEach(item => {
      // Enhanced seller name extraction to get full name
      let sellerName = 'Unknown Seller';
      let sellerId = 'unknown';
      
      // Try to get seller information from the nested seller object
      const seller = item.product?.seller;
      
      if (seller) {
        sellerId = seller.userId || 'unknown';
        // Get full name from seller object
        if (seller.fullName) {
          sellerName = seller.fullName;
        } else if (seller.username) {
          sellerName = seller.username;
        } else if (seller.email) {
          sellerName = seller.email;
        }
      } else if (item.product?.sellerName) {
        sellerName = item.product.sellerName;
      } else if (item.product?.fullName) { // Check for fullName field
        sellerName = item.product.fullName;
      } else if (item.product?.full_name) { // Check for full_name field
        sellerName = item.product.full_name;
      }
      
      if (!sellers.has(sellerId)) {
        sellers.set(sellerId, {
          sellerName,
          sellerInfo: seller,
          items: []
        });
      }
      
      sellers.get(sellerId).items.push(item);
    });
    
    return Array.from(sellers.values());
  };

  // Select all items from a specific seller
  const selectAllFromSeller = (sellerItems) => {
    const itemIds = sellerItems.map(item => item.id);
    const newSelectedItems = new Set(selectedItems);
    
    // Check if all items from this seller are already selected
    const allSelected = itemIds.every(id => selectedItems.has(id));
    
    if (allSelected) {
      // Deselect all items from this seller
      itemIds.forEach(id => newSelectedItems.delete(id));
    } else {
      // Select all items from this seller
      itemIds.forEach(id => newSelectedItems.add(id));
    }
    
    setSelectedItems(newSelectedItems);
  };

  // Group cart items by seller for display
  const groupedCartItems = groupItemsBySeller(cartItems);

  return (
    <div className="cart-page">
      <Navbar />
      
      <div className="cart-container">
        <h2>Shopping Cart</h2>

        {cartItems.length > 0 ? (
          <div className="cart-content">
            <div className="cart-main">
              {/* Selection controls for delete */}
              <div className="selection-controls">
                <div className="selection-actions">
                  <label className="select-all-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                      onChange={selectAllItems}
                    />
                    Select All
                  </label>
                  
                  <button 
                    className="btn-action-secondary"
                    onClick={confirmBulkDelete}
                    disabled={selectedItems.size === 0}
                  >
                    Delete Selected ({selectedItems.size})
                  </button>
                </div>
              </div>
              
              <div className="cart-items">
                {groupedCartItems.map((sellerGroup, sellerIndex) => (
                  <div key={sellerGroup.sellerInfo?.userId || sellerIndex} className="seller-group">
                    <div className="seller-header">
                      <h3>Seller: {sellerGroup.sellerName}</h3>
                      <button 
                        className="btn-select-seller"
                        onClick={() => selectAllFromSeller(sellerGroup.items)}
                      >
                        {sellerGroup.items.every(item => selectedItems.has(item.id)) ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    {sellerGroup.items.map(item => {
                      const productName = item.product?.productName || item.product?.name || 'Product';
                      const productImage = item.product?.imageUrl || '/placeholder.png';
                      const itemPrice = Number(item.priceAtAddition || item.product?.price || 0);
                      const itemTotal = itemPrice * item.quantity;
                      const isSelected = selectedItems.has(item.id);
                      const quantityAvailable = item.product?.quantityAvailable || 0;
                      
                      return (
                        <div key={item.id} className={`cart-item ${isSelected ? 'selected' : ''}`}>
                          <div className="item-selection">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectItem(item.id)}
                            />
                          </div>
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
                            <p className="unit-price">Unit Price: ₱{itemPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                          </div>
                          <div className="item-quantity-controls">
                            <button 
                              className="quantity-btn"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="quantity-display">{item.quantity}</span>
                            <button 
                              className="quantity-btn"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= quantityAvailable}
                            >
                              +
                            </button>
                          </div>
                          <div className="cart-item-actions">
                            <div className="item-total">
                              <p>₱{itemTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₱{selectedItemsTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>₱0.00</span>
              </div>
              <div className="summary-row total">
                <strong>Total:</strong>
                <strong className="total-amount">₱{selectedItemsTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
              <button
                className={`btn-checkout ${hasMultipleSellersSelected() ? 'btn-checkout-disabled' : ''}`}
                onClick={handleCheckout}
                disabled={cartItems.length === 0 || hasMultipleSellersSelected()}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
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
      
      <ConfirmModal
        isOpen={showBulkDeleteModal}
        title="Remove Items"
        message={`Are you sure you want to remove ${selectedItems.size} selected item${selectedItems.size !== 1 ? 's' : ''} from your cart?`}
        onConfirm={executeBulkDelete}
        onCancel={cancelBulkDelete}
        confirmText="Yes, Remove"
        cancelText="No, Keep Them"
        type="danger"
      />
    </div>
  );
};

export default Cart;