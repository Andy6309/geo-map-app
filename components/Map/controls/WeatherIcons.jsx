import React, { useId } from 'react';
import { calculateMoonPhase } from '@/lib/services/weatherService';

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

const clamp01 = (v) => Math.min(1, Math.max(0, v ?? 0));

export const MOON_DAY_CONFIG = [
  { day: 0, label: 'New Moon', illumination: 0, waxing: true },
  { day: 1, label: 'Waxing Crescent 1', illumination: 3, waxing: true },
  { day: 2, label: 'Waxing Crescent 2', illumination: 7, waxing: true },
  { day: 3, label: 'Waxing Crescent 3', illumination: 10, waxing: true },
  { day: 4, label: 'Waxing Crescent 4', illumination: 14, waxing: true },
  { day: 5, label: 'Waxing Crescent 5', illumination: 17, waxing: true },
  { day: 6, label: 'Waxing Crescent 6', illumination: 21, waxing: true },
  { day: 7, label: 'First Quarter', illumination: 25, waxing: true },
  { day: 8, label: 'Waxing Gibbous 1', illumination: 32, waxing: true },
  { day: 9, label: 'Waxing Gibbous 2', illumination: 39, waxing: true },
  { day: 10, label: 'Waxing Gibbous 3', illumination: 46, waxing: true },
  { day: 11, label: 'Waxing Gibbous 4', illumination: 54, waxing: true },
  { day: 12, label: 'Waxing Gibbous 5', illumination: 61, waxing: true },
  { day: 13, label: 'Waxing Gibbous 6', illumination: 68, waxing: true },
  { day: 14, label: 'Full Moon', illumination: 100, waxing: false },
  { day: 15, label: 'Waning Gibbous 1', illumination: 93, waxing: false },
  { day: 16, label: 'Waning Gibbous 2', illumination: 86, waxing: false },
  { day: 17, label: 'Waning Gibbous 3', illumination: 79, waxing: false },
  { day: 18, label: 'Waning Gibbous 4', illumination: 71, waxing: false },
  { day: 19, label: 'Waning Gibbous 5', illumination: 64, waxing: false },
  { day: 20, label: 'Waning Gibbous 6', illumination: 57, waxing: false },
  { day: 21, label: 'Last Quarter', illumination: 50, waxing: false },
  { day: 22, label: 'Waning Crescent 1', illumination: 43, waxing: false },
  { day: 23, label: 'Waning Crescent 2', illumination: 36, waxing: false },
  { day: 24, label: 'Waning Crescent 3', illumination: 29, waxing: false },
  { day: 25, label: 'Waning Crescent 4', illumination: 21, waxing: false },
  { day: 26, label: 'Waning Crescent 5', illumination: 14, waxing: false },
  { day: 27, label: 'Waning Crescent 6', illumination: 7, waxing: false },
  { day: 28, label: 'Waning Crescent 7', illumination: 3, waxing: false },
  { day: 29, label: 'Waning Crescent 8', illumination: 1, waxing: false },
];

export const getMoonDay = (date) => {
  const { dayNumber } = calculateMoonPhase(date);
  return dayNumber;
};

export const MoonIcon = ({ illuminationPct = 0, waxing = true, size = 40 }) => {
  const cx = 100;
  const cy = 100;
  const r = 85;
  const shadowColor = '#1b1b1b';

  const id = useId();
  const litMaskId = `lit-mask-${id}`;
  const shadowMaskId = `shadow-mask-${id}`;

  const illumRatio = clamp01(illuminationPct / 100);

  if (illumRatio <= 0.01) {
    return (
      <svg width={size} height={size} viewBox="0 0 200 200">
        <circle cx={cx} cy={cy} r={r} fill={shadowColor} stroke="#9E9E9E" strokeWidth="1" opacity="0.8" />
      </svg>
    );
  }

  if (illumRatio >= 0.99) {
    return (
      <svg width={size} height={size} viewBox="0 0 200 200">
        <circle cx={cx} cy={cy} r={r} fill="#f0f0f0" stroke="#9E9E9E" strokeWidth="1" opacity="0.8" />
      </svg>
    );
  }

  const k = 2 * illumRatio - 1;
  const ellipseRx = Math.max(Math.abs(k) * r, 1);

  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <defs>
        <mask id={litMaskId}>
          <rect width="200" height="200" fill="black" />
          <circle cx={cx} cy={cy} r={r} fill="white" />
          <ellipse
            cx={cx + (waxing ? -1 : 1) * (r - ellipseRx)}
            cy={cy}
            rx={ellipseRx}
            ry={r}
            fill="black"
          />
        </mask>

        <mask id={shadowMaskId}>
          <rect width="200" height="200" fill="black" />
          <circle cx={cx} cy={cy} r={r} fill="white" />
          <ellipse
            cx={cx + (waxing ? 1 : -1) * (r - ellipseRx)}
            cy={cy}
            rx={ellipseRx}
            ry={r}
            fill="black"
          />
        </mask>
      </defs>

      <circle cx={cx} cy={cy} r={r} fill="#f0f0f0" mask={`url(#${litMaskId})`} />
      <circle cx={cx} cy={cy} r={r} fill={shadowColor} mask={`url(#${shadowMaskId})`} />
      <circle cx={cx} cy={cy} r={r} stroke="#9E9E9E" strokeWidth="1" fill="none" opacity="0.8" />
    </svg>
  );
};
