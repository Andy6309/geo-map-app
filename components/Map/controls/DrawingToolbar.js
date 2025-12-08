// File: components/Map/controls/DrawingToolbar.js

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import { WaypointButton } from './WaypointButton';
import LineButton from './Line';

import AreaButton from './AreaButton';
import { LayersButton } from './LayersButton';

export const DrawingToolbar = ({ draw, map, mapContainerRef, waypointDrawerRef, onLineButtonClick, onAreaButtonClick, onLayersButtonClick }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileDevice = mobileRegex.test(userAgent);
      const isSmallScreen = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const activateTool = (tool) => {
    if (!map || !draw) return;
    if (tool === 'trash') {
      draw.trash();
    } else {
      draw.changeMode(tool);
    }
  };

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

  const dangerStyle = {
    ...buttonStyle,
    border: '1px solid #dc3545',
    color: '#dc3545',
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: isMobile ? '5px' : '10px',
        right: isMobile ? '5px' : '10px',
        zIndex: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: '5px',
        padding: isMobile ? '5px' : '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        width: 'auto',
        maxHeight: isMobile ? 'auto' : '80vh',
        overflowY: 'auto',
      }}
    >
      {!isMobile && (
        <div
          style={{
            transform: 'rotate(-90deg)',
            marginRight: '10px',
            fontWeight: 'bold',
            color: 'black',
            fontSize: '14px',
            textAlign: 'center',
            fontFamily: 'Roboto, Arial, sans-serif',
          }}
        >
          Tools
        </div>
      )}

      {/* 🔹 Modular Buttons */}

      <WaypointButton map={map} mapContainerRef={mapContainerRef} waypointDrawerRef={waypointDrawerRef} />
      <LineButton onLineButtonClick={onLineButtonClick} />
      <AreaButton onAreaButtonClick={onAreaButtonClick} />
      <LayersButton onClick={onLayersButtonClick} isMobile={isMobile} />

      {/* 🗑️ Delete button */}
      <button
        onClick={() => activateTool('trash')}
        style={dangerStyle}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#f8d7da';
          e.target.style.color = '#dc3545';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'white';
          e.target.style.color = '#dc3545';
        }}
        title="Delete Selected Features"
      >
        <FontAwesomeIcon icon={faTrash} style={{ fontSize: '24px' }} />
      </button>
    </div>
  );
};
