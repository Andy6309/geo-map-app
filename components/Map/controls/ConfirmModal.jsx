import React from 'react';
import Modal from 'react-modal';

export const ConfirmModal = ({ isOpen, onConfirm, onCancel, message }) => (
  <Modal
    isOpen={isOpen}
    onRequestClose={onCancel}
    style={{
      overlay: {
        zIndex: 100001,
        backgroundColor: 'rgba(0,0,0,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      content: {
        position: 'relative',
        width: '340px',
        maxWidth: '90vw',
        margin: 'auto',
        border: 'none',
        background: '#fff',
        padding: '30px 28px 20px 28px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18)',
        textAlign: 'center',
        fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif',
      }
    }}
    ariaHideApp={false}
    parentSelector={() => document.body}
    contentLabel="Confirm Action"
  >
    <div style={{fontWeight:700, fontSize:'1.2rem', marginBottom:20}}>{message}</div>
    <div style={{display:'flex', justifyContent:'center', gap:18}}>
      <button
        style={{padding:'10px 22px', fontWeight:600, fontSize:'1rem', borderRadius:7, border:'none', background:'#e53935', color:'#fff', cursor:'pointer'}}
        onClick={onConfirm}
      >Yes</button>
      <button
        style={{padding:'10px 22px', fontWeight:600, fontSize:'1rem', borderRadius:7, border:'1px solid #ccc', background:'#fff', color:'#222', cursor:'pointer'}}
        onClick={onCancel}
      >No</button>
    </div>
  </Modal>
);
