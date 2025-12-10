import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import ConfirmModal from '../components/ConfirmModal';
import '../styles/MyProducts.css';
import '../styles/MyOrders.css';

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
                <div key={sale.orderId} className="order-card-compact">
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
                    <div className="order-actions-col">
                      <button 
                        className="btn-view-compact"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/sales-order-details/${sale.orderId}`);
                        }}
                      >
                        View
                      </button>
                    </div>
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
      
      {/* Sale Details Modal - Simplified version */}
      {selectedSale && (
        <div className="modal-overlay" onClick={() => setSelectedSale(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedSale(null)}>×</button>
            <div className="modal-body">
              <h2>Sale Details</h2>
              <div className="modal-details">
                <div className="detail-row">
                  <span className="detail-label">Order Number:</span>
                  <span className="detail-value">{selectedSale.orderNumber || `#${selectedSale.orderId}`}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{new Date(selectedSale.orderDate).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`status-badge ${selectedSale.orderStatus?.toLowerCase()}`}>
                    {selectedSale.orderStatus}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Total Amount:</span>
                  <span className="detail-value">₱{Number(selectedSale.totalAmount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Items Sold:</span>
                  <span className="detail-value">{selectedSale.items?.length || 0}</span>
                </div>
              </div>
              
              <div className="order-items">
                {selectedSale.items?.map(item => (
                  <div key={item.id} className="order-item">
                    <img src={item.product?.imageUrl || '/placeholder.png'} alt={item.product?.productName} />
                    <div className="item-details">
                      <h4>{item.product?.productName}</h4>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ₱{Number(item.unitPrice).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="item-price">
                      ₱{Number(item.subtotal).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-edit"
                onClick={() => {
                  navigate(`/sales-order-details/${selectedSale.orderId}`);
                  setSelectedSale(null);
                }}
              >
                View Full Details
              </button>
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