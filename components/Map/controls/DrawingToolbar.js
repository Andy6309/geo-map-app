// File: components/Map/controls/DrawingToolbar.js

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRoute, faLocationDot, faDrawPolygon, faTrash } from '@fortawesome/free-solid-svg-icons';
import Waypoint from './Waypoint';  // Import Waypoint component
import Line from './Line';          // Import Line component
import Area from './Area';          // Import Area component

export const DrawingToolbar = ({ draw, map }) => {
    const activateTool = (tool) => {
        if (!map || !draw) return;
        if (tool === 'trash') {
            draw.trash();
        } else {
            draw.changeMode(tool);
        }
    };

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

    const dangerStyle = {
        ...buttonStyle,
        border: '1px solid #dc3545',
        color: '#dc3545',
    };

    return (
        <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '5px',
            padding: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            display: 'flex',        // Horizontal flex layout
            flexDirection: 'row',   // Align buttons horizontally
            alignItems: 'center',   // Center the items vertically
            width: 'auto',          // Allow toolbar to adjust based on content
            maxHeight: '80vh',      // Prevent the toolbar from being too tall
            overflowY: 'auto',      // Add scrolling if the toolbar is too long
        }}>
            <div style={{
                transform: 'rotate(-90deg)',   // Rotate "Input Tools" vertically
                marginRight: '10px',            // Space between title and buttons
                fontWeight: 'bold',
                color: 'black',
                fontSize: '14px',               // Smaller font size for "Input Tools"
                textAlign: 'center',
                fontFamily: 'Roboto, Arial, sans-serif', // More modern font
            }}>
                Tools
            </div>

            {/* Modular Buttons for Waypoint, Line, and Area */}
            <Waypoint activateTool={activateTool} />
            <Line activateTool={activateTool} />
            <Area activateTool={activateTool} />

            <button
                onClick={() => activateTool('trash')}
                style={dangerStyle}
                onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f8d7da';  // Light red background on hover
                    e.target.style.color = '#dc3545';            // Keep red icon color on hover
                }}
                onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'white';    // Reset background color
                    e.target.style.color = '#dc3545';            // Reset to original icon color
                }}
                title="Delete Selected Features"
            >
                <FontAwesomeIcon icon={faTrash} style={{ fontSize: '24px' }} />
            </button>
        </div>
    );
};
