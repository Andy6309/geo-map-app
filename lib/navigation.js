/**
 * Navigation utility for fetching and displaying routes using Mapbox Directions API
 */

import mapboxgl from 'mapbox-gl';

const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

/**
 * Fetch route from Mapbox Directions API with options
 * @param {Object} start - Start coordinates {lng, lat}
 * @param {Object} end - End coordinates {lng, lat}
 * @param {Object} options - Route options
 * @param {string} options.profile - Travel mode: 'driving', 'walking', 'cycling', 'driving-traffic'
 * @param {boolean} options.alternatives - Request alternative routes
 * @param {Array<string>} options.exclude - Exclude: 'toll', 'motorway', 'ferry', 'unpaved', 'cash_only_tolls'
 * @returns {Promise<Array>} Array of route alternatives
 */
export async function fetchRoute(start, end, options = {}) {
  const {
    profile = 'driving-traffic',
    alternatives = true,
    exclude = []
  } = options;

  // Build URL with parameters
  const params = new URLSearchParams({
    geometries: 'geojson',
    steps: 'true',
    banner_instructions: 'true',
    voice_instructions: 'true',
    alternatives: alternatives ? 'true' : 'false',
    overview: 'full',
    access_token: MAPBOX_ACCESS_TOKEN
  });

  // Add exclude parameter if provided
  if (exclude.length > 0) {
    params.append('exclude', exclude.join(','));
  }

  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${start.lng},${start.lat};${end.lng},${end.lat}?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Directions API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }

    // Return all routes with metadata
    return data.routes.map((route, index) => ({
      ...route,
      routeIndex: index,
      isRecommended: index === 0
    }));
  } catch (error) {
    console.error('Error fetching route:', error);
    throw error;
  }
}

/**
 * Add route layer to map
 * @param {Object} map - Mapbox map instance
 * @param {Object} routeGeometry - GeoJSON LineString geometry
 * @param {string} routeId - Unique ID for the route layer
 */
export function addRouteToMap(map, routeGeometry, routeId = 'navigation-route') {
  // Remove existing route if present
  removeRouteFromMap(map, routeId);

  // Add route source
  map.addSource(routeId, {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: routeGeometry
    }
  });

  // Add route line layer (main route)
  map.addLayer({
    id: `${routeId}-line`,
    type: 'line',
    source: routeId,
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#1976d2',
      'line-width': 6,
      'line-opacity': 0.8
    }
  });

  // Add route outline layer (for better visibility)
  map.addLayer({
    id: `${routeId}-outline`,
    type: 'line',
    source: routeId,
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#ffffff',
      'line-width': 8,
      'line-opacity': 0.6
    }
  }, `${routeId}-line`); // Place outline below the main line

  // Fit map to route bounds
  const coordinates = routeGeometry.coordinates;
  const bounds = coordinates.reduce((bounds, coord) => {
    return bounds.extend(coord);
  }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

  map.fitBounds(bounds, {
    padding: { top: 100, bottom: 100, left: 100, right: 100 },
    duration: 1000
  });
}

/**
 * Add all route alternatives to map with different colors
 * @param {Object} map - Mapbox map instance
 * @param {Array} routes - Array of route objects
 * @param {number} activeRouteIndex - Index of the active route
 * @param {Function} onRouteClick - Callback when a route is clicked
 */
export function addAllRoutesToMap(map, routes, activeRouteIndex = 0, onRouteClick) {
  // Remove all existing route layers
  removeAllRoutesFromMap(map);

  // Route colors: active route is blue, alternatives are gray
  const routeColors = [
    { line: '#1976d2', outline: '#ffffff', width: 6, opacity: 0.9 }, // Active (blue)
    { line: '#9e9e9e', outline: '#ffffff', width: 5, opacity: 0.6 }, // Alternative 1 (gray)
    { line: '#9e9e9e', outline: '#ffffff', width: 5, opacity: 0.6 }, // Alternative 2 (gray)
  ];

  // Add all routes to map
  routes.forEach((route, index) => {
    const routeId = `navigation-route-${index}`;
    const isActive = index === activeRouteIndex;
    const colorConfig = isActive ? routeColors[0] : routeColors[1];

    // Add route source
    map.addSource(routeId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {
          routeIndex: index,
          isActive: isActive
        },
        geometry: route.geometry
      }
    });

    // Add route outline layer
    map.addLayer({
      id: `${routeId}-outline`,
      type: 'line',
      source: routeId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': colorConfig.outline,
        'line-width': colorConfig.width + 2,
        'line-opacity': 0.6
      }
    });

    // Add route line layer
    map.addLayer({
      id: `${routeId}-line`,
      type: 'line',
      source: routeId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': colorConfig.line,
        'line-width': colorConfig.width,
        'line-opacity': colorConfig.opacity
      }
    });

    // Make route clickable (allow clicking any route, even if active)
    map.on('click', `${routeId}-line`, (e) => {
      if (onRouteClick) {
        e.preventDefault();
        e.originalEvent.stopPropagation();
        onRouteClick(route);
      }
    });

    // Change cursor on hover for all routes
    map.on('mouseenter', `${routeId}-line`, () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', `${routeId}-line`, () => {
      map.getCanvas().style.cursor = '';
    });
  });

  // Fit map to show all routes
  if (routes.length > 0) {
    const allCoordinates = routes.flatMap(route => route.geometry.coordinates);
    const bounds = allCoordinates.reduce((bounds, coord) => {
      return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(allCoordinates[0], allCoordinates[0]));

    map.fitBounds(bounds, {
      padding: { top: 100, bottom: 100, left: 100, right: 450 }, // Extra padding on right for directions panel
      duration: 1000
    });
  }
}

