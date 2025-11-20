import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudSun } from '@fortawesome/free-solid-svg-icons';

export const WeatherButton = ({ onClick, isMobile }) => {
  const buttonStyle = {
    position: 'absolute',
    bottom: isMobile ? '10px' : '80px',
    right: isMobile ? '10px' : '72px', // Position to left of locate me button (48px + 24px gap)
    width: isMobile ? '40px' : '48px',
    height: isMobile ? '40px' : '48px',
    backgroundColor: '#1a1a1a',
    border: '2px solid #4CAF50',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.2s ease',
    zIndex: 2,
  };

  const iconStyle = {
    color: '#4CAF50',
    fontSize: isMobile ? '18px' : '20px',
  };

  return (
    <button
      onClick={onClick}
      style={buttonStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#2a2a2a';
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#1a1a1a';
        e.currentTarget.style.transform = 'scale(1)';
      }}
      title="View Weather"
      aria-label="View Weather"
    >
      <FontAwesomeIcon icon={faCloudSun} style={iconStyle} />
    </button>
  );
};
