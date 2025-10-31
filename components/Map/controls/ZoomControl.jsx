// Location: /components/Map/controls/ZoomControl.jsx
// Provides zoom in (+) and zoom out (-) buttons in a vertical container.

import React, { useState, useEffect } from 'react';

const ZoomControl = ({ map }) => {
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

    const handleZoomIn = () => {
        if (map) {
            map.zoomIn();
        }
    };

    const handleZoomOut = () => {
        if (map) {
            map.zoomOut();
        }
    };

    const styles = {
        container: {
            position: 'absolute',
            bottom: isMobile ? '270px' : '135px',
            right: isMobile ? '5px' : '17px',
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '5px' : '8px',
            zIndex: 1000,
            borderRadius: '5px',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            padding: isMobile ? '3px' : '5px',
        },
        button: {
            width: isMobile ? '32px' : '36px',
            height: isMobile ? '32px' : '36px',
            fontSize: isMobile ? '18px' : '20px',
            backgroundColor: '#ffffff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            transition: 'background-color 0.2s',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
    };

    return (
        <div style={styles.container}>
            <button style={styles.button} onClick={handleZoomIn}>+</button>
            <button style={styles.button} onClick={handleZoomOut}>−</button>
        </div>
    );
};

export default ZoomControl;
