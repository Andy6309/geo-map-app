import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faRoute, 
  faArrowRight,
  faArrowLeft,
  faArrowUp,
  faLocationArrow,
  faClock,
  faRoad,
  faMobileAlt,
  faChevronRight,
  faChevronLeft
} from '@fortawesome/free-solid-svg-icons';

/**
 * DirectionsPanel - Display turn-by-turn navigation instructions
 */
export const DirectionsPanel = ({ 
  route, 
  instructions, 
  onClose,
  onRouteSelect,
  startName = 'Start',
  endName = 'Destination'
}) => {
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState('');
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);

  // Load available routes from window object
  React.useEffect(() => {
    if (window.availableRoutes && window.availableRoutes.length > 1) {
      setAvailableRoutes(window.availableRoutes);
    }
  }, [route]);

  if (!route) return null;

  const handleSendToPhone = async () => {
    if (!phoneNumber.trim()) {
      setSendStatus('Please enter a phone number');
      return;
    }

    setIsSending(true);
    setSendStatus('');

    try {
      // Create a shareable link with directions
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${startName}&destination=${endName}`;
      const message = `Your directions: ${directionsUrl}`;

      // Note: This is a placeholder. In production, you would:
      // 1. Use a service like Twilio, AWS SNS, or similar
      // 2. Call your backend API endpoint that sends SMS
      // 3. Handle rate limiting and validation
      
      // For now, we'll just copy to clipboard and show instructions
      await navigator.clipboard.writeText(message);
      setSendStatus('Link copied to clipboard! Use your SMS app to send.');
      
      // In production, you would do:
      // const response = await fetch('/api/send-sms', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ phoneNumber, message })
      // });
      // if (response.ok) {
      //   setSendStatus('Directions sent successfully!');
      // }
      
      setTimeout(() => {
        setShowPhoneModal(false);
        setSendStatus('');
        setPhoneNumber('');
      }, 3000);
    } catch (error) {
      console.error('Error sending to phone:', error);
      setSendStatus('Failed to send. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const getManeuverIcon = (type, modifier) => {
    if (type === 'turn') {
      if (modifier === 'left' || modifier === 'slight left' || modifier === 'sharp left') {
        return faArrowLeft;
      }
      if (modifier === 'right' || modifier === 'slight right' || modifier === 'sharp right') {
        return faArrowRight;
      }
    }
    if (type === 'depart' || type === 'arrive') {
      return faLocationArrow;
    }
    return faArrowUp;
  };

  return (
    <div style={{
      ...styles.panel,
      width: isMinimized ? 60 : 380,
      transition: 'width 0.3s ease-in-out'
    }}>
      {/* Header */}
      <div style={styles.header}>
        {!isMinimized ? (
          <>
            <div style={styles.headerTitle}>
              <FontAwesomeIcon icon={faRoute} style={{ color: '#1976d2', marginRight: 10 }} />
              <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>Directions</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                onClick={() => setIsMinimized(true)} 
                style={styles.minimizeButton} 
                aria-label="Minimize Panel"
                title="Minimize to see more of the map"
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
              <button onClick={onClose} style={styles.closeButton} aria-label="Close Directions">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </>
        ) : (
          <button 
            onClick={() => setIsMinimized(false)} 
            style={styles.expandButton} 
            aria-label="Expand Panel"
            title="Expand directions panel"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
        )}
      </div>

      {/* Content - Only show when not minimized */}
      {!isMinimized && (
        <>
          {/* Route Summary */}
          <div style={styles.summary}>
        <div style={styles.summaryItem}>
          <FontAwesomeIcon icon={faRoad} style={{ color: '#666', marginRight: 8 }} />
          <span style={{ fontWeight: 600 }}>{(route.distance * 0.000621371).toFixed(1)} mi</span>
        </div>
        <div style={styles.summaryItem}>
          <FontAwesomeIcon icon={faClock} style={{ color: '#666', marginRight: 8 }} />
          <span style={{ fontWeight: 600 }}>
            {Math.floor(route.duration / 60)} min
          </span>
        </div>
      </div>

      {/* Route Alternatives */}
      {availableRoutes.length > 1 && (
        <div style={{ padding: '0 20px 16px 20px', borderBottom: '1px solid #e0e0e0' }}>
          <button
            onClick={() => setShowAlternatives(!showAlternatives)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#444'
            }}
          >
            <span>{availableRoutes.length} Route Options</span>
            <span>{showAlternatives ? '▲' : '▼'}</span>
          </button>
          
          {showAlternatives && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {availableRoutes.map((altRoute, index) => {
                const isActive = altRoute.routeIndex === route.routeIndex;
                const duration = Math.floor(altRoute.duration / 60);
                const distance = (altRoute.distance * 0.000621371).toFixed(1);
                
                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (onRouteSelect) {
                        onRouteSelect(altRoute);
                      }
                      setShowAlternatives(false);
                    }}
                    style={{
                      padding: '12px',
                      background: isActive ? '#e3f2fd' : '#fff',
                      border: isActive ? '2px solid #1976d2' : '1px solid #ddd',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.target.style.background = '#f5f5f5';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.target.style.background = '#fff';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#222', marginBottom: 4 }}>
                          {index === 0 ? 'Recommended Route' : `Route ${index + 1}`}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                          {distance} mi • {duration} min
                        </div>
                      </div>
                      {isActive && (
                        <div style={{ color: '#1976d2', fontWeight: 600, fontSize: '0.85rem' }}>Active</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Send to Phone Button */}
      <div style={{ padding: '0 20px 12px 20px', borderBottom: '1px solid #e0e0e0' }}>
        <button
          onClick={() => setShowPhoneModal(true)}
          style={{
            width: '100%',
            padding: '12px',
            background: '#10b981',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#059669'}
          onMouseLeave={(e) => e.target.style.background = '#10b981'}
        >
          <FontAwesomeIcon icon={faMobileAlt} />
          Send to Phone
        </button>
      </div>

      {/* Route Info */}
      <div style={styles.routeInfo}>
        <div style={styles.routePoint}>
          <div style={{ ...styles.routeMarker, background: '#4caf50' }}>A</div>
          <span style={{ fontWeight: 600 }}>{startName}</span>
        </div>
        <div style={styles.routeDivider}>⋮</div>
        <div style={styles.routePoint}>
          <div style={{ ...styles.routeMarker, background: '#e53935' }}>B</div>
          <span style={{ fontWeight: 600 }}>{endName}</span>
        </div>
      </div>

      {/* Instructions List */}
      <div style={styles.instructionsList}>
        <div style={styles.instructionsHeader}>Turn-by-Turn Directions</div>
        {instructions.map((instruction, idx) => (
          <div key={idx} style={styles.instructionItem}>
            <div style={styles.instructionIcon}>
              <FontAwesomeIcon 
                icon={getManeuverIcon(instruction.type, instruction.modifier)} 
                style={{ color: '#1976d2' }}
              />
            </div>
            <div style={styles.instructionContent}>
              <div style={styles.instructionText}>{instruction.instruction}</div>
              <div style={styles.instructionMeta}>
                {instruction.distance}
                {instruction.duration && ` • ${instruction.duration}`}
              </div>
            </div>
            <div style={styles.instructionNumber}>{instruction.index}</div>
          </div>
        ))}
      </div>

      {/* Phone Modal */}
      {showPhoneModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 700 }}>Send to Phone</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#666' }}>
              Enter your phone number to receive a link to these directions.
            </p>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="(555) 123-4567"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                marginBottom: 12,
                boxSizing: 'border-box'
              }}
            />
            {sendStatus && (
              <div style={{
                padding: '10px',
                background: sendStatus.includes('Failed') ? '#ffebee' : '#e8f5e9',
                color: sendStatus.includes('Failed') ? '#c62828' : '#2e7d32',
                borderRadius: '6px',
                fontSize: '0.9rem',
                marginBottom: 12
              }}>
                {sendStatus}
              </div>
            )}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => {
                  setShowPhoneModal(false);
                  setSendStatus('');
                  setPhoneNumber('');
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f5f5f5',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSendToPhone}
                disabled={isSending}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: isSending ? '#ccc' : '#1976d2',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: isSending ? 'not-allowed' : 'pointer'
                }}
              >
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

const styles = {
  panel: {
    position: 'fixed',
    top: 80,
    right: 20,
    bottom: 20,
    width: 380,
    maxHeight: 'calc(100vh - 100px)',
    height: 'auto',
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif',
    zIndex: 10000,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e0e0e0',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.2rem',
    color: '#222',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: 24,
    color: '#888',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 4,
    transition: 'background 0.2s',
  },
  minimizeButton: {
    background: 'none',
    border: 'none',
    fontSize: 18,
    color: '#888',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 4,
    transition: 'background 0.2s',
  },
  expandButton: {
    background: '#1976d2',
    border: 'none',
    fontSize: 20,
    color: '#fff',
    cursor: 'pointer',
    padding: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: '50%',
    margin: 'auto',
    transition: 'background 0.2s',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  },
  summary: {
    display: 'flex',
    gap: 20,
    padding: '16px 20px',
    background: '#f8f9fa',
    borderBottom: '1px solid #e0e0e0',
  },
  summaryItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.95rem',
    color: '#222',
  },
  routeInfo: {
    padding: '16px 20px',
    borderBottom: '1px solid #e0e0e0',
  },
  routePoint: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: '0.95rem',
    color: '#222',
  },
  routeMarker: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.85rem',
  },
  routeDivider: {
    marginLeft: 13,
    color: '#ccc',
    fontSize: '1.2rem',
    lineHeight: 0.5,
  },
  instructionsList: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 0',
  },
  instructionsHeader: {
    padding: '8px 20px',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  instructionItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '12px 20px',
    borderBottom: '1px solid #f0f0f0',
    transition: 'background 0.2s',
    cursor: 'pointer',
  },
  instructionIcon: {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#e3f2fd',
    borderRadius: 8,
    fontSize: '1rem',
    flexShrink: 0,
  },
  instructionContent: {
    flex: 1,
  },
  instructionText: {
    fontSize: '0.95rem',
    color: '#222',
    marginBottom: 4,
    lineHeight: 1.4,
  },
  instructionMeta: {
    fontSize: '0.8rem',
    color: '#888',
  },
  instructionNumber: {
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f5f5',
    borderRadius: '50%',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#666',
    flexShrink: 0,
  },
};
