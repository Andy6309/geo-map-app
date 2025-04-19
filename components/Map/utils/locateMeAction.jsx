// File: components/Map/utils/locateMeAction.js

import mapboxgl from 'mapbox-gl';

let userMarkerRef = null;
let isLocating = false;

export async function locateAndMarkUser(map) {
  if (!navigator.geolocation || !map || isLocating) return;

  isLocating = true;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;

      // Remove previous marker
      if (userMarkerRef) {
        userMarkerRef.remove();
      }

      // Use Mapbox's default marker
      const marker = new mapboxgl.Marker()
        .setLngLat([longitude, latitude])
        .addTo(map);

      userMarkerRef = marker;

      // Center the map on the user's location
      map.flyTo({
        center: [longitude, latitude],
        zoom: 15,
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
