import React, { useId } from 'react';

/**
 * Simple SVG-style weather icons
 */
export const WeatherIcon = ({ condition, size = 40, color = '#4CAF50' }) => {
  const getIcon = () => {
    const conditionLower = (condition || '').toLowerCase();
    
    // Sunny/Clear
    if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="5" fill={color} />
          <line x1="12" y1="1" x2="12" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="21" x2="12" y2="23" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <line x1="1" y1="12" x2="3" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <line x1="21" y1="12" x2="23" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }
    
    // Partly Cloudy
    if (conditionLower.includes('partly') || conditionLower.includes('mostly')) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle cx="10" cy="8" r="3" fill="#FFB74D" />
          <path d="M16 16c0-2.21-1.79-4-4-4s-4 1.79-4 4h8z" fill="#90A4AE" />
          <path d="M6 16h12c1.1 0 2 .9 2 2s-.9 2-2 2H6c-1.1 0-2-.9-2-2s.9-2 2-2z" fill="#B0BEC5" />
        </svg>
      );
    }
    
    // Cloudy - two overlapping clouds
    if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* Back cloud */}
          <path 
            d="M16 12h-0.8c-0.3-1.6-1.7-2.8-3.4-2.8-1.5 0-2.8 1-3.3 2.3-1.2 0.2-2.1 1.2-2.1 2.5 0 1.4 1.1 2.5 2.5 2.5h7.1c1.2 0 2.2-1 2.2-2.2 0-1.2-1-2.2-2.2-2.3z" 
            fill="#B0BEC5" 
            stroke="#90A4AE" 
            strokeWidth="0.8"
          />
          {/* Front cloud */}
          <path 
            d="M14.5 14.5h-0.6c-0.2-1.2-1.3-2.1-2.6-2.1-1.1 0-2.1 0.7-2.5 1.7-0.9 0.1-1.6 0.9-1.6 1.9 0 1.1 0.8 1.9 1.9 1.9h5.4c0.9 0 1.7-0.7 1.7-1.7s-0.8-1.7-1.7-1.7z" 
            fill="#CFD8DC" 
            stroke="#B0BEC5" 
            strokeWidth="0.8"
          />
        </svg>
      );
    }
    
    // Rain/Showers
    if (conditionLower.includes('rain') || conditionLower.includes('shower') || conditionLower.includes('drizzle')) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* Cloud base */}
          <path
            d="M16 10h-0.8c-0.3-1.6-1.7-2.8-3.4-2.8-1.5 0-2.8 1-3.3 2.3-1.2 0.2-2.1 1.2-2.1 2.5 0 1.4 1.1 2.5 2.5 2.5h7.1c1.2 0 2.2-1 2.2-2.2 0-1.2-1-2.2-2.2-2.3z"
            fill="#B0BEC5"
            stroke="#90A4AE"
            strokeWidth="0.8"
          />
          <path
            d="M14.5 12.5h-0.6c-0.2-1.2-1.3-2.1-2.6-2.1-1.1 0-2.1 0.7-2.5 1.7-0.9 0.1-1.6 0.9-1.6 1.9 0 1.1 0.8 1.9 1.9 1.9h5.4c0.9 0 1.7-0.7 1.7-1.7s-0.8-1.7-1.7-1.7z"
            fill="#CFD8DC"
            stroke="#B0BEC5"
            strokeWidth="0.8"
          />
          {/* Raindrops */}
          <line x1="8" y1="18.5" x2="8" y2="21" stroke="#2196F3" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="12" y1="18.5" x2="12" y2="21.5" stroke="#2196F3" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="16" y1="18.5" x2="16" y2="21" stroke="#2196F3" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    }
    
    // Thunderstorm
    if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M18 10h-1.26A8 8 0 1 0 9 17h9a3 3 0 0 0 0-6z" fill="#546E7A" stroke="#37474F" strokeWidth="1.5" />
          <path d="M13 11l-3 5h2l-1 4 4-6h-2l2-3z" fill="#FFC107" stroke="#FFA000" strokeWidth="1" />
        </svg>
      );
    }
    
    // Snow
    if (conditionLower.includes('snow') || conditionLower.includes('flurr')) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* Cloud base */}
          <path
            d="M16 10h-0.8c-0.3-1.6-1.7-2.8-3.4-2.8-1.5 0-2.8 1-3.3 2.3-1.2 0.2-2.1 1.2-2.1 2.5 0 1.4 1.1 2.5 2.5 2.5h7.1c1.2 0 2.2-1 2.2-2.2 0-1.2-1-2.2-2.2-2.3z"
            fill="#B0BEC5"
            stroke="#90A4AE"
            strokeWidth="0.8"
          />
          <path
            d="M14.5 12.5h-0.6c-0.2-1.2-1.3-2.1-2.6-2.1-1.1 0-2.1 0.7-2.5 1.7-0.9 0.1-1.6 0.9-1.6 1.9 0 1.1 0.8 1.9 1.9 1.9h5.4c0.9 0 1.7-0.7 1.7-1.7s-0.8-1.7-1.7-1.7z"
            fill="#CFD8DC"
            stroke="#B0BEC5"
            strokeWidth="0.8"
          />
          {/* Snowflakes */}
          <circle cx="8" cy="19.5" r="0.9" fill="#E3F2FD" />
          <circle cx="12" cy="20.5" r="0.9" fill="#E3F2FD" />
          <circle cx="16" cy="19.5" r="0.9" fill="#E3F2FD" />
          <circle cx="10" cy="22" r="0.9" fill="#E3F2FD" />
          <circle cx="14" cy="22" r="0.9" fill="#E3F2FD" />
        </svg>
      );
    }
    
    // Fog/Mist
    if (conditionLower.includes('fog') || conditionLower.includes('mist') || conditionLower.includes('haze')) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <line x1="4" y1="10" x2="20" y2="10" stroke="#B0BEC5" strokeWidth="2" strokeLinecap="round" />
          <line x1="4" y1="14" x2="20" y2="14" stroke="#B0BEC5" strokeWidth="2" strokeLinecap="round" />
          <line x1="4" y1="18" x2="20" y2="18" stroke="#B0BEC5" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }
    
    // Wind
    if (conditionLower.includes('wind') || conditionLower.includes('breezy')) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" 
                stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    }
    
    // Default - cloud
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M18 10h-1.26A8 8 0 1 0 9 17h9a3 3 0 0 0 0-6z" fill="#90A4AE" stroke="#78909C" strokeWidth="1.5" />
      </svg>
    );
  };
  
  return <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{getIcon()}</div>;
};

