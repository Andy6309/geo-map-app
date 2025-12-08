import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faCloudSun, 
  faTemperatureHigh, 
  faWind, 
  faTint,
  faEye,
  faCompass,
  faSync
} from '@fortawesome/free-solid-svg-icons';
import { getCurrentWeather, getForecast, getWeeklyForecast, getAstronomicalData, isWithinUnitedStates } from '@/lib/services/weatherService';
import { WeatherIcon, MoonIcon } from './WeatherIcons';

const formatDateWithOrdinal = (date = new Date()) => {
  const day = date.getDate();
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = day % 100;
  const suffix = suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.getFullYear();
  return `${month} ${day}${suffix}, ${year}`;
};

const isWaxingPhase = (phase, fraction) => {
  const lower = (phase || '').toLowerCase();
  if (lower.includes('waxing') || lower.includes('first')) return true;
  if (lower.includes('waning') || lower.includes('last') || lower.includes('third')) return false;
  if (typeof fraction === 'number') return fraction <= 0.5;
  return true;
};

const normalizePhaseLabel = (label) => {
  if (!label) return 'moon phase';
  return label.replace(/\s+\d+$/i, '');
};

const formatMoonDescriptor = (phase, fraction, dayName) => {
  const baseLabel = normalizePhaseLabel(dayName) || normalizePhaseLabel(phase) || 'moon phase';
  const trend = isWaxingPhase(phase, fraction) ? 'getting brighter' : 'getting dimmer';
  return `${baseLabel}, ${trend}`;
};

// Ensure accessibility for react-modal
if (typeof window !== 'undefined') {
  const nextRoot = document.getElementById('__next');
  if (nextRoot) {
    Modal.setAppElement('#__next');
  } else {
    Modal.setAppElement('body');
  }
}

