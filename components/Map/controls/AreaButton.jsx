// File: components/Map/controls/AreaButton.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDrawPolygon } from '@fortawesome/free-solid-svg-icons';

const AreaButton = ({ onAreaButtonClick }) => {
    const buttonStyle = {
        backgroundColor: 'white',
        border: '1px solid #007bff',
        padding: '10px 12px',
        marginRight: '10px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#007bff',
        transition: 'all 0.3s ease-in-out',
        fontSize: '24px',
    };

    return (
        <button
            onClick={onAreaButtonClick}
            style={buttonStyle}
            onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f0f0f0';
                e.target.style.color = '#007bff';
            }}
            onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = '#007bff';
            }}
            title="Add Area"
        >
            <FontAwesomeIcon icon={faDrawPolygon} style={{ fontSize: '24px' }} />
        </button>
    );
};

export default AreaButton;
