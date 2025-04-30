// components/Map/controls/AreaMeasure.jsx
import { useEffect } from 'react';
import { polygon, length as turfLength, area as turfArea, lineString } from '@turf/turf';

const metersToAcres = (meters) => meters * 0.000247105;

const AreaMeasure = ({ map, draw, onUpdate }) => {
    useEffect(() => {
        if (!map || !draw) return;

        // Add custom area source/layer if not present
        if (!map.getSource('custom-area')) {
            map.addSource('custom-area', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });
            map.addLayer({
                id: 'custom-area-layer',
                type: 'fill',
                source: 'custom-area',
                paint: {
                    'fill-color': '#1976d2',
                    'fill-opacity': 0.25
                }
            });
            map.addLayer({
                id: 'custom-area-outline',
                type: 'line',
                source: 'custom-area',
                paint: {
                    'line-color': '#1976d2',
                    'line-width': 2
                }
            });
        }
        // Add vertex point source/layer for area
        if (!map.getSource('area-vertex-points')) {
            map.addSource('area-vertex-points', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });
            map.addLayer({
                id: 'area-vertex-points-layer',
                type: 'circle',
                source: 'area-vertex-points',
                paint: {
                    'circle-radius': 5,
                    'circle-color': '#1976d2',
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#fff'
                }
            });
        }

        const updateLiveArea = () => {
            if (!draw || typeof draw.getAll !== 'function') return;
            const data = draw.getAll();
            const polygonFeature = data.features.find(f => f.geometry.type === 'Polygon');
            if (!polygonFeature) {
                // No area being drawn
                map.getSource('custom-area').setData({ type: 'FeatureCollection', features: [] });
                map.getSource('area-vertex-points').setData({ type: 'FeatureCollection', features: [] });
                if (onUpdate) onUpdate([], 0);
                return;
            }
            // Update area fill/outline
            map.getSource('custom-area').setData({ type: 'FeatureCollection', features: [polygonFeature] });
            // Vertex points
            const coords = polygonFeature.geometry.coordinates[0] || [];
            map.getSource('area-vertex-points').setData({
                type: 'FeatureCollection',
                features: coords.map(coord => ({
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: coord },
                    properties: {}
                }))
            });
            // Calculate segment distances
            let segments = [];
            let totalPerimeter = 0;
            for (let i = 1; i < coords.length; i++) {
                const seg = lineString([coords[i - 1], coords[i]]);
                const dist = turfLength(seg, { units: 'miles' });
                segments.push({
                    from: coords[i - 1],
                    to: coords[i],
                    distance: dist
                });
                totalPerimeter += dist;
            }
            // Calculate area
            const areaSqMeters = turfArea(polygonFeature);
            const areaAcres = metersToAcres(areaSqMeters);
            if (onUpdate) onUpdate(segments, areaAcres);
        };

        // Listen for draw.update and draw.selectionchange events
        map.on('draw.update', updateLiveArea);
        map.on('draw.selectionchange', updateLiveArea);
        map.on('draw.create', updateLiveArea);
        map.on('draw.delete', updateLiveArea);
        // Initial update
        updateLiveArea();
        return () => {
            map.off('draw.update', updateLiveArea);
            map.off('draw.selectionchange', updateLiveArea);
            map.off('draw.create', updateLiveArea);
            map.off('draw.delete', updateLiveArea);
        };
    }, [map, draw, onUpdate]);
    return null;
};

export default AreaMeasure;
