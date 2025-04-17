import React, { useState } from 'react';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import mapboxgl from 'mapbox-gl';

// Default modal styles
const modalStyles = {
    content: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '300px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
};

const Waypoint = ({ map }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [waypointName, setWaypointName] = useState('');
    const [waypointColor, setWaypointColor] = useState('red');

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleAddWaypoint = () => {
        if (waypointName && map) {
            const center = map.getCenter();

            // Create a custom DOM element for the marker
            const el = document.createElement('div');
            el.className = 'custom-marker';
            el.style.backgroundColor = waypointColor;
            el.style.width = '20px';
            el.style.height = '20px';
            el.style.borderRadius = '50%';
            el.style.border = '2px solid white';
            el.style.boxShadow = '0 0 3px rgba(0,0,0,0.5)';
            el.title = waypointName;

            // Create popup
            const popup = new mapboxgl.Popup({ offset: 25 }).setText(waypointName);

            // Create the draggable marker
            const marker = new mapboxgl.Marker({ element: el, draggable: true })
                .setLngLat(center)
                .setPopup(popup)
                .addTo(map);

            // Optional: show popup on marker click
            el.addEventListener('click', () => marker.togglePopup());

            // Reset form and close modal
            setWaypointName('');
            closeModal();
        }
    };

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

    const colorDotStyle = (color) => ({
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        backgroundColor: color,
        cursor: 'pointer',
        margin: '5px',
        border: `2px solid ${color === waypointColor ? '#000' : 'transparent'}`,
    });

    return (
        <div>
            {/* Waypoint button */}
            <button onClick={openModal} style={buttonStyle}>
                <FontAwesomeIcon icon={faMapMarkerAlt} />
            </button>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                style={modalStyles}
                contentLabel="Add Waypoint"
                ariaHideApp={false} // Add this if you're getting accessibility warnings
            >
                <h2>Add Waypoint</h2>
                <div>
                    <input
                        type="text"
                        value={waypointName}
                        onChange={(e) => setWaypointName(e.target.value)}
                        placeholder="Waypoint Name"
                        style={styles.input}
                    />
                </div>
                <div>
                    <label>Choose Color:</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {['red', 'blue', 'green', 'yellow'].map((color) => (
                            <div
                                key={color}
                                style={colorDotStyle(color)}
                                onClick={() => setWaypointColor(color)}
                                title={color.charAt(0).toUpperCase() + color.slice(1)}
                            />
                        ))}
                    </div>
                </div>
                <button onClick={handleAddWaypoint} style={styles.addButton}>
                    Add Waypoint
                </button>
            </Modal>
        </div>
    );
};

const styles = {
    input: {
        padding: '5px',
        fontSize: '14px',
        width: '100%',
        marginBottom: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
    },
    addButton: {
        backgroundColor: '#007bff',
        color: '#fff',
        padding: '8px 16px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};

export default Waypoint;
