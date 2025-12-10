import React from 'react';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

// Ensure accessibility for react-modal
if (typeof window !== 'undefined') {
  const nextRoot = document.getElementById('__next');
  if (nextRoot) {
    Modal.setAppElement('#__next');
  } else {
    Modal.setAppElement('body');
  }
}

// Modal styles - left-aligned for desktop, bottom for mobile
const getModalStyle = (isMobile) => ({
  overlay: {
    zIndex: 100001,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    display: 'flex',
    alignItems: isMobile ? 'flex-end' : 'center',
    justifyContent: isMobile ? 'center' : 'flex-start',
    padding: isMobile ? '0' : '20px',
  },
  content: {
    position: 'relative',
    inset: 'auto',
    width: isMobile ? '100%' : '400px',
    maxHeight: isMobile ? '80vh' : 'calc(100vh - 40px)',
    border: 'none',
    background: '#fff',
    padding: '0',
    borderRadius: isMobile ? '20px 20px 0 0' : '13px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18)',
    fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  }
});

export const WMAModal = ({ isOpen, onClose, wmaData, isMobile }) => {
  if (!wmaData) return null;

  const modalStyle = getModalStyle(isMobile);

  // Header style
  const headerStyle = {
    padding: isMobile ? '16px' : '20px 22px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
  };

  const titleStyle = {
    fontSize: isMobile ? '18px' : '20px',
    fontWeight: '600',
    color: '#059669',
    margin: 0,
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280',
    fontSize: '20px',
    transition: 'color 0.2s',
  };

  // Content area style
  const contentStyle = {
    padding: isMobile ? '16px' : '20px 22px',
    overflowY: 'auto',
    flex: 1,
  };

  // Property row style
  const propertyRowStyle = {
    marginBottom: '14px',
    paddingBottom: '14px',
    borderBottom: '1px solid #f3f4f6',
  };

  const propertyLabelStyle = {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  };

  const propertyValueStyle = {
    fontSize: '15px',
    fontWeight: '500',
    color: '#111827',
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={modalStyle}
      contentLabel="WMA Properties"
    >
      {/* Header */}
      <div style={headerStyle}>
        <h2 style={titleStyle}>WMA Properties</h2>
        <button
          onClick={onClose}
          style={closeButtonStyle}
          onMouseEnter={(e) => e.currentTarget.style.color = '#059669'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
          aria-label="Close"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      {/* Content */}
      <div style={contentStyle}>
        {Object.entries(wmaData).map(([key, value]) => (
          <div key={key} style={propertyRowStyle}>
            <div style={propertyLabelStyle}>{formatKey(key)}</div>
            <div style={propertyValueStyle}>{formatValue(value)}</div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

// Helper function to format property keys
const formatKey = (key) => {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// Helper function to format property values
const formatValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }
  
  // Format numbers with commas
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  
  return String(value);
};
