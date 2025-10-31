import React from 'react';

/**
 * Mobile Search Bar - Collapsible search that appears above the bottom toolbar
 */
export const MobileSearchBar = ({ geocoderContainerRef, show }) => {
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '60px', // Just above the bottom toolbar
      left: 0,
      right: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(0, 0, 0, 0.1)',
      padding: '12px',
      zIndex: 999,
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
      animation: 'slideUp 0.3s ease-out',
    }}>
      <div
        ref={geocoderContainerRef}
        style={{
          width: '100%',
        }}
      />
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
