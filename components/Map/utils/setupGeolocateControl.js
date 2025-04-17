// File: components/Map/utils/setupGeolocateControl.js
// Purpose: Adds the geolocation control to the map and configures tracking and heading display

import mapboxgl from 'mapbox-gl';

export function setupGeolocateControl(mapInstance) {
  const geolocateControl = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
      showUserHeading: true,
      showUserLocation: true,
  });

  mapInstance.addControl(geolocateControl, 'top-right');
}
