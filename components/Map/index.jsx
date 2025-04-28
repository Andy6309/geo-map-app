
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { styles } from './styles';
import { setupGeocoder } from './geocoder';
import { trackMousePosition } from './utils/mouseTracker';
import { CompassButton } from './controls/CompassButton';
import { DrawingToolbar } from './controls/DrawingToolbar';
import { Analytics } from '@vercel/analytics/react';
import { LocateMeButton } from './controls/LocateMeButton';
import ZoomControl from './controls/ZoomControl';
import { WaypointButton } from './controls/WaypointButton';
import { CrosshairToggle } from './controls/CrosshairToggle';
import { WaypointDrawer } from './controls/WaypointAction';
import { length as turfLength, point, lineString } from '@turf/turf';
import  LineMeasure from './controls/LineMeasure';
import LineModal from './controls/LineModal';


mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const Map = () => {
    const [infoVisible, setInfoVisible] = useState(true);
    const mapContainer = useRef(null);
    const geocoderContainerRef = useRef(null);
    const markerRef = useRef(null);
    const waypointDrawerRef = useRef(null);
    const [map, setMap] = useState(null);
    const [mapBearing, setMapBearing] = useState(0);
    const [mapPitch, setMapPitch] = useState(0);
    const [draw, setDraw] = useState(null);










    // --- Line Modal State ---
    const [isLineModalOpen, setLineModalOpen] = useState(false);
    const [lineModalSegments, setLineModalSegments] = useState([]); // Live segment distances
    const [lineModalTotal, setLineModalTotal] = useState('0 ft'); // Live total distance
    const [lineModalColor, setLineModalColor] = useState('#e53935');
    const [lineModalName, setLineModalName] = useState("");
    const [lineModalNotes, setLineModalNotes] = useState("");

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
    const handleLineModalSave = (color, name, notes) => {
        // Save the drawn line (could persist or move to static layer)
        setLineModalOpen(false);
        setLineModalSegments([]);
        setLineModalTotal('0 ft');
        setLineModalColor('#e53935');
        setLineModalName("");
        setLineModalNotes("");
        if (draw) {
            // Optionally set style or metadata
            draw.changeMode('simple_select');
        }
    };

    // Handler for closing/canceling the modal
    const handleLineModalClose = () => {
        setLineModalOpen(false);
        setLineModalSegments([]);
        setLineModalTotal('0 ft');
        setLineModalColor('#e53935');
        setLineModalName("");
        setLineModalNotes("");
        if (draw) {
            // Remove all drawn lines (pending)
            const all = draw.getAll();
            if (all && all.features && all.features.length > 0) {
                all.features.filter(f => f.geometry.type === 'LineString').forEach(f => draw.delete(f.id));
            }
            draw.changeMode('simple_select');
        }
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
    // <LineMeasure map={map} draw={draw} onUpdate={(segments, total) => { setLineModalSegments(segments); setLineModalTotal(total); }} />












    useEffect(() => {
        const initialMap = new mapboxgl.Map({
            container: mapContainer.current,
            style: styles['3D-Topo'], // Set default style
            center: [-74.5, 40], // Set initial map center
            zoom: 9, // Set initial zoom level
        });

        // Restore original MapboxDraw setup: NO built-in controls, only custom toolbar
        // Custom MapboxDraw instance: Make all Draw layers fully transparent to hide default lines/points
        const drawControl = new MapboxDraw({
            displayControlsDefault: false,
            controls: {},
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
                        'line-color': 'rgba(0,0,0,0)', // Hide default line
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
                        'line-color': 'rgba(0,0,0,0)', // Hide default static line
                        'line-width': 3
                    }
                },
                {
                    id: 'gl-draw-point',
                    type: 'circle',
                    filter: ['all', ['==', '$type', 'Point'], ['!=', 'meta', 'midpoint']],
                    paint: {
                        'circle-radius': 6,
                        'circle-color': 'rgba(0,0,0,0)' // Hide default points
                    }
                },
                // Hide all other Draw layers (midpoints, vertex previews, etc.)
                {
                    id: 'gl-draw-midpoint',
                    type: 'circle',
                    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
                    paint: {
                        'circle-radius': 6,
                        'circle-color': 'rgba(0,0,0,0)'
                    }
                },
                {
                    id: 'gl-draw-vertex-halo-active',
                    type: 'circle',
                    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'vertex-halo'], ['==', 'active', 'true']],
                    paint: {
                        'circle-radius': 12,
                        'circle-color': 'rgba(0,0,0,0)'
                    }
                },
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

        initialMap.once('load', () => {
            initialMap.addControl(drawControl);
            setDraw(drawControl);
            // Remove any extra MapboxDraw control buttons (if present)
            setTimeout(() => {
              document.querySelectorAll('.mapbox-gl-draw_ctrl-draw-btns, .mapbox-gl-draw_ctrl-top-right, .mapbox-gl-draw_ctrl-group').forEach(el => el.remove());
            }, 200);
            setupGeocoder(initialMap, geocoderContainerRef); // Set up geocoder
            trackMousePosition(initialMap, true); // Track mouse position
            waypointDrawerRef.current = new WaypointDrawer(initialMap, drawControl); // Setup waypoint drawer
        });

        setMap(initialMap);

        return () => {
            if (markerRef.current) markerRef.current.remove();
            if (waypointDrawerRef.current) waypointDrawerRef.current.clearAll();
            initialMap.remove();
        };
    }, []);

    useEffect(() => {
        if (map) {
            trackMousePosition(map, infoVisible); // Update mouse position display based on visibility
        }
    }, [infoVisible, map]);

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
                    line_string: true,
                    trash: true
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
<div style={{ position: 'absolute', width: '100%', maxWidth: '2000px', height: '100vh', margin: '0 auto', padding: 0, overflow: 'hidden', left: 0, right: 0 }}>
                <div
                    ref={mapContainer}
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: 0,
                      right: 0,
                      width: '100%',
                      height: '100vh',
                      zIndex: 1,
                      margin: 0,
                      padding: 0
                    }}
                >
                    <div
                        ref={geocoderContainerRef}
                        style={{
                            position: 'absolute',
                            zIndex: 2,
                            width: '50%',
                            left: '50%',
                            marginLeft: '-48%',
                            top: '10px',
                        }}
                    />
                    {/* All overlays moved inside mapContainer for correct stacking */}
                    
                    <LocateMeButton map={map} />
                    <CrosshairToggle mapContainerRef={mapContainer} />
                    {draw && map && (
  <>
    <DrawingToolbar draw={draw} map={map} mapContainerRef={mapContainer} onLineButtonClick={handleLineButtonClick} />
    {isLineModalOpen && (
      <LineMeasure
        map={map}
        draw={draw}
        onUpdate={(segments, total) => {
          setLineModalSegments(segments);
          setLineModalTotal(total);
          if (draw && typeof draw.getAll === 'function') {
            console.log('[DEBUG] LineMeasure onUpdate draw features:', draw.getAll());
          }
        }}
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
    />
  </>
)}
                    <ZoomControl map={map} />

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
                            bottom: '25px',
                            right: '10px',
                            display: 'flex',
                            zIndex: 3, // ensure above other overlays
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            borderRadius: '5px',
                            padding: '5px',
                        }}
                    >
                        {Object.keys(styles).map((style, idx) => (
                            <button
                                key={idx}
                                onClick={() => changeMapStyle(style)}
                                style={{
                                    margin: '0 5px',
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    background: '#fff',
                                    color: '#007bff',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#007bff';
                                    e.target.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.color = '#007bff';
                                }}
                            >
                                {style}
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
            <Analytics />
        </>
    );
};

export default Map;
