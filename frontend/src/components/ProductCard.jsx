import React from 'react';
import '../styles/ProductCard.css';

const ProductCard = ({ product, onClick }) => {
  return (
    <div className="product-card" onClick={onClick}>
      <div className="product-image">
        <img 
          src={product.imageUrl || '/placeholder.png'} 
          alt={product.name}
          onError={(e) => {
            e.target.src = '/placeholder.png';
          }}
        />
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">
          {product.description?.substring(0, 60)}...
        </p>
        <div className="product-footer">
          <span className="product-price">${product.price}</span>
          <span className="product-rating">⭐ {product.rating || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
