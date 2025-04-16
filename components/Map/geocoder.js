// File: components/Map/geocoder.js
// Purpose: Initializes and configures the Mapbox geocoder and handles search result marker logic

import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import mapboxgl from 'mapbox-gl';

export function setupGeocoder(mapInstance, geocoderContainerRef, markerRef) {
  if (geocoderContainerRef.current) {
    while (geocoderContainerRef.current.firstChild) {
      geocoderContainerRef.current.removeChild(geocoderContainerRef.current.firstChild);
    }
  }

  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    marker: false,
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

    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    const newMarker = new mapboxgl.Marker({
      color: '#FF0000',
      scale: 1.2,
      draggable: false,
    });

    newMarker.setLngLat(coordinates).addTo(mapInstance);
    markerRef.current = newMarker;

    setTimeout(() => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    }, 5000);
  });
}
