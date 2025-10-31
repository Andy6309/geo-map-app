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

// Modal styles - responsive for mobile
const getModalStyle = (isMobile) => ({
  overlay: {
    zIndex: 100001,
    backgroundColor: 'transparent', // Always transparent to allow map interaction
    pointerEvents: 'none', // Always allow map clicks through
    display: 'flex',
    alignItems: isMobile ? 'flex-end' : 'flex-start',
    justifyContent: isMobile ? 'center' : 'flex-start',
  },
  content: {
    position: 'relative',
    left: isMobile ? '0' : '30px',
    top: isMobile ? 'auto' : '30px',
    bottom: isMobile ? '60px' : 'auto', // Above mobile toolbar
    width: isMobile ? '100%' : '100%',
    maxWidth: isMobile ? '100%' : '360px',
    height: isMobile ? '25vh' : '600px',
    maxHeight: isMobile ? '25vh' : '80vh',
    overflowY: 'auto',
    border: 'none',
    zIndex: 100002,
    background: '#fff',
    padding: isMobile ? '16px' : '24px 22px 20px 22px',
    borderRadius: isMobile ? '20px 20px 0 0' : '13px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18)',
    fontFamily: "Inter, Segoe UI, Roboto, Arial, sans-serif",
    pointerEvents: 'auto', // Only modal content is interactive
  }
});

// Only red color option
const colorOptions = [
  { label: 'Red', value: '#e53935' }
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
  initialName,
  editingLineId = null,
  elevation = { gain: 0, loss: 0, min: 0, max: 0 }
}) {
  // Debug: log segments and distance
  console.log('LineModal segments:', segments, 'totalDistance:', totalDistance, 'notes:', notes);
  const today = new Date();
  const defaultName = `Line ${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
  const [lineName, setLineName] = useState(initialName || defaultName);
  const [lineColor, setLineColor] = useState(initialColor);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmingSave, setConfirmingSave] = useState(false);
  const isMobile = useIsMobile();
  
  // Sync state with props when editing
  useEffect(() => {
    if (isOpen) {
      setLineName(initialName || defaultName);
      setLineColor(initialColor);
      setShowConfirm(false);
      setConfirmingSave(false);
    }
  }, [isOpen, initialName, initialColor, defaultName]);

  // Handle Enter key press to show save confirmation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && isOpen && !showConfirm) {
        e.preventDefault();
        e.stopPropagation(); // Prevent event from reaching map
        setConfirmingSave(true);
        setShowConfirm(true);
        // Blur any active elements to prevent form submission
        if (document.activeElement) {
          document.activeElement.blur();
        }
      }
    };
    
    // Use capture phase to ensure we catch the event first
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [isOpen, showConfirm]);

  const handleSave = () => {
    onSave(lineColor, lineName);
    setConfirmingSave(false);
  };
  
  const handleCancelConfirm = (confirmed) => {
    if (confirmingSave) {
      // If we were confirming a save, just close the confirmation
      setShowConfirm(false);
      setConfirmingSave(false);
    } else {
      // If we were canceling, handle based on confirmation
      setShowConfirm(false);
      if (confirmed) {
        // Only remove the line and close if confirmed
        onClose();
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => setShowConfirm(true)}
      aria-label="Line Modal"
      style={getModalStyle(isMobile)}
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
        message={confirmingSave 
          ? (editingLineId ? 'Are you sure you want to save changes?' : 'Are you sure you want to place this line?')
          : (editingLineId ? 'Are you sure you want to cancel editing?' : 'Are you sure you want to cancel line drawing?')}
        onConfirm={confirmingSave ? handleSave : () => handleCancelConfirm(true)}
        onCancel={() => handleCancelConfirm(false)}
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
      <div style={{ 
        marginBottom: 20, 
        padding: '16px', 
        background: '#f8f9fa', 
        borderRadius: '8px',
        border: '2px solid #e9ecef'
      }}>
        <div style={{ 
          fontWeight: 700, 
          fontSize: '1.1rem', 
          marginBottom: 12,
          color: '#1976d2',
          textAlign: 'center'
        }}>
          Total Distance: {totalDistance}
        </div>
        <div style={{ borderTop: '1px solid #dee2e6', paddingTop: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8, fontSize: '0.95rem' }}>Point-to-Point:</div>
          <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
            {segments && segments.length > 0 ? segments.map((seg, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '4px 8px',
                background: i % 2 === 0 ? 'white' : 'transparent',
                borderRadius: '4px'
              }}>
                <span style={{ color: '#666' }}>Point {i + 1} → {i + 2}:</span>
                <span style={{ fontWeight: 600, color: '#1976d2' }}>
                  {seg.distance ? `${(seg.distance * 5280).toFixed(0)} ft` : ''}
                </span>
              </div>
            )) : <div style={{ color: '#aaa', textAlign: 'center', padding: '8px' }}>{editingLineId ? 'Adjust points to see updated distances' : 'Draw line to see distances'}</div>}
          </div>
        </div>
        {elevation && (elevation.gain > 0 || elevation.loss > 0) && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #dee2e6' }}>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: '0.95rem' }}>Elevation Profile:</div>
            <div style={{ fontSize: '0.85rem', lineHeight: '1.8', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: '#f0f9ff', borderRadius: '4px' }}>
                <span style={{ color: '#666' }}>Gain:</span>
                <span style={{ fontWeight: 600, color: '#059669' }}>{elevation.gain.toFixed(0)} ft</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: '#fef2f2', borderRadius: '4px' }}>
                <span style={{ color: '#666' }}>Loss:</span>
                <span style={{ fontWeight: 600, color: '#dc2626' }}>{elevation.loss.toFixed(0)} ft</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'white', borderRadius: '4px' }}>
                <span style={{ color: '#666' }}>Min:</span>
                <span style={{ fontWeight: 600, color: '#1976d2' }}>{elevation.min.toFixed(0)} ft</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'white', borderRadius: '4px' }}>
                <span style={{ color: '#666' }}>Max:</span>
                <span style={{ fontWeight: 600, color: '#1976d2' }}>{elevation.max.toFixed(0)} ft</span>
              </div>
            </div>
          </div>
        )}
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
        {!editingLineId && (
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '12px', 
            borderRadius: '4px', 
            border: '1px solid #e9ecef',
            textAlign: 'center',
            color: '#495057',
            fontSize: '1rem',
            marginBottom: '8px'
          }}>
            Press enter to place line
          </div>
        )}
        {editingLineId && (
          <button
            style={{
              background:'#007bff', 
              color:'white', 
              border:'none', 
              fontWeight:600, 
              marginTop:0, 
              fontFamily:'inherit', 
              borderRadius:'4px', 
              padding:'13px', 
              width:'100%',
              cursor: 'pointer'
            }}
            onClick={() => {
              setConfirmingSave(true);
              setShowConfirm(true);
            }}
          >Save Changes</button>
        )}
        <button
          style={{background:'#eee', color:'#444', border:'1px solid #ccc', fontWeight:500, marginTop:0, fontFamily:'inherit', borderRadius:'4px', padding:'13px', width:'100%', cursor: 'pointer'}}
          onClick={() => setShowConfirm(true)}
        >Cancel</button>
      </div>
    </Modal>
  );
}
