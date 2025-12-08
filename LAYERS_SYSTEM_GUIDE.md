# Layers System Implementation Guide

## Overview
A comprehensive layer system has been added to the geospatial map application, allowing users to toggle state outlines and county boundaries per state.

## Features

### 1. **Layers Button**
- Located in the desktop toolbar (top-right)
- Located in the mobile bottom toolbar (orange Map icon)
- Opens the Layers Modal when clicked

### 2. **Layers Modal**
- **State Outlines Toggle**: Global toggle for all US state boundaries
- **County Lines by State**: 
  - Searchable list of all 50 US states
  - Each state can be expanded to show county status
  - Toggle county lines per state individually
  - Multiple states can have counties visible simultaneously

### 3. **Map Layers**
- **State Boundaries**: Bright green lines (`#00ff00`) at 2.5px width, visible by default
- **County Boundaries**: Bright green lines (`#00ff00`) at 1.5px width, hidden by default
- Uses free, publicly available GeoJSON data:
  - US States: Natural Earth Data (public domain)
  - US Counties: US Census Bureau via Plotly datasets (public domain)

**Data Sources**:
- State boundaries: `https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json`
- County boundaries: `https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master/us_counties_20m_2018.json`

**Note**: These are free, open-source GeoJSON files that don't require any premium subscriptions. County filtering uses FIPS codes for efficient state-based filtering.

**Important**: County GeoJSON is ~8MB and may take a few seconds to load. The filter logic checks multiple property name formats to ensure compatibility with different data sources.

## Implementation Details

### Components Created

#### 1. `LayersButton.jsx`
- Simple button component with layer group icon
- Consistent styling with other toolbar buttons
- Responsive for mobile and desktop

#### 2. `LayersModal.jsx`
- Full-featured modal with:
  - State outlines toggle
  - Searchable state list
  - Expandable state items
  - County toggle per state
  - Mobile-responsive design
  - Proper scrolling for long state lists
  - Styling consistent with other app modals (LineModal, AreaModal)

### State Management

The Map component manages:
- `isLayersModalOpen`: Controls modal visibility
- `stateOutlinesVisible`: Boolean for state boundaries visibility
- `countyLayers`: Object mapping state names to boolean visibility

### Layer Toggle Logic

#### State Outlines
```javascript
handleToggleStateOutlines() {
  // Toggles visibility of 'state-outlines-layer'
  // Updates stateOutlinesVisible state
}
```

#### County Lines
```javascript
handleToggleCountyLayer(state) {
  // Updates countyLayers object
  // Filters 'county-outlines-layer' to show only enabled states
  // Uses Mapbox filter: ['in', ['get', 'name'], ['literal', enabledStates]]
}
```

### Style Change Handling

When the map style changes (2D/3D toggle or style selector):
1. Map position and orientation are preserved
2. Custom layers (lines, areas, waypoints) are restored
3. **Boundary layers are restored** with their previous visibility states
4. County filters are reapplied if any states were enabled

## Usage

### Desktop
1. Click the Layers button (layer icon) in the top-right toolbar
2. Toggle "State Outlines" on/off
3. Search for a state or scroll through the list
4. Click a state name to expand and see county status
5. Toggle the checkbox next to any state to show/hide its counties

### Mobile
1. Tap the orange Map icon in the bottom toolbar
2. Same functionality as desktop in a mobile-optimized modal

## Technical Notes

### Data Format
- **GeoJSON**: Standard format for geographic data, loaded from public CDNs
- **FIPS Codes**: Used for county filtering (e.g., "06" for California, "36" for New York)
- County FIPS codes are 5 digits: first 2 digits are state code, last 3 are county code

### Performance
- GeoJSON data is cached by the browser after first load
- Filtering uses Mapbox GL's expression system for GPU-accelerated rendering
- State boundaries: ~50 features (one per state)
- County boundaries: ~3,200 features (all US counties)

### Filtering Logic
County filtering uses FIPS code prefix matching:
```javascript
['==', ['slice', ['get', 'id'], 0, 2], stateFIPS]
```
This checks if the first 2 characters of the county FIPS code match the state FIPS code.

## Future Enhancements

Potential improvements:
1. Add "Select All" / "Deselect All" for counties
2. Save layer preferences to localStorage
3. Add city boundaries layer
4. Add custom boundary upload feature
5. Layer opacity controls
6. Different color schemes for boundaries

## Files Modified

1. `components/Map/index.jsx` - Main map component with layer state and handlers
2. `components/Map/controls/DrawingToolbar.js` - Added Layers button
3. `components/Map/controls/MobileBottomToolbar.jsx` - Added boundary layers button
4. `components/Map/controls/LayersButton.jsx` - New component
5. `components/Map/controls/LayersModal.jsx` - New component
6. `lib/boundaryData.js` - New file with GeoJSON sources and FIPS code mappings

## Testing Checklist

- [ ] Layers button appears in desktop toolbar
- [ ] Layers button appears in mobile toolbar
- [ ] Modal opens and closes correctly
- [ ] State outlines toggle works
- [ ] County toggles work per state
- [ ] Search functionality works
- [ ] Multiple states can have counties visible
- [ ] Layers persist when changing map styles
- [ ] Layers persist when toggling 2D/3D
- [ ] Mobile responsive design works correctly
