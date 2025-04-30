import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import Modal from 'react-modal';

// Ensure accessibility and visibility for react-modal
if (typeof window !== 'undefined') {
  const nextRoot = document.getElementById('__next');
  if (nextRoot) {
    Modal.setAppElement('#__next');
  } else {
    Modal.setAppElement('body');
  }
}

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faTrash, faSave } from '@fortawesome/free-solid-svg-icons';
import { WaypointDrawer } from '../controls/WaypointAction';
import { ConfirmModal } from './ConfirmModal';

export const WaypointButton = ({ map, mapContainerRef }) => {
  const [waypointType, setWaypointType] = React.useState('deer');
  const [isDraggable, setIsDraggable] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [waypointName, setWaypointName] = useState('');
  const [waypointColor, setWaypointColor] = useState('red');
  const [waypointNotes, setWaypointNotes] = useState('');

  const [editFeatureId, setEditFeatureId] = useState(null);
  const [isAddingWaypoint, setIsAddingWaypoint] = useState(false);
  const [pendingWaypointDetails, setPendingWaypointDetails] = useState(null);
  const waypointDrawer = useRef(null);
  const tempMarkerRef = useRef(null);

  useEffect(() => {
    if (map && (!waypointDrawer.current || waypointDrawer.current.map !== map)) {
      console.log('WaypointDrawer: (Re)constructing with map instance', map);
      waypointDrawer.current = new WaypointDrawer(map);
    }
  }, [map]);

  useEffect(() => {
    if (!waypointDrawer.current) return;
    waypointDrawer.current.onMarkerDrag = ({ id, lngLat }) => {
      // Optionally update state/UI here, or show a toast, etc.
      // For now, just log the drag event
      console.log('Waypoint dragged:', id, lngLat);
    };
    // Enable marker click to open modal for editing
    waypointDrawer.current.onMarkerClick = (marker) => {
      setEditFeatureId(marker._waypointId);
      setWaypointName(marker.getElement().dataset.name || '');
      setWaypointColor(marker.getElement().dataset.color || 'red');
      setWaypointNotes(marker.getElement().dataset.notes || '');
      
      setIsModalOpen(true);
    };
    // Clean up callbacks on unmount
    return () => {
      if (waypointDrawer.current) {
        waypointDrawer.current.onMarkerClick = null;
        waypointDrawer.current.onMarkerDrag = null;
      }
    };
  }, [waypointDrawer]);

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
    setIsModalOpen(false);
    setEditFeatureId(null);
    setWaypointName('');
    setWaypointNotes('');
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
      if (!isAddingWaypointRef.current || !waypointDrawer.current) return;
      const lngLat = e.lngLat;
      waypointDrawer.current.addWaypoint(lngLat, details.name, details.color, details.notes);
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
    waypointDrawer.current.stopDrawingWaypoint();
  };

  const handleSaveEdit = () => {
    if (waypointDrawer.current && editFeatureId !== null) {
      waypointDrawer.current.updateWaypoint(editFeatureId, {
        name: waypointName,
        color: waypointColor,
        notes: waypointNotes,
      });
      closeModal();
    }
  };

  const handleDelete = () => {
    if (waypointDrawer.current && editFeatureId !== null) {
      waypointDrawer.current.removeWaypoint(editFeatureId);
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
  }, [waypointColor]);

  const [showConfirm, setShowConfirm] = React.useState(false);

  return (
    <>
      <button
        onClick={openModal}
        style={styles.button}
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
            backgroundColor: 'transparent', // No blur or darken
            pointerEvents: 'none', // allow map interaction
          },
          content: {
            position: 'absolute',
            left: '30px',
            top: '30px',
            width: '100%',
            maxWidth: '360px',
            height: '600px',      // sets a fixed height
            maxHeight: '80vh',    // sets a maximum height relative to the viewport
            overflowY: 'auto',    // enables scrolling if content exceeds the height
            border: 'none',
            zIndex: 100000,
            background: '#fff',
            padding: '24px 22px 20px 22px',
            borderRadius: '13px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18)',
            pointerEvents: 'auto', // modal itself is interactive
            fontFamily: "Inter, Segoe UI, Roboto, Arial, sans-serif"
          }
        }}
      >
        <button
          onClick={() => setShowConfirm(true)}
          style={{ position: 'absolute', top: 8, right: 12, border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: '#888', zIndex: 100001 }}
          aria-label="Close Modal"
        >×</button>
        <ConfirmModal
          isOpen={!!showConfirm}
          message={editFeatureId ? 'Are you sure you want to cancel editing this waypoint?' : 'Are you sure you want to cancel adding this waypoint?'}
          onConfirm={() => {
            setShowConfirm(false);
            if (tempMarkerRef.current) {
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
            {`Lng: ${tempLngLat.lng ? tempLngLat.lng.toFixed(6) : '--'}  |  Lat: ${tempLngLat.lat ? tempLngLat.lat.toFixed(6) : '--'}`}
          </span>
        </div>
        <div style={{height:18}} />
        <div style={styles.buttonGroup}>
          <button
            style={{...styles.saveButton, fontSize:'1.13rem', fontWeight:600, padding:'13px', marginBottom:'6px', fontFamily:'inherit'}}
            onClick={() => {
              if (editFeatureId) {
                handleSaveEdit();
              } else {
                const nameToUse = waypointName && waypointName.trim() ? waypointName : defaultName;
                if (map && waypointDrawer.current) {
                  let lngLat = map.getCenter();
                  if (tempMarkerRef.current) {
                    lngLat = tempMarkerRef.current.getLngLat();
                    tempMarkerRef.current.remove();
                    tempMarkerRef.current = null;
                  }
                  waypointDrawer.current.addWaypoint(lngLat, nameToUse, waypointColor, waypointNotes);
                  setWaypointName('');
                  setWaypointNotes('');
                  setWaypointColor('red');
                  setWaypointType('deer');
                  setIsModalOpen(false);
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
    </>
  );
}

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
