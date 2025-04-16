// File: components/Map/controls/DrawingToolbar.js
// Purpose: Custom UI buttons to activate draw modes for waypoints, lines, shapes, and delete

import React from 'react';

export const DrawingToolbar = ({ draw, map }) => {
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
    borderRadius: '4px',
    padding: '8px',
    marginBottom: '5px',
    cursor: 'pointer',
    width: '100%',
    display: 'block',
    color: '#007bff',
    transition: 'all 0.3s ease-in-out',
  };

  const dangerStyle = {
    ...buttonStyle,
    border: '1px solid #dc3545',
    color: '#dc3545',
  };

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      zIndex: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      borderRadius: '5px',
      padding: '5px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    }}>
      <div style={{ marginBottom: '5px', fontWeight: 'bold', textAlign: 'center', color: 'black' }}>
        Drawing Tools
      </div>

      {[
        { label: 'Waypoint', mode: 'draw_point' },
        { label: 'Line', mode: 'draw_line_string' },
        { label: 'Shape', mode: 'draw_polygon' },
      ].map(({ label, mode }) => (
        <button
          key={mode}
          onClick={() => activateTool(mode)}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#007bff';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'white';
            e.target.style.color = '#007bff';
          }}
          title={`Add ${label}`}
        >
          {label}
        </button>
      ))}

      <button
        onClick={() => activateTool('trash')}
        style={dangerStyle}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#dc3545';
          e.target.style.color = 'white';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'white';
          e.target.style.color = '#dc3545';
        }}
        title="Delete Selected Features"
      >
        Delete
      </button>
    </div>
  );
};
