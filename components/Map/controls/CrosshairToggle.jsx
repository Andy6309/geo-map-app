import React, { useEffect, useState } from 'react';

/**
 * CrosshairToggle renders a toggle switch and a large crosshair at the center of the map when enabled.
 *
 * Props:
 *   mapContainerRef: ref to the map container div
 */
const CROSSHAIR_ID = 'geo-map-crosshair-overlay';

export const CrosshairToggle = ({ mapContainerRef }) => {
  const [showCrosshair, setShowCrosshair] = useState(true);
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

  useEffect(() => {
    const container = mapContainerRef?.current;
    if (!container) return;

    let crosshair = document.getElementById(CROSSHAIR_ID);
    if (showCrosshair) {
      if (!crosshair) {
        crosshair = document.createElement('div');
        crosshair.id = CROSSHAIR_ID;
        crosshair.style.position = 'absolute';
        crosshair.style.top = '50%';
        crosshair.style.left = '50%';
        crosshair.style.transform = 'translate(-50%, -50%)';
        crosshair.style.pointerEvents = 'none';
        crosshair.style.zIndex = '10000';
        crosshair.innerHTML = `
          <svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Top vertical line -->
            <line x1="55" y1="10" x2="55" y2="37" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
            <!-- Bottom vertical line -->
            <line x1="55" y1="73" x2="55" y2="100" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
            <!-- Left horizontal line -->
            <line x1="10" y1="55" x2="37" y2="55" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
            <!-- Right horizontal line -->
            <line x1="73" y1="55" x2="100" y2="55" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
            <!-- Central dot -->
            <circle cx="55" cy="55" r="2" fill="#fff" />
          </svg>
        `;
        container.appendChild(crosshair);
      } else {
        crosshair.style.display = 'block';
      }
    } else if (crosshair) {
      crosshair.style.display = 'none';
    }
    return () => {
      if (crosshair) crosshair.style.display = 'none';
    };
  }, [showCrosshair, mapContainerRef]);

  return (
    <div style={{ 
      position: 'absolute', 
      bottom: isMobile ? 420 : 155, 
      left: 10, 
      zIndex: 20, 
      background: 'rgba(24,24,24,0.75)', 
      borderRadius: 6, 
      padding: isMobile ? '4px 8px' : '6px 12px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.16)' 
    }}>
      <label style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: isMobile ? 8 : 12, 
        fontWeight: 500, 
        fontSize: isMobile ? 13 : 15, 
        cursor: 'pointer', 
        userSelect: 'none', 
        color: '#fff' 
      }}>
        <span style={{ position: 'relative', display: 'inline-block', width: isMobile ? 32 : 38, height: isMobile ? 18 : 22 }}>
          <input
            type="checkbox"
            checked={showCrosshair}
            onChange={e => setShowCrosshair(e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
            aria-label="Toggle map center crosshair"
          />
          <span
            style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: showCrosshair ? '#007bff' : '#444',
              transition: 'background 0.2s',
              borderRadius: 22,
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }}
          />
          <span
            style={{
              position: 'absolute',
              left: showCrosshair ? 18 : 2,
              top: 2,
              width: 18,
              height: 18,
              background: '#fff',
              borderRadius: '50%',
              boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
              transition: 'left 0.2s',
              border: '1px solid #eee',
            }}
          />
        </span>
        <span>Show Map Crosshair</span>
      </label>
    </div>
  );
};

export default CrosshairToggle;
