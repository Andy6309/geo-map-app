// File: components/Map/controls/LocateMeButton.jsx

import React, { useState } from 'react';
import { Locate } from 'lucide-react';
import { locateAndMarkUser } from '../utils/locateMeAction';

export const LocateMeButton = ({ map }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!map) return;
    setLoading(true);
    await locateAndMarkUser(map);
    setLoading(false);
  };

  return (
    <div style={{ position: 'absolute', bottom: '80px', right: '16px', zIndex: 2 }}>
      <button
        onClick={handleClick}
        style={{
          backgroundColor: '#1e1e1e',
          border: '1px solid #2c2c2c',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
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
        <Locate size={22} />
      </button>
    </div>
  );
};
