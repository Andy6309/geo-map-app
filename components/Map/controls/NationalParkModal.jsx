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

export const NationalParkModal = ({ isOpen, onClose, parkData, isMobile }) => {
  if (!parkData) return null;

  const modalStyle = getModalStyle(isMobile);

  // Extract and format the CLASS property for the modal title
  const getModalTitle = () => {
    if (!parkData.class && !parkData.CLASS) return 'Landuse Area';
    
    const classValue = parkData.class || parkData.CLASS;
    
    // Format: national_park -> National Park, wetland -> Wetland
    return classValue
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const modalTitle = getModalTitle();

  // Styles
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 22px 12px 22px',
    borderBottom: '1px solid #e5e7eb',
    flexShrink: 0,
  };

  const titleStyle = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#166534', // Dark green for National Parks
    margin: 0,
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s',
  };

  const contentStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 22px 20px 22px',
  };

  const propertyRowStyle = {
    marginBottom: '12px',
    paddingBottom: '12px',
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
    fontSize: '14px',
    color: '#111827',
    fontWeight: '500',
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={modalStyle}
      contentLabel="National Park Properties"
    >
      {/* Header */}
      <div style={headerStyle}>
        <h2 style={titleStyle}>{modalTitle}</h2>
        <button
          onClick={onClose}
          style={closeButtonStyle}
          onMouseEnter={(e) => e.currentTarget.style.color = '#166534'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
          aria-label="Close"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      {/* Content */}
      <div style={contentStyle}>
        {Object.entries(parkData).map(([key, value]) => (
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
