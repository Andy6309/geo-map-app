import React, { useState, useEffect, useRef } from 'react';
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

export const WaypointButton = ({ map, mapContainerRef }) => {
  const [isDraggable, setIsDraggable] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [waypointName, setWaypointName] = useState('');
  const [waypointColor, setWaypointColor] = useState('red');
  const [waypointNotes, setWaypointNotes] = useState('');
  const [editFeatureId, setEditFeatureId] = useState(null);
  const [isAddingWaypoint, setIsAddingWaypoint] = useState(false);
  const [pendingWaypointDetails, setPendingWaypointDetails] = useState(null);
  const waypointDrawer = useRef(null);

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

  const defaultName = `Waypoint ${map ? map.getCenter().lng.toFixed(4) : ''}, ${map ? map.getCenter().lat.toFixed(4) : ''} / ${new Date().toLocaleDateString()}`;

  React.useEffect(() => {
    console.log('Modal open state:', isModalOpen);
  }, [isModalOpen]);

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
        onRequestClose={closeModal}
        style={{
          overlay: {
            zIndex: 99999,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          },
          content: {
            position: 'relative',
            inset: 'unset',
            margin: 'auto',
            maxWidth: '400px',
            border: '4px solid red',
            zIndex: 100000,
            background: '#fff',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
          }
        }}
        contentLabel="Waypoint Modal"
        ariaHideApp={false}
        parentSelector={() => document.body}
      >
        <h2 style={styles.header}>{editFeatureId ? 'Edit Waypoint' : 'Add Waypoint'}</h2>

        <input
          type="text"
          value={waypointName || defaultName}
          onChange={(e) => setWaypointName(e.target.value)}
          placeholder="Waypoint Name"
          style={styles.input}
        />

        <textarea
          value={waypointNotes}
          onChange={(e) => setWaypointNotes(e.target.value)}
          placeholder="Notes (optional)"
          style={styles.textarea}
        />

        {/* Color Picker */}
        <div style={styles.colorWrap}>
          {["red", "blue", "green", "orange", "purple", "yellow", "black", "#00bcd4", "#ff9800", "#795548"].map((color) => (
            <div
              key={color}
              style={styles.colorDot(color, waypointColor)}
              onClick={() => setWaypointColor(color)}
              title={color}
            />
          ))}
        </div>

        {editFeatureId && (
          <div style={{ margin: '10px 0' }}>
            <label style={{ fontWeight: 500 }}>
              <input
                type="checkbox"
                checked={isDraggable}
                onChange={e => {
                  setIsDraggable(e.target.checked);
                  if (waypointDrawer.current && editFeatureId) {
                    waypointDrawer.current.setDraggable(editFeatureId, e.target.checked);
                  }
                }}
                style={{ marginRight: 8 }}
              />
              Make waypoint draggable
            </label>
          </div>
        )}
        {(!editFeatureId) && (
          <div style={{ margin: '10px 0' }}>
            <label style={{ fontWeight: 500 }}>
              <input
                type="checkbox"
                checked={isDraggable}
                onChange={e => setIsDraggable(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              Make waypoint draggable
            </label>
          </div>
        )}
        <div style={styles.buttonGroup}>
          <button
            style={styles.saveButton}
            onClick={() => {
              if (editFeatureId) {
                handleSaveEdit();
              } else {
                const nameToUse = waypointName && waypointName.trim() ? waypointName : defaultName;
                if (map && waypointDrawer.current) {
                  const center = map.getCenter();
                  waypointDrawer.current.addWaypoint(center, nameToUse, waypointColor, waypointNotes);
                  setWaypointName('');
                  setWaypointNotes('');
                  setWaypointColor('red');
                  setIsModalOpen(false);
                } else {
                  alert('Map not ready');
                }
              }
            }}
          >
            <FontAwesomeIcon icon={faSave} style={{ marginRight: 8 }} /> {editFeatureId ? 'Save Changes' : 'Add Waypoint'}
          </button>
          {editFeatureId && (
            <button style={styles.deleteButton} onClick={handleDelete}>
              <FontAwesomeIcon icon={faTrash} style={{ marginRight: 8 }} /> Delete
            </button>
          )}
          <button style={styles.cancelButton} onClick={closeModal}>
            Cancel
          </button>
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
