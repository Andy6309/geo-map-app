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

      // Use a custom marker: dot with direction arrow
      const markerEl = document.createElement('div');
      markerEl.style.width = '24px';
      markerEl.style.height = '24px';
      markerEl.style.borderRadius = '50%';
      markerEl.style.background = '#007bff';
      markerEl.style.border = '2px solid #fff';
      markerEl.style.boxShadow = '0 0 8px rgba(0,0,0,0.15)';
      markerEl.style.position = 'relative';

      // Blue cone for direction (SVG)
      const cone = document.createElement('div');
      cone.innerHTML = `
        <svg width="48" height="48" viewBox="0 0 48 48" style="display:block;" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 24 L10 6 A20 20 0 0 1 38 6 Z" fill="rgba(0,123,255,0.25)" />
        </svg>
      `;
      cone.style.position = 'absolute';
      cone.style.left = '50%';
      cone.style.top = '-28px';
      cone.style.transform = 'translateX(-50%)';
      cone.style.pointerEvents = 'none';
      cone.style.zIndex = '1';
      markerEl.appendChild(cone);

      const marker = new mapboxgl.Marker({ element: markerEl, rotationAlignment: 'map' })
        .setLngLat([longitude, latitude])
        .addTo(map);

      // Try to update direction using device orientation
      if (window.DeviceOrientationEvent) {
        const handleOrientation = (event) => {
          // 'alpha' is compass heading in degrees (0 = north)
          if (typeof event.alpha === 'number') {
            markerEl.style.transform = `rotate(${-event.alpha}deg)`;
          }
        };
        window.addEventListener('deviceorientation', handleOrientation, true);
        markerEl._removeOrientationListener = () => {
          window.removeEventListener('deviceorientation', handleOrientation, true);
        };
      }

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