/**
 * Remove all route layers from map
 * @param {Object} map - Mapbox map instance
 */
export function removeAllRoutesFromMap(map) {
  // Remove up to 5 possible route alternatives
  for (let i = 0; i < 5; i++) {
    const routeId = `navigation-route-${i}`;
    
    // Remove click handlers
    if (map.getLayer(`${routeId}-line`)) {
      map.off('click', `${routeId}-line`);
      map.off('mouseenter', `${routeId}-line`);
      map.off('mouseleave', `${routeId}-line`);
    }
    
    removeRouteFromMap(map, routeId);
  }
  
  // Also remove the default route
  removeRouteFromMap(map, 'navigation-route');
}

/**
 * Update active route styling
 * @param {Object} map - Mapbox map instance
 * @param {number} newActiveIndex - Index of the new active route
 */
export function updateActiveRoute(map, newActiveIndex) {
  // Update all route layers
  for (let i = 0; i < 5; i++) {
    const routeId = `navigation-route-${i}`;
    const lineLayerId = `${routeId}-line`;
    
    if (map.getLayer(lineLayerId)) {
      const isActive = i === newActiveIndex;
      
      map.setPaintProperty(lineLayerId, 'line-color', isActive ? '#1976d2' : '#9e9e9e');
      map.setPaintProperty(lineLayerId, 'line-width', isActive ? 6 : 5);
      map.setPaintProperty(lineLayerId, 'line-opacity', isActive ? 0.9 : 0.6);
    }
  }
}

/**
 * Remove route layer from map
 * @param {Object} map - Mapbox map instance
 * @param {string} routeId - Unique ID for the route layer
 */
export function removeRouteFromMap(map, routeId = 'navigation-route') {
  // Remove layers
  if (map.getLayer(`${routeId}-line`)) {
    map.removeLayer(`${routeId}-line`);
  }
  if (map.getLayer(`${routeId}-outline`)) {
    map.removeLayer(`${routeId}-outline`);
  }
  
  // Remove source
  if (map.getSource(routeId)) {
    map.removeSource(routeId);
  }
}

/**
 * Add start and end markers for navigation
 * @param {Object} map - Mapbox map instance
 * @param {Object} start - Start coordinates {lng, lat}
 * @param {Object} end - End coordinates {lng, lat, name, color}
 * @returns {Array} Array of marker instances
 */
export function addNavigationMarkers(map, start, end) {
  const markers = [];

  // Start marker (green)
  const startMarkerEl = document.createElement('div');
  startMarkerEl.className = 'navigation-marker-start';
  startMarkerEl.innerHTML = `
    <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 40C16 40 28 27 28 17C28 9.26801 21.732 4 16 4C10.268 4 4 9.26801 4 17C4 27 16 40 16 40Z" fill="#4caf50" stroke="#fff" stroke-width="3"/>
      <circle cx="16" cy="17" r="6" fill="#fff"/>
      <text x="16" y="21" text-anchor="middle" font-size="12" font-weight="bold" fill="#4caf50">A</text>
    </svg>
  `;
  
  const startMarker = new mapboxgl.Marker({ element: startMarkerEl })
    .setLngLat([start.lng, start.lat])
    .addTo(map);
  
  markers.push(startMarker);

  // End marker (red/custom color)
  const endMarkerEl = document.createElement('div');
  endMarkerEl.className = 'navigation-marker-end';
  const endColor = end.color || '#e53935';
  endMarkerEl.innerHTML = `
    <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 40C16 40 28 27 28 17C28 9.26801 21.732 4 16 4C10.268 4 4 9.26801 4 17C4 27 16 40 16 40Z" fill="${endColor}" stroke="#fff" stroke-width="3"/>
      <circle cx="16" cy="17" r="6" fill="#fff"/>
      <text x="16" y="21" text-anchor="middle" font-size="12" font-weight="bold" fill="${endColor}">B</text>
    </svg>
  `;
  
  const endMarker = new mapboxgl.Marker({ element: endMarkerEl })
    .setLngLat([end.lng, end.lat])
    .addTo(map);
  
  markers.push(endMarker);

  return markers;
}

/**
 * Format distance for display
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance string
 */
export function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const miles = meters * 0.000621371;
  return `${miles.toFixed(1)} mi`;
}

/**
 * Format duration for display
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  }
  return `${minutes} min`;
}

/**
 * Parse turn-by-turn instructions from route
 * @param {Object} route - Route object from Directions API
 * @returns {Array} Array of instruction objects
 */
export function parseInstructions(route) {
  const instructions = [];
  
  if (route.legs && route.legs.length > 0) {
    route.legs.forEach((leg) => {
      if (leg.steps) {
        leg.steps.forEach((step, index) => {
          instructions.push({
            index: index + 1,
            instruction: step.maneuver.instruction,
            distance: formatDistance(step.distance),
            duration: formatDuration(step.duration),
            type: step.maneuver.type,
            modifier: step.maneuver.modifier
          });
        });
      }
    });
  }
  
  return instructions;
}
