import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import '../styles/MyLikes.css';

const MyLikes = () => {
  const navigate = useNavigate();
  const [likedProducts, setLikedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLikedProducts = useCallback(async (pageNum = 0, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/user/likes?page=${pageNum}&size=12`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const { products, total, hasMore: more } = response.data;
      
      if (append) {
        setLikedProducts(prev => [...prev, ...products]);
      } else {
        setLikedProducts(products);
      }
      
      setTotalLikes(total);
      setHasMore(more);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching liked products:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchLikedProducts();
  }, [fetchLikedProducts]);

  const handleUnlike = (productId) => {
    // Remove product from the list immediately
    setLikedProducts(prevProducts => 
      prevProducts.filter(p => (p.productId || p.id) !== productId)
    );
    setTotalLikes(prev => prev - 1);
  };

  // Load more products
  const loadMore = () => {
    if (!hasMore) return;
    fetchLikedProducts(page + 1, true);
  };

  // Handle product click to open modal
  const handleProductClick = (productId) => {
    setSelectedProductId(productId);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProductId(null);
  };

  // Render skeleton loaders
  const renderSkeletons = (count) => {
    return Array.from({ length: count }).map((_, index) => (
      <div key={`skeleton-${index}`} className="liked-product-card">
        <ProductCardSkeleton />
      </div>
    ));
  };

  if (loading && likedProducts.length === 0) {
    return (
      <div className="my-likes-page">
        <Navbar />
        <div className="my-likes-container">
          <h2>My Likes</h2>
          <p className="likes-count">Loading...</p>
          <div className="liked-products-grid">
            {renderSkeletons(8)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-likes-page">
      <Navbar />
      
      <div className="my-likes-container">
        <h2>My Likes</h2>
        <p className="likes-count">{totalLikes} product{totalLikes !== 1 ? 's' : ''} liked</p>

        <div className="liked-products-grid">
          {likedProducts.length > 0 ? (
            <>
              {likedProducts.map(product => {
                const productId = product.productId || product.id;
                return (
                  <div key={productId} className="liked-product-card">
                    <ProductCard 
                      product={product}
                      onClick={() => handleProductClick(productId)}
                      onUnlike={() => handleUnlike(productId)}
                      initialLiked={true}
                    />
                  </div>
                );
              })}
              
              {loadingMore && renderSkeletons(4)}
              
              {hasMore && (
                <div className="load-more-container">
                  <button 
                    className="load-more-btn"
                    onClick={loadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <p>No liked products yet</p>
              <span>Start exploring and like products you love!</span>
              <button 
                className="btn-primary"
                onClick={() => navigate('/dashboard')}
              >
                Browse Products
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Product Details Modal */}
      <ProductDetailsModal 
        productId={selectedProductId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default MyLikes;