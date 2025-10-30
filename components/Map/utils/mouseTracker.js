// Location: /components/Map/utils/mouseTracker.js

let mouseMoveHandler = null; // to store the event handler for removal
let retryCount = 0;
const MAX_RETRIES = 5;

export function trackMousePosition(mapInstance, isMouseTrackingEnabled = true) {
    const infoElement = document.getElementById('info');
    const toggleCheckbox = document.getElementById('toggleVisibility'); // Checkbox to toggle visibility

    // If checkbox doesn't exist yet, retry after a short delay (with limit)
    if (!toggleCheckbox || !infoElement) {
        if (retryCount < MAX_RETRIES) {
            retryCount++;
            setTimeout(() => trackMousePosition(mapInstance, isMouseTrackingEnabled), 200);
        } else {
            console.error('Mouse tracker elements not found after max retries');
        }
        return;
    }
    
    // Reset retry count once elements are found
    retryCount = 0;

    // If tracking is disabled, remove only our own event handler if it exists
    if (!isMouseTrackingEnabled && mouseMoveHandler) {
        mapInstance.off('mousemove', mouseMoveHandler);
        mouseMoveHandler = null;
        return;
    }

    // If tracking is enabled, set the mouse move handler
    if (isMouseTrackingEnabled && !mouseMoveHandler) {
        mouseMoveHandler = (e) => {
            const lng = e.lngLat.lng.toFixed(4);
            const lat = e.lngLat.lat.toFixed(4);
            const elevation = mapInstance.queryTerrainElevation(e.lngLat);

            // Update content only if checkbox is checked
            if (toggleCheckbox.checked) {
                infoElement.innerHTML = `Longitude: ${lng}<br />Latitude: ${lat}`;
                // Uncomment the line below if you want to display elevation
                // (elevation !== null ? `<br />Elevation: ${elevation.toFixed(2)} m` : '');
            }
        };

        mapInstance.on('mousemove', mouseMoveHandler); // Attach event listener
    }
}
