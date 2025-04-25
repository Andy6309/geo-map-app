
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
import { WaypointDrawer } from './controls/WaypointAction';
import { length as turfLength, point, lineString } from '@turf/turf';
import  LineMeasure from './controls/LineMeasure';


mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const Map = () => {
    const mapContainer = useRef(null);
    const geocoderContainerRef = useRef(null);
    const markerRef = useRef(null);
    const waypointDrawerRef = useRef(null);
    const [map, setMap] = useState(null);
    const [mapBearing, setMapBearing] = useState(0);
    const [mapPitch, setMapPitch] = useState(0);
    const [draw, setDraw] = useState(null);
    const [infoVisible, setInfoVisible] = useState(true);

    useEffect(() => {
        const initialMap = new mapboxgl.Map({
            container: mapContainer.current,
            style: styles['3D-Topo'], // Set default style
            center: [-74.5, 40], // Set initial map center
            zoom: 9, // Set initial zoom level
        });

        // Restore original MapboxDraw setup: NO built-in controls, only custom toolbar
        const drawControl = new MapboxDraw({
            displayControlsDefault: false,
            controls: {}, // No built-in controls
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
        // Remove any existing MapboxDraw controls before adding a new one (prevents duplicate sources)
        if (initialMap._controls) {
          for (let i = initialMap._controls.length - 1; i >= 0; i--) {
            const ctrl = initialMap._controls[i];
            if (ctrl && ctrl.constructor && ctrl.constructor.name === 'MapboxDraw') {
              try {
                initialMap.removeControl(ctrl);
              } catch (e) {}
            }
          }
        }
        initialMap.addControl(drawControl);
        setDraw(drawControl);
        // Remove any extra MapboxDraw control buttons (if present)
        const drawControls = document.querySelector('.mapbox-gl-draw_ctrl-draw-btns');
        if (drawControls) drawControls.remove();

        initialMap.on('rotate', () => setMapBearing(initialMap.getBearing()));
        initialMap.on('pitch', () => setMapPitch(initialMap.getPitch()));

        initialMap.once('load', () => {
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
                    {draw && map && (
                      <>
                        <DrawingToolbar draw={draw} map={map} mapContainerRef={mapContainer} />
                        <LineMeasure map={map} draw={draw} />
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
                        backgroundColor: 'rgba(0, 0, 0, 0.70)', // semi-transparent
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
                    <input
                        type="checkbox"
                        id="toggleVisibility"
                        checked={infoVisible}
                        onChange={(e) => setInfoVisible(e.target.checked)}
                        style={{
                            width: '16px',
                            height: '16px',
                            accentColor: '#00bfff',
                            cursor: 'pointer',
                        }}
                    />
                    <label htmlFor="toggleVisibility" style={{ cursor: 'pointer' }}>
                        Show Coordinates
                    </label>
                </div>
            </div>
            <Analytics />
        </>
    );
};

export default Map;
