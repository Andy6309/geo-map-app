import React, { useState } from 'react';
import { Locate, Compass, Plus, Minus, Search, Layers } from 'lucide-react';
import { locateAndMarkUser } from '../utils/locateMeAction';

/**
 * Mobile Bottom Toolbar - A unified bottom control panel for mobile devices
 * Includes: Drawing tools, Search toggle, Layer toggle, Locate, Compass, Zoom
 */
export const MobileBottomToolbar = ({ 
  map, 
  mapBearing, 
  mapPitch,
  resetNorthAndTilt,
  waypointDrawerRef,
  onLineButtonClick,
  onAreaButtonClick,
  onSearchToggle,
  showSearch,
  onLayerToggle,
  currentStyleId
}) => {
  const [locating, setLocating] = useState(false);

  const handleLocate = async () => {
    if (!map) return;
    setLocating(true);
    await locateAndMarkUser(map);
    setLocating(false);
  };

  const handleZoomIn = () => {
    if (map) map.zoomIn();
  };

  const handleZoomOut = () => {
    if (map) map.zoomOut();
  };

  const isNorthFacing = mapBearing === 0;
  const isFlat = mapPitch === 0;
  const compassOpacity = isNorthFacing && isFlat ? 0.5 : 1;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '60px',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 8px',
      zIndex: 1000,
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
    }}>
      {/* Left Section - Drawing Tools */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        {/* Search Toggle */}
        <button
          onClick={onSearchToggle}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '8px',
            border: '1px solid #007bff',
            backgroundColor: showSearch ? '#007bff' : '#fff',
            color: showSearch ? '#fff' : '#007bff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title="Search"
        >
          <Search size={20} />
        </button>

        {/* Waypoint Button */}
        <button
          onClick={() => {
            // Trigger waypoint modal
            const waypointBtn = document.querySelector('[data-waypoint-button]');
            if (waypointBtn) waypointBtn.click();
          }}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '8px',
            border: '1px solid #007bff',
            backgroundColor: '#fff',
            color: '#007bff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '20px',
            fontWeight: 'bold',
          }}
          title="Add Waypoint"
        >
          📍
        </button>

        {/* Line Button */}
        <button
          onClick={onLineButtonClick}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '8px',
            border: '1px solid #007bff',
            backgroundColor: '#fff',
            color: '#007bff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '20px',
            fontWeight: 'bold',
          }}
          title="Draw Line"
        >
          📏
        </button>

        {/* Area Button */}
        <button
          onClick={onAreaButtonClick}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '8px',
            border: '1px solid #007bff',
            backgroundColor: '#fff',
            color: '#007bff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '20px',
            fontWeight: 'bold',
          }}
          title="Draw Area"
        >
          ⬡
        </button>

        {/* Layer Toggle */}
        <button
          onClick={onLayerToggle}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '8px',
            border: '1px solid #007bff',
            backgroundColor: '#fff',
            color: '#007bff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title={currentStyleId === '2d-topo' ? 'Switch to 3D Satellite' : 'Switch to 2D Topo'}
        >
          <Layers size={20} />
        </button>
      </div>

      {/* Right Section - Navigation Controls */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        {/* Locate Me */}
        <button
          onClick={handleLocate}
          disabled={locating}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '1px solid #2c2c2c',
            backgroundColor: '#1e1e1e',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: locating ? 0.6 : 1,
          }}
          title="Locate Me"
        >
          <Locate size={20} />
        </button>

        {/* Compass */}
        <button
          onClick={resetNorthAndTilt}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '1px solid #ddd',
            backgroundColor: '#000',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            transform: `rotate(${mapBearing}deg)`,
            opacity: compassOpacity,
            transition: 'opacity 0.3s',
          }}
          title="Reset North"
        >
          <div style={{
            position: 'absolute',
            width: 0,
            height: 0,
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderBottom: '8px solid white',
            top: '8px',
          }} />
          <div style={{
            position: 'absolute',
            width: 0,
            height: 0,
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderTop: '8px solid gray',
            bottom: '8px',
          }} />
        </button>

        {/* Zoom Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button
            onClick={handleZoomIn}
            style={{
              width: '36px',
              height: '20px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            <Plus size={14} />
          </button>
          <button
            onClick={handleZoomOut}
            style={{
              width: '36px',
              height: '20px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            <Minus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
