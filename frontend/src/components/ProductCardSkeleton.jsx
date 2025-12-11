import React from 'react';
import '../styles/ProductCard.css';

const ProductCardSkeleton = () => {
  return (
    <div className="product-card skeleton">
      {/* Like Button Skeleton */}
      <div className="skeleton-like-btn"></div>
      
      {/* Product Image Skeleton */}
      <div className="product-image skeleton-image">
        <div className="image-placeholder skeleton-box"></div>
      </div>
      
      {/* Product Info Skeleton */}
      <div className="product-info">
        <div className="skeleton-category skeleton-box"></div>
        <div className="skeleton-title skeleton-box"></div>
        <div className="skeleton-seller skeleton-box"></div>
        
        <div className="product-footer">
          <div className="price-section">
            <div className="skeleton-price skeleton-box"></div>
          </div>
          <div className="skeleton-button skeleton-box"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;