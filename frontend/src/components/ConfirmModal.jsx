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

  const modalContent = (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className={`confirm-modal ${modalTypeClass}`} onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <h3>{title}</h3>
        </div>
        <div className="confirm-modal-body">
          <p>{message}</p>
        </div>
        <div className="confirm-modal-footer">
          <button 
            className="confirm-modal-btn cancel-btn"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-modal-btn confirm-btn ${type === 'danger' ? 'danger' : ''}`}
            onClick={onConfirm}
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
