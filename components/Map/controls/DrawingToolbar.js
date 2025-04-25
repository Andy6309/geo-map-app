// File: components/Map/controls/DrawingToolbar.js

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import { WaypointButton } from './WaypointButton';
import LineButton from './Line';
import AreaButton from './Area';

export const DrawingToolbar = ({ draw, map, mapContainerRef }) => {
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
    padding: '10px 12px',
    marginRight: '10px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#007bff',
    transition: 'all 0.3s ease-in-out',
    fontSize: '24px',
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
        top: '10px',
        right: '10px',
        zIndex: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: '5px',
        padding: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: 'auto',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
    >
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

      {/* 🔹 Modular Buttons */}

      <WaypointButton map={map} mapContainerRef={mapContainerRef} />
      <LineButton activateTool={activateTool} />
      <AreaButton activateTool={activateTool} />

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
