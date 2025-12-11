import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRoute, faLocationCrosshairs, faMapMarkerAlt, faTimes, faSpinner, faSearch } from '@fortawesome/free-solid-svg-icons';

// Helper to detect mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileDevice = mobileRegex.test(userAgent);
      const isSmallScreen = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
      setIsMobile(isMobileDevice || isSmallScreen);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
};

export const NavigationModal = ({ 
  isOpen, 
  onClose, 
  destination, 
  map,
  onNavigationStart 
}) => {
  const isMobile = useIsMobile();
  const [startPoint, setStartPoint] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [startInputValue, setStartInputValue] = useState('');
  const [isSelectingOnMap, setIsSelectingOnMap] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [routeOptions, setRouteOptions] = useState({
    avoidTolls: false,
    avoidFerries: false,
    avoidMotorways: false,
    profile: 'driving-traffic'
  });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStartPoint(null);
      setStartInputValue('');
      setLocationError(null);
      setIsSelectingOnMap(false);
      setAddressInput('');
      setIsGeocodingAddress(false);
      setAddressSuggestions([]);
      setShowSuggestions(false);
      setRouteOptions({
        avoidTolls: false,
        avoidFerries: false,
        avoidMotorways: false,
        profile: 'driving-traffic'
      });
    }
  }, [isOpen]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setStartPoint({ lng: longitude, lat: latitude });
        setStartInputValue('My Location');
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied. Please enable location permissions.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('An unknown error occurred.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSelectOnMap = () => {
    setIsSelectingOnMap(true);
    setLocationError(null);
    
    // Add click handler to map
    const handleMapClick = (e) => {
      const { lng, lat } = e.lngLat;
      setStartPoint({ lng, lat });
      setStartInputValue(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      setIsSelectingOnMap(false);
      
      // Remove the click handler
      map.off('click', handleMapClick);
    };

    map.once('click', handleMapClick);
  };

  const handleAddressInputChange = async (value) => {
    setAddressInput(value);
    
    if (value.trim().length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${MAPBOX_TOKEN}&limit=5&autocomplete=true`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          setAddressSuggestions(data.features);
          setShowSuggestions(true);
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const handleSelectSuggestion = (feature) => {
    const [lng, lat] = feature.center;
    const placeName = feature.place_name;
    setStartPoint({ lng, lat });
    setStartInputValue(placeName);
    setAddressInput(placeName);
    setShowSuggestions(false);
    setAddressSuggestions([]);
    setLocationError(null);
  };

  const handleGetDirections = () => {
    if (!startPoint || !destination) return;

    // Build exclude array based on options
    const exclude = [];
    if (routeOptions.avoidTolls) exclude.push('toll');
    if (routeOptions.avoidFerries) exclude.push('ferry');
    if (routeOptions.avoidMotorways) exclude.push('motorway');

    onNavigationStart({
      start: startPoint,
      end: destination,
      options: {
        profile: routeOptions.profile,
        exclude,
        alternatives: true
      }
    });
    
    onClose();
  };

  const handleCancel = () => {
    // Clean up map click handler if selecting
    if (isSelectingOnMap && map) {
      map.off('click');
      setIsSelectingOnMap(false);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleCancel}
      aria-label="Navigation Modal"
      style={{
        overlay: {
          zIndex: 99999,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          pointerEvents: 'none',
        },
        content: {
          position: 'fixed',
          top: isMobile ? 'auto' : '20px',
          right: isMobile ? '0' : '20px',
          bottom: isMobile ? '0' : '20px',
          left: isMobile ? '0' : 'auto',
          width: isMobile ? '100%' : '420px',
          height: isMobile ? 'auto' : 'auto',
          maxHeight: isMobile ? '75vh' : 'calc(100vh - 40px)',
          overflowY: 'auto',
          border: 'none',
          background: '#fff',
          padding: isMobile ? '20px' : '24px',
          borderRadius: isMobile ? '20px 20px 0 0' : '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
          fontFamily: "Inter, Segoe UI, Roboto, Arial, sans-serif",
          pointerEvents: 'auto',
        }
      }}
    >
      <button
        onClick={handleCancel}
        style={{
          position: 'absolute',
          top: 12,
          right: 16,
          border: 'none',
          background: 'none',
          fontSize: 28,
          cursor: 'pointer',
          color: '#888',
          lineHeight: 1,
          padding: 0,
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        aria-label="Close Modal"
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: 8,
          color: '#222',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <FontAwesomeIcon icon={faRoute} style={{ color: '#1976d2' }} />
          Get Directions
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#666', margin: 0 }}>
          Choose your starting point to navigate to <strong>{destination?.name || 'this waypoint'}</strong>
        </p>
      </div>

      {/* Destination Display */}
      <div style={{
        background: '#f8f9fa',
        padding: '14px 16px',
        borderRadius: '10px',
        marginBottom: 24,
        border: '1px solid #e0e0e0'
      }}>
        <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: 4, fontWeight: 600 }}>
          DESTINATION
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: destination?.color || '#e53935', fontSize: '1.2rem' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#222' }}>
              {destination?.name || 'Waypoint'}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#888' }}>
              {destination?.lat?.toFixed(6)}, {destination?.lng?.toFixed(6)}
            </div>
          </div>
        </div>
      </div>

      {/* Start Point Selection */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: 10, fontWeight: 600 }}>
          SELECT START POINT
        </div>

        {/* Use My Location Button */}
        <button
          onClick={handleUseMyLocation}
          disabled={isGettingLocation}
          style={{
            width: '100%',
            padding: '14px 16px',
            background: startInputValue === 'My Location' ? '#e3f2fd' : '#fff',
            border: startInputValue === 'My Location' ? '2px solid #1976d2' : '2px solid #ddd',
            borderRadius: '10px',
            cursor: isGettingLocation ? 'wait' : 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            color: '#222',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 12,
            transition: 'all 0.2s',
            fontFamily: 'inherit'
          }}
          onMouseEnter={(e) => {
            if (!isGettingLocation) {
              e.target.style.borderColor = '#1976d2';
              e.target.style.background = '#f5f5f5';
            }
          }}
          onMouseLeave={(e) => {
            if (startInputValue !== 'My Location') {
              e.target.style.borderColor = '#ddd';
              e.target.style.background = '#fff';
            }
          }}
        >
          <FontAwesomeIcon 
            icon={isGettingLocation ? faSpinner : faLocationCrosshairs} 
            style={{ color: '#1976d2', fontSize: '1.2rem' }}
            spin={isGettingLocation}
          />
          {isGettingLocation ? 'Getting location...' : 'Use My Location'}
        </button>

        {/* Address Input */}
        <div style={{ marginBottom: 12, position: 'relative' }}>
          <input
            type="text"
            value={addressInput}
            onChange={(e) => handleAddressInputChange(e.target.value)}
            onFocus={(e) => {
              e.target.style.borderColor = '#1976d2';
              if (addressSuggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder="Type address or location..."
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '2px solid #ddd',
              borderRadius: '10px',
              fontSize: '1rem',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onBlur={(e) => {
              // Delay to allow click on suggestion
              setTimeout(() => {
                e.target.style.borderColor = '#ddd';
                setShowSuggestions(false);
              }, 200);
            }}
          />
          
          {/* Suggestions Dropdown */}
          {showSuggestions && addressSuggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: '8px',
              marginTop: 4,
              maxHeight: '200px',
              overflowY: 'auto',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              zIndex: 1000
            }}>
              {addressSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: index < addressSuggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#f5f5f5';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#fff';
                  }}
                >
                  <div style={{ fontSize: '0.95rem', color: '#222', marginBottom: 2 }}>
                    {suggestion.text}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>
                    {suggestion.place_name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Select on Map Button */}
        <button
          onClick={handleSelectOnMap}
          disabled={isSelectingOnMap}
          style={{
            width: '100%',
            padding: '14px 16px',
            background: isSelectingOnMap ? '#e3f2fd' : '#fff',
            border: isSelectingOnMap ? '2px solid #1976d2' : '2px solid #ddd',
            borderRadius: '10px',
            cursor: isSelectingOnMap ? 'default' : 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            color: '#222',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 12,
            transition: 'all 0.2s',
            fontFamily: 'inherit'
          }}
          onMouseEnter={(e) => {
            if (!isSelectingOnMap) {
              e.target.style.borderColor = '#1976d2';
              e.target.style.background = '#f5f5f5';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelectingOnMap) {
              e.target.style.borderColor = '#ddd';
              e.target.style.background = '#fff';
            }
          }}
        >
          <FontAwesomeIcon 
            icon={faMapMarkerAlt} 
            style={{ color: '#1976d2', fontSize: '1.2rem' }}
          />
          {isSelectingOnMap ? 'Click on map to select...' : 'Select on Map'}
        </button>

        {/* Display selected start point */}
        {startPoint && startInputValue && (
          <div style={{
            padding: '12px 14px',
            background: '#e8f5e9',
            border: '1px solid #4caf50',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: '#2e7d32',
            fontWeight: 500
          }}>
            ✓ Start point set: {startInputValue}
          </div>
        )}

        {/* Error Display */}
        {locationError && (
          <div style={{
            padding: '12px 14px',
            background: '#ffebee',
            border: '1px solid #f44336',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: '#c62828',
            marginTop: 12
          }}>
            {locationError}
          </div>
        )}
      </div>

      {/* Route Options */}
      {startPoint && (
        <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #e0e0e0' }}>
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: 12, fontWeight: 600 }}>
            ROUTE OPTIONS
          </div>

          {/* Travel Mode */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: 8 }}>Travel Mode</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setRouteOptions({ ...routeOptions, profile: 'driving-traffic' })}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: routeOptions.profile === 'driving-traffic' ? '#1976d2' : '#f5f5f5',
                  color: routeOptions.profile === 'driving-traffic' ? '#fff' : '#666',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Fastest
              </button>
              <button
                onClick={() => setRouteOptions({ ...routeOptions, profile: 'driving' })}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: routeOptions.profile === 'driving' ? '#1976d2' : '#f5f5f5',
                  color: routeOptions.profile === 'driving' ? '#fff' : '#666',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Shortest
              </button>
            </div>
          </div>

          {/* Avoid Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={routeOptions.avoidTolls}
                onChange={(e) => setRouteOptions({ ...routeOptions, avoidTolls: e.target.checked })}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.9rem', color: '#444' }}>Avoid tolls</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={routeOptions.avoidFerries}
                onChange={(e) => setRouteOptions({ ...routeOptions, avoidFerries: e.target.checked })}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.9rem', color: '#444' }}>Avoid ferries</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={routeOptions.avoidMotorways}
                onChange={(e) => setRouteOptions({ ...routeOptions, avoidMotorways: e.target.checked })}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.9rem', color: '#444' }}>Avoid highways</span>
            </label>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button
          onClick={handleCancel}
          style={{
            flex: 1,
            padding: '14px',
            background: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            color: '#666',
            fontFamily: 'inherit',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#e0e0e0';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#f5f5f5';
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleGetDirections}
          disabled={!startPoint}
          style={{
            flex: 2,
            padding: '14px',
            background: startPoint ? '#1976d2' : '#ccc',
            border: 'none',
            borderRadius: '10px',
            cursor: startPoint ? 'pointer' : 'not-allowed',
            fontSize: '1rem',
            fontWeight: 600,
            color: '#fff',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10
          }}
          onMouseEnter={(e) => {
            if (startPoint) {
              e.target.style.background = '#1565c0';
            }
          }}
          onMouseLeave={(e) => {
            if (startPoint) {
              e.target.style.background = '#1976d2';
            }
          }}
        >
          <FontAwesomeIcon icon={faRoute} />
          Get Directions
        </button>
      </div>
    </Modal>
  );
};
