# Boundary Layers Troubleshooting Guide

## Current Implementation

### Data Sources
- **States**: Natural Earth Data via PublicaMundi
- **Counties**: OpenDataDE GeoJSON (2018, 20m resolution)

### How to Test County Boundaries

1. **Open the Layers Modal**
   - Desktop: Click the Layers button (layer icon) in top-right toolbar
   - Mobile: Tap the orange Map icon in bottom toolbar

2. **Enable Counties for a State**
   - Toggle a state checkbox (e.g., California, Texas, New York)
   - Counties should appear as bright green outlines

3. **Debug Mode**
   - Open browser console (F12)
   - Enable a state's counties
   - Look for: `County filter applied for states: [...] FIPS: [...]`
   - Click on a visible county line
   - Console will show: `County clicked - properties: {...}`

## Common Issues & Solutions

### Issue 1: Counties Not Showing

**Symptoms**: State outlines work, but county lines don't appear when toggled

**Debugging Steps**:
1. Open browser console
2. Toggle a state's counties
3. Check for the log message with FIPS codes
4. Look for any error messages about the GeoJSON source

**Possible Causes**:
- GeoJSON source is slow to load (large file ~8MB)
- Property name mismatch in filtering
- CORS issues with the data source

**Solutions**:
- Wait 5-10 seconds after page load before toggling counties
- Check Network tab in DevTools to see if `us_counties_20m_2018.json` loaded
- Try a different state (some states have more counties than others)

### Issue 2: Wrong Counties Showing

**Symptoms**: Counties from wrong state appear

**Cause**: Property name mismatch in filtering logic

**Solution**: The code tries multiple property names:
- `fips`, `FIPS`, `id`, `GEOID` (with string slicing)
- `STATE`, `STATEFP` (exact match)

Click on a county to see which property contains the FIPS code.

### Issue 3: Performance Issues

**Symptoms**: Map lags when toggling counties

**Cause**: Large GeoJSON file (~3,200 county features)

**Solutions**:
1. Use a more simplified dataset (lower resolution)
2. Implement lazy loading per state
3. Use vector tiles (requires premium Mapbox account)

## Alternative Data Sources

If the current source doesn't work, try these alternatives:

### Option 1: Eric Celeste's US GeoJSON
```javascript
counties: {
  type: 'geojson',
  data: 'https://eric.clst.org/assets/wiki/uploads/Stuff/gz_2010_us_050_00_5m.json'
}
```
- Property: `STATE` (2-digit FIPS)
- Size: ~15MB (detailed)

### Option 2: Plotly's County FIPS
```javascript
counties: {
  type: 'geojson',
  data: 'https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json'
}
```
- Property: `id` (5-digit FIPS, slice first 2 digits)
- Size: ~25MB (very detailed)

### Option 3: US Census Bureau (Direct)
```javascript
counties: {
  type: 'geojson',
  data: 'https://www2.census.gov/geo/tiger/GENZ2018/shp/cb_2018_us_county_500k.zip'
}
```
- Requires shapefile to GeoJSON conversion
- Most accurate, but largest file size

## Verifying the Fix

### Test Checklist

1. **State Boundaries**
   - [ ] State outlines visible by default
   - [ ] Bright green color (#00ff00)
   - [ ] Toggle on/off works
   - [ ] Persists through style changes

2. **County Boundaries**
   - [ ] Hidden by default
   - [ ] Appear when state is toggled on
   - [ ] Bright green color (#00ff00)
   - [ ] Only show counties for enabled states
   - [ ] Multiple states can be enabled simultaneously

3. **Performance**
   - [ ] No lag when toggling states
   - [ ] Counties load within 2-3 seconds
   - [ ] Map remains responsive

4. **Accuracy**
   - [ ] County lines align with state boundaries
   - [ ] No gaps or overlaps
   - [ ] Correct counties for each state

## Current Filter Logic

The county filter checks multiple property formats:

```javascript
const filters = enabledFIPS.flatMap(fips => [
  ['==', ['slice', ['to-string', ['get', 'fips']], 0, 2], fips],
  ['==', ['slice', ['to-string', ['get', 'FIPS']], 0, 2], fips],
  ['==', ['slice', ['to-string', ['get', 'id']], 0, 2], fips],
  ['==', ['slice', ['to-string', ['get', 'GEOID']], 0, 2], fips],
  ['==', ['get', 'STATE'], fips],
  ['==', ['get', 'STATEFP'], fips]
]);
```

This tries to match:
- First 2 digits of FIPS codes (for 5-digit county codes)
- Exact match of STATE property (for 2-digit state codes)

## Getting Help

If counties still don't work:

1. **Check Console Logs**
   - Look for "County filter applied" message
   - Check for any error messages
   - Click on a county to see its properties

2. **Verify Data Load**
   - Network tab → Filter by "json"
   - Find the counties GeoJSON file
   - Check if it loaded successfully (200 status)
   - Check file size (should be several MB)

3. **Test with Different State**
   - Try California (06) - has 58 counties
   - Try Texas (48) - has 254 counties
   - Try Rhode Island (44) - has 5 counties (easier to see)

4. **Fallback Option**
   - If counties don't work, state boundaries still function
   - Can manually zoom to see state-level detail
   - Consider using satellite imagery for reference
