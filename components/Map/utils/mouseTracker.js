// File: components/Map/utils/mouseTracker.js
// Purpose: Tracks mouse movement on the map and displays coordinates and elevation in an overlay

export function trackMousePosition(mapInstance) {
  mapInstance.on('mousemove', (e) => {
    const lng = e.lngLat.lng.toFixed(4);
    const lat = e.lngLat.lat.toFixed(4);
    const elevation = mapInstance.queryTerrainElevation(e.lngLat);

    const infoElement = document.getElementById('info');
    if (infoElement) {
      infoElement.innerHTML =
        `Longitude: ${lng}<br />Latitude: ${lat}` +
        (elevation !== null ? `<br />Elevation: ${elevation.toFixed(2)} m` : '');
    }
  });
}
