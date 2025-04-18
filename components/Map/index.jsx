﻿
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
import { WaypointDrawer } from './controls/Waypoint';
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

        initialMap.addControl(drawControl, 'top-left');
        setDraw(drawControl);

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

        map.setStyle(styles[styleKey]);
        map.once('style.load', () => {
            map.setCenter(center);
            map.setZoom(zoom);
            map.setBearing(bearing);
            map.setPitch(pitch);
            setupGeocoder(map, geocoderContainerRef, markerRef);
        });
    };

    const resetNorthAndTilt = () => {
        if (!map) return;
        map.easeTo({ bearing: 0, pitch: 0, duration: 1000 });
    };

    return (
        <>
            <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
                <div
                    ref={geocoderContainerRef}
                    style={{
                        position: 'absolute',
                        zIndex: 1,
                        width: '50%',
                        left: '50%',
                        marginLeft: '-48%',
                        top: '10px',
                    }}
                />

                <LocateMeButton map={map} />
                <DrawingToolbar draw={draw} map={map} />
                <ZoomControl map={map} />
                <LineMeasure map={map} draw={draw} />

                <div
                    ref={mapContainer}
                    style={{ width: '100%', height: '100%', position: 'relative', zIndex: 0 }}
                />

                <div
                    id="info"
                    style={{
                        display: infoVisible ? 'block' : 'none',
                        position: 'absolute',
                        bottom: '70px',
                        left: '10px',
                        padding: '5px 10px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: '#fff',
                        fontSize: '12px',
                        borderRadius: '3px',
                        zIndex: 2,
                    }}
                ></div>

                <CompassButton
                    mapBearing={mapBearing}
                    mapPitch={mapPitch}
                    resetNorthAndTilt={resetNorthAndTilt}
                />

                <div
                    style={{
                        position: 'absolute',
                        bottom: '25px',
                        right: '10px',
                        display: 'flex',
                        zIndex: 2,
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
                                marginRight: idx < 3 ? '10px' : '0',
                                backgroundColor: 'transparent',
                                border: '2px solid #007bff',
                                padding: '8px 16px',
                                borderRadius: '5px',
                                fontSize: '14px',
                                color: '#007bff',
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

                <div
                    style={{
                        position: 'absolute',
                        bottom: '115px',
                        left: '10px',
                        zIndex: 3,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: '#fff',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        fontFamily: 'Segoe UI, Roboto, sans-serif',
                        fontSize: '12px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transform: 'scale(0.8)',
                        transformOrigin: 'bottom left',
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
