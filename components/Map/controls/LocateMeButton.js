// File: components/Map/controls/LocateMeButton.js
// Purpose: Locate user and drop a custom <Plus /> icon marker

import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Locate, Plus } from 'lucide-react';

export const LocateMeButton = ({ map }) => {
    const userMarkerRef = useRef(null);

    const handleClick = () => {
        if (!map || !navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;

                // Remove old marker
                //if (userMarkerRef.current) {
                 //   userMarkerRef.current.remove();
                //}

                // Create HTML element for the marker
                const el = document.createElement('div');
                el.style.width = '32px';
                el.style.height = '32px';
                el.style.display = 'flex';
                el.style.justifyContent = 'center';
                el.style.alignItems = 'center';
                el.style.borderRadius = '50%';
                el.style.backgroundColor = 'white';
                el.style.boxShadow = '0 0 0 2px #007bff';
                el.style.color = '#007bff';

                // Render Plus icon inside the marker
                const icon = document.createElement('div');
                icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus" viewBox="0 0 24 24"><path d="M5 12h14M12 5v14"/></svg>`;
                el.appendChild(icon);

                // Add the marker to the map
                const marker = new mapboxgl.Marker(el)
                    .setLngLat([longitude, latitude])
                    .addTo(map);

                userMarkerRef.current = marker;

                // Fly to the user's location
                map.flyTo({
                    center: [longitude, latitude],
                    zoom: 15,
                    speed: 1.2,
                });
            },
            (err) => {
                console.error('Geolocation error:', err);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
            }
        );
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
                }}
                title="Locate Me"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2a2a2a')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1e1e1e')}
            >
                <Locate size={22} />
            </button>
        </div>
    );
};
