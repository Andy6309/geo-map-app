import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';

export const LayersButton = ({ onClick, isMobile }) => {
  const buttonStyle = {
    backgroundColor: 'white',
    border: '1px solid #007bff',
    padding: isMobile ? '6px 8px' : '10px 12px',
    marginRight: isMobile ? '0' : '10px',
    marginBottom: isMobile ? '5px' : '0',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#007bff',
    transition: 'all 0.3s ease-in-out',
    fontSize: isMobile ? '18px' : '24px',
    minWidth: isMobile ? '40px' : 'auto',
  };

  return (
    <button
      onClick={onClick}
      style={buttonStyle}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = '#e7f3ff';
        e.target.style.color = '#0056b3';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'white';
        e.target.style.color = '#007bff';
      }}
      title="Layers"
    >
      <FontAwesomeIcon icon={faLayerGroup} style={{ fontSize: isMobile ? '18px' : '24px' }} />
    </button>
  );
};
