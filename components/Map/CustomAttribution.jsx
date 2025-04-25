import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

const CustomAttribution = ({ map }) => {
  useEffect(() => {
    if (map) {
      const attributionControl = new mapboxgl.AttributionControl({
        compact: true, // Optional: makes the attribution control more compact
        customAttribution: '© OpenStreetMap contributors', // Your custom attribution
      });

      // Add the control to the map
      map.addControl(attributionControl, 'bottom-right');

      // Ensure Mapbox attribution is also shown
      const defaultAttribution = attributionControl._attribution;
      attributionControl._container.querySelector('.mapboxgl-ctrl-attrib-inner').innerHTML = `
        ${defaultAttribution} <br> © Mapbox`;
    }
  }, [map]);

  return null;
};

export default CustomAttribution;
