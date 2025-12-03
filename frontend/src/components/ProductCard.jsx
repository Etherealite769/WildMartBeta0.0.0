import React, { useState } from 'react';
import '../styles/ProductCard.css';

const ProductCard = ({ product, onClick }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Handle both field name formats from backend (old Product format and new ProductDTO format)
  const productName = product.productName || product.name || 'Untitled Product';
  const productPrice = product.price || 0;
  const productImage = product.imageUrl || '/placeholder.png';

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  return (
    <div className="product-card" onClick={onClick}>
      <div className="product-image">
        <img 
          src={productImage} 
          alt={productName}
          onError={(e) => {
            e.target.src = '/placeholder.png';
          }}
        />
      </div>
      <div className="product-info">
        <div className="product-header">
          <h3 className="product-name">{productName}</h3>
          <button 
            className="like-btn" 
            onClick={handleLike}
            aria-label="Like product"
          >
            <span className={`heart-icon ${isLiked ? 'liked' : ''}`}>♡</span>
          </button>
        </div>
        <div className="product-footer">
          <span className="product-price">₱{productPrice.toFixed(2)}</span>
          <div className="menu-container">
            <button 
              className="menu-btn" 
              onClick={handleMenuClick}
              aria-label="Product menu"
            >
              ⋮
            </button>
            {showMenu && (
              <div className="dropdown-menu">
                <a href="#">View Details</a>
                <a href="#">Share</a>
                <a href="#">Report</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
