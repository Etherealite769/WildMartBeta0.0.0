import React from 'react';
import '../styles/ProductCard.css';

const ProductCard = ({ product, onClick }) => {
  // Handle both field name formats from backend (old Product format and new ProductDTO format)
  const productName = product.productName || product.name || 'Untitled Product';
  const productPrice = product.price || 0;
  const productRating = product.averageRating || product.rating || 0;
  const productImage = product.imageUrl || '/placeholder.png';
  const productDesc = product.description || 'No description';
  const sellerName = product.sellerName || 'Unknown Seller';

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
        <h3 className="product-name">{productName}</h3>
        <p className="product-description">
          {productDesc.substring(0, 60)}...
        </p>
        <div className="product-footer">
          <span className="product-price">${productPrice}</span>
          <span className="product-rating">⭐ {productRating.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
