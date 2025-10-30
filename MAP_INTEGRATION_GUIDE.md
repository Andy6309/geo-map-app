# Map Component Integration Guide

This guide explains how to integrate the existing Map component with the database to persist and load geospatial data.

## Overview

The Map component (`components/Map/index.jsx`) currently stores waypoints, lines, and areas in local state. We need to:

1. Load saved data when the component mounts
2. Save data to the database when users create features
3. Update data when users edit features
4. Delete data when users remove features

## Integration Steps

### 1. Import the API Client

At the top of `components/Map/index.jsx`, add:

```javascript
import { waypointAPI, lineAPI, areaAPI } from '@/lib/api/geospatial';
import { useAuth } from '@/contexts/AuthContext';
```

### 2. Add User Context

Inside the Map component, add:

```javascript
const { user } = useAuth();
```

### 3. Load Data on Mount

Add a useEffect to load saved data when the component mounts:

```javascript
useEffect(() => {
  if (!user || !map) return;

  const loadSavedData = async () => {
    try {
      // Load waypoints
      const waypoints = await waypointAPI.getAll();
      // Convert waypoints to map markers
      waypoints.forEach(wp => {
        // Use your existing WaypointDrawer to add markers
        if (waypointDrawer.current) {
          waypointDrawer.current.addWaypoint({
            id: wp.id,
            lngLat: [wp.longitude, wp.latitude],
            name: wp.name,
            color: wp.color,
            notes: wp.notes,
            iconType: wp.icon_type,
          });
        }
      });

      // Load lines
      const lines = await lineAPI.getAll();
      setSavedLines(lines.map(line => ({
        id: line.id,
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: line.coordinates,
        },
        properties: {
          name: line.name,
          color: line.color,
          notes: line.notes,
          total_distance: line.total_distance,
        },
      })));

      // Load areas
      const areas = await areaAPI.getAll();
      setSavedAreas(areas.map(area => ({
        id: area.id,
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [area.coordinates],
        },
        properties: {
          name: area.name,
          color: area.color,
          notes: area.notes,
          total_area: area.total_area,
        },
      })));
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  loadSavedData();
}, [user, map]);
```

### 4. Update Line Save Handler

Modify `handleLineModalSave` to save to the database:

```javascript
const handleLineModalSave = async (color, name, notes) => {
  if (draw && map) {
    const all = draw.getAll();
    const lineFeature = all.features.find(f => f.geometry.type === 'LineString');
    
    if (lineFeature) {
      try {
        // Save to database
        const savedLine = await lineAPI.create({
          name,
          notes,
          color,
          coordinates: lineFeature.geometry.coordinates,
          total_distance: parseFloat(lineModalTotal), // Convert from string
          segment_distances: lineModalSegments,
        });

        // Update local state with database ID
        lineFeature.id = savedLine.id;
        lineFeature.properties = {
          color,
          name,
          notes,
          createdAt: savedLine.created_at,
        };

        setSavedLines(prev => {
          const updated = [...prev, lineFeature];
          if (map.getSource('static-lines')) {
            map.getSource('static-lines').setData({ 
              type: 'FeatureCollection', 
              features: updated 
            });
          }
          return updated;
        });

        // Remove from Draw
        draw.delete(lineFeature.id);
      } catch (error) {
        console.error('Error saving line:', error);
        alert('Failed to save line. Please try again.');
        return;
      }
    }
  }

  // Reset modal state
  setLineModalOpen(false);
  setLineModalSegments([]);
  setLineModalTotal('0 ft');
  setLineModalColor('#e53935');
  setLineModalName("");
  setLineModalNotes("");
  
  if (draw) {
    draw.changeMode('simple_select');
  }
};
```

### 5. Update Area Save Handler

Modify `handleAreaModalSave` similarly:

```javascript
const handleAreaModalSave = async (color, name, notes) => {
  if (draw && map) {
    const all = draw.getAll();
    const areaFeature = all.features.find(f => f.geometry.type === 'Polygon');
    
    if (areaFeature) {
      try {
        // Save to database
        const savedArea = await areaAPI.create({
          name,
          notes,
          color,
          coordinates: areaFeature.geometry.coordinates[0], // First ring of polygon
          total_area: areaModalTotal,
          perimeter: 0, // Calculate if needed
        });

        // Update local state with database ID
        areaFeature.id = savedArea.id;
        areaFeature.properties = {
          color,
          name,
          notes,
          createdAt: savedArea.created_at,
        };

        setSavedAreas(prev => {
          const updated = [...prev, areaFeature];
          if (map.getSource('static-areas')) {
            map.getSource('static-areas').setData({ 
              type: 'FeatureCollection', 
              features: updated 
            });
          }
          return updated;
        });

        // Remove from Draw
        draw.delete(areaFeature.id);
      } catch (error) {
        console.error('Error saving area:', error);
        alert('Failed to save area. Please try again.');
        return;
      }
    }
  }

  // Reset modal state
  setAreaModalOpen(false);
  setAreaModalTotal(0);
  setAreaModalSegments([]);
  setAreaModalColor('#1976d2');
  setAreaModalName("");
  setAreaModalNotes("");
  
  if (draw) {
    draw.changeMode('simple_select');
  }
};
```

