import React, { useEffect, useState } from 'react';

/**
 * Mobile Modal Wrapper - Converts standard modals to bottom sheets on mobile
 * Wraps existing modal content and applies mobile-specific styling
 */
export const MobileModalWrapper = ({ isOpen, children, onClose }) => {
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

  if (!isOpen) return null;

  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 100000,
            animation: 'fadeIn 0.3s ease-out',
          }}
        />
        
        {/* Bottom Sheet */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '85vh',
            backgroundColor: '#fff',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
            zIndex: 100001,
            animation: 'slideUp 0.3s ease-out',
            overflowY: 'auto',
            paddingBottom: '20px', // Extra padding for safe area
          }}
        >
          {/* Drag Handle */}
          <div style={{
            width: '40px',
            height: '4px',
            backgroundColor: '#ccc',
            borderRadius: '2px',
            margin: '12px auto 8px',
          }} />
          
          {children}
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
        `}</style>
      </>
    );
  }

  // Desktop - render children as-is (they have their own modal styling)
  return <>{children}</>;
};
