import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const Map = () => {
    const mapContainer = useRef(null);
    const geocoderContainerRef = useRef(null);
    const [map, setMap] = useState(null);
    const markerRef = useRef(null);
    const [mapBearing, setMapBearing] = useState(0);
    const [mapPitch, setMapPitch] = useState(0);
    const geocoderRef = useRef(null);
    const [draw, setDraw] = useState(null);
    const router = userRotuer();

    const styles = {
        '3D-Topo': 'mapbox://styles/andy6309/cm91e8vke00j901s409p0fn1u',
        '3D-Satellite': 'mapbox://styles/andy6309/cm91ep7zp00jc01s4cnzuan6u',
        '2D-Satellite': 'mapbox://styles/andy6309/cm91dg5v400cg01sb7l517cjv',
        '2D-Topo': 'mapbox://styles/andy6309/cm91cu31800j101s4bxku2m6i'
    };

    useEffect(() => {
        const session = supabase.auth.getSession();
        if (!session) {
            router.push('/login'); // Redirect to login if not authenticated
        } else {
            setUser(session.user);
        }
    }, []);

    if (!user) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            {/* Map rendering logic here */}
            <h1>Welcome to the Map, {user.email}</h1>
        </div>
    );

    // Function to set up the geocoder
    const setupGeocoder = (mapInstance) => {

        if (geocoderContainerRef.current) {
            while (geocoderContainerRef.current.firstChild) {
                geocoderContainerRef.current.removeChild(geocoderContainerRef.current.firstChild);
            }
        }

        const geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl,
            marker: false,
            placeholder: 'Search locations...'
        });

        if (geocoderContainerRef.current) {
            geocoderContainerRef.current.appendChild(geocoder.onAdd(mapInstance));
        }

        // Set up the result event handler
        geocoder.on('result', (event) => {
            console.log("Search result:", event.result);
            const coordinates = event.result.geometry.coordinates;
            console.log("Coordinates to flyTo:", coordinates);

            // Explicitly call flyTo on the map
            mapInstance.flyTo({
                center: coordinates,
                zoom: 17,
                bearing: 0,
                speed: 1.2,
                curve: 1,
                essential: true
            });

            // Remove previous marker if it exists
            if (markerRef.current) {
                markerRef.current.remove();
                markerRef.current = null;
            }

            // Create a new marker with more visible styling
            const newMarker = new mapboxgl.Marker({
                color: '#FF0000',
                scale: 1.2, // Make it slightly larger
                draggable: false
            });

            // Set position and add to map
            newMarker.setLngLat(coordinates).addTo(mapInstance);

            // Store reference
            markerRef.current = newMarker;

            console.log("Marker created at:", coordinates);

            // Remove the marker after 5 seconds
            setTimeout(() => {
                if (markerRef.current) {
                    console.log("Removing marker");
                    markerRef.current.remove();
                    markerRef.current = null;
                }
            }, 5000);
        });

        // Store the geocoder reference
        geocoderRef.current = geocoder;

        return geocoder;
    };

    // Initialize map and drawing tools
    useEffect(() => {
        // Initialize the map
        const initialMap = new mapboxgl.Map({
            container: mapContainer.current,
            style: styles['3D-Topo'],
            center: [-74.5, 40],
            zoom: 9

        });

        // Create a new MapboxDraw instance
        const drawControl = new MapboxDraw({
            displayControlsDefault: false,
            controls: {
                point: true,      // For waypoints
                line_string: true, // For lines
                polygon: true,    // For shapes
                trash: true       // To delete features
            }
        });



        // Add the draw control to the map
        initialMap.addControl(drawControl, 'top-left');
        setDraw(drawControl);

        // Add event listeners to track map bearing and pitch changes
        initialMap.on('rotate', () => {
            setMapBearing(initialMap.getBearing());
        });

        initialMap.on('pitch', () => {
            setMapPitch(initialMap.getPitch());
        });

        // Setup geocoder once the map is loaded
        initialMap.once('load', () => {
            setupGeocoder(initialMap);

            // Add geolocate control to the map.
            initialMap.on(
                new mapboxgl.GeolocateControl({
                    positionOptions: {
                        enableHighAccuracy: true
                    },
                    // When active the map will receive updates to the device's location as it changes.
                    trackUserLocation: true,
                    // Draw an arrow next to the location dot to indicate which direction the device is heading.
                    showUserHeading: true
                })
            );


            // Track mouse movement - add this inside the load event
            initialMap.on('mousemove', (e) => {
                // Get the coordinates
                const lng = e.lngLat.lng.toFixed(4);
                const lat = e.lngLat.lat.toFixed(4);

                // Query the terrain elevation at the current position
                const elevation = initialMap.queryTerrainElevation(e.lngLat);


                // Update your display container
                const infoElement = document.getElementById('info');
                if (infoElement) {
                    infoElement.innerHTML =
                        `Longitude: ${lng}<br />Latitude: ${lat}<br `;
                }
            });
        });

        setMap(initialMap);

        return () => {
            if (markerRef.current) {
                markerRef.current.remove();
            }
            initialMap.remove();
        };
  
    }, []);

    // Add event handlers for the draw features
    useEffect(() => {
        if (map && draw) {
            // Listen for drawing events
            map.on('draw.create', (e) => {
                console.log('A feature was created', e.features);
                // Handle the created feature
            });

            map.on('draw.update', (e) => {
                console.log('A feature was updated', e.features);
                // Handle the updated feature
            });

            map.on('draw.delete', (e) => {
                console.log('A feature was deleted', e.features);
                // Handle the deleted feature
            });
        }
    }, [map, draw]);

    const changeMapStyle = (style) => {
        if (map) {
            // Store the current view state
            const currentCenter = map.getCenter();
            const currentZoom = map.getZoom();
            const currentBearing = map.getBearing();
            const currentPitch = map.getPitch();

            // Set the new style
            map.setStyle(styles[style]);

            // After the style is loaded, restore the view and reattach geocoder
            map.once('style.load', () => {
                // Restore the previous view
                map.setCenter(currentCenter);
                map.setZoom(currentZoom);
                map.setBearing(currentBearing);
                map.setPitch(currentPitch);

                // Re-setup the geocoder
                setupGeocoder(map);

                // Re-add terrain source after style change
               // map.addSource('mapbox-dem', {
                //    'type': 'raster-dem',
                //    'url': 'mapbox://mapbox.terrain-rgb',
                //    'tileSize': 512,
                 //   'maxzoom': 14
               // });
                //map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
            });
        }
    };

    const resetNorthAndTilt = () => {
        if (map) {
            // Reset both bearing to 0 (north up) and pitch to 0 (no tilt)
            map.easeTo({
                bearing: 0,
                pitch: 0,
                duration: 1000 // Animation duration in milliseconds
            });
        }
    };

    // Custom Drawing Toolbar component
    const DrawingToolbar = () => {
        const activateTool = (tool) => {
            if (map && draw) {
                if (tool === 'trash') {
                    draw.trash();
                } else {
                    draw.changeMode(tool);
                }
            }
        };

        return (
            <div
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '5px',
                    padding: '5px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
            >
                <div style={{ marginBottom: '5px', fontWeight: 'bold', textAlign: 'center', color: 'black' }}>
                    Drawing Tools
                </div>
                <button
                    onClick={() => activateTool('draw_point')}
                    style={{
                        backgroundColor: 'white',
                        border: '1px solid #007bff',
                        borderRadius: '4px',
                        padding: '8px',
                        marginRight: '5px',
                        marginBottom: '5px',
                        cursor: 'pointer',
                        width: '100%',
                        display: 'block',
                        color: '#007bff',
                        transition: 'all 0.3s ease-in-out',
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#007bff';
                        e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.color = '#007bff';
                    }}
                    title="Add Waypoint"
                >
                    Waypoint
                </button>
                <button
                    onClick={() => activateTool('draw_line_string')}
                    style={{
                        backgroundColor: 'white',
                        border: '1px solid #007bff',
                        borderRadius: '4px',
                        padding: '8px',
                        marginRight: '5px',
                        marginBottom: '5px',
                        cursor: 'pointer',
                        width: '100%',
                        display: 'block',
                        color: '#007bcolor',
                        transition: 'all 0.3s ease-in-out',
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#007bff';
                        e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.color = '#007bff';
                    }}
                    title="Add Line"
                >
                    Line
                </button>
                <button
                    onClick={() => activateTool('draw_polygon')}
                    style={{
                        backgroundColor: 'white',
                        border: '1px solid #007bff',
                        borderRadius: '4px',
                        padding: '8px',
                        marginRight: '5px',
                        marginBottom: '5px',
                        cursor: 'pointer',
                        width: '100%',
                        display: 'block',
                        color: '#007bff',
                        transition: 'all 0.3s ease-in-out',
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#007bff';
                        e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.color = '#007bff';
                    }}
                    title="Add Shape"
                >
                    Shape
                </button>
                <button
                    onClick={() => activateTool('trash')}
                    style={{
                        backgroundColor: 'white',
                        border: '1px solid #dc3545',
                        borderRadius: '4px',
                        padding: '8px',
                        cursor: 'pointer',
                        width: '100%',
                        display: 'block',
                        color: '#dc3545',
                        transition: 'all 0.3s ease-in-out',
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#dc3545';
                        e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.color = '#dc3545';
                    }}
                    title="Delete Selected Features"
                >
                    Delete
                </button>
            </div>
        );
    };

    // Compass component
    const CompassButton = () => {
        // Show compass with reduced opacity when facing north and has no tilt
        const isNorthFacing = mapBearing === 0;
        const isFlat = mapPitch === 0;
        const opacity = (isNorthFacing && isFlat) ? 0.6 : 1;

        return (
            <div
                style={{
                    position: 'absolute',
                    top: '250px',
                    right: '10px',
                    zIndex: 2,
                    opacity: opacity,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: 'auto', // Ensure the button is clickable even when the map is in certain states
                }}
            >
                <button
                    onClick={resetNorthAndTilt}
                    style={{
                        backgroundColor: 'black', // Set the background to black
                        border: '1px solid #ddd',
                        borderRadius: '50%',
                        width: '60px', // Slightly larger for better accessibility
                        height: '60px',
                        padding: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 0 0 3px rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: `rotate(${mapBearing}deg)`,
                        transition: 'transform 0.3s ease, box-shadow 0.2s ease',
                        position: 'relative',
                        outline: 'none', // Remove the default button outline on click
                    }}
                    aria-label="Reset North and Tilt"
                >
                    {/* Compass Circle */}
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            border: '2px solid #007bff',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            boxSizing: 'border-box',
                        }}
                    />

                    {/* North Arrow (small top arrow) */}
                    <div
                        style={{
                            position: 'absolute',
                            width: '0',
                            height: '0',
                            borderLeft: '5px solid transparent',
                            borderRight: '5px solid transparent',
                            borderBottom: '10px solid white', // White top arrow
                            top: '6px', // Adjust the position to appear at the top
                            left: '50%',
                            transform: 'translateX(-50%)',
                            pointerEvents: 'none',
                        }}
                    />

                    {/* South Arrow (small bottom arrow) */}
                    <div
                        style={{
                            position: 'absolute',
                            width: '0',
                            height: '0',
                            borderLeft: '5px solid transparent',
                            borderRight: '5px solid transparent',
                            borderTop: '10px solid gray', // Changed to gray for South arrow
                            bottom: '6px', // Adjust the position to appear at the bottom
                            left: '50%',
                            transform: 'translateX(-50%)',
                            pointerEvents: 'none',
                        }}
                    />

                    {/* East Dash */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',  // Center vertically
                            left: '82%',  // Place on the right side (East) of the circle
                            transform: 'translateX(-50%) translateY(-50%)', // Center it properly
                            width: '8px',  // Set width for better visibility
                            height: '2px',
                            backgroundColor: 'gray', // Gray for East dash
                            pointerEvents: 'none',
                        }}
                    />

                    {/* West Dash */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',  // Center vertically
                            left: '18%',  // Place on the left side (West) of the circle
                            transform: 'translateX(-50%) translateY(-50%)', // Center it properly
                            width: '8px',  // Set width for better visibility
                            height: '2px',
                            backgroundColor: 'gray', // Gray for West dash
                            pointerEvents: 'none',
                        }}
                    />

                    {/* Compass Label "N" in the center */}
                    <div
                        style={{
                            position: 'absolute',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: 'white', // White for the "N" label
                            textAlign: 'center',
                            width: '100%',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            userSelect: 'none', // Prevent selection of text
                        }}
                    >
                        N
                    </div>
                </button>
            </div>
        );
    };


    // Alternative: Use Mapbox's built-in compass
    const useBuiltInCompass = false; // Set to true to use Mapbox's compass instead

    useEffect(() => {
        if (map && useBuiltInCompass) {
            // Add the compass control if using built-in compass
            map.addControl(new mapboxgl.NavigationControl({
                visualizePitch: true,
                showCompass: true,
                showZoom: false
            }), 'top-right');
        }
    }, [map, useBuiltInCompass]);

    return (
        <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
            {/* Geocoder Container */}
            <div
                ref={geocoderContainerRef}
                style={{
                    position: 'absolute',
                    zIndex: 1,
                    width: '50%',
                    left: '50%',
                    marginLeft: '-48%',
                    top: '10px'
                }}
            ></div>

            {/* Drawing Toolbar */}

            <DrawingToolbar />

            {/* Map Container */}
            <div
                ref={mapContainer}
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative'
                }}
            />

            {/* Info container for coordinates and elevation */}
            <div id="info" style={{
                position: 'absolute',
                bottom: '70px',
                left: '10px',
                padding: '5px 10px',
                background: 'rgba(0, 0, 0, 0.7)',
                color: '#fff',
                fontSize: '12px',
                borderRadius: '3px',
                zIndex: 1
            }}></div>

            {/* Custom Compass Button (only show if not using built-in) */}
            {!useBuiltInCompass && <CompassButton />}

            {/* Container for Map Style Toggle Buttons */}
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
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
            >
                {['3D-Topo', '3D-Satellite', '2D-Satellite', '2D-Topo'].map((style, index) => (
                    <button
                        key={index}
                        onClick={() => changeMapStyle(style)}
                        style={{
                            marginRight: index < 3 ? '10px' : '0',
                            backgroundColor: 'transparent',
                            border: '2px solid #007bff',
                            padding: '8px 16px',
                            borderRadius: '5px',
                            fontSize: '14px',
                            color: '#007bff',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease-in-out',
                            outline: 'none',
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#007bff';
                            e.target.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#007bff';
                        }}
                        onFocus={(e) => e.target.style.boxShadow = '0 0 5px rgba(0, 123, 255, 0.5)'}
                        onBlur={(e) => e.target.style.boxShadow = 'none'}
                        aria-label={`Switch to ${style} map`}
                    >
                        {style}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Map;