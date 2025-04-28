import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ConfirmModal } from './ConfirmModal';

// Ensure accessibility and focus management, matching Waypoint modal
if (typeof window !== 'undefined') {
  const nextRoot = document.getElementById('__next');
  if (nextRoot) {
    Modal.setAppElement('#__next');
  } else {
    Modal.setAppElement('body');
  }
}

// Modal styles matching Waypoint modal for visual and functional consistency
const modalStyle = {
  overlay: {
    zIndex: 100001,
    backgroundColor: 'transparent', // allow map interaction
    pointerEvents: 'none', // allow all map clicks through except modal content
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
    pointerEvents: 'auto', // Modal content is interactive
  }
};

const colorOptions = [
  { label: 'Red', value: '#e53935' },
  { label: 'Blue', value: '#1976d2' },
  { label: 'Green', value: '#43a047' },
  { label: 'Orange', value: '#fbc02d' },
  { label: 'Purple', value: '#8e24aa' },
];

console.log('Custom LineModal in use');
export default function LineModal({
  isOpen,
  onClose,
  onSave,
  totalDistance,
  segments,
  notes,
  setNotes,
  initialColor = '#e53935',
  initialName
}) {
  // Debug: log segments and distance
  console.log('LineModal segments:', segments, 'totalDistance:', totalDistance, 'notes:', notes);
  const today = new Date();
  const defaultName = `Line ${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
  const [lineName, setLineName] = useState(initialName || defaultName);
  const [lineColor, setLineColor] = useState(initialColor);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = () => {
    onSave(lineColor, lineName);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => setShowConfirm(true)}
      aria-label="Line Modal"
      style={modalStyle}
      contentLabel="Add/Edit Line"
      ariaHideApp={false}
      parentSelector={() => document.body}
    >
      <button
        onClick={() => setShowConfirm(true)}
        style={{ position: 'absolute', top: 8, right: 12, border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: '#888', zIndex: 100001 }}
        aria-label="Close Modal"
      >×</button>
      <ConfirmModal
        isOpen={!!showConfirm}
        message={'Are you sure you want to cancel line drawing?'}
        onConfirm={() => {
          setShowConfirm(false);
          onClose();
        }}
        onCancel={() => setShowConfirm(false)}
      />
      <div style={{marginBottom:'18px', display:'flex', flexDirection:'column', alignItems:'center'}}>
        <label htmlFor="line-name-input" style={{fontWeight:700, fontSize:'1.13rem', marginBottom:8, display:'block', letterSpacing:'-0.5px', fontFamily:'inherit'}}>Line Name</label>
        <input
          id="line-name-input"
          type="text"
          value={lineName}
          onChange={e => setLineName(e.target.value)}
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
        <label htmlFor="line-notes-input" style={{ fontWeight: 600, marginBottom: 5, display: 'block', textAlign: 'left' }}>Notes</label>
        <textarea
          id="line-notes-input"
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
          placeholder="Add notes about this line..."
        />
      </div>
      <div style={{height:16}} />
      <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 20 }}>
        Line Details
      </div>
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontWeight: 600 }}>Total Distance:</span>
        <span style={{ marginLeft: 8, color: '#1976d2', fontWeight: 600 }}>{totalDistance}</span>
      </div>
      <div style={{ marginBottom: 16, textAlign: 'left' }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Segments:</div>
        <ul style={{ paddingLeft: 18, margin: 0, fontSize: '1rem' }}>
          {segments && segments.length > 0 ? segments.map((seg, i) => (
            <li key={i}>Segment {i + 1}: <span style={{ color: '#555' }}>{seg}</span></li>
          )) : <li style={{ color: '#aaa' }}>No segments yet</li>}
        </ul>
      </div>
      <div style={{marginBottom:'7px', fontWeight:600, fontSize:'1rem', letterSpacing:'-0.5px'}}>Color</div>
      <div style={{display:'flex', gap: 12, justifyContent:'center', marginBottom:'18px', borderRadius:'6px', background:'#f7f7f7', padding:'7px 6px 3px 6px', border:'1px solid #e0e0e0'}}>
        {colorOptions.map(opt => (
          <div
            key={opt.value}
            style={{
              width: 32, height: 32, borderRadius: '50%', border: lineColor === opt.value ? '3px solid #1976d2' : '1px solid #ccc',
              background: opt.value, cursor: 'pointer', outline: 'none', marginRight: 6
            }}
            onClick={() => setLineColor(opt.value)}
            aria-label={opt.label}
            title={opt.label}
          />
        ))}
      </div>
      <div style={{height:18}} />
      <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginTop:'10px' }}>
        <button
          style={{backgroundColor: '#1976d2', color: '#fff', padding:'13px', border:'none', borderRadius:'4px', cursor:'pointer', width:'100%', fontSize:'1.13rem', fontWeight:600, fontFamily:'inherit', marginBottom:'6px'}}
          onClick={handleSave}
        >
          <FontAwesomeIcon icon={faSave} style={{ marginRight: 8 }} /> Save Line
        </button>
        <button
          style={{background:'#eee', color:'#444', border:'1px solid #ccc', fontWeight:500, marginTop:0, fontFamily:'inherit', borderRadius:'4px', padding:'13px', width:'100%'}}
          onClick={() => setShowConfirm(true)}
        >Cancel</button>
      </div>
    </Modal>
  );
}
