import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import mapboxgl from 'mapbox-gl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faSave, faTrash, faRoute, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { ConfirmModal } from './ConfirmModal';
import { NavigationModal } from './NavigationModal';
import { waypointAPI } from '@/lib/api/geospatial';

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

// Ensure accessibility and visibility for react-modal
if (typeof window !== 'undefined') {
  const nextRoot = document.getElementById('__next');
  if (nextRoot) {
    Modal.setAppElement('#__next');
  } else {
    Modal.setAppElement('body');
  }
}

import { WaypointDrawer } from '../controls/WaypointAction';

export const WaypointButton = ({ map, mapContainerRef, waypointDrawerRef, onNavigationStart }) => {
  const [waypointType, setWaypointType] = React.useState('deer');
  const [isDraggable, setIsDraggable] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [waypointName, setWaypointName] = useState('');
  const [waypointColor, setWaypointColor] = useState('red');
  const [waypointNotes, setWaypointNotes] = useState('');

  const [editFeatureId, setEditFeatureId] = useState(null);
  const [isAddingWaypoint, setIsAddingWaypoint] = useState(false);
  const [pendingWaypointDetails, setPendingWaypointDetails] = useState(null);
  const tempMarkerRef = useRef(null);
  const isMobile = useIsMobile();
  const [isNavigationModalOpen, setIsNavigationModalOpen] = useState(false);
  const [navigationDestination, setNavigationDestination] = useState(null);
  const [isModalMinimized, setIsModalMinimized] = useState(false);

  // Use callback to avoid stale closures
  const handleMarkerClick = React.useCallback((marker) => {
    console.log('Marker clicked, opening edit modal');
    setEditFeatureId(marker._dbId || marker._waypointId); // Use database ID if available
    setWaypointName(marker.getElement().dataset.name || '');
    setWaypointColor(marker.getElement().dataset.color || 'red');
    setWaypointNotes(marker.getElement().dataset.notes || '');
    setIsModalOpen(true);
  }, []);

  useEffect(() => {
    if (!waypointDrawerRef?.current) return;
    waypointDrawerRef.current.onMarkerDrag = ({ id, lngLat }) => {
      // Optionally update state/UI here, or show a toast, etc.
      // For now, just log the drag event
      console.log('Waypoint dragged:', id, lngLat);
    };
    // Enable marker click to open modal for editing
    waypointDrawerRef.current.onMarkerClick = handleMarkerClick;
    
    // Clean up callbacks on unmount
    return () => {
      if (waypointDrawerRef?.current) {
        waypointDrawerRef.current.onMarkerClick = null;
        waypointDrawerRef.current.onMarkerDrag = null;
      }
    };
  }, [waypointDrawerRef, handleMarkerClick]);

  const openModal = () => {
    console.log('Waypoint button clicked, opening modal');
    setEditFeatureId(null);
    setWaypointName('');
    setWaypointNotes('');
    
    setIsModalOpen(true);
    // Place a temporary marker at the map center
    if (map && !tempMarkerRef.current) {
      const center = map.getCenter();
      const markerEl = document.createElement('div');
      markerEl.className = 'custom-icon-marker';
      markerEl.style.width = '36px';
      markerEl.style.height = '48px';
      markerEl.style.display = 'flex';
      markerEl.style.alignItems = 'center';
      markerEl.style.justifyContent = 'center';
      markerEl.style.zIndex = '10000';
      markerEl.innerHTML = `
      <svg width="36" height="48" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 46C18 46 32 30.5 32 19C32 10.1634 25.8366 4 18 4C10.1634 4 4 10.1634 4 19C4 30.5 18 46 18 46Z" fill="#fff" stroke="${waypointColor}" stroke-width="4"/>
        <circle cx="18" cy="19" r="7" fill="#fff" stroke="${waypointColor}" stroke-width="4"/>
      </svg>
    `;
      tempMarkerRef.current = new mapboxgl.Marker({ element: markerEl, draggable: isDraggable })
        .setLngLat(center)
        .addTo(map);
    }
  };

  const closeModal = () => {
    // Only remove temp marker if we're not editing (i.e., creating new)
    if (tempMarkerRef.current && !editFeatureId) {
      tempMarkerRef.current.remove();
      tempMarkerRef.current = null;
    }
    setIsModalOpen(false);
    setEditFeatureId(null);
    setWaypointName('');
    setWaypointNotes('');
    setWaypointColor('red'); // Reset color to default
  };

  const startAddingWaypoint = (details) => {
    // Ensure color is included in details
    if (!details.color && waypointColor) {
      details.color = waypointColor;
    }
    setIsModalOpen(false);
    setPendingWaypointDetails(details);
    setIsAddingWaypoint(true);
    isAddingWaypointRef.current = true;
    // Remove any previous handler
    if (window._waypointMapClickHandler) {
      map.off('click', window._waypointMapClickHandler);
    }
    const handleMapClick = (e) => {
      console.log('Map clicked, isAddingWaypointRef:', isAddingWaypointRef.current);
      if (!isAddingWaypointRef.current || !waypointDrawerRef?.current) return;
      const lngLat = e.lngLat;
      waypointDrawerRef.current.addWaypoint(lngLat, details.name, details.color, details.notes);
      alert(`Waypoint placed at:\nLongitude: ${lngLat.lng.toFixed(6)}\nLatitude: ${lngLat.lat.toFixed(6)}`);
      setIsAddingWaypoint(false);
      setPendingWaypointDetails(null);
      isAddingWaypointRef.current = false;
      map.off('click', handleMapClick);
      window._waypointMapClickHandler = null;
    };
    window._waypointMapClickHandler = handleMapClick;
    map.on('click', handleMapClick);
  };

  const stopAddingWaypoint = () => {
    setIsAddingWaypoint(false);
    if (waypointDrawerRef?.current?.stopDrawingWaypoint) {
      waypointDrawerRef.current.stopDrawingWaypoint();
    }
  };

  const handleSaveEdit = async () => {
    if (waypointDrawerRef?.current && editFeatureId !== null) {
      try {
        // Update in database
        await waypointAPI.update({
          id: editFeatureId,
          name: waypointName,
          color: waypointColor,
          notes: waypointNotes,
        });
        
        console.log('✅ Waypoint updated in database:', editFeatureId);
        
        // Update the marker visually
        waypointDrawerRef.current.updateWaypoint(editFeatureId, {
          name: waypointName,
          color: waypointColor,
          notes: waypointNotes,
        });
        
        closeModal();
      } catch (error) {
        console.error('❌ Error updating waypoint:', error);
        alert('Failed to update waypoint. Please try again.');
      }
    }
  };

  const handleDelete = () => {
    if (waypointDrawerRef?.current && editFeatureId !== null) {
      waypointDrawerRef.current.removeWaypoint(editFeatureId);
      closeModal();
    }
  };

  const today = new Date();
  const mmddyyyy = `${today.getMonth()+1}`.padStart(2, '0') + '/' + `${today.getDate()}`.padStart(2, '0') + '/' + today.getFullYear();
  const defaultName = `Waypoint ${mmddyyyy}`;
  const [tempLngLat, setTempLngLat] = useState(map ? map.getCenter() : {lng: '', lat: ''});
  // Keep tempLngLat in sync with marker
  useEffect(() => {
    if (!isModalOpen) return;
    let marker = tempMarkerRef.current;
    if (!marker) return;
    // Initial set
    setTempLngLat(marker.getLngLat());
    // Handler for drag
    const onDrag = () => setTempLngLat(marker.getLngLat());
    marker.on('drag', onDrag);
    // Handler for move (if not draggable, still update position if changed)
    const interval = setInterval(() => {
      if (marker) setTempLngLat(marker.getLngLat());
    }, 500);
    return () => {
      marker.off('drag', onDrag);
      clearInterval(interval);
    };
  }, [isModalOpen]);

  React.useEffect(() => {
    console.log('Modal open state:', isModalOpen);
  }, [isModalOpen]);

  React.useEffect(() => {
    // Update temp marker color (when creating new waypoint)
    if (tempMarkerRef.current) {
      const markerEl = tempMarkerRef.current.getElement();
      markerEl.className = 'custom-icon-marker';
      markerEl.innerHTML = `
      <svg width="36" height="48" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 46C18 46 32 30.5 32 19C32 10.1634 25.8366 4 18 4C10.1634 4 4 10.1634 4 19C4 30.5 18 46 18 46Z" fill="#fff" stroke="${waypointColor}" stroke-width="4"/>
        <circle cx="18" cy="19" r="7" fill="#fff" stroke="${waypointColor}" stroke-width="4"/>
      </svg>
    `;
    }
    
    // Update existing marker color in real-time (when editing)
    if (editFeatureId && waypointDrawerRef?.current && isModalOpen) {
      const marker = waypointDrawerRef.current.markers.find(m => m._dbId === editFeatureId || m._waypointId === editFeatureId);
      if (marker) {
        const markerEl = marker.getElement();
        markerEl.innerHTML = `
          <svg width="36" height="48" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 46C18 46 32 30.5 32 19C32 10.1634 25.8366 4 18 4C10.1634 4 4 10.1634 4 19C4 30.5 18 46 18 46Z" fill="#fff" stroke="${waypointColor}" stroke-width="4"/>
            <circle cx="18" cy="19" r="7" fill="#fff" stroke="${waypointColor}" stroke-width="4"/>
          </svg>
        `;
        // Also update the dataset
        markerEl.dataset.color = waypointColor;
      }
    }
  }, [waypointColor, editFeatureId, isModalOpen]);

  const [showConfirm, setShowConfirm] = React.useState(false);

  const handleGetDirections = () => {
    // Get the current waypoint's coordinates
    if (editFeatureId && waypointDrawerRef?.current) {
      const marker = waypointDrawerRef.current.markers.find(m => m._dbId === editFeatureId || m._waypointId === editFeatureId);
      if (marker) {
        const lngLat = marker.getLngLat();
        setNavigationDestination({
          name: waypointName,
          lng: lngLat.lng,
          lat: lngLat.lat,
          color: waypointColor
        });
        setIsNavigationModalOpen(true);
      }
    }
  };

  const handleNavigationStart = (navigationData) => {
    // Pass navigation data to parent Map component
    if (onNavigationStart) {
      onNavigationStart(navigationData);
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        style={styles.button}
        data-waypoint-button="true"
        onMouseEnter={e => {
          e.target.style.backgroundColor = '#f0f0f0';
          e.target.style.color = '#007bff';
        }}
        onMouseLeave={e => {
          e.target.style.backgroundColor = 'white';
          e.target.style.color = '#007bff';
        }}
        title="Add Waypoint"
      >
        <FontAwesomeIcon icon={faMapMarkerAlt} />
      </button>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setShowConfirm(true)}
        aria-label="Waypoint Modal"
        style={{
          overlay: {
            zIndex: 99999,
            backgroundColor: 'transparent',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: isMobile ? 'flex-end' : 'flex-start',
            justifyContent: isMobile ? 'center' : 'flex-start',
          },
          content: {
            position: 'relative',
            left: isMobile ? '0' : (isModalMinimized ? '-310px' : '30px'),
            top: isMobile ? 'auto' : '80px',
            bottom: isMobile ? '60px' : 'auto',
            width: isMobile ? '100%' : '100%',
            maxWidth: isMobile ? '100%' : '360px',
            height: isMobile ? '25vh' : '600px',
            maxHeight: isMobile ? '25vh' : 'calc(100vh - 100px)',
            overflowY: isModalMinimized ? 'hidden' : 'auto',
            border: 'none',
            zIndex: 100000,
            background: '#fff',
            padding: isMobile ? '16px' : '24px 22px 20px 22px',
            borderRadius: isMobile ? '20px 20px 0 0' : '13px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18)',
            pointerEvents: 'auto',
            fontFamily: "Inter, Segoe UI, Roboto, Arial, sans-serif",
            transition: 'left 0.3s ease-in-out'
          }
        }}
      >
        <div style={{ position: 'absolute', top: 8, right: 12, display: 'flex', gap: 8, zIndex: 100001 }}>
          {!isMobile && (
            <button
              onClick={() => setIsModalMinimized(!isModalMinimized)}
              style={{ border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: '#888', padding: 4 }}
              aria-label={isModalMinimized ? "Expand Modal" : "Minimize Modal"}
              title={isModalMinimized ? "Expand to see waypoint details" : "Minimize to see more of the map"}
            >
              <FontAwesomeIcon icon={isModalMinimized ? faChevronRight : faChevronLeft} />
            </button>
          )}
          <button
            onClick={() => setShowConfirm(true)}
            style={{ border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}
            aria-label="Close Modal"
          >×</button>
        </div>
        <ConfirmModal
          isOpen={!!showConfirm}
          message={editFeatureId ? 'Are you sure you want to cancel editing this waypoint?' : 'Are you sure you want to cancel adding this waypoint?'}
          onConfirm={() => {
            setShowConfirm(false);
            // Only remove temp marker if we're creating new (not editing)
            if (tempMarkerRef.current && !editFeatureId) {
              tempMarkerRef.current.remove();
              tempMarkerRef.current = null;
            }
            closeModal();
          }}
          onCancel={() => setShowConfirm(false)}
        />
        <div style={{marginBottom:'20px', display:'flex', flexDirection:'column', alignItems:'center'}}>
          <label htmlFor="waypoint-name" style={{fontWeight:700, fontSize:'1.13rem', marginBottom:8, display:'block', letterSpacing:'-0.5px', fontFamily:'inherit'}}>Waypoint Name</label>
          <input
            id="waypoint-name"
            type="text"
            value={waypointName || defaultName}
            onChange={(e) => setWaypointName(e.target.value)}
            placeholder="Waypoint Name"
            style={{
              ...styles.input,
              fontWeight:600,
              fontSize:'1.22rem',
              padding:'12px 10px',
              border:'1.5px solid #c8c8c8',
              marginBottom:0,
              width:'100%',
              maxWidth:400,
              fontFamily:'inherit',
              textAlign:'center',
              borderRadius:'8px',
              boxShadow:'0 1px 8px 0 rgba(0,0,0,0.03)'
            }}
          />
        </div>
        <div style={{height:16}} />
        <div style={{marginBottom:'18px'}}>
          <label htmlFor="waypoint-notes" style={{fontWeight:600, fontSize:'1rem', marginBottom:4, display:'block'}}>Notes</label>
          <textarea
            id="waypoint-notes"
            value={waypointNotes}
            onChange={(e) => setWaypointNotes(e.target.value)}
            placeholder="Notes (optional)"
            style={styles.textarea}
          />
        </div>
        <div style={{height:12}} />
        <div style={{marginBottom:'7px', fontWeight:600, fontSize:'1rem', letterSpacing:'-0.5px'}}>Color</div>
        <div style={{...styles.colorWrap, marginBottom:'18px', borderRadius:'6px', background:'#f7f7f7', padding:'7px 6px 3px 6px', border:'1px solid #e0e0e0'}}>
          {[
  { label: 'Red', value: '#e53935' },
  { label: 'Blue', value: '#1976d2' },
  { label: 'Green', value: '#43a047' },
  { label: 'Yellow', value: '#fbc02d' },
  { label: 'Black', value: '#222' },
].map(opt => (
  <button
    key={opt.value}
    type="button"
    onClick={() => setWaypointColor(opt.value)}
    style={{
      width: 32,
      height: 32,
      borderRadius: '50%',
      background: opt.value,
      border: waypointColor === opt.value ? '3px solid #222' : '2px solid #fff',
      outline: waypointColor === opt.value ? '2px solid #1976d2' : 'none',
      boxShadow: waypointColor === opt.value ? '0 2px 8px rgba(0,0,0,0.18)' : '0 1px 4px rgba(0,0,0,0.09)',
      cursor: 'pointer',
      padding: 0,
      display: 'inline-block',
      transition: 'border 0.2s, outline 0.2s',
      marginRight: 8,
    }}
    aria-label={opt.label}
    title={opt.label}
  />
))}
        </div>
        <div style={{height:12}} />
        {/* Only show draggable and coordinates when creating new waypoint, not editing */}
        {!editFeatureId && (
          <div style={{ margin: '10px 0', display:'flex', alignItems:'center', gap:'10px' }}>
            <label style={{ fontWeight: 500, display:'flex', alignItems:'center', gap:'6px' }}>
              <input
                type="checkbox"
                checked={isDraggable}
                onChange={e => {
                  setIsDraggable(e.target.checked);
                  if (tempMarkerRef.current) {
                    tempMarkerRef.current.setDraggable(e.target.checked);
                  }
                }}
                style={{ marginRight: 8 }}
              />
              <span>Draggable</span>
            </label>
            <span style={{fontSize:'0.97em', color:'#888', fontWeight:400, marginLeft:'10px', minWidth:180}}>
              Lng: {tempLngLat.lng?.toFixed(6) || 'N/A'}, Lat: {tempLngLat.lat?.toFixed(6) || 'N/A'}
            </span>
          </div>
        )}
        <div style={{...styles.buttonGroup, marginTop:'20px'}}>
          {editFeatureId && (
            <button
              style={{
                ...styles.saveButton,
                background: '#10b981',
                fontSize: '1.13rem',
                fontWeight: 600,
                padding: '13px',
                marginBottom: '6px',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onClick={handleGetDirections}
            >
              <FontAwesomeIcon icon={faRoute} /> Get Directions
            </button>
          )}
          <button
            style={{...styles.saveButton, fontSize:'1.13rem', fontWeight:600, padding:'13px', marginBottom:'6px', fontFamily:'inherit'}}
            onClick={async () => {
              if (editFeatureId) {
                handleSaveEdit();
              } else {
                const nameToUse = waypointName && waypointName.trim() ? waypointName : defaultName;
                if (map && waypointDrawerRef?.current) {
                  let lngLat = map.getCenter();
                  if (tempMarkerRef.current) {
                    lngLat = tempMarkerRef.current.getLngLat();
                    tempMarkerRef.current.remove();
                    tempMarkerRef.current = null;
                  }
                  
                  try {
                    // Save to database first
                    const savedWaypoint = await waypointAPI.create({
                      name: nameToUse,
                      notes: waypointNotes,
                      color: waypointColor,
                      icon_type: waypointType,
                      longitude: lngLat.lng,
                      latitude: lngLat.lat,
                    });
                    
                    console.log('✅ Waypoint saved to database:', savedWaypoint.id);
                    
                    // Then add to map with database ID
                    waypointDrawerRef.current.addWaypoint(lngLat, nameToUse, waypointColor, waypointNotes, savedWaypoint.id);
                    
                    setWaypointName('');
                    setWaypointNotes('');
                    setWaypointColor('red');
                    setWaypointType('deer');
                    setIsModalOpen(false);
                  } catch (error) {
                    console.error('❌ Error saving waypoint:', error);
                    alert('Failed to save waypoint. Please try again.');
                  }
                } else {
                  alert('Map not ready');
                }
              }
            }}
          >
            <FontAwesomeIcon icon={faSave} style={{ marginRight: 8 }} /> {editFeatureId ? 'Save Changes' : 'Add Waypoint'}
          </button>
          <button
            style={{...styles.deleteButton, background:'#eee', color:'#444', border:'1px solid #ccc', fontWeight:500, marginTop:0, fontFamily:'inherit'}}
            onClick={() => setShowConfirm(true)}
          >Cancel</button>
          {editFeatureId && (
            <button style={styles.deleteButton} onClick={handleDelete}>
              <FontAwesomeIcon icon={faTrash} style={{ marginRight: 8 }} /> Delete
            </button>
          )}
        </div>
      </Modal>

      <NavigationModal
        isOpen={isNavigationModalOpen}
        onClose={() => setIsNavigationModalOpen(false)}
        destination={navigationDestination}
        map={map}
        onNavigationStart={handleNavigationStart}
      />
    </>
  );
};

const styles = {
  button: {
    backgroundColor: 'white',
    border: '1px solid #007bff',
    padding: '10px 12px',
    marginRight: '10px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#007bff',
    fontSize: '24px',
    borderRadius: '4px',
    transition: '0.3s ease',
  },
  modalStyles: {
    content: {
      backgroundColor: '#fff',
      padding: '20px',
      maxWidth: '400px',
      margin: 'auto',
      borderRadius: '10px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
      inset: '50% auto auto 50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 9999,
      fontFamily: '"Roboto", sans-serif',
    },
  },
  header: {
    marginBottom: '15px',
    fontSize: '20px',
    fontWeight: '600',
  },
  input: {
    padding: '8px',
    fontSize: '14px',
    width: '100%',
    marginBottom: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  textarea: {
    padding: '8px',
    fontSize: '14px',
    width: '100%',
    height: '60px',
    resize: 'vertical',
    marginBottom: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  label: {
    fontWeight: '500',
    marginBottom: '6px',
    display: 'block',
  },
  colorWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    marginBottom: '12px',
  },
  colorDot: (color, selectedColor) => ({
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: color,
    margin: '4px',
    cursor: 'pointer',
    border: `2px solid ${color === selectedColor ? '#000' : '#ccc'}`,
  }),
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '10px',
  },
  saveButton: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: '#fff',
    padding: '12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
  },
};
