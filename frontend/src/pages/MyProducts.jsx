import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import ConfirmModal from '../components/ConfirmModal';
import '../styles/MyProducts.css';

const MyProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState({
    title: '',
    message: '',
    onConfirm: null,
    type: 'default'
  });

  useEffect(() => {
    fetchMyProducts();
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
            Sold
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
                />
                <span className={`product-status ${getStatusClass(product.status)}`}>
                  {product.status ? product.status.charAt(0).toUpperCase() + product.status.slice(1) : 'Draft'}
                </span>
              </div>
            ))
          )}
        </div>
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
