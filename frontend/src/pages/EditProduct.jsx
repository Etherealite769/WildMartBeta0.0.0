import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import ConfirmModal from '../components/ConfirmModal';
import { supabase } from '../utils/supabase';
import { v4 as uuidv4 } from 'uuid';
import Cropper from 'react-easy-crop';
import '../styles/AddProduct.css';

// Helper function to create cropped image
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.9);
  });
};

const EditProduct = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [productData, setProductData] = useState({
    productName: '',
    category: '', 
    description: '',
    price: '',
    stock: '',
    status: 'active',
    images: [],
    imageUrl: '',
    sellerId: null,
    isOwner: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState({
    title: '',
    message: '',
    onConfirm: null,
    type: 'default'
  });
  
  // Cropping states
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`http://localhost:8080/api/products/${productId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      const product = response.data;
      console.log('Product data:', product);
      
      // Check ownership - store for later use but don't block viewing
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const currentUserEmail = tokenPayload.sub;
      const isOwner = !product.sellerEmail || product.sellerEmail === currentUserEmail;
      
      // Extract category name - now directly from categoryName field
      const categoryName = product.categoryName || '';
      
      setProductData({
        productName: product.productName || '',
        category: categoryName,
        description: product.description || '',
        price: product.price || '',
        stock: product.quantityAvailable || '',
        status: product.status || 'active',
        images: [],
        imageUrl: product.imageUrl || '',
        sellerId: product.sellerId,
        isOwner: isOwner
      });
      
      // If not owner, show error after loading data
      if (!isOwner) {
        setError('You do not have permission to edit this product.');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else if (error.response?.status === 404) {
        setError('Product not found.');
      } else {
        setError('Failed to load product details. Please try again.');
      }
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
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropConfirm = async () => {
    try {
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      
      // Convert blob to file
      const croppedFile = new File([croppedBlob], `cropped-${Date.now()}.jpg`, {
        type: 'image/jpeg'
      });
      
      setProductData(prev => ({
        ...prev,
        images: [croppedFile]
      }));
      
      setShowCropper(false);
      setImageToCrop(null);
    } catch (error) {
      console.error('Error cropping image:', error);
      toast.error('Failed to crop image. Please try again.');
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
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
      toast.error('Please fill in all required fields: Product Name, Category, Price, and Stock');
      return;
    }

    if (parseFloat(productData.price) <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    if (parseInt(productData.stock) < 0) {
      toast.error('Stock cannot be negative');
      return;
    }

    // Show confirmation dialog
    setConfirmModalData({
      title: 'Update Product',
      message: 'Are you sure you want to update this product?',
      onConfirm: () => {
        setShowConfirmModal(false);
        updateProduct();
      },
      type: 'default'
    });
    setShowConfirmModal(true);
  };

  const updateProduct = async () => {
    setIsSaving(true);

    try {
      const token = localStorage.getItem('token');
      console.log('Authorization Token exists:', !!token);
      
      if (!token) {
        toast.error('No authentication token found. Please log in again.');
        navigate('/login');
        return;
      }

      // Check if token is expired
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Date.now() / 1000;
        if (payload.exp < now) {
          console.log('Token expired, clearing and redirecting to login');
          localStorage.removeItem('token');
          toast.error('Your session has expired. Please log in again.');
          navigate('/login');
          return;
        }
        console.log('Token valid, user email:', payload.sub);
      } catch (e) {
        console.log('Invalid token format, clearing and redirecting to login');
        localStorage.removeItem('token');
        toast.error('Invalid session. Please log in again.');
        navigate('/login');
        return;
      }
      
      // Handle image upload if new images are selected
      let imageUrl = productData.imageUrl; // Default to existing image
      
      if (productData.images.length > 0) {
        const imageFile = productData.images[0];
        // Generate a unique filename for Supabase storage
        const fileName = `${uuidv4()}-${imageFile.name}`;
        const filePath = `${fileName}`;

        // Upload image to Supabase storage bucket "product-images"
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: true,
            contentType: imageFile.type
          });

        if (error) {
          console.error('Supabase upload error:', error);
          throw new Error('Image upload failed: ' + error.message);
        }

        // Get the public URL of the uploaded image
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
        console.log('Image uploaded successfully:', imageUrl);
      }
      
      // Build the update payload matching ProductDTO expected by backend
      const updatePayload = {
        productName: productData.productName,
        description: productData.description,
        price: parseFloat(productData.price),
        quantityAvailable: parseInt(productData.stock),
        status: productData.status,
        imageUrl: imageUrl,
        categoryName: productData.category
      };

      console.log('Sending update payload:', updatePayload);

      const response = await axios.put(`http://localhost:8080/api/products/${productId}`, updatePayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Product updated:', response.data);
      toast.success('Product updated successfully!');
      navigate('/my-products');

    } catch (error) {
      console.error('Error updating product:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else if (error.response?.status === 403) {
        const errorData = error.response?.data;
        console.error('Permission denied details:', errorData);
        toast.error(`Permission denied: ${errorData?.message || 'You can only update your own products.'}`);
      } else {
        toast.error(`Error updating product: ${error.response?.data?.message || error.message}. Please try again.`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setConfirmModalData({
      title: 'Cancel Changes',
      message: 'Are you sure you want to cancel? All unsaved changes will be lost.',
      onConfirm: () => {
        setShowConfirmModal(false);
        navigate('/my-products');
      },
      type: 'default'
    });
    setShowConfirmModal(true);
  };

  const handleDelete = async () => {
    setConfirmModalData({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      onConfirm: () => {
        setShowConfirmModal(false);
        deleteProduct();
      },
      type: 'danger'
    });
    setShowConfirmModal(true);
  };

  const deleteProduct = async () => {

    setIsSaving(true);

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Product deleted successfully');
      toast.success('Product deleted successfully!');
      navigate('/my-products');

    } catch (error) {
      console.error('Error deleting product:', error);
      console.error('Error response:', error.response?.data);
      toast.error(`Error deleting product: ${error.response?.data?.message || error.message}. Please try again.`);
    } finally {
      setIsSaving(false);
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

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="add-product-main">
          <div className="add-product-header">
            <h2>Edit Product</h2>
          </div>
          <div className="product-form-container">
            <div className="product-form" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => navigate('/my-products')}
              >
                Back to My Products
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      
      {/* Cropping Modal */}
      {showCropper && (
        <div className="cropper-modal">
          <div className="cropper-overlay" onClick={handleCropCancel}></div>
          <div className="cropper-container">
            <div className="cropper-header">
              <h3>Crop Image</h3>
              <button className="cropper-close" onClick={handleCropCancel}>×</button>
            </div>
            <div className="cropper-content">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="rect"
              />
            </div>
            <div className="cropper-controls">
              <div className="zoom-control">
                <label>Zoom:</label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                />
              </div>
              <div className="cropper-actions">
                <button className="btn-cancel" onClick={handleCropCancel}>
                  Cancel
                </button>
                <button className="btn-confirm" onClick={handleCropConfirm}>
                  Confirm Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
              <label>Status</label>
              <div className="category-dropdown">
                <select 
                  name="status"
                  value={productData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="active">Active</option>
                  <option value="sold">Sold</option>
                  <option value="draft">Draft</option>
                </select>
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
                
                {/* Preview existing image if no new image selected */}
                {productData.images.length === 0 && productData.imageUrl && (
                  <div className="uploaded-images">
                    <h4>Current Product Image</h4>
                    <div className="image-preview-grid">
                      <div className="image-preview-item">
                        <img src={productData.imageUrl} alt="Current product" />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Preview new images if selected */}
                {productData.images.length > 0 && (
                  <div className="uploaded-images">
                    <h4>New Product Image</h4>
                    <div className="image-preview-grid">
                      {productData.images.map((image, index) => (
                        <div key={index} className="image-preview-item">
                          <img src={URL.createObjectURL(image)} alt={`Product ${index + 1}`} />
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
                className="delete-btn" 
                onClick={handleDelete}
                disabled={isSaving}
              >
                {isSaving ? 'Deleting...' : 'Delete'}
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
                {(productData.images.length > 0 ? (
                  <div className="preview-main-image">
                    <img src={URL.createObjectURL(productData.images[0])} alt="Product preview" />
                  </div>
                ) : productData.imageUrl ? (
                  <div className="preview-main-image">
                    <img src={productData.imageUrl} alt="Product preview" />
                  </div>
                ) : (
                  <div className="preview-image-placeholder">
                    No image uploaded
                  </div>
                ))}
              </div>
              <h4>{productData.productName || 'Product Name'}</h4>
              <p>{productData.description || 'Product details here!'}</p>
              <div className="preview-category">
                <strong>Category:</strong> {productData.category || 'Not selected'}
              </div>
              <div className="preview-status">
                <strong>Status:</strong> <span className={`status-badge status-${productData.status}`}>{productData.status.charAt(0).toUpperCase() + productData.status.slice(1)}</span>
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
      <ConfirmModal
        isOpen={showConfirmModal}
        title={confirmModalData.title}
        message={confirmModalData.message}
        onConfirm={confirmModalData.onConfirm}
        onCancel={() => setShowConfirmModal(false)}
        type={confirmModalData.type}
      />
    </div>
  );
};

export default EditProduct;