import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import ConfirmModal from '../components/ConfirmModal';
import MessageModal from '../components/MessageModal';
import '../styles/MyProducts.css';
import '../styles/OrderDetails.css';

const MyProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [activeView, setActiveView] = useState('products'); // 'products' or 'sales'
  const [filter, setFilter] = useState('all');
  const [salesFilter, setSalesFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageBuyer, setMessageBuyer] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
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
    if (salesFilter === 'all') return true;
    return sale.orderStatus?.toLowerCase() === salesFilter.toLowerCase();
  });

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8080/api/user/sales/${orderId}/update-status`,
        { orderStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      // Update local state
      setSales(prev => prev.map(sale => 
        sale.orderId === orderId ? { ...sale, orderStatus: newStatus } : sale
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const openMessageModal = (sale) => {
    setMessageBuyer({
      id: sale.buyer?.userId,
      name: sale.buyer?.fullName || sale.buyer?.username,
      image: sale.buyer?.profileImage,
      orderId: sale.orderId,
      orderNumber: sale.orderNumber,
      orderDetails: sale
    });
    setShowMessageModal(true);
  };

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
          <h2>{activeView === 'products' ? 'My Products' : 'My Sales'}</h2>
          <div className="header-actions">
            <div className="view-toggle">
              <button 
                className={`view-btn ${activeView === 'products' ? 'active' : ''}`}
                onClick={() => setActiveView('products')}
              >
                Products
              </button>
              <button 
                className={`view-btn ${activeView === 'sales' ? 'active' : ''}`}
                onClick={() => setActiveView('sales')}
              >
                Sales ({sales.length})
              </button>
            </div>
            {activeView === 'products' && (
              <button className="btn-add" onClick={() => navigate('/add-product')}>
                + Add Product
              </button>
            )}
          </div>
        </div>

        {activeView === 'products' ? (
          <>
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
                Sold ({products.filter(p => p.status === 'sold').length})
              </button>
              <button 
                className={`filter-btn ${filter === 'draft' ? 'active' : ''}`}
                onClick={() => setFilter('draft')}
              >
                Draft
              </button>
            </div>

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
          </>
        ) : (
          <>
            <div className="filter-tabs">
              <button 
                className={`filter-btn ${salesFilter === 'all' ? 'active' : ''}`}
                onClick={() => setSalesFilter('all')}
              >
                All Orders ({sales.length})
              </button>
              <button 
                className={`filter-btn ${salesFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setSalesFilter('pending')}
              >
                Pending ({sales.filter(s => s.orderStatus?.toLowerCase() === 'pending').length})
              </button>
              <button 
                className={`filter-btn ${salesFilter === 'processing' ? 'active' : ''}`}
                onClick={() => setSalesFilter('processing')}
              >
                Processing ({sales.filter(s => s.orderStatus?.toLowerCase() === 'processing').length})
              </button>
              <button 
                className={`filter-btn ${salesFilter === 'shipped' ? 'active' : ''}`}
                onClick={() => setSalesFilter('shipped')}
              >
                Shipped ({sales.filter(s => s.orderStatus?.toLowerCase() === 'shipped').length})
              </button>
              <button 
                className={`filter-btn ${salesFilter === 'delivered' ? 'active' : ''}`}
                onClick={() => setSalesFilter('delivered')}
              >
                Delivered ({sales.filter(s => s.orderStatus?.toLowerCase() === 'delivered').length})
              </button>
            </div>

            <div className="sales-list">
              {filteredSales.length === 0 ? (
                <div className="empty-state">
                  <p>No sales found.</p>
                </div>
              ) : (
                filteredSales.map(sale => (
                  <div key={sale.orderId} className="sales-card">
                    <div className="sales-card-header">
                      <div className="order-info">
                        <h3>Order #{sale.orderNumber || sale.orderId}</h3>
                        <span className="order-date">
                          {new Date(sale.orderDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <span className={`status-badge ${sale.orderStatus?.toLowerCase().replace(/\s+/g, '-')}`}>
                        {sale.orderStatus}
                      </span>
                    </div>
                    
                    <div className="sales-card-body">
                      <div className="buyer-info">
                        <div className="buyer-avatar">
                          {sale.buyer?.profileImage ? (
                            <img src={sale.buyer.profileImage} alt={sale.buyer.fullName} />
                          ) : (
                            <span>{(sale.buyer?.fullName || sale.buyer?.username || 'B').charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="buyer-details">
                          <span className="buyer-name">{sale.buyer?.fullName || sale.buyer?.username || 'Unknown Buyer'}</span>
                          <span className="buyer-address">{sale.shippingAddress || 'No address'}</span>
                        </div>
                      </div>
                      
                      <div className="order-items-preview">
                        {sale.items?.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="item-preview">
                            <img 
                              src={item.product?.imageUrl || '/placeholder.png'} 
                              alt={item.product?.productName}
                              onError={(e) => { e.target.src = '/placeholder.png'; }}
                            />
                            <span>{item.product?.productName}</span>
                            <span className="qty">x{item.quantity}</span>
                          </div>
                        ))}
                        {sale.items?.length > 2 && (
                          <span className="more-items">+{sale.items.length - 2} more</span>
                        )}
                      </div>
                      
                      <div className="order-total">
                        <span className="total-label">Total:</span>
                        <span className="total-amount">
                          ₱{Number(sale.totalAmount || 0).toLocaleString('en-PH', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="sales-card-footer">
                      <div className="status-update">
                        <label>Update Status:</label>
                        <select 
                          value={sale.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(sale.orderId, e.target.value)}
                          disabled={updatingStatus === sale.orderId}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>
                      
                      <div className="action-buttons">
                        <button 
                          className="btn-message-buyer-small"
                          onClick={() => openMessageModal(sale)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                          Message
                        </button>
                        <button 
                          className="btn-view-details"
                          onClick={() => navigate(`/sales-order-details/${sale.orderId}`)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
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
      
      {/* Message Buyer Modal */}
      {messageBuyer && (
        <MessageModal
          isOpen={showMessageModal}
          onClose={() => {
            setShowMessageModal(false);
            setMessageBuyer(null);
          }}
          receiverId={messageBuyer.id}
          receiverName={messageBuyer.name}
          receiverImage={messageBuyer.image}
          orderId={messageBuyer.orderId}
          orderNumber={messageBuyer.orderNumber}
          orderDetails={messageBuyer.orderDetails}
          isSeller={true}
        />
      )}
    </div>
  );
};

export default MyProducts;