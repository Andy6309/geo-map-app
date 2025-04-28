// components/controls/LineMeasure.jsx
import { useEffect } from 'react';
import { lineString, length as turfLength } from '@turf/turf';

console.log('Custom LineMeasure in use');
const LineMeasure = ({ map, draw, onUpdate }) => {
    useEffect(() => {
        if (!map || !draw) return;

        const onMapLoad = () => {
            // Add custom line source/layer FIRST
            if (!map.getSource('custom-line')) {
                map.addSource('custom-line', {
                    type: 'geojson',
                    data: { type: 'FeatureCollection', features: [] }
                });
                map.addLayer({
                    id: 'custom-line-layer',
                    type: 'line',
                    source: 'custom-line',
                    layout: {
                        'line-cap': 'round',
                        'line-join': 'round'
                    },
                    paint: {
                        'line-color': '#ff6600', // Make this dynamic if needed
                        'line-width': 4
                    }
                });
            }
            // Always move custom line layer above basemap (but below points/labels)
            if (map.getLayer('custom-line-layer')) {
                if (map.getLayer('vertex-points-layer')) {
                    map.moveLayer('custom-line-layer', 'vertex-points-layer');
                }
            }

            // Add vertex point source/layer
            if (!map.getSource('vertex-points')) {
                map.addSource('vertex-points', {
                    type: 'geojson',
                    data: { type: 'FeatureCollection', features: [] }
                });

                map.addLayer({
                    id: 'vertex-points-layer',
                    type: 'circle',
                    source: 'vertex-points',
                    paint: {
                        'circle-radius': 5,
                        'circle-color': '#007bff',
                        'circle-stroke-width': 1,
                        'circle-stroke-color': '#fff'
                    }
                });
            }

            // Add distance label source/layer
            if (!map.getSource('distance-labels')) {
                map.addSource('distance-labels', {
                    type: 'geojson',
                    data: { type: 'FeatureCollection', features: [] }
                });

                map.addLayer({
                    id: 'distance-labels-layer',
                    type: 'symbol',
                    source: 'distance-labels',
                    layout: {
                        'text-field': ['get', 'label'],
                        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                        'text-size': 14,
                        'text-offset': [0, 1.5],
                        'text-anchor': 'top'
                    },
                    paint: {
                        'text-color': '#000',
                        'text-halo-color': '#fff',
                        'text-halo-width': 2
                    }
                });
            }

            const updateLiveMeasurements = () => {
                if (!draw || typeof draw.getAll !== 'function') return;
                const data = draw.getAll();
                console.log('LineMeasure updateLiveMeasurements features:', data.features);

                const points = [];
                const labels = [];
                let totalFeet = 0;
                
                let segments = [];
                let totalYards = 0;
                data.features.forEach((line) => {
                    if (line.geometry.type !== 'LineString') return;

                    const coords = line.geometry.coordinates;

                    for (let i = 0; i < coords.length; i++) {
                        points.push({
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: coords[i]
                            },
                            properties: {}
                        });
                        // For every segment, add a segment label in yards
                        if (i > 0) {
                            const seg = lineString([coords[i - 1], coords[i]]);
                            const distYards = turfLength(seg, { units: 'kilometers' }) * 1093.6133;
                            totalYards += distYards;
                            segments.push(`${distYards.toFixed(1)} yd`);
                            // Add segment label at midpoint
                            const midLng = (coords[i - 1][0] + coords[i][0]) / 2;
                            const midLat = (coords[i - 1][1] + coords[i][1]) / 2;
                            labels.push({
                                type: 'Feature',
                                geometry: {
                                    type: 'Point',
                                    coordinates: [midLng, midLat]
                                },
                                properties: {
                                    label: `${distYards.toFixed(1)} yd`
                                }
                            });
                        }
                    }
                    // After all segments, add a total label at the end
                    if (coords.length > 1) {
                        const lastCoord = coords[coords.length - 1];
                        let totalLabel = '';
                        if (totalYards >= 1760) {
                            totalLabel = `Total: ${(totalYards / 1760).toFixed(2)} mi`;
                        } else {
                            totalLabel = `Total: ${totalYards.toFixed(1)} yd`;
                        }
                        labels.push({
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: lastCoord
                            },
                            properties: {
                                label: totalLabel
                            }
                        });
                    }
                });

                // Update custom line source with a single LineString (if any)
                let lineFeature = data.features.find(f => f.geometry.type === 'LineString');
                if (!lineFeature) {
                    // If only one point exists, create a degenerate LineString for feedback
                    const allPoints = data.features.filter(f => f.geometry.type === 'Point');
                    if (allPoints.length === 1) {
                        lineFeature = {
                            type: 'Feature',
                            geometry: {
                                type: 'LineString',
                                coordinates: [allPoints[0].geometry.coordinates, allPoints[0].geometry.coordinates]
                            },
                            properties: {}
                        };
                    }
                }
                if (lineFeature) {
                    map.getSource('custom-line')?.setData({
                        type: 'FeatureCollection',
                        features: [lineFeature]
                    });
                } else {
                    map.getSource('custom-line')?.setData({
                        type: 'FeatureCollection',
                        features: []
                    });
                }
                // Ensure custom line layer is above the basemap but below points/labels
                if (map.getLayer('custom-line-layer')) {
                    if (map.getLayer('vertex-points-layer')) {
                        map.moveLayer('custom-line-layer', 'vertex-points-layer');
                    }
                }

                map.getSource('vertex-points')?.setData({
                    type: 'FeatureCollection',
                    features: points
                });

                map.getSource('distance-labels')?.setData({
                    type: 'FeatureCollection',
                    features: labels
                });

                // Call onUpdate with live segments and total (for modal)
                if (typeof onUpdate === 'function') {
                    let totalDisplay = '';
                    if (totalYards >= 1760) {
                        totalDisplay = `${(totalYards / 1760).toFixed(2)} mi`;
                    } else {
                        totalDisplay = `${totalYards.toFixed(1)} yd`;
                    }
                    onUpdate(segments, totalDisplay);
                }
            };

            const clearMeasurements = () => {
                const empty = { type: 'FeatureCollection', features: [] };
                map.getSource('vertex-points')?.setData(empty);
                map.getSource('distance-labels')?.setData(empty);
            };

            if (draw && typeof draw.on === 'function') {
                draw.on('draw.create', (e) => {
                    console.log('[DEBUG] draw.create', e, draw.getAll());
                    updateLiveMeasurements();
                });
                draw.on('draw.update', (e) => {
                    console.log('[DEBUG] draw.update', e, draw.getAll());
                    console.log('[DEBUG] draw.render', e);
                    updateLiveMeasurements();
                });
                draw.on('draw.selectionchange', (e) => {
                    console.log('[DEBUG] draw.selectionchange', e);
                    updateLiveMeasurements();
                });
                draw.on('draw.delete', (e) => {
                    console.log('[DEBUG] draw.delete', e);
                    clearMeasurements();
                });
            }
        };

        if (!map.loaded()) {
            map.once('load', onMapLoad);
        } else {
            onMapLoad();
        }

        return () => {
            if (draw && typeof draw.off === 'function') {
                draw.off('draw.create', updateLiveMeasurements);
                draw.off('draw.update', updateLiveMeasurements);
                draw.off('draw.render', updateLiveMeasurements);
                draw.off('draw.selectionchange', updateLiveMeasurements);
                draw.off('draw.delete', clearMeasurements);
            }
        };
    }, [map, draw]);

    return null; // This component doesn't render anything directly
};

export default LineMeasure;
