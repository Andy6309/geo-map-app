import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { styles } from './styles';
import { setupGeocoder } from './geocoder';
import { trackMousePosition } from './utils/mouseTracker';
import { CompassButton } from './controls/CompassButton';
import { DrawingToolbar } from './controls/DrawingToolbar';
import AreaModal from './controls/AreaModal';
import { Analytics } from '@vercel/analytics/react';
import { LocateMeButton } from './controls/LocateMeButton';
import ZoomControl from './controls/ZoomControl';
import { WaypointButton } from './controls/WaypointButton';
import { CrosshairToggle } from './controls/CrosshairToggle';
import { WaypointDrawer } from './controls/WaypointAction';
import { length as turfLength, point, lineString, area as turfArea } from '@turf/turf';
import  LineMeasure from './controls/LineMeasure';
import AreaMeasure from './controls/AreaMeasure';
import LineModal from './controls/LineModal';
import { waypointAPI, lineAPI, areaAPI } from '@/lib/api/geospatial';
import { useAuth } from '@/contexts/AuthContext';


mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const Map = () => {
    const { user } = useAuth();
    
    // Mobile detection
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
        const checkMobile = () => {
            const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
            const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
            const isMobileDevice = mobileRegex.test(userAgent);
            const isSmallScreen = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
            setIsMobile(isMobileDevice || isSmallScreen);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    // --- Persistent drawn features ---
    const [savedLines, setSavedLines] = useState([]); // Array of GeoJSON features
    const [savedAreas, setSavedAreas] = useState([]); // Array of GeoJSON features
    const [infoVisible, setInfoVisible] = useState(true);
    const mapContainer = useRef(null);
    const geocoderContainerRef = useRef(null);
    const markerRef = useRef(null);
    const waypointDrawerRef = useRef(null);
    const [map, setMap] = useState(null);
    const [mapBearing, setMapBearing] = useState(0);
    const [mapPitch, setMapPitch] = useState(0);
    const [draw, setDraw] = useState(null);
    const [currentStyleId, setCurrentStyleId] = useState('3d-satellite'); // Track current style ID, default to 3D Satellite
    const [dataLoaded, setDataLoaded] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // --- Line Modal State ---
    const [isLineModalOpen, setLineModalOpen] = useState(false);
    const [editingLineId, setEditingLineId] = useState(null);

    // --- Area Modal State ---
    const [isAreaModalOpen, setAreaModalOpen] = useState(false);
    const [editingAreaId, setEditingAreaId] = useState(null);
    const [areaModalTotal, setAreaModalTotal] = useState(0); // acres
    const [areaModalSegments, setAreaModalSegments] = useState([]);
    const [areaModalColor, setAreaModalColor] = useState('#1976d2'); // default color
    const [areaModalName, setAreaModalName] = useState("");
    const [areaModalNotes, setAreaModalNotes] = useState("");
    const [lineModalSegments, setLineModalSegments] = useState([]); // Live segment distances
    const [lineModalTotal, setLineModalTotal] = useState('0 ft'); // Live total distance
    const [lineModalColor, setLineModalColor] = useState('#e53935');
    const [lineModalName, setLineModalName] = useState("");
    const [lineModalNotes, setLineModalNotes] = useState("");
    const [lineModalElevation, setLineModalElevation] = useState({ gain: 0, loss: 0, min: 0, max: 0 });

    // Handler for Area button in toolbar
    const handleAreaButtonClick = () => {
        if (draw && map) {
            setAreaModalOpen(true);
            setAreaModalTotal(0);
            setAreaModalSegments([]);
            setAreaModalColor('#1976d2');
            setAreaModalName("");
            setAreaModalNotes("");
            // Delay draw mode activation until after modal is open to avoid focus issues
            setTimeout(() => {
                draw.changeMode('draw_polygon');
            }, 100);
        }
    };

    // Handler for closing/canceling the AreaModal
    const handleAreaModalClose = () => {
        if (draw) {
            const all = draw.getAll();
            if (editingAreaId) {
                // If editing, remove from draw and restore to static layer
                const editedFeature = all.features.find(f => f.id === editingAreaId || f.properties?.id === editingAreaId);
                if (editedFeature) {
                    draw.delete(editingAreaId);
                    // Restore original feature to static layer
                    setSavedAreas(prev => {
                        const exists = prev.some(a => a.id === editingAreaId || a.properties?.id === editingAreaId);
                        if (!exists) {
                            const restored = [...prev, editedFeature];
                            if (map.getSource('static-areas')) {
                                map.getSource('static-areas').setData({ type: 'FeatureCollection', features: restored });
                            }
                            return restored;
                        }
                        return prev;
                    });
                }
            } else {
                // Only remove drawn polygons if creating new
                if (all && all.features && all.features.length > 0) {
                    all.features.filter(f => f.geometry.type === 'Polygon').forEach(f => draw.delete(f.id));
                }
            }
            draw.changeMode('simple_select');
        }
        setAreaModalOpen(false);
        setEditingAreaId(null);
        setAreaModalTotal(0);
        setAreaModalSegments([]);
        setAreaModalColor('#1976d2');
        setAreaModalName("");
        setAreaModalNotes("");
    };

    // Handler for saving the area
    const handleAreaModalSave = async (color, name, notes) => {
        if (editingAreaId) {
            // UPDATE existing area
            try {
                // Get updated geometry from draw
                const all = draw.getAll();
                const drawId = String(editingAreaId);
                const editedFeature = all.features.find(f => 
                    String(f.id) === drawId || 
                    String(f.properties?.id) === drawId ||
                    f.id === editingAreaId || 
                    f.properties?.id === editingAreaId
                );
                const updatedCoordinates = editedFeature ? editedFeature.geometry.coordinates[0] : null;
                
                console.log('Looking for edited area:', editingAreaId, 'Found:', editedFeature);
                
                // Calculate new area if coordinates changed
                let totalArea = null;
                if (editedFeature) {
                    const areaSqMeters = turfArea(editedFeature);
                    totalArea = areaSqMeters * 0.000247105; // Convert to acres
                }
                
                const updatedArea = await areaAPI.update({
                    id: editingAreaId,
                    name,
                    notes,
                    color,
                    ...(updatedCoordinates && { coordinates: updatedCoordinates }),
                    ...(totalArea !== null && { total_area: totalArea }),
                });
                
                console.log('✅ Area updated in database:', editingAreaId);
                
                // Remove from draw and add back to static layer
                if (editedFeature) {
                    // Use the actual ID from the feature in draw
                    draw.delete(editedFeature.id);
                }
                
                // Update in state
                setSavedAreas(prev => {
                    const updated = prev.map(area => {
                        if (area.id === editingAreaId || area.properties?.id === editingAreaId) {
                            return {
                                ...area,
                                geometry: updatedCoordinates ? { type: 'Polygon', coordinates: [updatedCoordinates] } : area.geometry,
                                properties: {
                                    ...area.properties,
                                    name,
                                    notes,
                                    color,
                                    total_area: totalArea || area.properties.total_area,
                                }
                            };
                        }
                        return area;
                    });
                    
                    // If feature wasn't in prev (was being edited), add it back
                    const exists = updated.some(a => a.id === editingAreaId || a.properties?.id === editingAreaId);
                    if (!exists && editedFeature) {
                        updated.push({
                            id: editingAreaId,
                            type: 'Feature',
                            geometry: editedFeature.geometry,
                            properties: {
                                id: editingAreaId,
                                name,
                                notes,
                                color,
                                total_area: totalArea,
                            }
                        });
                    }
                    
                    if (map.getSource('static-areas')) {
                        map.getSource('static-areas').setData({ type: 'FeatureCollection', features: updated });
                    }
                    return updated;
                });
            } catch (error) {
                console.error('❌ Error updating area:', error);
                alert('Failed to update area. Please try again.');
                return;
            }
        } else {
            // CREATE new area
            if (draw && map) {
                const all = draw.getAll();
                const areaFeature = all.features.find(f => f.geometry.type === 'Polygon');
                if (areaFeature) {
                    try {
                        // Calculate area from geometry
                        const areaSqMeters = turfArea(areaFeature);
                        const totalAcres = areaSqMeters * 0.000247105; // Convert to acres
                        
                        console.log('Creating area with acres:', totalAcres);
                        
                        // Save to database
                        const savedArea = await areaAPI.create({
                            name,
                            notes,
                            color,
                            coordinates: areaFeature.geometry.coordinates[0], // First ring of polygon
                            total_area: totalAcres,
                            perimeter: 0, // Calculate if needed
                        });
                        
                        console.log('✅ Area saved to database:', savedArea.id);
                        
                        // Update feature with database ID
                        areaFeature.id = savedArea.id;
                        areaFeature.properties = {
                            id: savedArea.id, // Store ID in properties too for Mapbox
                            color,
                            name,
                            notes,
                            total_area: savedArea.total_area,
                            createdAt: savedArea.created_at
                        };
                        
                        setSavedAreas(prev => {
                            const updated = [...prev, areaFeature];
                            if (map.getSource('static-areas')) {
                                map.getSource('static-areas').setData({ type: 'FeatureCollection', features: updated });
                            }
                            return updated;
                        });
                        draw.delete(areaFeature.id);
                    } catch (error) {
                        console.error('❌ Error saving area:', error);
                        alert('Failed to save area. Please try again.');
                        return;
                    }
                }
            }
        }
        setAreaModalOpen(false);
        setEditingAreaId(null);
        setAreaModalTotal(0);
        setAreaModalSegments([]);
        setAreaModalColor('#1976d2');
        setAreaModalName("");
        setAreaModalNotes("");
        if (draw) {
            draw.changeMode('simple_select');
        }
    };

    // Handler for Line button in toolbar
    const handleLineButtonClick = () => {
        if (draw && map) {
            setLineModalOpen(true);
            setLineModalSegments([]);
            setLineModalTotal('0 ft');
            setLineModalColor('#e53935');
            setLineModalName("");
            setLineModalNotes("");
            // Delay draw mode activation until after modal is open to avoid focus issues
            setTimeout(() => {
                draw.changeMode('draw_line_string');
                if (typeof draw.getMode === 'function') {
                  console.log('[DEBUG] Draw mode after modal open:', draw.getMode());
                }
            }, 100);
        }
    };


    // Handler for saving the line
    const handleLineModalSave = async (color, name, notes) => {
        if (editingLineId) {
            // UPDATE existing line
            try {
                // Get updated geometry from draw
                const all = draw.getAll();
                const drawId = String(editingLineId);
                const editedFeature = all.features.find(f => 
                    String(f.id) === drawId || 
                    String(f.properties?.id) === drawId ||
                    f.id === editingLineId || 
                    f.properties?.id === editingLineId
                );
                const updatedCoordinates = editedFeature ? editedFeature.geometry.coordinates : null;
                
                console.log('Looking for edited line:', editingLineId, 'Found:', editedFeature);
                
                // Calculate new distance if coordinates changed
                let totalDistance = null;
                if (updatedCoordinates) {
                    let total = 0;
                    for (let i = 1; i < updatedCoordinates.length; i++) {
                        const seg = lineString([updatedCoordinates[i - 1], updatedCoordinates[i]]);
                        const dist = turfLength(seg, { units: 'miles' });
                        total += dist;
                    }
                    totalDistance = total * 5280; // Convert to feet
                }
                
                const updatedLine = await lineAPI.update({
                    id: editingLineId,
                    name,
                    notes,
                    color,
                    ...(updatedCoordinates && { coordinates: updatedCoordinates }),
                    ...(totalDistance !== null && { total_distance: totalDistance }),
                });
                
                console.log('✅ Line updated in database:', editingLineId);
                
                // Remove from draw and add back to static layer
                if (editedFeature) {
                    // Use the actual ID from the feature in draw
                    draw.delete(editedFeature.id);
                }
                
                // Update in state
                setSavedLines(prev => {
                    const updated = prev.map(line => {
                        if (line.id === editingLineId || line.properties?.id === editingLineId) {
                            return {
                                ...line,
                                geometry: updatedCoordinates ? { type: 'LineString', coordinates: updatedCoordinates } : line.geometry,
                                properties: {
                                    ...line.properties,
                                    name,
                                    notes,
                                    color,
                                    total_distance: totalDistance || line.properties.total_distance,
                                }
                            };
                        }
                        return line;
                    });
                    
                    // If feature wasn't in prev (was being edited), add it back
                    const exists = updated.some(l => l.id === editingLineId || l.properties?.id === editingLineId);
                    if (!exists && editedFeature) {
                        updated.push({
                            id: editingLineId,
                            type: 'Feature',
                            geometry: editedFeature.geometry,
                            properties: {
                                id: editingLineId,
                                name,
                                notes,
                                color,
                                total_distance: totalDistance,
                            }
                        });
                    }
                    
                    if (map.getSource('static-lines')) {
                        map.getSource('static-lines').setData({ type: 'FeatureCollection', features: updated });
                    }
                    return updated;
                });
            } catch (error) {
                console.error('❌ Error updating line:', error);
                alert('Failed to update line. Please try again.');
                return;
            }
        } else {
            // CREATE new line
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
                            total_distance: parseFloat(lineModalTotal.replace(/[^\d.]/g, '')) || 0,
                            segment_distances: lineModalSegments,
                        });
                        
                        console.log('✅ Line saved to database:', savedLine.id);
                        
                        // Update feature with database ID
                        lineFeature.id = savedLine.id;
                        lineFeature.properties = {
                            id: savedLine.id, // Store ID in properties too for Mapbox
                            color,
                            name,
                            notes,
                            total_distance: savedLine.total_distance,
                            createdAt: savedLine.created_at
                        };
                        
                        setSavedLines(prev => {
                            const updated = [...prev, lineFeature];
                            // Update map source
                            if (map.getSource('static-lines')) {
                                map.getSource('static-lines').setData({ type: 'FeatureCollection', features: updated });
                            }
                            return updated;
                        });
                        // Remove from Draw
                        draw.delete(lineFeature.id);
                    } catch (error) {
                        console.error('❌ Error saving line:', error);
                        alert('Failed to save line. Please try again.');
                        return;
                    }
                }
            }
        }
        setLineModalOpen(false);
        setEditingLineId(null);
        setLineModalSegments([]);
        setLineModalTotal('0 ft');
        setLineModalColor('#e53935');
        setLineModalName("");
        setLineModalNotes("");
        if (draw) {
            draw.changeMode('simple_select');
        }
    };

    // Handler for closing/canceling the modal
    const handleLineModalClose = () => {
        if (draw) {
            const all = draw.getAll();
            if (editingLineId) {
                // If editing, remove from draw and restore to static layer
                const editedFeature = all.features.find(f => f.id === editingLineId || f.properties?.id === editingLineId);
                if (editedFeature) {
                    draw.delete(editingLineId);
                    // Restore original feature to static layer
                    setSavedLines(prev => {
                        const exists = prev.some(l => l.id === editingLineId || l.properties?.id === editingLineId);
                        if (!exists) {
                            const restored = [...prev, editedFeature];
                            if (map.getSource('static-lines')) {
                                map.getSource('static-lines').setData({ type: 'FeatureCollection', features: restored });
                            }
                            return restored;
                        }
                        return prev;
                    });
                }
            } else {
                // Only remove drawn lines if creating new
                if (all && all.features && all.features.length > 0) {
                    all.features.filter(f => f.geometry.type === 'LineString').forEach(f => draw.delete(f.id));
                }
            }
            draw.changeMode('simple_select');
        }
        setLineModalOpen(false);
        setEditingLineId(null);
        setLineModalSegments([]);
        setLineModalTotal('0 ft');
        setLineModalColor('#e53935');
        setLineModalName("");
        setLineModalNotes("");
    };

    // --- Sync live measurements from LineMeasure.jsx ---
    // Render LineMeasure and update modal state via onUpdate
    // This must be inside the component render:
    {isLineModalOpen && (
        <LineMeasure 
            map={map} 
            draw={draw} 
            onUpdate={(segments, total) => { 
                setLineModalSegments(segments); 
                setLineModalTotal(total); 
            }} 
        />
    )}

    useEffect(() => {
        // Load saved map position from localStorage
        const savedPosition = localStorage.getItem('mapPosition');
        let initialCenter = [-74.5, 40];
        let initialZoom = 9;
        
        if (savedPosition) {
            try {
                const { center, zoom } = JSON.parse(savedPosition);
                initialCenter = center;
                initialZoom = zoom;
            } catch (e) {
                console.error('Error loading saved map position:', e);
            }
        }

        const initialMap = new mapboxgl.Map({
            container: mapContainer.current,
            style: styles.find(s => s.id === '3d-satellite').url, // Set default style to 3D Satellite
            center: initialCenter, // Use saved or default center
            zoom: initialZoom, // Use saved or default zoom
            attributionControl: false, // Disabled - attribution shown in header instead
            // Configure map controls and interactions
            boxZoom: true,
            dragRotate: true,  // Enable rotation with right-click + drag or ctrl + drag
            dragPan: true,     // Enable panning
            keyboard: true,    // Enable keyboard navigation
            doubleClickZoom: true,
            touchPitch: true,  // Enable tilt with touch
            touchZoomRotate: true,  // Enable zoom and rotate with touch
            pitchWithRotate: true,  // Enable tilt with right-click + drag or ctrl + drag
        });

        // Hide default navigation controls in top-right
        initialMap.on('load', () => {
            // Target the specific navigation control group
            const navControls = document.querySelectorAll('.mapboxgl-ctrl-top-right .mapboxgl-ctrl');
            navControls.forEach(control => {
                control.style.display = 'none';
                control.style.visibility = 'hidden';
            });
            
            // Also hide any navigation control groups
            const navGroups = document.querySelectorAll('.mapboxgl-ctrl-top-right .mapboxgl-ctrl-group');
            navGroups.forEach(group => {
                group.style.display = 'none';
                group.style.visibility = 'hidden';
            });
            
            // Hide the container itself
            const topRightContainer = document.querySelector('.mapboxgl-ctrl-top-right');
            if (topRightContainer) {
                topRightContainer.style.display = 'none';
                topRightContainer.style.visibility = 'hidden';
            }
        });

        // Add static sources/layers for saved lines and areas
        initialMap.on('load', () => {
            // Static Lines
            if (!initialMap.getSource('static-lines')) {
                initialMap.addSource('static-lines', {
                    type: 'geojson',
                    data: { type: 'FeatureCollection', features: savedLines }
                });
                initialMap.addLayer({
                    id: 'static-lines-layer',
                    type: 'line',
                    source: 'static-lines',
                    paint: {
                        'line-color': ['get', 'color'], // Use color from feature properties
                        'line-width': 4,
                        'line-opacity': 1
                    }
                });
            }
            // Static Areas
            if (!initialMap.getSource('static-areas')) {
                initialMap.addSource('static-areas', {
                    type: 'geojson',
                    data: { type: 'FeatureCollection', features: savedAreas }
                });
                initialMap.addLayer({
                    id: 'static-areas-layer',
                    type: 'fill',
                    source: 'static-areas',
                    paint: {
                        'fill-color': ['get', 'color'], // Use color from feature properties
                        'fill-opacity': 0.25
                    }
                });
                // Border for areas
                initialMap.addLayer({
                    id: 'static-areas-outline',
                    type: 'line',
                    source: 'static-areas',
                    paint: {
                        'line-color': ['get', 'color'], // Use color from feature properties
                        'line-width': 3,
                        'line-opacity': 1
                    }
                });
                
                // Add labels for area acres
                initialMap.addSource('area-labels', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: savedAreas.map(area => {
                            // Calculate centroid for label placement
                            const coords = area.geometry.coordinates[0];
                            let sumLng = 0, sumLat = 0;
                            for (let i = 0; i < coords.length - 1; i++) {
                                sumLng += coords[i][0];
                                sumLat += coords[i][1];
                            }
                            const centroid = [
                                sumLng / (coords.length - 1),
                                sumLat / (coords.length - 1)
                            ];
                            
                            return {
                                type: 'Feature',
                                geometry: {
                                    type: 'Point',
                                    coordinates: centroid
                                },
                                properties: {
                                    acres: area.properties?.total_area || 0,
                                    name: area.properties?.name || ''
                                }
                            };
                        })
                    }
                });
                
                initialMap.addLayer({
                    id: 'area-labels-layer',
                    type: 'symbol',
                    source: 'area-labels',
                    layout: {
                        'text-field': [
                            'concat',
                            ['get', 'name'],
                            '\n',
                            ['to-string', ['round', ['get', 'acres']]],
                            ' ac'
                        ],
                        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                        'text-size': 14,
                        'text-anchor': 'center',
                        'text-allow-overlap': false,
                        'text-ignore-placement': false
                    },
                    paint: {
                        'text-color': '#000',
                        'text-halo-color': '#fff',
                        'text-halo-width': 2,
                        'text-halo-blur': 1
                    }
                });
            }
        });

        // Add hash function to String prototype for generating IDs
        if (!String.prototype.hashCode) {
            String.prototype.hashCode = function() {
                let hash = 0;
                for (let i = 0; i < this.length; i++) {
                    const char = this.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash; // Convert to 32bit integer
                }
                return Math.abs(hash);
            };
        }

        // Simplified MapboxDraw instance
        const drawControl = new MapboxDraw({
            displayControlsDefault: false,
            controls: {
                line_string: true,
                polygon: true,
                trash: true,
                combine_features: false,
                uncombine_features: false
            },
            // Don't modify modes directly to avoid conflicts
            defaultMode: 'simple_select',
            styles: [
                // Line style for drawing (visible for both lines and polygons)
                {
                    id: 'gl-draw-line',
                    type: 'line',
                    filter: ['all', 
                        ['any', 
                            ['==', '$type', 'LineString'], 
                            ['==', '$type', 'Polygon']
                        ], 
                        ['!=', 'mode', 'static']
                    ],
                    layout: {
                        'line-cap': 'round',
                        'line-join': 'round'
                    },
                    paint: {
                        'line-color': '#1976d2',
                        'line-width': 3
                        // Removed dasharray for solid lines
                    }
                },
                // Static lines (hidden)
                {
                    id: 'gl-draw-line-static',
                    type: 'line',
                    filter: ['all', 
                        ['any', 
                            ['==', '$type', 'LineString'], 
                            ['==', '$type', 'Polygon']
                        ], 
                        ['==', 'mode', 'static']
                    ],
                    layout: {
                        'line-cap': 'round',
                        'line-join': 'round'
                    },
                    paint: {
                        'line-color': 'rgba(0,0,0,0)',
                        'line-width': 3
                    }
                },
                // Points (hidden)
                {
                    id: 'gl-draw-point',
                    type: 'circle',
                    filter: ['all', ['==', '$type', 'Point'], ['!=', 'meta', 'midpoint']],
                    paint: {
                        'circle-radius': 6,
                        'circle-color': 'rgba(0,0,0,0)'
                    }
                },
                // Midpoints (hidden)
                {
                    id: 'gl-draw-midpoint',
                    type: 'circle',
                    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
                    paint: {
                        'circle-radius': 6,
                        'circle-color': 'rgba(0,0,0,0)'
                    }
                },
                // Vertex halos (hidden)
                {
                    id: 'gl-draw-vertex-halo-active',
                    type: 'circle',
                    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'vertex-halo'], ['==', 'active', 'true']],
                    paint: {
                        'circle-radius': 12,
                        'circle-color': 'rgba(0,0,0,0)'
                    }
                },
                // Vertices (hidden)
                {
                    id: 'gl-draw-vertex-active',
                    type: 'circle',
                    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'vertex'], ['==', 'active', 'true']],
                    paint: {
                        'circle-radius': 8,
                        'circle-color': 'rgba(0,0,0,0)'
                    }
                }
            ]
        });
        // Remove any existing MapboxDraw controls before adding a new one (prevents duplicate sources)
        if (initialMap._controls) {
          for (let i = initialMap._controls.length - 1; i >= 0; i--) {
            const ctrl = initialMap._controls[i];
            if (ctrl && ctrl.constructor && ctrl.constructor.name === 'MapboxDraw') {
              try {
                initialMap.removeControl(ctrl);
              } catch (e) {}
            }
            // Remove any GeolocateControl if present
            if (ctrl && ctrl.constructor && ctrl.constructor.name === 'GeolocateControl') {
              try {
                initialMap.removeControl(ctrl);
              } catch (e) {}
            }
          }
        }
        // Add MapboxDraw control to the map ONLY after map is fully loaded
        initialMap.on('rotate', () => setMapBearing(initialMap.getBearing()));
        initialMap.on('pitch', () => setMapPitch(initialMap.getPitch()));

        // Save map position whenever it moves (debounced)
        let saveTimeout;
        const saveMapPosition = () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                const center = initialMap.getCenter();
                const zoom = initialMap.getZoom();
                localStorage.setItem('mapPosition', JSON.stringify({
                    center: [center.lng, center.lat],
                    zoom: zoom
                }));
            }, 1000); // Save 1 second after user stops moving
        };
        
        initialMap.on('moveend', saveMapPosition);
        initialMap.on('zoomend', saveMapPosition);

        initialMap.once('load', () => {
            initialMap.addControl(drawControl);
            setDraw(drawControl);
            // Remove any extra MapboxDraw control buttons (if present)
            setTimeout(() => {
              document.querySelectorAll('.mapbox-gl-draw_ctrl-draw-btns, .mapbox-gl-draw_ctrl-top-right, .mapbox-gl-draw_ctrl-group').forEach(el => el.remove());
            }, 200);
            setupGeocoder(initialMap, geocoderContainerRef); // Set up geocoder
            trackMousePosition(initialMap, true); // Track mouse position
            // Setup waypoint drawer with delete callback
            waypointDrawerRef.current = new WaypointDrawer(initialMap, async (waypointId) => {
                await waypointAPI.delete(waypointId);
            });
        });

        setMap(initialMap);

        return () => {
            if (markerRef.current) markerRef.current.remove();
            if (waypointDrawerRef.current && typeof waypointDrawerRef.current.clearAll === 'function') {
                waypointDrawerRef.current.clearAll();
            }
            initialMap.remove();
        };
    }, []);

    // Load saved data from database when map and user are ready
    useEffect(() => {
        if (!map || !user || dataLoaded || !waypointDrawerRef.current) return;

        const loadSavedData = async () => {
            try {
                setIsLoadingData(true);
                console.log('📥 Loading saved data from database...');
                
                // Load waypoints
                const waypoints = await waypointAPI.getAll();
                console.log(`✅ Loaded ${waypoints.length} waypoints`, waypoints);
                waypoints.forEach(wp => {
                    if (waypointDrawerRef.current && wp.longitude && wp.latitude) {
                        // addWaypoint expects: (lngLat, name, color, notes, dbId)
                        const lngLat = { lng: wp.longitude, lat: wp.latitude };
                        waypointDrawerRef.current.addWaypoint(
                            lngLat,
                            wp.name,
                            wp.color || 'red',
                            wp.notes || '',
                            wp.id // Pass database ID
                        );
                    }
                });

                // Load lines
                const lines = await lineAPI.getAll();
                console.log(`✅ Loaded ${lines.length} lines`);
                // Lines store coordinates as JSON array, not WKT
                const lineFeatures = lines.map(line => ({
                    id: line.id,
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: line.coordinates || [],
                    },
                    properties: {
                        id: line.id, // Store ID in properties for Mapbox
                        name: line.name,
                        color: line.color,
                        notes: line.notes,
                        total_distance: line.total_distance,
                    },
                }));
                setSavedLines(lineFeatures);

                // Load areas
                const areas = await areaAPI.getAll();
                console.log(`✅ Loaded ${areas.length} areas`);
                // Areas store coordinates as JSON array, not WKT
                const areaFeatures = areas.map(area => ({
                    id: area.id,
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [area.coordinates || []],
                    },
                    properties: {
                        id: area.id, // Store ID in properties for Mapbox
                        name: area.name,
                        color: area.color,
                        notes: area.notes,
                        total_area: area.total_area,
                    },
                }));
                setSavedAreas(areaFeatures);

                setDataLoaded(true);
                console.log('✅ All data loaded successfully!');
            } catch (error) {
                console.error('❌ Error loading saved data:', error);
            } finally {
                setIsLoadingData(false);
            }
        };

        loadSavedData();
    }, [map, user, dataLoaded]);

    // Memoized handlers to avoid stale closures
    const handleEditFeature = useCallback((featureId, isArea, feature) => {
        if (!draw) return;
        
        // Find the feature in saved state
        const savedFeature = isArea 
            ? savedAreas.find(f => (f.id === featureId || f.properties?.id === featureId))
            : savedLines.find(f => (f.id === featureId || f.properties?.id === featureId));
        
        if (savedFeature) {
            // Convert featureId to string for MapboxDraw
            const drawId = String(featureId);
            
            // Add feature to draw for editing with proper structure
            const drawFeature = {
                type: 'Feature',
                id: drawId,
                geometry: savedFeature.geometry,
                properties: savedFeature.properties || {}
            };
            
            console.log('Adding feature to draw for editing:', drawFeature);
            const addedIds = draw.add(drawFeature);
            console.log('Added IDs:', addedIds);
            
            // Use the actual ID returned by draw.add
            const actualId = addedIds && addedIds.length > 0 ? addedIds[0] : drawId;
            draw.changeMode('direct_select', { featureId: actualId });
            
            // Remove from static layer temporarily
            if (isArea) {
                setSavedAreas(prev => prev.filter(f => !(f.id === featureId || f.properties?.id === featureId)));
            } else {
                setSavedLines(prev => prev.filter(f => !(f.id === featureId || f.properties?.id === featureId)));
            }
        }
        
        // Open the appropriate modal in edit mode
        if (isArea) {
            setEditingAreaId(featureId);
            setAreaModalName(feature.properties?.name || '');
            setAreaModalNotes(feature.properties?.notes || '');
            setAreaModalColor(feature.properties?.color || '#1976d2');
            setAreaModalTotal(feature.properties?.total_area || 0);
            setAreaModalOpen(true);
        } else {
            setEditingLineId(featureId);
            setLineModalName(feature.properties?.name || '');
            setLineModalNotes(feature.properties?.notes || '');
            setLineModalColor(feature.properties?.color || '#e53935');
            setLineModalTotal(feature.properties?.total_distance ? `${feature.properties.total_distance} ft` : '0 ft');
            setLineModalOpen(true);
        }
    }, [draw, savedAreas, savedLines]);

    const handleDeleteFeature = useCallback(async (featureId, isArea) => {
        if (!map) return;
        
        // Also remove from draw if it's currently being edited
        if (draw) {
            const all = draw.getAll();
            const inDraw = all.features.find(f => f.id === featureId || f.properties?.id === featureId);
            if (inDraw) {
                draw.delete(featureId);
            }
        }
        
        // Clear any custom area/line sources that might be showing this feature
        if (isArea && map.getSource('custom-area')) {
            map.getSource('custom-area').setData({ type: 'FeatureCollection', features: [] });
            if (map.getSource('area-vertex-points')) {
                map.getSource('area-vertex-points').setData({ type: 'FeatureCollection', features: [] });
            }
        } else if (!isArea && map.getSource('custom-line')) {
            map.getSource('custom-line').setData({ type: 'FeatureCollection', features: [] });
            if (map.getSource('vertex-points')) {
                map.getSource('vertex-points').setData({ type: 'FeatureCollection', features: [] });
            }
        }
        
        // Optimistic update: Remove from UI immediately
        let removedFeature = null;
        if (isArea) {
            setSavedAreas(prev => {
                removedFeature = prev.find(f => (f.id === featureId || f.properties?.id === featureId));
                const updated = prev.filter(f => !(f.id === featureId || f.properties?.id === featureId));
                
                if (map.getSource('static-areas')) {
                    map.getSource('static-areas').setData({ 
                        type: 'FeatureCollection', 
                        features: updated 
                    });
                }
                return updated;
            });
        } else {
            setSavedLines(prev => {
                removedFeature = prev.find(f => (f.id === featureId || f.properties?.id === featureId));
                const updated = prev.filter(f => !(f.id === featureId || f.properties?.id === featureId));
                
                if (map.getSource('static-lines')) {
                    map.getSource('static-lines').setData({ 
                        type: 'FeatureCollection', 
                        features: updated 
                    });
                }
                return updated;
            });
        }
        
        // Then delete from database in background
        try {
            if (isArea) {
                await areaAPI.delete(featureId);
                console.log('✅ Area deleted from database:', featureId);
            } else {
                await lineAPI.delete(featureId);
                console.log('✅ Line deleted from database:', featureId);
            }
        } catch (error) {
            console.error('❌ Error deleting from database:', error);
            // Restore feature if database deletion failed
            if (removedFeature) {
                if (isArea) {
                    setSavedAreas(prev => {
                        const restored = [...prev, removedFeature];
                        if (map.getSource('static-areas')) {
                            map.getSource('static-areas').setData({ 
                                type: 'FeatureCollection', 
                                features: restored 
                            });
                        }
                        return restored;
                    });
                } else {
                    setSavedLines(prev => {
                        const restored = [...prev, removedFeature];
                        if (map.getSource('static-lines')) {
                            map.getSource('static-lines').setData({ 
                                type: 'FeatureCollection', 
                                features: restored 
                            });
                        }
                        return restored;
                    });
                }
            }
            alert(`Failed to delete ${isArea ? 'area' : 'line'} from database. Feature restored.`);
        }
    }, [map, draw]);

    // Add click handler for lines and areas to show edit/delete popup
    useEffect(() => {
        if (!map || !draw) return;

        const handleClick = (e) => {
            document.querySelectorAll('.mapboxgl-popup').forEach(popup => popup.remove());
            
            // Check if a feature was clicked
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['static-lines-layer', 'static-areas-layer']
            });

            if (features.length > 0) {
                const feature = features[0];
                const isArea = feature.layer.id === 'static-areas-layer';
                
                // Get the feature ID from properties
                const featureId = feature.properties?.id || feature.id;
                
                if (!featureId) {
                    console.error('Could not identify feature');
                    return;
                }
                
                console.log('Clicked feature:', {
                    id: featureId,
                    type: isArea ? 'area' : 'line',
                    properties: feature.properties
                });
                
                // Create a popup with edit and delete buttons
                const popup = new mapboxgl.Popup({ 
                    closeButton: false,
                    closeOnClick: true,
                    className: 'feature-popup'
                });

                // Create popup content
                const popupContent = document.createElement('div');
                popupContent.style.cssText = 'padding: 8px; display: flex; flex-direction: column; gap: 6px;';
                
                // Edit button
                const editButton = document.createElement('button');
                editButton.textContent = `Edit ${isArea ? 'Area' : 'Line'}`;
                editButton.style.cssText = `
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                `;
                
                editButton.onclick = (e) => {
                    e.stopPropagation();
                    handleEditFeature(featureId, isArea, feature);
                };
                
                // Delete button
                const deleteButton = document.createElement('button');
                deleteButton.textContent = `Delete ${isArea ? 'Area' : 'Line'}`;
                deleteButton.style.cssText = `
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                `;
                
                deleteButton.onclick = async (e) => {
                    e.stopPropagation();
                    popup.remove();
                    await handleDeleteFeature(featureId, isArea);
                };
                
                popupContent.appendChild(editButton);
                popupContent.appendChild(deleteButton);
                popup.setDOMContent(popupContent).setLngLat(e.lngLat).addTo(map);
            }
        };

        // Add click handler for lines and areas
        map.on('click', handleClick);

        // Clean up
        return () => {
            map.off('click', handleClick);
        };
    }, [map, draw, savedLines, savedAreas, handleEditFeature, handleDeleteFeature]);

    // Keep static sources in sync with state changes
    useEffect(() => {
        if (map && map.getSource('static-lines')) {
            map.getSource('static-lines').setData({ type: 'FeatureCollection', features: savedLines });
        }
    }, [savedLines, map]);
    
    useEffect(() => {
        if (map && map.getSource('static-areas')) {
            map.getSource('static-areas').setData({ type: 'FeatureCollection', features: savedAreas });
        }
        
        // Update area labels
        if (map && map.getSource('area-labels')) {
            const labelFeatures = savedAreas.map(area => {
                // Calculate centroid for label placement
                const coords = area.geometry.coordinates[0];
                let sumLng = 0, sumLat = 0;
                for (let i = 0; i < coords.length - 1; i++) {
                    sumLng += coords[i][0];
                    sumLat += coords[i][1];
                }
                const centroid = [
                    sumLng / (coords.length - 1),
                    sumLat / (coords.length - 1)
                ];
                
                return {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: centroid
                    },
                    properties: {
                        acres: area.properties?.total_area || 0,
                        name: area.properties?.name || ''
                    }
                };
            });
            
            map.getSource('area-labels').setData({
                type: 'FeatureCollection',
                features: labelFeatures
            });
        }
    }, [savedAreas, map]);

    useEffect(() => {
        if (map) {
            // Small delay to ensure DOM elements are ready
            setTimeout(() => {
                trackMousePosition(map, infoVisible); // Update mouse position display based on visibility
            }, 100);
        }
    }, [infoVisible, map]);

    // Memoized update callbacks to avoid infinite render loops
    const handleLineMeasureUpdate = useCallback((segments, total, elevation) => {
        setLineModalSegments(segments);
        setLineModalTotal(total);
        if (elevation) {
            setLineModalElevation(elevation);
        }
    }, []);
    const handleAreaMeasureUpdate = useCallback((segments, totalAreaAcres) => {
        setAreaModalSegments(segments);
        setAreaModalTotal(totalAreaAcres);
    }, []);

    // --- Render AreaMeasure for live area drawing/measurement ---
    // This is a render helper for inside JSX, not a hook
    const renderAreaMeasure = () => {
        if (!isAreaModalOpen || !map || !draw) return null;
        return (
            <AreaMeasure
                map={map}
                draw={draw}
                onUpdate={handleAreaMeasureUpdate}
            />
        );
    };


    const changeMapStyle = (styleKey) => {
        if (!map) return;
        const center = map.getCenter();
        const zoom = map.getZoom();
        const bearing = map.getBearing();
        const pitch = map.getPitch();
        // Save draw features before style change (avoid crash if draw is null)
        let prevDrawFeatures = null;
        if (draw && typeof draw.getAll === 'function') {
          try {
            prevDrawFeatures = draw.getAll();
          } catch (e) {
            prevDrawFeatures = null;
          }
        }

        // Remove previous draw control if present BEFORE changing style
        if (draw && map._controls) {
          try {
            map.removeControl(draw);
          } catch (e) {
            // Ignore if already removed
          }
        }
        // Remove all MapboxDraw layers and sources if present (remove layers first, in reverse order)
        if (map && typeof map.getStyle === 'function') {
          // List of possible draw source/layer prefixes
          const drawPrefixes = ['mapbox-gl-draw'];
          // Remove all draw layers
          const style = map.getStyle();
          if (style && style.layers) {
            for (let i = style.layers.length - 1; i >= 0; i--) {
              const layer = style.layers[i];
              if (layer.id && drawPrefixes.some(prefix => layer.id.startsWith(prefix))) {
                if (map.hasLayer(layer.id)) {
                  try { map.removeLayer(layer.id); } catch (e) {}
                }
              }
            }
          }
          // Remove all draw sources
          if (style && style.sources) {
            Object.keys(style.sources).forEach((sourceId) => {
              if (drawPrefixes.some(prefix => sourceId.startsWith(prefix))) {
                if (map.hasSource(sourceId)) {
                  try { map.removeSource(sourceId); } catch (e) {}
                }
              }
            });
          }
        }
        map.setStyle(styles[styleKey]);
        map.once('style.load', () => {
            // Extra cleanup: Remove any leftover MapboxDraw layers/sources after style load (sometimes style rehydrates them)
            const drawPrefixes = ['mapbox-gl-draw'];
            const style = map.getStyle();
            if (style && style.layers) {
                for (let i = style.layers.length - 1; i >= 0; i--) {
                    const layer = style.layers[i];
                    if (layer.id && drawPrefixes.some(prefix => layer.id.startsWith(prefix))) {
                        if (map.hasLayer(layer.id)) {
                            try { map.removeLayer(layer.id); } catch (e) {}
                        }
                    }
                }
            }
            if (style && style.sources) {
                Object.keys(style.sources).forEach((sourceId) => {
                    if (drawPrefixes.some(prefix => sourceId.startsWith(prefix))) {
                        if (map.hasSource(sourceId)) {
                            try { map.removeSource(sourceId); } catch (e) {}
                        }
                    }
                });
            }
            map.setCenter(center);
            map.setZoom(zoom);
            map.setBearing(bearing);
            map.setPitch(pitch);
            // Re-add MapboxDraw after style change
            const drawControl = new MapboxDraw({
                displayControlsDefault: false,
                controls: {
                    point: false,
                    line_string: true,
                    polygon: true,
                    trash: true,
                    combine_features: false,
                    uncombine_features: false
                },
                styles: [
                    {
                        id: 'gl-draw-line',
                        type: 'line',
                        filter: ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
                        layout: {
                            'line-cap': 'round',
                            'line-join': 'round'
                        },
                        paint: {
                            'line-color': '#ff6600',
                            'line-width': 4
                        }
                    },
                    {
                        id: 'gl-draw-line-static',
                        type: 'line',
                        filter: ['all', ['==', '$type', 'LineString'], ['==', 'mode', 'static']],
                        layout: {
                            'line-cap': 'round',
                            'line-join': 'round'
                        },
                        paint: {
                            'line-color': '#333',
                            'line-width': 3
                        }
                    },
                    {
                        id: 'gl-draw-point',
                        type: 'circle',
                        filter: ['all', ['==', '$type', 'Point'], ['!=', 'meta', 'midpoint']],
                        paint: {
                            'circle-radius': 6,
                            'circle-color': '#ff6600'
                        }
                    }
                ]
            });
            map.addControl(drawControl);
            setDraw(drawControl);
            // Restore previous draw features
            if (
              prevDrawFeatures &&
              Array.isArray(prevDrawFeatures.features) &&
              prevDrawFeatures.features.length > 0
            ) {
              prevDrawFeatures.features.forEach(f => drawControl.add(f));
            }
            setupGeocoder(map, geocoderContainerRef, markerRef);
        });
    };

    const resetNorthAndTilt = () => {
        if (!map) return;
        map.easeTo({ bearing: 0, pitch: 0, duration: 1000 });
    };

    return (
        <>
<div style={{ position: 'absolute', width: '100%', maxWidth: '2000px', height: '100%', margin: '0 auto', padding: 0, overflow: 'hidden', left: 0, right: 0 }}>
                <div
                    ref={mapContainer}
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: 0,
                      right: 0,
                      width: '100%',
                      height: '100%',
                      zIndex: 1,
                      margin: 0,
                      padding: 0
                    }}
                >
                    <div
                        ref={geocoderContainerRef}
                        style={{
                            position: 'absolute',
                            zIndex: 10,
                            width: isMobile ? '200px' : '300px',
                            left: isMobile ? '8px' : '16px',
                            top: isMobile ? '10px' : '20px',
                            pointerEvents: 'auto',
                        }}
                    />
                    {/* All overlays moved inside mapContainer for correct stacking */}
                    
                    <LocateMeButton map={map} />
                    <CrosshairToggle mapContainerRef={mapContainer} />
                    {draw && map && (
  <>
    <DrawingToolbar 
      draw={draw} 
      map={map} 
      mapContainerRef={mapContainer} 
      waypointDrawerRef={waypointDrawerRef}
      onLineButtonClick={handleLineButtonClick} 
      onAreaButtonClick={handleAreaButtonClick}
    />
    {isLineModalOpen && (
      <LineMeasure
        map={map}
        draw={draw}
        onUpdate={handleLineMeasureUpdate}
        lineColor={lineModalColor}
      />
    )}
    <LineModal
      isOpen={isLineModalOpen}
      onClose={handleLineModalClose}
      onSave={handleLineModalSave}
      totalDistance={lineModalTotal}
      segments={lineModalSegments}
      notes={lineModalNotes}
      setNotes={setLineModalNotes}
      initialColor={lineModalColor}
      initialName={lineModalName}
      editingLineId={editingLineId}
      elevation={lineModalElevation}
    />
  </>
)}
                    <ZoomControl map={map} />

                    {/* Area Modal */}
                    {isAreaModalOpen && renderAreaMeasure()}
                    <AreaModal
                      isOpen={isAreaModalOpen}
                      onClose={handleAreaModalClose}
                      onSave={handleAreaModalSave}
                      totalAreaAcres={areaModalTotal}
                      segments={areaModalSegments}
                      areaColor={areaModalColor}
                      setAreaColor={setAreaModalColor}
                      initialName={areaModalName}
                      notes={areaModalNotes}
                      setNotes={setAreaModalNotes}
                      editingAreaId={editingAreaId}
                    />

                    <div
                        id="info"
                        style={{
                            display: infoVisible ? 'block' : 'none',
                            position: 'absolute',
                            bottom: '50px', // Lower so toggle bar is above
                            left: '10px',
                            padding: '7px 16px',
                            background: 'rgba(0, 0, 0, 0.7)',
                            color: '#fff',
                            fontSize: '14px',
                            borderRadius: '5px',
                            zIndex: 3,
                        }}
                    ></div>

                    <CompassButton
                        mapBearing={mapBearing}
                        mapPitch={mapPitch}
                        resetNorthAndTilt={resetNorthAndTilt}
                    />

                    
                                        {/* Style toggle buttons restored */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: isMobile ? '10px' : '25px',
                            right: isMobile ? '5px' : '10px',
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            zIndex: 3, // ensure above other overlays
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            borderRadius: '5px',
                            padding: isMobile ? '3px' : '5px',
                        }}
                    >
                        {styles.map((style, idx) => (
                            <button
                                key={style.id}
                                onClick={() => {
                                    if (map) {
                                        const center = map.getCenter();
                                        const zoom = map.getZoom();
                                        const bearing = map.getBearing();
                                        const pitch = map.getPitch();
                                        
                                        map.setStyle(style.url);
                                        setCurrentStyleId(style.id);
                                        
                                        // Restore map state after style loads
                                        map.once('style.load', () => {
                                            map.setCenter(center);
                                            map.setZoom(zoom);
                                            map.setBearing(bearing);
                                            map.setPitch(pitch);
                                            
                                            // Recreate custom sources and layers (setStyle removes them)
                                            // Add static lines source and layer
                                            if (!map.getSource('static-lines')) {
                                                map.addSource('static-lines', {
                                                    type: 'geojson',
                                                    data: { type: 'FeatureCollection', features: savedLines }
                                                });
                                                map.addLayer({
                                                    id: 'static-lines-layer',
                                                    type: 'line',
                                                    source: 'static-lines',
                                                    paint: {
                                                        'line-color': ['get', 'color'],
                                                        'line-width': 4,
                                                        'line-opacity': 1
                                                    }
                                                });
                                            }
                                            
                                            // Add static areas source and layers
                                            if (!map.getSource('static-areas')) {
                                                map.addSource('static-areas', {
                                                    type: 'geojson',
                                                    data: { type: 'FeatureCollection', features: savedAreas }
                                                });
                                                map.addLayer({
                                                    id: 'static-areas-layer',
                                                    type: 'fill',
                                                    source: 'static-areas',
                                                    paint: {
                                                        'fill-color': ['get', 'color'],
                                                        'fill-opacity': 0.25
                                                    }
                                                });
                                                map.addLayer({
                                                    id: 'static-areas-outline',
                                                    type: 'line',
                                                    source: 'static-areas',
                                                    paint: {
                                                        'line-color': ['get', 'color'],
                                                        'line-width': 3,
                                                        'line-opacity': 1
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }}
                                style={{
                                    margin: isMobile ? '2px 0' : '0 5px',
                                    padding: isMobile ? '4px 8px' : '6px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    background: style.id === currentStyleId ? '#007bff' : '#fff',
                                    color: style.id === currentStyleId ? 'white' : '#007bff',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    fontSize: isMobile ? '11px' : '14px',
                                    whiteSpace: 'nowrap',
                                }}
                                onMouseEnter={(e) => {
                                    if (style.id !== currentStyleId) {
                                        e.target.style.backgroundColor = '#007bff';
                                        e.target.style.color = 'white';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (style.id !== currentStyleId) {
                                        e.target.style.backgroundColor = '#fff';
                                        e.target.style.color = '#007bff';
                                    } else {
                                        e.target.style.backgroundColor = '#007bff';
                                        e.target.style.color = 'white';
                                    }
                                }}
                            >
                                {style.name}
                            </button>
                        ))}
                    </div>
                    {/* End overlays inside mapContainer */}
                </div>

                <div
                    style={{
                        position: 'absolute',
                        bottom: '110px', // Just above coord box
                        left: '10px',
                        zIndex: 4, // Ensure above info box
                        backgroundColor: 'rgba(24,24,24,0.75)', // match CrosshairToggle
                        color: '#fff',
                        padding: '6px 10px', // Smaller
                        borderRadius: '6px',
                        fontFamily: 'Segoe UI, Roboto, sans-serif',
                        fontSize: '13px', // Smaller
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transform: 'none',
                        transformOrigin: 'unset',
                    }}
                >
                    <label htmlFor="toggleVisibility" style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 500, fontSize: 15, cursor: 'pointer', userSelect: 'none', color: '#fff' }}>
                      <span style={{ position: 'relative', display: 'inline-block', width: 38, height: 22 }}>
                        <input
                          type="checkbox"
                          id="toggleVisibility"
                          checked={infoVisible}
                          onChange={e => setInfoVisible(e.target.checked)}
                          style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                          aria-label="Toggle coordinates visibility"
                        />
                        <span
                          style={{
                            position: 'absolute',
                            cursor: 'pointer',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: infoVisible ? '#007bff' : '#444',
                            transition: 'background 0.2s',
                            borderRadius: 22,
                            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                          }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            left: infoVisible ? 18 : 2,
                            top: 2,
                            width: 18,
                            height: 18,
                            background: '#fff',
                            borderRadius: '50%',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                            transition: 'left 0.2s',
                            border: '1px solid #eee',
                          }}
                        />
                      </span>
                      <span>Show Coordinates</span>
                    </label>
                </div>
            </div>
            
            {/* Loading Spinner */}
            {isLoadingData && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 100000,
                    background: 'rgba(0, 0, 0, 0.8)',
                    padding: '30px 40px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '15px'
                }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '5px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '5px solid #007bff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <div style={{
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: '600',
                        fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif'
                    }}>
                        Loading map data...
                    </div>
                </div>
            )}
            
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            
            <Analytics />
        </>
    );
};

export default Map;
