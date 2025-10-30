// File: components/Map/geocoder.js
// Purpose: Initializes and configures the Mapbox geocoder without placing a marker

import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import mapboxgl from 'mapbox-gl';

export function setupGeocoder(mapInstance, geocoderContainerRef) {
    console.log('🔍 Setting up geocoder...', { 
        hasMap: !!mapInstance, 
        hasContainer: !!geocoderContainerRef.current 
    });
    
    if (geocoderContainerRef.current) {
        while (geocoderContainerRef.current.firstChild) {
            geocoderContainerRef.current.removeChild(geocoderContainerRef.current.firstChild);
        }
    }

    const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: false, // no automatic marker
        placeholder: 'Search locations...',
    });

    if (geocoderContainerRef.current) {
        geocoderContainerRef.current.appendChild(geocoder.onAdd(mapInstance));
        console.log('✅ Geocoder added to container');
    } else {
        console.error('❌ Geocoder container ref is null!');
    }

    geocoder.on('result', (event) => {
        const coordinates = event.result.geometry.coordinates;

        mapInstance.flyTo({
            center: coordinates,
            zoom: 17,
            bearing: 0,
            speed: 1.2,
            curve: 1,
            essential: true,
        });

        console.log('📍 Flying to coordinates (no marker):', coordinates);
    });
}
