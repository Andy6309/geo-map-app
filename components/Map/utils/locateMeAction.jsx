// File: components/Map/utils/locateMeAction.js

import mapboxgl from 'mapbox-gl';

let userMarkerRef = null;
let isLocating = false;

export async function locateAndMarkUser(map) {
  if (!navigator.geolocation || !map || isLocating) return;

  // If there's an existing marker, remove it and return
  if (userMarkerRef) {
    userMarkerRef.remove();
    userMarkerRef = null;
    isLocating = false;
    return;
  }

  isLocating = true;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;

      // Create a simple blue dot marker
      const markerEl = document.createElement('div');
      markerEl.style.width = '16px';
      markerEl.style.height = '16px';
      markerEl.style.borderRadius = '50%';
      markerEl.style.background = '#007bff';
      markerEl.style.border = '2px solid #fff';
      markerEl.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';

      const marker = new mapboxgl.Marker({ element: markerEl })
        .setLngLat([longitude, latitude])
        .addTo(map);

      userMarkerRef = marker;

      // Center the map on the user's location
      map.flyTo({
        center: [longitude, latitude],
        zoom: 17,
        speed: 1.2,
      });

      isLocating = false;
    },
    (err) => {
      console.error('Geolocation failed:', err);
      isLocating = false;
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
    }
  );
}
