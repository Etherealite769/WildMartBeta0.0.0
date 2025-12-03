import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import '../styles/AddProduct.css';

const EditProduct = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [productData, setProductData] = useState({
    productName: '',
    category: '', 
    description: '',
    price: '',
    stock: '',
    images: [],
    imageUrl: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Try with token first
      let response;
      try {
        response = await axios.get(`http://localhost:8080/api/products/${productId}`, {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        // If error, try without token
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('Auth failed, retrying without token');
          response = await axios.get(`http://localhost:8080/api/products/${productId}`);
        } else {
          throw error;
        }
      }
      
      const product = response.data;
      console.log('Product data:', product);
      
      // Extract category name from category object if it exists
      let categoryName = '';
      if (product.category) {
        categoryName = product.category.categoryName || product.category;
      } else if (product.categoryName) {
        categoryName = product.categoryName;
      }
      
      setProductData({
        productName: product.productName || '',
        category: categoryName || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.quantityAvailable || '',
        images: product.imageUrl ? [product.imageUrl] : [],
        imageUrl: product.imageUrl || ''
      });
    } catch (error) {
      console.error('Error fetching product details:', error);
      console.error('Error response:', error.response?.data);
      console.error('Product ID:', productId);
      console.error('Full error:', error.message);
      alert(`Error loading product details: ${error.response?.data?.message || error.message}. Please try again.`);
      navigate('/my-products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    
    setProductData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  const removeImage = (index) => {
    setProductData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleUpdate = async () => {
    // Validate required fields
    if (!productData.productName || !productData.category || !productData.price || !productData.stock) {
      alert('Please fill in all required fields: Product Name, Category, Price, and Stock');
      return;
    }

    if (parseFloat(productData.price) <= 0) {
      alert('Price must be greater than 0');
      return;
    }

    if (parseInt(productData.stock) < 0) {
      alert('Stock cannot be negative');
      return;
    }

    // Show confirmation dialog
    const isConfirmed = window.confirm('Are you sure you want to update this product?');
    
    if (!isConfirmed) {
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('productName', productData.productName);
      formData.append('categoryName', productData.category);
      formData.append('description', productData.description);
      formData.append('price', parseFloat(productData.price));
      formData.append('quantityAvailable', parseInt(productData.stock));

      // Handle image upload - only append if a new image was selected
      const imageInput = document.getElementById('image-upload');
      if (imageInput && imageInput.files.length > 0) {
        formData.append('image', imageInput.files[0]);
      }

      // Use the multipart endpoint
      const response = await axios.put(`http://localhost:8080/api/products/${productId}/multipart`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Product updated:', response.data);
      alert('Product updated successfully!');
      navigate('/my-products');

    } catch (error) {
      console.error('Error updating product:', error);
      console.error('Error response:', error.response?.data);
      alert(`Error updating product: ${error.response?.data?.message || error.message}. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      navigate('/my-products');
    }
  };

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="add-product-main">
          <div className="add-product-header">
            <h2>Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="add-product-main">
        <div className="add-product-header">
          <h2>Edit Product</h2>
        </div>
        <div className="product-form-container">
          <div className="product-form">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label>Product Name</label>
              <input 
                type="text" 
                name="productName"
                value={productData.productName}
                onChange={handleInputChange}
                placeholder="Enter product name"
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <div className="category-dropdown">
                <select 
                  name="category"
                  value={productData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="books">Books</option>
                  <option value="home">Home</option>
                  <option value="accessories">Accessories</option>
                  <option value="sports">Sports</option>
                  <option value="other">Others</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Price</label>
                <div className="price-input-container">
                  <span className="currency-symbol">₱</span>
                  <input 
                    type="number" 
                    name="price"
                    value={productData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Stock</label>
                <input 
                  type="number" 
                  name="stock"
                  value={productData.stock}
                  onChange={handleInputChange}
                  placeholder="Enter quantity"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Product Description</label>
              <textarea 
                name="description"
                value={productData.description}
                onChange={handleInputChange}
                placeholder="Enter product description"
              ></textarea>
            </div>
            <div className="form-group">
              <label>Images</label>
              <div className="image-upload-area">
                <input 
                  type="file" 
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="image-upload-input"
                />
                <label htmlFor="image-upload" className="image-upload-box">
                  <div className="upload-icon">+</div>
                  <p>Click to upload image</p>
                  <span>or drag and drop</span>
                </label>
                
                {productData.images.length > 0 && (
                  <div className="uploaded-images">
                    <h4>Product Image</h4>
                    <div className="image-preview-grid">
                      {productData.images.map((image, index) => (
                        <div key={index} className="image-preview-item">
                          <img src={image} alt={`Product ${index + 1}`} />
                          <button 
                            type="button" 
                            className="remove-image-btn"
                            onClick={() => removeImage(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="publish-btn" 
                onClick={handleUpdate}
                disabled={isSaving}
              >
                {isSaving ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
          <div className="product-preview">
            <h3>Preview</h3>
            <div className="preview-content">
              <h3>Product Detail</h3>
              <div className="preview-image-section">
                {productData.images.length > 0 ? (
                  <div className="preview-main-image">
                    <img src={productData.images[0]} alt="Product preview" />
                  </div>
                ) : (
                  <div className="preview-image-placeholder">
                    No image uploaded
                  </div>
                )}
              </div>
              <h4>{productData.productName || 'Product Name'}</h4>
              <p>{productData.description || 'Product details here!'}</p>
              <div className="preview-category">
                <strong>Category:</strong> {productData.category || 'Not selected'}
              </div>
              <div className="preview-details">
                <div className="preview-price-stock-row">
                  <div className="preview-price">
                    <strong>Price:</strong> ₱{productData.price ? parseFloat(productData.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                  </div>
                  <div className="preview-stock">
                    <strong>Stock:</strong> {productData.stock || '0'} 
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
