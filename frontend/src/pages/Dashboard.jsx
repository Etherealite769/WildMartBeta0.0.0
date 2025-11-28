import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { FaSearch } from 'react-icons/fa'; // Import search icon
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategories] = useState(['Popular', 'Whats New', 'Hot Deals', 'Picks For You', 'Most Purchased']);
  const [productCategories] = useState(['All', 'Clothing', 'Accessories', 'Electronics', 'Home']); // New state for product categories
  const [selectedProductCategory, setSelectedProductCategory] = useState(''); // New state for dropdown
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('Popular'); // State for filter buttons

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/products', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterProducts(term, selectedProductCategory, selectedFilterCategory);
  };

  const filterProducts = (term, productCategory, filterCategory) => {
    let filtered = products;
    
    if (filterCategory === 'Hot Deals') {
      filtered = filtered.filter(p => p.discount > 0);
    } else if (filterCategory === 'Popular') {
      filtered = filtered.filter(p => p.rating >= 4);
    } else if (filterCategory === 'Most Purchased') {
      filtered = filtered.sort((a, b) => b.sold - a.sold);
    }
    // Add more filter category logic as needed

    if (productCategory) {
      filtered = filtered.filter(p => p.category === productCategory); // Assuming 'category' field in product
    }
    
    if (term) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term.toLowerCase()) ||
        p.description.toLowerCase().includes(term.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  };

  const handleProductCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedProductCategory(category);
    filterProducts(searchTerm, category, selectedFilterCategory);
  };

  const handleFilterCategoryChange = (category) => {
    setSelectedFilterCategory(category);
    filterProducts(searchTerm, selectedProductCategory, category);
  };

  return (
    <div className="dashboard">
      <Navbar />
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>DASHBOARD</h1>
        </div>

        <div className="dashboard-search-filter-section">
          <div className="dashboard-search-bar-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="SEARCH HERE"
              value={searchTerm}
              onChange={handleSearch}
              className="dashboard-search-input"
            />
          </div>
          
          <div className="dashboard-category-dropdown">
            <select
              value={selectedProductCategory}
              onChange={handleProductCategoryChange}
              className="category-select"
            >
              <option value="">Category</option>
              {productCategories.map(cat => (
                <option key={cat} value={cat === 'All' ? '' : cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="dashboard-filter-buttons">
          {filterCategories.map(category => (
            <button
              key={category}
              className={`filter-button ${selectedFilterCategory === category ? 'active' : ''}`}
              onClick={() => handleFilterCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="products-grid-wrapper">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product}
              onClick={() => navigate(`/product/${product.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
