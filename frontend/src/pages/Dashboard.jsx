import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState(['All', 'Electronics', 'Clothing', 'Books', 'Home', 'Accesories', 'Sports', 'Others']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeFilter, setActiveFilter] = useState('Popular');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching products with token:', token ? 'present' : 'missing');
      
      const response = await axios.get('http://localhost:8080/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Products fetched:', response.data);
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error.response?.data || error.message);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterProducts(term, selectedCategory);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    filterProducts(searchTerm, category);
  };

  const filterProducts = (term, category) => {
    let filtered = products;
    
    if (category !== 'All') {
      // Handle both categoryName and category.categoryName formats
      filtered = filtered.filter(p => {
        const productCategory = p.categoryName || p.category?.categoryName || p.category;
        return productCategory === category;
      });
    }
    
    if (term) {
      filtered = filtered.filter(p => {
        const name = p.productName || p.name || '';
        const desc = p.description || '';
        return name.toLowerCase().includes(term.toLowerCase()) ||
               desc.toLowerCase().includes(term.toLowerCase());
      });
    }
    
    setFilteredProducts(filtered);
  };

  return (
    <div className="dashboard">
      <Navbar />
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Dashboard</h2>
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

        <div className="filter-buttons">
          {['Popular', 'What\'s New', 'Hot Deals', 'Exclusive Deals', 'Picks For You', 'Most Purchased',].map(filter => (
            <button
              key={filter}
              className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="products-grid">
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
