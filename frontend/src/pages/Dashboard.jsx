import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState(['All', 'Electronics', 'Clothing', 'Books', 'Home', 'Accessories', 'Sports', 'Other']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeFilter, setActiveFilter] = useState('All');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Fetch user and products in parallel for faster loading
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        // Fetch both in parallel
        const [productsResponse, userResponse] = await Promise.all([
          axios.get('http://localhost:8080/api/products', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          token ? axios.get('http://localhost:8080/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(err => {
            console.error('Error fetching user:', err);
            return null;
          }) : Promise.resolve(null)
        ]);
        
        setProducts(productsResponse.data);
        if (userResponse?.data) {
          setCurrentUser(userResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    // Apply all filters when products or currentUser changes
    applyAllFilters();
  }, [products, currentUser, searchTerm, selectedCategory, activeFilter]);

  // Remove individual fetch functions - now using combined fetchData

  const applyAllFilters = () => {
    // Filter out sold products and products belonging to the current user
    let filtered = products.filter(p => {
      // Filter out sold products
      if (p.status && p.status.toLowerCase() === 'sold') return false;
      
      // Filter out products belonging to the current user
      if (currentUser && p.sellerId === currentUser.userId) return false;
      
      return true;
    });
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.categoryName === selectedCategory);
    }
    
    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(p => {
        const name = p.productName ? p.productName.toLowerCase() : '';
        const desc = p.description ? p.description.toLowerCase() : '';
        return name.includes(searchTerm.toLowerCase()) || 
               desc.includes(searchTerm.toLowerCase());
      });
    }
    
    // Apply specific filter logic
    switch (activeFilter) {
      case 'Popular':
        // Products with 2 or more likes
        filtered = filtered.filter(p => p.likeCount >= 2);
        break;
      case 'What\'s New':
        // Products with "NEW" badge (based on ProductCard implementation)
        // A product is considered "new" if it was created today
        filtered = filtered.filter(p => {
          if (!p.createdAt) return false;
          const createdAt = new Date(p.createdAt);
          const today = new Date();
          return createdAt.getDate() === today.getDate() &&
                 createdAt.getMonth() === today.getMonth() &&
                 createdAt.getFullYear() === today.getFullYear();
        });
        break;
      case 'Most Purchased':
        // Products purchased 2 or more times
        // Since we don't have direct purchase count, we'll use a heuristic:
        // Original stock - current stock = items sold
        // We'll estimate that if the difference is >= 2, it's been purchased multiple times
        filtered = filtered.filter(p => {
          // This is a simplified approach since we don't have original stock data
          // We'll assume that if quantityAvailable is significantly lower than a typical stock level,
          // it indicates multiple purchases
          const typicalStockLevel = 10; // Assumed typical stock level
          const estimatedSold = typicalStockLevel - (p.quantityAvailable || 0);
          return estimatedSold >= 2;
        });
        break;
      case 'All':
      default:
        // No additional filtering for 'All'
        break;
    }
    
    // Separate in-stock and out-of-stock products
    const inStock = filtered.filter(p => p.quantityAvailable > 0);
    const outOfStock = filtered.filter(p => p.quantityAvailable === 0);
    
    // Combine with in-stock first, out-of-stock at the bottom
    setFilteredProducts([...inStock, ...outOfStock]);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleProductClick = (productId) => {
    setSelectedProductId(productId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProductId(null);
    // Trigger refresh of product cards to update like status
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="dashboard">
      <Navbar />
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Wildcats Marketplace</h2>
          <div className="search-and-category">
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="SEARCH HERE"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className="category-dropdown">
              <select onChange={(e) => handleCategoryChange(e.target.value)} value={selectedCategory}>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="filter-buttons-container">
          <div className="filter-buttons">
            {['All', 'Popular', 'What\'s New', 'Most Purchased'].map(filter => (
              <button
                key={filter}
                className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="products-grid">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              {/* In-stock products */}
              {filteredProducts.filter(p => p.quantityAvailable > 0).map(product => (
                <ProductCard 
                  key={`${product.id}-${refreshTrigger}`}
                  product={product}
                  onClick={() => handleProductClick(product.id)}
                />
              ))}
              
              {/* Out of stock section */}
              {filteredProducts.filter(p => p.quantityAvailable === 0).length > 0 && (
                <>
                  <div className="out-of-stock-divider">
                    <h3>Out of Stock</h3>
                  </div>
                  {filteredProducts.filter(p => p.quantityAvailable === 0).map(product => (
                    <ProductCard 
                      key={`${product.id}-${refreshTrigger}`}
                      product={product}
                      onClick={() => handleProductClick(product.id)}
                    />
                  ))}
                </>
              )}
            </>
          ) : (
            <div className="no-products">
              <p>No products found</p>
            </div>
          )}
        </div>
      </div>
      
      <ProductDetailsModal 
        productId={selectedProductId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Dashboard;