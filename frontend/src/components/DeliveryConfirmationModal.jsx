import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import '../styles/ConfirmModal.css';

const DeliveryConfirmationModal = ({ 
  isOpen, 
  onConfirm, 
  onCancel
}) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, etc.)');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    onConfirm(imageFile);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  // Handle escape key press
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  // Focus trap for accessibility
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const modalContent = (
    <div className="confirm-modal-overlay" onClick={onCancel} onKeyDown={handleKeyDown} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="confirm-modal confirm-modal-default" onClick={handleModalClick}>
        <div className="confirm-modal-header">
          <h3 id="modal-title">Confirm Delivery</h3>
        </div>
        <div className="confirm-modal-body">
          <p>Are you sure you want to mark this order as delivered?</p>
          
          <div className="image-upload-section" style={{ marginTop: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '10px', 
              fontWeight: '500', 
              color: '#333' 
            }}>
              Upload Delivery Proof (Optional):
            </label>
            
            {!imagePreview ? (
              <div className="image-upload-area" style={{
                border: '2px dashed #ccc',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: '#fafafa'
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  id="image-upload-input"
                />
                <label htmlFor="image-upload-input" style={{ cursor: 'pointer' }}>
                  <div style={{ 
                    padding: '15px', 
                    color: '#666',
                    fontSize: '14px'
                  }}>
                    <div style={{ marginBottom: '10px' }}>📁</div>
                    <div>Click to upload delivery proof image</div>
                    <div style={{ fontSize: '12px', marginTop: '5px' }}>(JPG, PNG, max 5MB)</div>
                  </div>
                </label>
              </div>
            ) : (
              <div className="image-preview-container" style={{ 
                position: 'relative', 
                display: 'inline-block',
                maxWidth: '100%'
              }}>
                <img 
                  src={imagePreview} 
                  alt="Delivery proof preview" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '200px', 
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }} 
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    background: '#800000',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="confirm-modal-footer">
          <button 
            className="confirm-modal-btn cancel-btn"
            onClick={onCancel}
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button 
            className="confirm-modal-btn confirm-btn"
            onClick={handleConfirm}
            autoFocus
            aria-label="Confirm Delivery"
          >
            Confirm Delivery
          </button>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document root
  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
};

export default DeliveryConfirmationModal;