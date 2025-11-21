import React from 'react';
import Navbar from '../components/Navbar';
import '../styles/AddProduct.css';

const AddProduct = () => {
  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div className="add-product-main">
          <h1>Add New Product</h1>
          <div className="product-form-container">
            <div className="product-form">
              <h2>Basic Information</h2>
              <div className="form-group">
                <label>Product Name</label>
                <input type="text" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input type="text" />
              </div>
              <div className="form-group">
                <label>Product Description</label>
                <textarea></textarea>
              </div>
              <div className="form-group">
                <label>Images</label>
                <div className="image-upload-box"></div>
              </div>
              <div className="form-actions">
                <button className="cancel-btn">Cancel</button>
                <button className="draft-btn">Save as Draft</button>
                <button className="publish-btn">Publish</button>
              </div>
            </div>
            <div className="product-preview">
              <h2>Preview</h2>
              <div className="preview-content">
                <h3>Product Detail</h3>
                <div className="preview-image"></div>
                <h4>Product Name</h4>
                <p>Product details here!</p>
                <div className="preview-small-box"></div>
                <div className="preview-details">
                  <div className="preview-price"></div>
                  <div className="preview-stock"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
