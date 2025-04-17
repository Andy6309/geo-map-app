// Location: /components/Map/controls/ZoomControl.jsx
// Provides zoom in (+) and zoom out (-) buttons in a vertical container.

import React from 'react';

const ZoomControl = ({ map }) => {
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

    return (
        <div style={styles.container}>
            <button style={styles.button} onClick={handleZoomIn}>+</button>
            <button style={styles.button} onClick={handleZoomOut}>−</button>
        </div>
    );
};

const styles = {
    container: {
        position: 'absolute',
        bottom: '135px',
        right: '17px',
        display: 'flex',
        flexDirection: 'column',  // Align buttons vertically (stacked)
        gap: '8px',               // Space between buttons
        zIndex: 1000,
        borderRadius: '5px',      // Optional: Add border radius for a sleek look
        backgroundColor: 'rgba(255, 255, 255, 0.7)', // Optional: Light background for contrast
        padding: '5px',           // Optional: Padding for spacing inside the container
    },
    button: {
        width: '36px',
        height: '36px',
        fontSize: '20px',
        backgroundColor: '#ffffff',
        border: '1px solid #ccc',
        borderRadius: '4px',
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'background-color 0.2s',
        display: 'flex',           // Center text in the button
        justifyContent: 'center',
        alignItems: 'center',
    },
};

export default ZoomControl;