### 6. Update Waypoint Save Handler

In the WaypointButton component, modify the save handler to call the API:

```javascript
const handleSaveWaypoint = async () => {
  if (!tempMarkerRef.current) return;

  const lngLat = tempMarkerRef.current.getLngLat();

  try {
    // Save to database
    const savedWaypoint = await waypointAPI.create({
      name: waypointName,
      notes: waypointNotes,
      color: waypointColor,
      icon_type: waypointType,
      longitude: lngLat.lng,
      latitude: lngLat.lat,
    });

    // Add to map with database ID
    if (waypointDrawer.current) {
      waypointDrawer.current.addWaypoint({
        id: savedWaypoint.id,
        lngLat: [lngLat.lng, lngLat.lat],
        name: waypointName,
        color: waypointColor,
        notes: waypointNotes,
        iconType: waypointType,
      });
    }

    // Remove temporary marker
    tempMarkerRef.current.remove();
    tempMarkerRef.current = null;

    // Close modal
    closeModal();
  } catch (error) {
    console.error('Error saving waypoint:', error);
    alert('Failed to save waypoint. Please try again.');
  }
};
```

### 7. Add Delete Functionality

Add delete handlers for each feature type:

```javascript
const handleDeleteLine = async (lineId) => {
  try {
    await lineAPI.delete(lineId);
    setSavedLines(prev => {
      const updated = prev.filter(line => line.id !== lineId);
      if (map.getSource('static-lines')) {
        map.getSource('static-lines').setData({ 
          type: 'FeatureCollection', 
          features: updated 
        });
      }
      return updated;
    });
  } catch (error) {
    console.error('Error deleting line:', error);
    alert('Failed to delete line. Please try again.');
  }
};

const handleDeleteArea = async (areaId) => {
  try {
    await areaAPI.delete(areaId);
    setSavedAreas(prev => {
      const updated = prev.filter(area => area.id !== areaId);
      if (map.getSource('static-areas')) {
        map.getSource('static-areas').setData({ 
          type: 'FeatureCollection', 
          features: updated 
        });
      }
      return updated;
    });
  } catch (error) {
    console.error('Error deleting area:', error);
    alert('Failed to delete area. Please try again.');
  }
};

const handleDeleteWaypoint = async (waypointId) => {
  try {
    await waypointAPI.delete(waypointId);
    if (waypointDrawer.current) {
      waypointDrawer.current.removeWaypoint(waypointId);
    }
  } catch (error) {
    console.error('Error deleting waypoint:', error);
    alert('Failed to delete waypoint. Please try again.');
  }
};
```

### 8. Add Click Handlers for Editing

Add click handlers to allow users to edit existing features:

```javascript
useEffect(() => {
  if (!map) return;

  // Click handler for lines
  map.on('click', 'static-lines-layer', async (e) => {
    if (e.features && e.features.length > 0) {
      const feature = e.features[0];
      // Open edit modal with feature data
      // Implement edit functionality
    }
  });

  // Click handler for areas
  map.on('click', 'static-areas-layer', async (e) => {
    if (e.features && e.features.length > 0) {
      const feature = e.features[0];
      // Open edit modal with feature data
      // Implement edit functionality
    }
  });

  // Change cursor on hover
  map.on('mouseenter', 'static-lines-layer', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'static-lines-layer', () => {
    map.getCanvas().style.cursor = '';
  });

  return () => {
    map.off('click', 'static-lines-layer');
    map.off('click', 'static-areas-layer');
    map.off('mouseenter', 'static-lines-layer');
    map.off('mouseleave', 'static-lines-layer');
  };
}, [map]);
```

## Testing

1. **Create a new account** at `/register`
2. **Add a waypoint** - it should save to the database
3. **Refresh the page** - the waypoint should still be there
4. **Draw a line** - it should save with distance measurements
5. **Draw an area** - it should save with area calculations
6. **Log out and log in** - your data should persist
7. **Create a second account** - you should only see your own data

## Troubleshooting

### Data Not Loading

- Check browser console for errors
- Verify you're logged in (check `user` in AuthContext)
- Verify the database migration ran successfully
- Check Supabase dashboard to see if data is being saved

### API Errors

- Check that your Supabase URL and anon key are correct
- Verify RLS policies are set up correctly
- Check the Network tab in browser dev tools for API responses

### Map Not Updating

- Make sure you're updating both the database AND local state
- Verify the map sources are being updated after state changes
- Check that feature IDs match between database and map

## Next Steps

1. Add edit functionality for existing features
2. Add a sidebar to list all features
3. Add search/filter functionality
4. Add export functionality (GeoJSON, KML, etc.)
5. Add sharing functionality between users
6. Add offline support with service workers
