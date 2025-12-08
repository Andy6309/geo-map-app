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

// Modal styles - responsive for mobile
const getModalStyle = (isMobile) => ({
  overlay: {
    zIndex: 100001,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: isMobile ? 'flex-end' : 'center',
    justifyContent: 'center',
  },
  content: {
    position: 'relative',
    inset: 'auto',
    width: isMobile ? '100%' : '360px',
    maxHeight: isMobile ? '80vh' : 'auto',
    border: 'none',
    background: '#fff',
    padding: isMobile ? '16px' : '24px 22px 20px 22px',
    borderRadius: isMobile ? '20px 20px 0 0' : '13px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18)',
    fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif',
    overflow: 'visible',
  }
});

export const LayersModal = ({ 
  isOpen, 
  onClose, 
  countyBoundariesVisible,
  onToggleCountyBoundaries,
  isMobile 
}) => {

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e5e7eb',
    flexShrink: 0,
  };

  const titleStyle = {
    fontSize: isMobile ? '18px' : '20px',
    fontWeight: '600',
    color: '#111827',
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

  const sectionStyle = {
    marginBottom: '12px',
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  };

  const sectionTitleStyle = {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const toggleRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    fontSize: '14px',
    color: '#374151',
  };

  const checkboxStyle = {
    marginLeft: 'auto',
    cursor: 'pointer',
    width: '18px',
    height: '18px',
    accentColor: '#10b981',
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={getModalStyle(isMobile)}
      contentLabel="Map Layers"
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
    >
      <div style={headerStyle}>
        <h2 style={titleStyle}>Map Layers</h2>
        <button style={closeButtonStyle} onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      {/* County Boundaries Toggle */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Boundaries</div>
        
        <div style={toggleRowStyle}>
          <span>County Boundaries</span>
          <input
            type="checkbox"
            checked={countyBoundariesVisible}
            onChange={onToggleCountyBoundaries}
            style={checkboxStyle}
          />
        </div>
      </div>
    </Modal>
  );
};
