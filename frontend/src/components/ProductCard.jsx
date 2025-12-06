import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ConfirmModal from './ConfirmModal';
import '../styles/ProductCard.css';

const ProductCard = ({ product, onClick, showSeller = true, showEditButton = false, onUnlike, initialLiked = false }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);

  // Handle both field name formats from backend (old Product format and new ProductDTO format)
  const productName = product.productName || product.name || 'Untitled Product';
  const productPrice = product.price || 0;
  const productImage = product.imageUrl || '';
  const productCategory = product.categoryName || product.category?.categoryName || product.category || '';
  const sellerName = product.sellerName || product.seller?.firstName || 'Unknown Seller';
  const stockQuantity = product.quantityAvailable || product.stockQuantity || product.quantity || 0;
  const createdAt = product.createdAt ? new Date(product.createdAt) : null;
  
  // Check if product is created today (same day check)
  const isNew = (() => {
    if (!createdAt) return false;
    const today = new Date();
    return createdAt.getDate() === today.getDate() &&
           createdAt.getMonth() === today.getMonth() &&
           createdAt.getFullYear() === today.getFullYear();
  })();
  const isOutOfStock = stockQuantity === 0;
  const isLowStock = stockQuantity > 0 && stockQuantity <= 5;

  // Check if product is already liked when component mounts
  useEffect(() => {
    // If initialLiked is provided (e.g., from MyLikes page), use it
    if (initialLiked) {
      setIsLiked(true);
    } else {
      checkIfLiked();
    }
  }, [initialLiked, product.productId, product.id]);

  const checkIfLiked = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get('http://localhost:8080/api/user/likes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const likedProducts = Array.isArray(response.data) ? response.data : Array.from(response.data);
        const productId = product.productId || product.id;
        const isProductLiked = likedProducts.some(p => 
          (p.productId || p.id) === productId
        );
        setIsLiked(isProductLiked);
      }
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const likeProduct = async (productId, shouldLike) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to like products');
        return false;
      }

      if (shouldLike) {
        // Like the product
        await axios.post(`http://localhost:8080/api/user/likes/${productId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Unlike the product
        await axios.delete(`http://localhost:8080/api/user/likes/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      // Refresh the like status after the operation
      setTimeout(() => {
        checkIfLiked();
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Error liking/unliking product:', error);
      toast.error('Failed to update like status. Please try again.');
      return false;
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    
    const productId = product.productId || product.id;
    const newLikeState = !isLiked;
    
    // Optimistically update UI
    setIsLiked(newLikeState);
    
    // Call API to like/unlike the product
    const success = await likeProduct(productId, newLikeState);
    
    // If API call failed, revert the UI change
    if (!success) {
      setIsLiked(!newLikeState);
    } else if (!newLikeState && onUnlike) {
      // If unliking was successful and we have an onUnlike callback, call it
      onUnlike(productId);
    }
  };

  const handleEditProduct = (e) => {
    e.stopPropagation();
    navigate(`/edit-product/${product.productId || product.id}`);
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    
    // Check if user is logged in first
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to add items to cart');
      return;
    }
    
    // Check if product ID exists
    const productId = product.productId || product.id;
    if (!productId) {
      toast.error('Product ID not found');
      return;
    }
    
    // Show confirmation modal
    setShowAddToCartModal(true);
  };

  const handleAddToCart = async () => {
    // Close modal first
    setShowAddToCartModal(false);
    
    // Get product ID (handle both field name formats)
    const productId = product.productId || product.id;
    
    try {
      const token = localStorage.getItem('token');
      
      // Add to cart API call
      await axios.post('http://localhost:8080/api/cart/add', 
        { productId: productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      toast.success('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart. Please try again.');
    }
  };

  const handleCardClick = () => {
    // Prevent click if product is out of stock
    if (isOutOfStock) {
      return;
    }
    onClick();
  };

  return (
    <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`} onClick={handleCardClick}>
      {/* Badges */}
      <div className="product-badges">
        {isNew && <span className="badge badge-new">NEW</span>}
        {isOutOfStock && <span className="badge badge-out-of-stock">OUT OF STOCK</span>}
        {isLowStock && <span className="badge badge-low-stock">Only {stockQuantity} left</span>}
      </div>

      {/* Like Button */}
      <button 
        className={`like-btn-floating ${isLiked ? 'liked' : ''}`}
        onClick={handleLike}
        aria-label="Like product"
      >
        <svg viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>

      {/* Product Image */}
      <div className="product-image">
        {!imageLoaded && !imageError && (
          <div className="image-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
        )}
        {imageError && (
          <div className="image-placeholder error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <span>No Image</span>
          </div>
        )}
        {productImage && !imageError && (
          <img 
            src={productImage} 
            alt={productName}
            className={imageLoaded ? 'loaded' : ''}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
        )}
        {!productImage && (
          <div className="image-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <span>No Image</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-info">
        {productCategory && (
          <span className="product-category">{productCategory}</span>
        )}
        <h3 className="product-name" title={productName}>{productName}</h3>
        {showSeller && (
          <p className="product-seller">by {sellerName}</p>
        )}
        
        <div className="product-footer">
          <div className="price-section">
            <span className="product-price">₱{productPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          {showEditButton ? (
            <button 
              className="edit-product-btn"
              onClick={handleEditProduct}
              aria-label="Edit product"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          ) : (
            <button 
              className="add-to-cart-btn"
              onClick={handleAddToCartClick}
              aria-label="Add to cart"
              disabled={stockQuantity === 0}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Add to Cart Confirmation Modal */}
      <ConfirmModal
        isOpen={showAddToCartModal}
        title="Add to Cart"
        message={`Are you sure you want to add "${productName}" to your cart?`}
        onConfirm={handleAddToCart}
        onCancel={() => setShowAddToCartModal(false)}
        confirmText="Add to Cart"
        cancelText="Cancel"
        type="default"
      />
    </div>
  );
};

export default ProductCard;