export const WeatherModal = ({ isOpen, onClose, map, isMobile }) => {
  const [activeTab, setActiveTab] = useState('current');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [weeklyForecast, setWeeklyForecast] = useState([]);
  const [astroData, setAstroData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [expandedDays, setExpandedDays] = useState({});
  const [selectedHourlyDate, setSelectedHourlyDate] = useState(new Date()); // Selected date for hourly forecast

  // Fetch weather when modal opens or location changes
  useEffect(() => {
    if (isOpen && map) {
      fetchWeatherData();
    }
  }, [isOpen, map]);

  const fetchWeatherData = async () => {
    if (!map) return;

    setLoading(true);
    setError(null);

    try {
      const center = map.getCenter();
      const lat = center.lat;
      const lng = center.lng;

      // Check if location is within US
      if (!isWithinUnitedStates(lat, lng)) {
        setError('Weather data is only available for locations within the United States and territories.');
        setLoading(false);
        return;
      }

      setLocation({ lat, lng });

      // Fetch current weather
      const currentWeather = await getCurrentWeather(lat, lng);
      setWeather(currentWeather);

      // Fetch 7-day hourly forecast (168 hours)
      const forecastData = await getForecast(lat, lng, 168);
      setForecast(forecastData);

      // Fetch weekly forecast
      const weeklyData = await getWeeklyForecast(lat, lng);
      setWeeklyForecast(weeklyData);

      // Get astronomical data
      const astro = getAstronomicalData(lat, lng);
      setAstroData(astro);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError(err.message || 'Failed to fetch weather data');
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchWeatherData();
  };

  const formatVisibility = (meters) => {
    if (!meters) return 'N/A';
    const miles = meters * 0.000621371;
    return `${miles.toFixed(1)} mi`;
  };

  const formatPressure = (hPa) => {
    if (!hPa) return 'N/A';
    const inHg = hPa * 0.02953;
    return `${inHg.toFixed(2)} inHg`;
  };

  const modalStyles = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      zIndex: 10000,
      display: 'flex',
      alignItems: isMobile ? 'flex-end' : 'center',
      justifyContent: 'center',
    },
    content: {
      position: 'relative',
      inset: 'auto',
      width: isMobile ? '100%' : '500px',
      maxWidth: isMobile ? '100%' : '90vw',
      maxHeight: isMobile ? '85vh' : '80vh',
      padding: 0,
      border: 'none',
      borderRadius: isMobile ? '20px 20px 0 0' : '12px',
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={modalStyles}
      contentLabel="Weather Information"
    >
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FontAwesomeIcon icon={faCloudSun} style={{ fontSize: '24px', color: '#4CAF50' }} />
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Weather</h2>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleRefresh}
            disabled={loading}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#4CAF50',
              cursor: loading ? 'not-allowed' : 'pointer',
              padding: '8px',
              borderRadius: '4px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <FontAwesomeIcon icon={faSync} spin={loading} />
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #333',
        backgroundColor: '#2a2a2a',
        overflowX: 'auto',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        {['current', 'hourly', 'weekly', 'moon'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: activeTab === tab ? '#1a1a1a' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #4CAF50' : '2px solid transparent',
              color: activeTab === tab ? '#4CAF50' : '#999',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              transition: 'all 0.2s',
              textTransform: 'capitalize',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab) e.target.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab) e.target.style.color = '#999';
            }}
          >
            {tab === 'moon' ? 'Moon Phase' : tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
      }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <FontAwesomeIcon icon={faSync} spin style={{ fontSize: '48px', color: '#4CAF50' }} />
            <p style={{ marginTop: '20px', color: '#999' }}>Loading weather data...</p>
          </div>
        )}

        {error && (
          <div style={{
            padding: '20px',
            backgroundColor: '#ff5252',
            borderRadius: '8px',
            marginBottom: '20px',
          }}>
            <p style={{ margin: 0, color: '#fff' }}>{error}</p>
          </div>
        )}

        {!loading && !error && weather && activeTab === 'current' && (
          <>
            {/* Location */}
            {location && (
              <div style={{ marginBottom: '20px', color: '#999', fontSize: '14px' }}>
                <p style={{ margin: 0 }}>
                  {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°
                </p>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>
                  Source: {weather.source}
                </p>
              </div>
            )}

            {/* Current Conditions */}
            <div style={{
              backgroundColor: '#2a2a2a',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', marginBottom: '15px' }}>
                <div>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#4CAF50' }}>
                    {Math.round(weather.temperatureFahrenheit)}°F
                  </div>
                  <div style={{ fontSize: '16px', color: '#999', marginTop: '5px' }}>
                    Feels like {Math.round(weather.feelsLikeFahrenheit || weather.temperatureFahrenheit)}°F
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
                  <WeatherIcon condition={weather.condition} size={120} />
                </div>
              </div>
              <div style={{ fontSize: '18px', marginBottom: '10px' }}>
                {weather.condition}
              </div>
              {weather.description && (
                <div style={{ fontSize: '14px', color: '#999', lineHeight: '1.5' }}>
                  {weather.description}
                </div>
              )}
            </div>

            {/* Weather Details Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '15px',
              marginBottom: '20px',
            }}>
              {/* Wind */}
              <div style={{
                backgroundColor: '#2a2a2a',
                borderRadius: '8px',
                padding: '15px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <FontAwesomeIcon icon={faWind} style={{ color: '#4CAF50' }} />
                  <span style={{ fontSize: '14px', color: '#999' }}>Wind</span>
                </div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  {weather.windSpeedMph !== undefined ? `${Math.round(weather.windSpeedMph)} mph` : 'N/A'}
                </div>
                {weather.windDirection && (
                  <div style={{ fontSize: '14px', color: '#999', marginTop: '4px' }}>
                    <FontAwesomeIcon icon={faCompass} style={{ marginRight: '5px' }} />
                    {weather.windDirection}
                  </div>
                )}
              </div>

              {/* Humidity */}
              <div style={{
                backgroundColor: '#2a2a2a',
                borderRadius: '8px',
                padding: '15px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <FontAwesomeIcon icon={faTint} style={{ color: '#2196F3' }} />
                  <span style={{ fontSize: '14px', color: '#999' }}>Humidity</span>
                </div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  {weather.humidity}%
                </div>
              </div>

              {/* Visibility */}
              {weather.visibilityMeters && (
                <div style={{
                  backgroundColor: '#2a2a2a',
                  borderRadius: '8px',
                  padding: '15px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <FontAwesomeIcon icon={faEye} style={{ color: '#FF9800' }} />
                    <span style={{ fontSize: '14px', color: '#999' }}>Visibility</span>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                    {formatVisibility(weather.visibilityMeters)}
                  </div>
                </div>
              )}

              {/* Pressure */}
              {weather.pressureHPa && (
                <div style={{
                  backgroundColor: '#2a2a2a',
                  borderRadius: '8px',
                  padding: '15px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <FontAwesomeIcon icon={faTemperatureHigh} style={{ color: '#9C27B0' }} />
                    <span style={{ fontSize: '14px', color: '#999' }}>Pressure</span>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                    {formatPressure(weather.pressureHPa)}
                  </div>
                </div>
              )}
            </div>

            {/* Sunrise/Sunset */}
            {weather.sunrise && weather.sunset && (
              <div style={{
                backgroundColor: '#2a2a2a',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
              }}>
                <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#fff' }}>
                  Sun & Moon
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>Sunrise</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFB74D' }}>
                      {weather.sunrise.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>Sunset</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#FF6F00' }}>
                      {weather.sunset.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </div>
                  </div>
                  {weather.moonPhase && (
                    <>
                      <div>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>Moon Phase</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#B39DDB' }}>
                          {weather.moonPhase}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>Illumination</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#B39DDB' }}>
                          {Math.round(weather.moonIllumination || 0)}%
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

          </>
        )}

        {/* Hourly Tab */}
        {!loading && !error && activeTab === 'hourly' && forecast.length > 0 && (
          <div>
            {/* Calendar Date Selector */}
            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontSize: '14px', color: '#999', marginBottom: '8px' }}>Select Date</div>
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                overflowX: 'auto', 
                paddingBottom: '8px',
                scrollbarWidth: 'thin',
                scrollbarColor: '#4CAF50 #2a2a2a',
              }}>
                {(() => {
                  const dates = [];
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  
                  // Generate 7 days of dates
                  for (let i = 0; i < 7; i++) {
                    const date = new Date(today);
                    date.setDate(today.getDate() + i);
                    dates.push(date);
                  }
                  
                  return dates.map((date, index) => {
                    const isSelected = selectedHourlyDate.toDateString() === date.toDateString();
                    const dayLabel = index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' });
                    const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    
                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => setSelectedHourlyDate(date)}
                        style={{
                          minWidth: '80px',
                          padding: '12px',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid #4CAF50' : '1px solid #333',
                          backgroundColor: isSelected ? '#4CAF50' : '#2a2a2a',
                          color: isSelected ? '#fff' : '#999',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: isSelected ? 'bold' : 'normal',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = '#333';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = '#2a2a2a';
                        }}
                      >
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>{dayLabel}</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{dateLabel}</div>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>
            
            <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#fff' }}>
              Hourly Forecast
            </h3>
            <div style={{
              display: 'flex',
              overflowX: 'auto',
              gap: '10px',
              paddingBottom: '10px',
            }}>
              {forecast.filter((item) => {
                const itemDate = new Date(item.timestamp);
                const now = new Date();
                
                // Only show future data (from current hour forward)
                if (itemDate < now) return false;
                
                return itemDate.getDate() === selectedHourlyDate.getDate() && 
                       itemDate.getMonth() === selectedHourlyDate.getMonth() &&
                       itemDate.getFullYear() === selectedHourlyDate.getFullYear();
              }).map((item, index) => {
                const time = new Date(item.timestamp);
                const hour = time.getHours();
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour % 12 || 12;

                return (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#2a2a2a',
                      borderRadius: '8px',
                      padding: '12px',
                      minWidth: '80px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                      {displayHour} {ampm}
                    </div>
                    <div style={{ margin: '8px 0' }}>
                      <WeatherIcon condition={item.condition} size={40} />
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '8px' }}>
                      {Math.round(item.temperatureFahrenheit)}°
                    </div>
                    <div style={{ fontSize: '11px', color: '#4CAF50', marginTop: '4px' }}>
                      {item.condition}
                    </div>
                    {item.windSpeedMph !== undefined && (
                      <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                        <FontAwesomeIcon icon={faWind} style={{ marginRight: '3px' }} />
                        {Math.round(item.windSpeedMph)} mph {item.windDirection || ''}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Weekly Tab */}
        {!loading && !error && activeTab === 'weekly' && weeklyForecast.length > 0 && (
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#fff' }}>
              7-Day Forecast
            </h3>
            {(() => {
              // Group forecast by day (combine day and night periods)
              const groupedDays = [];
              for (let i = 0; i < weeklyForecast.length; i += 2) {
                const dayPeriod = weeklyForecast[i];
                const nightPeriod = weeklyForecast[i + 1];
                
                if (dayPeriod) {
                  groupedDays.push({
                    day: dayPeriod,
                    night: nightPeriod,
                    highTemp: Math.max(
                      dayPeriod.temperatureFahrenheit,
                      nightPeriod ? nightPeriod.temperatureFahrenheit : dayPeriod.temperatureFahrenheit
                    ),
                    lowTemp: Math.min(
                      dayPeriod.temperatureFahrenheit,
                      nightPeriod ? nightPeriod.temperatureFahrenheit : dayPeriod.temperatureFahrenheit
                    )
                  });
                }
              }
              
              return groupedDays.map((dayData, index) => {
              const date = new Date(dayData.day.timestamp);
              const dayName = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'long' });
              const isExpanded = expandedDays[index];
              
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: '#2a2a2a',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    overflow: 'hidden',
                  }}
                >
                  {/* Day Header - Clickable */}
                  <div
                    onClick={() => setExpandedDays(prev => ({ ...prev, [index]: !prev[index] }))}
                    style={{
                      padding: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                      <div style={{ minWidth: '80px', fontWeight: 'bold', color: '#fff' }}>
                        {dayName}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <WeatherIcon condition={dayData.day.condition} size={32} />
                        <div style={{ fontSize: '14px', color: '#999', maxWidth: '150px' }}>
                          {dayData.day.condition}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#FF6B6B' }}>
                          {Math.round(dayData.highTemp)}°
                        </div>
                        <div style={{ fontSize: '16px', color: '#64B5F6' }}>
                          {Math.round(dayData.lowTemp)}°
                        </div>
                      </div>
                      <div style={{ fontSize: '14px', color: '#999', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                        ▼
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  {isExpanded && (
                    <div style={{
                      padding: '15px',
                      borderTop: '1px solid #333',
                      backgroundColor: '#1a1a1a',
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                        {/* Wind */}
                        <div>
                          <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                            <FontAwesomeIcon icon={faWind} style={{ marginRight: '5px', color: '#4CAF50' }} />
                            Wind
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                            {dayData.day.windSpeedMph !== undefined ? `${Math.round(dayData.day.windSpeedMph)} mph ${dayData.day.windDirection || ''}` : 'N/A'}
                          </div>
                        </div>
                        
                        {/* Humidity */}
                        <div>
                          <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                            <FontAwesomeIcon icon={faTint} style={{ marginRight: '5px', color: '#2196F3' }} />
                            Humidity
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                            {dayData.day.humidity}%
                          </div>
                        </div>
                        
                        {/* Pressure */}
                        {dayData.day.pressureHPa && (
                          <div>
                            <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                              <FontAwesomeIcon icon={faTemperatureHigh} style={{ marginRight: '5px', color: '#9C27B0' }} />
                              Pressure
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                              {formatPressure(dayData.day.pressureHPa)}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Description */}
                      {dayData.day.description && (
                        <div style={{
                          marginTop: '12px',
                          padding: '10px',
                          backgroundColor: '#2a2a2a',
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: '#999',
                          lineHeight: '1.5',
                        }}>
                          {dayData.day.description}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })})()}
          </div>
        )}

        {/* Moon Phase Tab */}
        {!loading && !error && activeTab === 'moon' && astroData && (
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#fff' }}>
              Current Moon
            </h3>
            
            {/* Current Moon Info */}
            <div style={{
              backgroundColor: '#2a2a2a',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '16px', color: '#999', marginBottom: '10px' }}>
                {formatDateWithOrdinal(new Date())}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <MoonIcon
                  illuminationPct={astroData.moonIllumination}
                  waxing={isWaxingPhase(astroData.moonPhase, astroData.moonFraction)}
                  dayNumber={astroData.moonDayNumber}
                  size={80}
                />
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
                  {Math.round(astroData.moonIllumination)}% Illumination
                </div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginBottom: '6px', textTransform: 'capitalize' }}>
                {normalizePhaseLabel(astroData.moonDayName) || normalizePhaseLabel(astroData.moonPhase)}
              </div>
              <div style={{ fontSize: '16px', color: '#999', marginBottom: '12px', textTransform: 'capitalize' }}>
                {formatMoonDescriptor(astroData.moonPhase, astroData.moonFraction, astroData.moonDayName)}
              </div>
              {/* Moon Rise/Set */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #333' }}>
                {astroData.moonrise && (
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Moonrise</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#B39DDB' }}>
                      {astroData.moonrise.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </div>
                  </div>
                )}
                {astroData.moonset && (
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Moonset</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#B39DDB' }}>
                      {astroData.moonset.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </div>
                  </div>
                )}
                {astroData.moonOverhead && (
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Overhead</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#B39DDB' }}>
                      {astroData.moonOverhead.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </div>
                  </div>
                )}
                {astroData.moonUnderfoot && (
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Underfoot</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#B39DDB' }}>
                      {astroData.moonUnderfoot.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
