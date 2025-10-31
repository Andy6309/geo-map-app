# Mobile Responsiveness Implementation

## Overview
The geospatial map application now fully supports mobile devices with responsive layouts and touch-optimized controls.

## Mobile Detection

### Custom Hook: `useIsMobile`
Location: `hooks/useIsMobile.ts`

```typescript
// Detects mobile devices via user agent and screen width
const isMobile = useIsMobile(768); // 768px breakpoint

// Also available: useScreenSize() for 'mobile' | 'tablet' | 'desktop'
```

**Detection Criteria:**
- User agent matching: Android, iOS, Windows Phone, etc.
- Screen width < 768px (customizable breakpoint)
- Responsive to window resize events

## Responsive Components

### 1. MapHeader (`components/Map/MapHeader.tsx`)

**Mobile Optimizations:**
- Compact padding: `px-2 py-2` (vs `px-4 py-3`)
- Shortened title: "Geo Map" (vs "Geospatial Map")
- Hidden user email on mobile
- Hidden attribution links on mobile (shown in desktop)
- Smaller logout button: "Exit" (vs "Logout")
- Truncated email with max-width on desktop

### 2. Main Page (`app/page.tsx`)

**Mobile Adjustments:**
- Dynamic header height: 40px (mobile) vs 57px (desktop)
- Map container adjusts automatically below header

### 3. Map Component (`components/Map/index.jsx`)

**Mobile Features:**
- Mobile detection state with resize listener
- Responsive geocoder: 200px width (mobile) vs 300px (desktop)
- Adjusted positioning: 8px left, 10px top (mobile) vs 16px, 20px (desktop)

### 4. Drawing Toolbar (`components/Map/controls/DrawingToolbar.js`)

**Mobile Layout:**
- **Direction:** Vertical column (mobile) vs horizontal row (desktop)
- **Positioning:** 5px margins (mobile) vs 10px (desktop)
- **Button Size:** 18px icons (mobile) vs 24px (desktop)
- **Padding:** 6px/8px (mobile) vs 10px/12px (desktop)
- **Tools Label:** Hidden on mobile
- **Spacing:** Bottom margin between buttons (mobile) vs right margin (desktop)

### 5. Style Toggle Buttons

**Mobile Styling:**
- **Layout:** Vertical stack (mobile) vs horizontal row (desktop)
- **Position:** 5px right, 10px bottom (mobile) vs 10px, 25px (desktop)
- **Button Size:** 11px font, 4px/8px padding (mobile) vs 14px font, 6px/12px padding (desktop)
- **Spacing:** 2px vertical margin (mobile) vs 5px horizontal margin (desktop)

## Breakpoints

| Device Type | Width Range | Behavior |
|------------|-------------|----------|
| Mobile | < 768px | Compact layout, vertical stacks, smaller controls |
| Tablet | 768px - 1023px | Desktop layout with some optimizations |
| Desktop | ≥ 1024px | Full-featured layout |

## Touch Optimizations

### Map Interactions (Built-in Mapbox GL)
- **Touch Zoom:** Pinch to zoom enabled
- **Touch Rotate:** Two-finger rotation enabled
- **Touch Pitch:** Two-finger tilt enabled
- **Drag Pan:** Single-finger panning enabled

### Button Sizes
- Minimum touch target: 40px on mobile
- Increased padding for easier tapping
- Proper spacing to prevent accidental taps

## Testing Mobile Responsiveness

### Browser DevTools
1. Open Chrome/Edge DevTools (F12)
2. Click "Toggle Device Toolbar" (Ctrl+Shift+M)
3. Select device: iPhone, iPad, Galaxy, etc.
4. Test portrait and landscape orientations

### Real Device Testing
1. Access via mobile browser: `http://your-domain.com`
2. Test on iOS Safari and Android Chrome
3. Verify touch gestures work correctly
4. Check that all controls are accessible

## Known Mobile Considerations

### Performance
- Map tiles load progressively on slower connections
- Consider reducing initial zoom level for mobile
- Waypoint/line/area loading optimized for mobile networks

### UX Improvements
- Modals (LineModal, AreaModal, WaypointButton) inherit responsive behavior
- Coordinate display toggle works on mobile
- All drawing tools accessible via vertical toolbar

### Future Enhancements
- Consider bottom sheet for mobile modals
- Add swipe gestures for style switching
- Implement mobile-specific map controls
- Add haptic feedback for touch interactions

## CSS Framework

The application uses **Tailwind CSS** for responsive utilities:
- `sm:` - Small screens (640px+)
- `md:` - Medium screens (768px+)
- `lg:` - Large screens (1024px+)
- `xl:` - Extra large screens (1280px+)

## Viewport Configuration

Ensure proper viewport meta tag in `app/layout.tsx`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
```

## Mobile-Specific Features

### Compact Header
- Smaller logo/title
- Essential controls only
- Quick exit button

### Optimized Controls
- Larger touch targets
- Vertical stacking for better thumb reach
- Reduced visual clutter

### Responsive Geocoder
- Narrower search box
- Closer to screen edge
- Touch-friendly input

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome Mobile | Latest | ✅ Full |
| Safari iOS | 12+ | ✅ Full |
| Samsung Internet | Latest | ✅ Full |
| Firefox Mobile | Latest | ✅ Full |
| Edge Mobile | Latest | ✅ Full |

## Troubleshooting

### Issue: Controls too small on mobile
**Solution:** Adjust `isMobile` breakpoint in hook or component

### Issue: Map not filling screen
**Solution:** Check header height calculation in `app/page.tsx`

### Issue: Buttons overlapping
**Solution:** Adjust z-index values or positioning in mobile mode

### Issue: Touch gestures not working
**Solution:** Verify Mapbox GL touch options are enabled in map initialization

## Performance Tips

1. **Lazy load components** - Use Next.js dynamic imports
2. **Optimize images** - Use WebP format for icons
3. **Reduce initial bundle** - Code split by route
4. **Cache map tiles** - Enable service worker caching
5. **Debounce resize events** - Prevent excessive re-renders

## Accessibility

- Touch targets meet WCAG 2.1 minimum size (44x44px)
- Proper ARIA labels on interactive elements
- Keyboard navigation supported (desktop)
- Screen reader compatible
- High contrast mode support

---

**Last Updated:** October 31, 2025
**Version:** 1.0.0
