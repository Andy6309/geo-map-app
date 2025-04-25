// components/controls/LineMeasure.jsx
import { useEffect } from 'react';
import { lineString, length as turfLength } from '@turf/turf';

const LineMeasure = ({ map, draw }) => {
    useEffect(() => {
        if (!map || !draw) return;

        const onMapLoad = () => {
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
                const points = [];
                const labels = [];
                let totalFeet = 0;
            
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
            
                        if (i > 0) {
                            const seg = lineString([coords[i - 1], coords[i]]);
                            const distFeet = turfLength(seg, { units: 'kilometers' }) * 3280.84;
                            totalFeet += distFeet;
            
                            const mid = [
                                (coords[i - 1][0] + coords[i][0]) / 2,
                                (coords[i - 1][1] + coords[i][1]) / 2
                            ];
            
                            labels.push({
                                type: 'Feature',
                                geometry: {
                                    type: 'Point',
                                    coordinates: mid
                                },
                                properties: {
                                    label: `${distFeet.toFixed(1)} ft`
                                }
                            });
                        }
                    }
            
                    if (coords.length > 1) {
                        const lastCoord = coords[coords.length - 1];
            
                        // Convert total distance to miles if it exceeds the feet-to-mile threshold
                        let totalDistance = totalFeet;
                        let unit = 'ft';
                        if (totalFeet >= 5280) { // 1 mile = 5280 feet
                            totalDistance = totalFeet / 5280;
                            unit = 'miles';
                        }
            
                        labels.push({
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: lastCoord
                            },
                            properties: {
                                label: `Total: ${totalDistance >= 5280 ? totalDistance.toFixed(2) : totalDistance.toFixed(1)} ${unit}`
                            }
                        });
                    }
                });
            
                map.getSource('vertex-points')?.setData({
                    type: 'FeatureCollection',
                    features: points
                });
            
                map.getSource('distance-labels')?.setData({
                    type: 'FeatureCollection',
                    features: labels
                });
            };

            const clearMeasurements = () => {
                const empty = { type: 'FeatureCollection', features: [] };
                map.getSource('vertex-points')?.setData(empty);
                map.getSource('distance-labels')?.setData(empty);
            };

            if (draw && typeof draw.on === 'function') {
                draw.on('draw.create', updateLiveMeasurements);
                draw.on('draw.update', updateLiveMeasurements);
                draw.on('draw.render', updateLiveMeasurements);
                draw.on('draw.selectionchange', updateLiveMeasurements);
                draw.on('draw.delete', clearMeasurements);
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
