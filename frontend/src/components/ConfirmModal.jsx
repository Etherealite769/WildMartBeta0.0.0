import React from 'react';
import ReactDOM from 'react-dom';
import '../styles/ConfirmModal.css';

const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'OK', 
  cancelText = 'Cancel',
  type = 'default' // default, danger, warning
}) => {
  if (!isOpen) return null;

  const modalTypeClass = `confirm-modal-${type}`;

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
      <div className={`confirm-modal ${modalTypeClass}`} onClick={handleModalClick}>
        <div className="confirm-modal-header">
          <h3 id="modal-title">{title}</h3>
        </div>
        <div className="confirm-modal-body">
          <p>{message}</p>
        </div>
        <div className="confirm-modal-footer">
          <button 
            className="confirm-modal-btn cancel-btn"
            onClick={onCancel}
            aria-label={cancelText}
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-modal-btn confirm-btn ${type === 'danger' ? 'danger' : ''}`}
            onClick={onConfirm}
            autoFocus
            aria-label={confirmText}
          >
            {confirmText}
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

export default ConfirmModal;