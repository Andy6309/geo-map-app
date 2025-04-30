// File: components/Map/controls/AreaModal.jsx
import React, { useState } from 'react';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ConfirmModal } from './ConfirmModal';

// Modal styles matching LineModal/Waypoint modal for consistency
const modalStyle = {
  overlay: {
    zIndex: 100001,
    backgroundColor: 'transparent',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  content: {
    position: 'relative',
    left: '30px',
    top: '30px',
    width: '100%',
    maxWidth: '360px',
    height: '600px',
    maxHeight: '80vh',
    overflowY: 'auto',
    border: 'none',
    zIndex: 100002,
    background: '#fff',
    padding: '24px 22px 20px 22px',
    borderRadius: '13px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18)',
    fontFamily: "Inter, Segoe UI, Roboto, Arial, sans-serif",
    pointerEvents: 'auto',
  }
};

const colorOptions = [
  { label: 'Red', value: '#e53935' },
  { label: 'Blue', value: '#1976d2' },
  { label: 'Green', value: '#43a047' },
  { label: 'Yellow', value: '#fbc02d' },
  { label: 'Black', value: '#222' },
];

export default function AreaModal({
  isOpen,
  onClose,
  onSave,
  totalAreaAcres,
  segments,
  areaColor,
  setAreaColor,
  initialName = '',
  notes = '',
  setNotes
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const today = new Date();
  const defaultName = `Area ${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
  const [areaName, setAreaName] = useState(initialName || defaultName);

  const handleSave = () => {
    onSave(areaColor, areaName, notes);
  };

  // Close button triggers confirm modal
  const handleRequestClose = () => {
    setShowConfirm(true);
  };

  const handleCancelClose = () => {
    setShowConfirm(false);
  };

  const handleConfirmClose = () => {
    setShowConfirm(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleRequestClose}
      style={modalStyle}
      contentLabel="Add/Edit Area"
      ariaHideApp={false}
      parentSelector={() => document.body}
    >
      <button
        onClick={handleRequestClose}
        style={{ position: 'absolute', top: 8, right: 12, border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: '#888', zIndex: 100001 }}
        aria-label="Close Modal"
      >×</button>
      <ConfirmModal
        isOpen={!!showConfirm}
        message={'Are you sure you want to cancel area drawing?'}
        onConfirm={() => {
          setShowConfirm(false);
          onClose();
        }}
        onCancel={() => setShowConfirm(false)}
      />
      <div style={{marginBottom:'18px', display:'flex', flexDirection:'column', alignItems:'center'}}>
        <label htmlFor="area-name-input" style={{fontWeight:700, fontSize:'1.13rem', marginBottom:8, display:'block', letterSpacing:'-0.5px', fontFamily:'inherit'}}>Area Name</label>
        <input
          id="area-name-input"
          type="text"
          value={areaName}
          onChange={e => setAreaName(e.target.value)}
          placeholder={defaultName}
          style={{
            padding:'12px 10px',
            border:'1.5px solid #c8c8c8',
            marginBottom:0,
            width:'100%',
            maxWidth:400,
            fontFamily:'inherit',
            textAlign:'center',
            borderRadius:'8px',
            boxShadow:'0 1px 8px 0 rgba(0,0,0,0.03)',
            fontWeight:600,
            fontSize:'1.22rem',
          }}
        />
      </div>
      <div style={{ marginBottom: 18 }}>
        <label htmlFor="area-notes-input" style={{ fontWeight: 600, marginBottom: 5, display: 'block', textAlign: 'left' }}>Notes</label>
        <textarea
          id="area-notes-input"
          value={typeof notes !== 'undefined' ? notes : ''}
          onChange={e => {
            if (typeof setNotes === 'function') setNotes(e.target.value);
          }}
          style={{
            width: '100%',
            minHeight: '60px',
            padding: '7px 12px',
            fontSize: '1rem',
            borderRadius: '6px',
            border: '1px solid #ccc',
            marginBottom: 10,
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            resize: 'vertical',
          }}
          placeholder="Add notes about this area..."
        />
      </div>
      <div style={{ marginBottom: 24, padding: '12px 0', borderRadius: 8, background: '#f6f6f6', border: '1px solid #e0e0e0' }}>
        <label style={{ fontWeight: 600, marginBottom: 10, display: 'block', textAlign: 'left', fontSize: 15 }}>Color</label>
        <div style={{ display: 'flex', gap: 16, marginBottom: 2, justifyContent: 'center' }}>
          {colorOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setAreaColor(opt.value)}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: opt.value,
                border: areaColor === opt.value ? '3px solid #222' : '2px solid #fff',
                outline: areaColor === opt.value ? '2px solid #1976d2' : 'none',
                boxShadow: areaColor === opt.value ? '0 2px 8px rgba(0,0,0,0.18)' : '0 1px 4px rgba(0,0,0,0.09)',
                cursor: 'pointer',
                padding: 0,
                display: 'inline-block',
                transition: 'border 0.2s, outline 0.2s',
              }}
              aria-label={opt.label}
            />
          ))}
        </div>
      </div>
      <div style={{height:16}} />
      <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 20 }}>
        Area Details
      </div>
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontWeight: 600 }}>Total Area:</span>
        <span style={{ marginLeft: 8, color: '#1976d2', fontWeight: 600 }}>{totalAreaAcres?.toFixed(2) ?? '0.00'} acres</span>
      </div>
      {/* TODO: Add segment details live here if desired */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button
          style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 16px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
          onClick={handleSave}
        >
          <FontAwesomeIcon icon={faSave} style={{ marginRight: 8 }} />Save Area
        </button>
        <button
          style={{ background: '#fff', color: '#dc3545', border: '1px solid #dc3545', borderRadius: 6, padding: '10px 16px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
          onClick={handleRequestClose}
        >
          <FontAwesomeIcon icon={faTrash} style={{ marginRight: 8 }} />Cancel
        </button>
      </div>
    </Modal>
  );
}
