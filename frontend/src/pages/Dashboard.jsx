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
  const [activeFilter, setActiveFilter] = useState('Popular');
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
  }, [products, currentUser, searchTerm, selectedCategory]);

  // Remove individual fetch functions - now using combined fetchData

  const applyAllFilters = () => {
    // Filter out sold products and products belonging to the current user
    let filtered = products.filter(p => {
      // Filter out sold products
      if (p.status === 'sold') return false;
      
      // Filter out products belonging to the current user (if we have user data)
      if (currentUser && typeof currentUser === 'object' && 
          (p.sellerEmail === currentUser.email || 
           p.seller?.email === currentUser.email)) {
        return false;
      }
      
      return true;
    });
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => {
        const productCategory = (p.categoryName || p.category?.categoryName || p.category || '').toLowerCase();
        return productCategory === selectedCategory.toLowerCase();
      });
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(p => {
        const name = p.productName || p.name || '';
        const desc = p.description || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               desc.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    
    setFilteredProducts(filtered);
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
            {['Popular', 'What\'s New', 'Hot Deals', 'Exclusive Deals', 'Picks For You', 'Most Purchased'].map(filter => (
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
            filteredProducts.map(product => (
              <ProductCard 
                key={`${product.id}-${refreshTrigger}`}
                product={product}
                onClick={() => handleProductClick(product.id)}
              />
            ))
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