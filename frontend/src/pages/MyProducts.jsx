import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import ConfirmModal from '../components/ConfirmModal';
import '../styles/MyProducts.css';
import '../styles/OrderDetails.css';

const MyProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState({
    title: '',
    message: '',
    onConfirm: null,
    type: 'default'
  });

  useEffect(() => {
    fetchMyProducts();
    fetchMySales();
  }, []);

  const fetchMyProducts = async () => {
    // Fetch from backend
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/user/products', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products from backend:', error);
      // Optionally, set products to empty array or show an error message to the user
      setProducts([]); 
    }
  };

  const fetchMySales = async () => {
    // Fetch sales from backend
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/user/sales', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setSales(response.data);
    } catch (error) {
      console.error('Error fetching sales from backend:', error);
      // Optionally, set sales to empty array or show an error message to the user
      setSales([]); 
    }
  };

  const handleDelete = async (productId) => {
    setConfirmModalData({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product?',
      onConfirm: () => {
        setShowConfirmModal(false);
        deleteProduct(productId);
      },
      type: 'danger'
    });
    setShowConfirmModal(true);
  };

  const deleteProduct = async (productId) => {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8080/api/products/${productId}`, {
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });

        fetchMyProducts(); // Refresh the list
        setSelectedProduct(null); // Close modal
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Error deleting product. Please try again.');
      }
  };

  const filteredProducts = products.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const filteredSales = sales.filter(sale => {
    if (filter === 'all') return true;
    // For sales, we consider them "sold" if they have any items
    return filter === 'sold' && sale.items && sale.items.length > 0;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case 'active':
        return 'available';
      case 'sold':
        return 'out-of-stock';
      case 'draft':
        return 'draft';
      default:
        return '';
    }
  };

  // Calculate values for display in sales details
  const calculateSaleValues = (sale) => {
    const totalAmount = Number(sale.totalAmount) || 0;
    const discountAmount = Number(sale.discountAmount) || 0;
    const shippingFee = Number(sale.shippingFee) || (totalAmount * 0.05); // Default to 5% if not provided
    const subtotal = totalAmount + discountAmount - shippingFee;
    
    return {
      totalAmount,
      discountAmount,
      shippingFee,
      subtotal
    };
  };

  return (
    <div className="my-products-page">
      <Navbar />
      
      <div className="my-products-container">
        <div className="page-header">
          <h2>My Products</h2>
          <button className="btn-add" onClick={() => navigate('/add-product')}>
            + Add Product
          </button>
        </div>

        <div className="filter-tabs">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button 
            className={`filter-btn ${filter === 'sold' ? 'active' : ''}`}
            onClick={() => setFilter('sold')}
          >
            Sold ({sales.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'draft' ? 'active' : ''}`}
            onClick={() => setFilter('draft')}
          >
            Draft
          </button>
        </div>

        {filter !== 'sold' ? (
          <div className="products-grid-my-products">
            {filteredProducts.length === 0 ? (
              <div className="empty-state">
                <p>No products found.</p>
              </div>
            ) : (
              filteredProducts.map(product => (
                <div key={product.productId} className="product-card-wrapper">
                  <ProductCard 
                    product={product} 
                    onClick={() => setSelectedProduct(product)}
                    showSeller={false}
                    showEditButton={true}
                  />
                  <span className={`product-status ${getStatusClass(product.status)}`}>
                    {product.status ? product.status.charAt(0).toUpperCase() + product.status.slice(1) : 'Draft'}
                  </span>
                </div>
              ))
            )}
          </div>
        ) : (
          // Display sales when 'sold' filter is active
          <div className="orders-list">
            {filteredSales.length > 0 ? (
              filteredSales.map(sale => (
                  <div className="order-main" onClick={() => setSelectedSale(sale)}>
                    <div className="order-number-col">
                      <span className="order-number">{sale.orderNumber || `#${sale.orderId}`}</span>
                    </div>
                    <div className="order-date-col">
                      <span className="label">Date:</span>
                      <span>{new Date(sale.orderDate).toLocaleDateString()}</span>
                    </div>
                    <div className="order-items-count-col">
                      <span className="label">Items:</span>
                      <span>{sale.items?.length || 0}</span>
                    </div>
                    <div className="order-total-col">
                      <span className="label">Total:</span>
                      <span className="amount">₱{Number(sale.totalAmount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="order-status-col">
                      <span className={`status-badge ${sale.orderStatus?.toLowerCase()}`}>
                        {sale.orderStatus}
                      </span>
                    </div>
                  </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="8" width="18" height="12" rx="2" ry="2"></rect>
                    <path d="M3 8l9-5 9 5"></path>
                    <line x1="12" y1="3" x2="12" y2="8"></line>
                  </svg>
                </div>
                <p>No sales yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedProduct(null)}>×</button>
            
            <div className="modal-body">
              <div className="modal-image">
                <img 
                  src={selectedProduct.imageUrl || '/placeholder.png'} 
                  alt={selectedProduct.productName}
                  onError={(e) => {
                    e.target.src = '/placeholder.png';
                  }}
                />
              </div>
              
              <div className="modal-info">
                <h2>{selectedProduct.productName}</h2>
                <p className="modal-price">₱{selectedProduct.price ? parseFloat(selectedProduct.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</p>
                
                <div className="modal-details">
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className={`product-status ${getStatusClass(selectedProduct.status)}`}>
                      {selectedProduct.status ? selectedProduct.status.charAt(0).toUpperCase() + selectedProduct.status.slice(1) : 'Draft'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Quantity Available:</span>
                    <span className="detail-value">{selectedProduct.quantityAvailable || 0}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Description:</span>
                    <p className="detail-description">{selectedProduct.description || 'No description provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-edit"
                onClick={() => {
                  navigate(`/edit-product/${selectedProduct.productId}`);
                  setSelectedProduct(null);
                }}
              >
                Edit
              </button>
              <button 
                className="btn-delete"
                onClick={() => handleDelete(selectedProduct.productId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Sales Order Details Modal - New Implementation */}
      {selectedSale && (
        <div className="modal-overlay-blur" onClick={() => setSelectedSale(null)}>
          <div className="sales-details-section" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sales-details-header">
              <h2>Order #{selectedSale.orderNumber || selectedSale.orderId} Details</h2>
              <button className="btn-close-details" onClick={() => setSelectedSale(null)}>
                Close
              </button>
            </div>
            
            {/* Content */}
            <div className="sales-details-content">
              {/* Left Column - Order Summary */}
              <div className="sales-summary-section">
                <div className="sales-summary-card">
                  <div className="summary-header">
                    <h3>Order Information</h3>
                  </div>
                  
                  <div className="summary-details">
                    <div className="detail-row">
                      <span className="detail-label">Order Date:</span>
                      <span className="detail-value">
                        {new Date(selectedSale.orderDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <span className={`status-badge ${selectedSale.orderStatus?.toLowerCase().replace(/\s+/g, '-')}`}>
                        {selectedSale.orderStatus}
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Payment Status:</span>
                      <span className={`status-badge ${selectedSale.paymentStatus?.toLowerCase()}`}>
                        {selectedSale.paymentStatus}
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Buyer:</span>
                      <span className="detail-value">
                        {selectedSale.buyer?.fullName || selectedSale.buyer?.username || 'Unknown Buyer'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="sales-summary-card">
                  <div className="summary-header">
                    <h3>Shipping Information</h3>
                  </div>
                  
                  <div className="summary-details">
                    <div className="detail-row">
                      <span className="detail-label">Shipping Address:</span>
                      <span className="detail-value">
                        {selectedSale.shippingAddress || 'No address provided'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Details */}
              <div className="sales-info-section">
                {/* Price Section */}
                <div className="sales-price-section">
                  <div className="price-label">Total Amount</div>
                  <div className="price-value">
                    <span className="currency">₱</span>
                    <span className="amount">
                      {Number(selectedSale.totalAmount || 0).toLocaleString('en-PH', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </span>
                  </div>
                </div>
                
                {/* Pricing Breakdown */}
                <div className="sales-pricing-breakdown">
                  <h3>Pricing Breakdown</h3>
                  <div className="pricing-breakdown">
                    {(() => {
                      const { totalAmount, discountAmount, shippingFee, subtotal } = calculateSaleValues(selectedSale);
                      return (
                        <>
                          <div className="summary-row">
                            <span>Subtotal:</span>
                            <span>
                              ₱{subtotal.toLocaleString('en-PH', { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })}
                            </span>
                          </div>
                          <div className="summary-row">
                            <span>Shipping:</span>
                            <span>
                              ₱{shippingFee.toLocaleString('en-PH', { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })}
                            </span>
                          </div>
                          {discountAmount > 0 && (
                            <div className="summary-row discount-row">
                              <span>Discount:</span>
                              <span>
                                -₱{discountAmount.toLocaleString('en-PH', { 
                                  minimumFractionDigits: 2, 
                                  maximumFractionDigits: 2 
                                })}
                              </span>
                            </div>
                          )}
                          <div className="summary-row total-row">
                            <strong>Total:</strong>
                            <strong>
                              ₱{totalAmount.toLocaleString('en-PH', { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })}
                            </strong>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
                
                {/* Order Items */}
                <div className="sales-order-items">
                  <h3>Order Items ({selectedSale.items?.length || 0})</h3>
                  <div className="order-items-list">
                    {selectedSale.items?.map(item => {
                      // Extract seller name with fallback logic
                      let sellerName = 'Unknown Seller';
                      const seller = item.product?.seller;
                      
                      if (item.product?.sellerName) {
                        sellerName = item.product.sellerName;
                      } else if (item.product?.fullName) {
                        sellerName = item.product.fullName;
                      } else if (item.product?.full_name) {
                        sellerName = item.product.full_name;
                      } else if (seller) {
                        if (seller.firstName && seller.lastName) {
                          sellerName = `${seller.firstName} ${seller.lastName}`;
                        } else if (seller.fullName) {
                          sellerName = seller.fullName;
                        } else if (seller.full_name) {
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
                          // Extract name from email (before @)
                          sellerName = seller.email.split('@')[0];
                        }
                      }
                      
                      return (
                        <div key={item.id} className="order-item">
                          <div className="item-image">
                            <img 
                              src={item.product?.imageUrl || '/placeholder.png'} 
                              alt={item.product?.productName}
                              onError={(e) => {
                                e.target.src = '/placeholder.png';
                              }}
                            />
                          </div>
                          <div className="item-details">
                            <h4>{item.product?.productName}</h4>
                            <p>Seller: {sellerName}</p>
                            <p>Quantity: {item.quantity}</p>
                            <p>
                              Price: ₱{Number(item.unitPrice).toLocaleString('en-PH', { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })}
                            </p>
                          </div>
                          <div className="item-price">
                            ₱{Number(item.subtotal).toLocaleString('en-PH', { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: 2 
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ConfirmModal
        isOpen={showConfirmModal}
        title={confirmModalData.title}
        message={confirmModalData.message}
        onConfirm={confirmModalData.onConfirm}
        onCancel={() => setShowConfirmModal(false)}
        type={confirmModalData.type}
      />
    </div>
  );
};

export default MyProducts;