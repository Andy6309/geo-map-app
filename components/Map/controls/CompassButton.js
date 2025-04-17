// File: components/Map/controls/CompassButton.js
// Purpose: Custom compass button that rotates with map bearing and resets orientation on click

import React from 'react';

export const CompassButton = ({ mapBearing, mapPitch, resetNorthAndTilt }) => {
  const isNorthFacing = mapBearing === 0;
  const isFlat = mapPitch === 0;
  const opacity = isNorthFacing && isFlat ? 0.6 : 1;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '230px',
        right: '10px',
        zIndex: 2,
        opacity: opacity,
        transition: 'opacity 0.3s ease',
      }}
    >
      <button
        onClick={resetNorthAndTilt}
        style={{
          backgroundColor: 'black',
          border: '1px solid #ddd',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          padding: '8px',
          cursor: 'pointer',
          boxShadow: '0 0 0 3px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `rotate(${mapBearing}deg)`,
          position: 'relative',
          outline: 'none',
        }}
        aria-label="Reset North and Tilt"
      >

        {/* Arrows + Markers */}
        <div style={{
          position: 'absolute',
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderBottom: '10px solid white',
          top: '6px',
          left: '50%',
          transform: 'translateX(-50%)',
        }} />
        <div style={{
          position: 'absolute',
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: '10px solid gray',
          bottom: '6px',
          left: '50%',
          transform: 'translateX(-50%)',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '82%',
          transform: 'translate(-50%, -50%)',
          width: '8px',
          height: '2px',
          backgroundColor: 'gray',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '18%',
          transform: 'translate(-50%, -50%)',
          width: '8px',
          height: '2px',
          backgroundColor: 'gray',
        }} />
        <div style={{
          position: 'absolute',
          fontSize: '14px',
          fontWeight: 'bold',
          color: 'white',
          width: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          textAlign: 'center',
        }}>N</div>
      </button>
    </div>
  );
};