/**
 * Moon phase icon with accurate visual representation
 * Uses mask to reveal illuminated portion (always white except true new moon)
 */
const MOON_PHASE_SEGMENTS = [
  { start: 0.0, end: 0.03, type: 'new' },
  { start: 0.03, end: 0.09, direction: 'right', amount: 0.18 },
  { start: 0.09, end: 0.16, direction: 'right', amount: 0.32 },
  { start: 0.16, end: 0.23, direction: 'right', amount: 0.5 },
  { start: 0.23, end: 0.30, direction: 'right', amount: 0.68 },
  { start: 0.30, end: 0.38, direction: 'right', amount: 0.82 },
  { start: 0.38, end: 0.45, direction: 'right', amount: 0.92 },
  { start: 0.45, end: 0.55, type: 'full' },
  { start: 0.55, end: 0.62, direction: 'left', amount: 0.92 },
  { start: 0.62, end: 0.70, direction: 'left', amount: 0.82 },
  { start: 0.70, end: 0.77, direction: 'left', amount: 0.68 },
  { start: 0.77, end: 0.84, direction: 'left', amount: 0.5 },
  { start: 0.84, end: 0.91, direction: 'left', amount: 0.32 },
  { start: 0.91, end: 0.97, direction: 'left', amount: 0.18 },
  { start: 0.97, end: 1.01, type: 'new' }
];

export const MoonIcon = ({ phase, size = 40, illumination, fraction }) => {
  const phaseLower = (phase || '').toLowerCase();
  const shadowColor = '#2a2a2a';
  
  const cx = 100;
  const cy = 100;
  const r = 85;
  const uniqueId = useId?.() ?? `moon-${size}-${Math.random().toString(36).slice(2, 7)}`;
  const clipId = `${uniqueId}-clip`;
  const gradientId = `${uniqueId}-grad`;
  
  const deriveFraction = () => {
    if (typeof fraction === 'number') {
      return Math.min(1, Math.max(0, fraction));
    }
    if (illumination !== undefined) {
      const illumRatio = Math.min(1, Math.max(0, illumination / 100));
      const angle = Math.acos(Math.max(-1, Math.min(1, 1 - 2 * illumRatio))) / (2 * Math.PI);
      if (Number.isNaN(angle)) return 0;
      if (phaseLower.includes('waning') || phaseLower.includes('last')) {
        return 1 - angle;
      }
      if (phaseLower.includes('full')) return 0.5;
      if (phaseLower.includes('new')) return 0;
      return angle;
    }
    // Fallback based on phase name
    if (phaseLower.includes('first quarter')) return 0.25;
    if (phaseLower.includes('full')) return 0.5;
    if (phaseLower.includes('last quarter')) return 0.75;
    if (phaseLower.includes('waxing')) return 0.2;
    if (phaseLower.includes('waning')) return 0.8;
    return 0;
  };
  
  const frac = deriveFraction();
  const segment = MOON_PHASE_SEGMENTS.find(seg => frac >= seg.start && frac < seg.end) ?? MOON_PHASE_SEGMENTS[0];
  const litAmount = segment.amount ?? (segment.type === 'full' ? 1 : 0);
  const offsetDirection = segment.direction === 'left' ? 1 : -1;
  const offset = segment.direction ? offsetDirection * (1 - litAmount) * r : 0;
  
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <defs>
        <radialGradient id={gradientId}>
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F5F5F5" />
          <stop offset="100%" stopColor="#E8E8E8" />
        </radialGradient>
        <clipPath id={clipId}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      
      {segment.type === 'new' ? (
        <>
          <circle cx={cx} cy={cy} r={r} fill={shadowColor} stroke="#666" strokeWidth="2" />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#9E9E9E" strokeWidth="1" opacity="0.8" />
        </>
      ) : segment.type === 'full' ? (
        <>
          <circle cx={cx} cy={cy} r={r} fill={`url(#${gradientId})`} stroke="#666" strokeWidth="2" />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#9E9E9E" strokeWidth="1" opacity="0.8" />
        </>
      ) : (
        <>
          <circle cx={cx} cy={cy} r={r} fill={`url(#${gradientId})`} stroke="#666" strokeWidth="2" />
          <circle
            cx={cx + offset}
            cy={cy}
            r={r}
            fill={shadowColor}
            clipPath={`url(#${clipId})`}
          />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#9E9E9E" strokeWidth="1" opacity="0.8" />
        </>
      )}
    </svg>
  );
};
