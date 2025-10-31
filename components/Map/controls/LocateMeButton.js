// File: components/Map/controls/LocateMeButton.jsx

import React, { useState, useEffect } from 'react';
import { Locate } from 'lucide-react';
import { locateAndMarkUser } from '../utils/locateMeAction';

export const LocateMeButton = ({ map }) => {
  const [loading, setLoading] = useState(false);
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

  const handleClick = async () => {
    if (!map) return;
    setLoading(true);
    await locateAndMarkUser(map);
    setLoading(false);
  };

  return (
    <div style={{ 
      position: 'absolute', 
      bottom: isMobile ? '10px' : '80px', 
      left: isMobile ? '10px' : 'auto',
      right: isMobile ? 'auto' : '16px', 
      zIndex: 2 
    }}>
      <button
        onClick={handleClick}
        style={{
          backgroundColor: '#1e1e1e',
          border: '1px solid #2c2c2c',
          borderRadius: '50%',
          width: isMobile ? '40px' : '48px',
          height: isMobile ? '40px' : '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease',
          boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
          opacity: loading ? 0.6 : 1,
        }}
        title="Locate Me"
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2a2a2a')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1e1e1e')}
        disabled={loading}
      >
        <Locate size={isMobile ? 18 : 22} />
      </button>
    </div>
  );
};
