// File: components/Map/geocoder.js
// Purpose: Initializes and configures the Mapbox geocoder without placing a marker

import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import mapboxgl from 'mapbox-gl';

export function setupGeocoder(mapInstance, geocoderContainerRef) {
    if (geocoderContainerRef.current) {
        while (geocoderContainerRef.current.firstChild) {
            geocoderContainerRef.current.removeChild(geocoderContainerRef.current.firstChild);
        }
    }

    const geocoder = new MapboxGeocoder({
        accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: false, // no automatic marker
        placeholder: 'Search locations...',
    });

    if (geocoderContainerRef.current) {
        geocoderContainerRef.current.appendChild(geocoder.onAdd(mapInstance));
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
