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
                const data = draw.getAll();
                const points = [];
                const labels = [];

                data.features.forEach((line) => {
                    if (line.geometry.type !== 'LineString') return;

                    const coords = line.geometry.coordinates;
                    let totalFeet = 0;

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
                        labels.push({
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: lastCoord
                            },
                            properties: {
                                label: `Total: ${totalFeet.toFixed(1)} ft`
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

            map.on('draw.create', updateLiveMeasurements);
            map.on('draw.update', updateLiveMeasurements);
            map.on('draw.render', updateLiveMeasurements);
            map.on('draw.selectionchange', updateLiveMeasurements);
            map.on('draw.delete', clearMeasurements);
        };

        if (!map.loaded()) {
            map.once('load', onMapLoad);
        } else {
            onMapLoad();
        }

        return () => {
            map.off('draw.create', onMapLoad);
            map.off('draw.update', onMapLoad);
            map.off('draw.render', onMapLoad);
            map.off('draw.selectionchange', onMapLoad);
            map.off('draw.delete', onMapLoad);
        };
    }, [map, draw]);

    return null; // This component doesn't render anything directly
};

export default LineMeasure;
