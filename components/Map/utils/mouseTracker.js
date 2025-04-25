// Location: /components/Map/utils/mouseTracker.js

let mouseMoveHandler = null; // to store the event handler for removal

export function trackMousePosition(mapInstance, isMouseTrackingEnabled = true) {
    const infoElement = document.getElementById('info');
    const toggleCheckbox = document.getElementById('toggleVisibility'); // Checkbox to toggle visibility

    // If checkbox doesn't exist yet, return early
    if (!toggleCheckbox || !infoElement) return;

    // If tracking is disabled, remove only our own event handler if it exists
    if (!isMouseTrackingEnabled && mouseMoveHandler) {
        mapInstance.off('mousemove', mouseMoveHandler);
        mouseMoveHandler = null;

        // Hide the info container when tracking is disabled
        infoElement.style.display = 'none';
        return;
    }

    // If tracking is enabled, set the mouse move handler
    if (isMouseTrackingEnabled && !mouseMoveHandler) {
        mouseMoveHandler = (e) => {
            console.log('mouseTracker.js mousemove', e.lngLat);
            const lng = e.lngLat.lng.toFixed(4);
            const lat = e.lngLat.lat.toFixed(4);
            const elevation = mapInstance.queryTerrainElevation(e.lngLat);

            // Check if checkbox is checked before displaying location
            if (toggleCheckbox.checked) {
                infoElement.style.display = 'block'; // Ensure it's visible
                infoElement.innerHTML =
                    `Longitude: ${lng}<br />Latitude: ${lat}`;
                // Uncomment the line below if you want to display elevation
                // (elevation !== null ? `<br />Elevation: ${elevation.toFixed(2)} m` : '');
            }
        };

        mapInstance.on('mousemove', mouseMoveHandler); // Attach event listener
    }
}
