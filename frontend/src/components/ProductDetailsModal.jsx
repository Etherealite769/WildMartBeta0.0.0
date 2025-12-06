import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ConfirmModal from './ConfirmModal';
import '../styles/ProductDetailsModal.css';

const ProductDetailsModal = ({ productId, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState({
    title: '',
    message: '',
    onConfirm: null,
    type: 'default'
  });

  useEffect(() => {
    if (isOpen && productId) {
      fetchProduct();
      fetchCurrentUser();
      checkIfLiked();
      setImageLoaded(false);
      setQuantity(1);
    }
  }, [productId, isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get('http://localhost:8080/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(response.data);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const checkIfLiked = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get('http://localhost:8080/api/user/likes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const likedProducts = Array.isArray(response.data) ? response.data : Array.from(response.data);
        const isProductLiked = likedProducts.some(p => 
          (p.productId || p.id) === parseInt(productId)
        );
        setIsLiked(isProductLiked);
      }
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await axios.post('http://localhost:8080/api/cart/add', 
        { productId, quantity },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      toast.success('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      const prodId = product?.productId || productId;
      
      if (isLiked) {
        await axios.delete(`http://localhost:8080/api/user/likes/${prodId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsLiked(false);
      } else {
        await axios.post(`http://localhost:8080/api/user/likes/${prodId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like status. Please try again.');
    }
  };

  const handleDelete = async () => {
    setConfirmModalData({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      onConfirm: () => {
        setShowConfirmModal(false);
        deleteProduct();
      },
      type: 'danger'
    });
    setShowConfirmModal(true);
  };

  const deleteProduct = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/products/${productId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Product deleted successfully!');
      onClose();
      navigate('/my-products');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(`Error deleting product: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  if (!product) {
    return (
      <div className="modal-overlay-blur" onClick={onClose}>
        <div className="product-details-modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  const productName = product?.productName || product?.name || 'Product';
  const productPrice = product?.price || 0;
  const productDescription = product?.description || 'No description available';
  const productImage = product?.imageUrl || '';
  const productCategory = product?.category?.categoryName || product?.categoryName || '';
  const productStatus = product?.status || 'active';
  const stockQuantity = product?.quantityAvailable || 0;
  const sellerName = product?.seller?.fullName || product?.seller?.username || product?.sellerName || 'Unknown Seller';
  const sellerRating = product?.seller?.rating || 0;
  const sellerProfileImage = product?.seller?.profileImage || null;
  const productRating = product?.averageRating || 0;
  const reviewCount = product?.reviewCount || 0;
  const likeCount = product?.likeCount || 0;

  return (
    <>
      <div className="modal-overlay-blur" onClick={onClose}>
        <button className="modal-close-btn" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div className="product-details-modal" onClick={(e) => e.stopPropagation()}>
          <div className="product-details-container">
            {/* Left Column - Image */}
            <div className="product-images-section">
              <div className="product-images">
                <div className="main-image">
                  {!imageLoaded && (
                    <div className="image-placeholder-detail">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </div>
                  )}
                  {productImage ? (
                    <img 
                      src={productImage} 
                      alt={productName}
                      className={imageLoaded ? 'loaded' : ''}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageLoaded(true)}
                    />
                  ) : (
                    <div className="image-placeholder-detail">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      <span>No Image Available</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Stats */}
              <div className="product-stats">
                <div className="stat-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  <span>{likeCount} likes</span>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="product-info">
              {/* Header with Category & Status */}
              <div className="product-meta-header">
                {productCategory && (
                  <span className="product-category-tag">{productCategory}</span>
                )}
                <span className={`product-status-badge status-${productStatus.toLowerCase()}`}>
                  {productStatus.charAt(0).toUpperCase() + productStatus.slice(1)}
                </span>
              </div>

              {/* Product Title */}
              <h1 className="product-title">{productName}</h1>

              {/* Rating */}
              <div className="product-rating">
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={star <= productRating ? 'star filled' : 'star'}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="rating-value">{productRating.toFixed(1)}</span>
                <span className="review-count">({reviewCount} reviews)</span>
              </div>

              {/* Price */}
              <div className="product-price-section">
                <span className="price-label">Price</span>
                <div className="price-value">
                  <span className="currency">₱</span>
                  <span className="amount">{Number(productPrice).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Stock Status */}
              <div className="stock-status">
                {stockQuantity > 10 ? (
                  <span className="in-stock">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    In Stock ({stockQuantity} available)
                  </span>
                ) : stockQuantity > 0 ? (
                  <span className="low-stock">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    Only {stockQuantity} left!
                  </span>
                ) : (
                  <span className="out-of-stock">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="product-description">
                <h3>Description</h3>
                <p>{productDescription}</p>
              </div>

              {/* Quantity Selector */}
              <div className="product-quantity">
                <label>Quantity</label>
                <div className="quantity-selector">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(Math.max(1, Math.min(stockQuantity, parseInt(e.target.value) || 1)))}
                    min="1"
                    max={stockQuantity}
                  />
                  <button 
                    onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
                    disabled={quantity >= stockQuantity}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="product-actions">
                <button 
                  className="btn-add-cart"
                  onClick={handleAddToCart}
                  disabled={stockQuantity === 0 || addingToCart}
                >
                  {addingToCart ? (
                    <span>Adding...</span>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
                <button 
                  className={`btn-like ${isLiked ? 'liked' : ''}`}
                  onClick={handleLike}
                  title={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <svg viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
              </div>

              {/* Seller Information */}
              <div className="seller-info">
                <h3>Seller Information</h3>
                <div className="seller-card">
                  <div className="seller-avatar">
                    {sellerProfileImage ? (
                      <img src={sellerProfileImage} alt={sellerName} className="seller-profile-img" />
                    ) : (
                      sellerName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="seller-details">
                    <h4>{sellerName}</h4>
                    <div className="seller-rating">
                      <span className="star filled">★</span>
                      <span>{sellerRating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Owner Actions */}
                {product.seller?.userId === currentUser?.userId && (
                  <div className="product-owner-actions">
                    <button 
                      className="btn-edit-product"
                      onClick={() => {
                        onClose();
                        navigate(`/edit-product/${productId}`);
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Edit Product
                    </button>
                    <button 
                      className="btn-delete-product"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ConfirmModal
        isOpen={showConfirmModal}
        title={confirmModalData.title}
        message={confirmModalData.message}
        onConfirm={confirmModalData.onConfirm}
        onCancel={() => setShowConfirmModal(false)}
        type={confirmModalData.type}
      />
    </>
  );
};

export default ProductDetailsModal;
