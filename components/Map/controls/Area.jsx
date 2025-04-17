// File: components/Map/controls/Area.jsx

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDrawPolygon } from '@fortawesome/free-solid-svg-icons';

const Area = ({ activateTool }) => {
    const buttonStyle = {
        backgroundColor: 'white',
        border: '1px solid #007bff',
        padding: '10px 12px',  // Adjust padding for better sizing without circles
        marginRight: '10px',   // Space between buttons
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#007bff',
        transition: 'all 0.3s ease-in-out',
        fontSize: '24px',      // Icon size
    };

    return (
        <button
            onClick={() => activateTool('draw_polygon')}
            style={buttonStyle}
            onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f0f0f0'; // Light grey background on hover
                e.target.style.color = '#007bff';            // Maintain blue color on hover
            }}
            onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';    // Reset background color
                e.target.style.color = '#007bff';            // Reset to original icon color
            }}
            title="Add Area"
        >
            <FontAwesomeIcon icon={faDrawPolygon} style={{ fontSize: '24px' }} />
        </button>
    );
};

export default Area;
