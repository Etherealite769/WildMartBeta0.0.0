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
  const [categories, setCategories] = useState(['All', 'Electronics', 'Clothing', 'Books', 'Home', 'Accesories', 'Sports']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeFilter, setActiveFilter] = useState('Popular');

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
    filterProducts(term, selectedCategory);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    filterProducts(searchTerm, category);
  };

  const filterProducts = (term, category) => {
    let filtered = products;
    
    if (category !== 'All') {
      filtered = filtered.filter(p => p.category === category);
    }
    
    if (term) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term.toLowerCase()) ||
        p.description.toLowerCase().includes(term.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  };

  return (
    <div className="dashboard">
      <Navbar />
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>DASHBOARD</h1>
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
