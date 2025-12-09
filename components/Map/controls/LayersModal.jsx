import React, { useState } from 'react';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';

// Ensure accessibility for react-modal
if (typeof window !== 'undefined') {
  const nextRoot = document.getElementById('__next');
  if (nextRoot) {
    Modal.setAppElement('#__next');
  } else {
    Modal.setAppElement('body');
  }
}

// Modal styles - responsive for mobile
const getModalStyle = (isMobile) => ({
  overlay: {
    zIndex: 100001,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: isMobile ? 'flex-end' : 'center',
    justifyContent: 'center',
  },
  content: {
    position: 'relative',
    inset: 'auto',
    width: isMobile ? '100%' : '360px',
    maxHeight: isMobile ? '80vh' : 'auto',
    border: 'none',
    background: '#fff',
    padding: isMobile ? '16px' : '24px 22px 20px 22px',
    borderRadius: isMobile ? '20px 20px 0 0' : '13px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18)',
    fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif',
    overflow: 'visible',
  }
});

// All 50 US states
const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
  'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
  'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
  'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

export const LayersModal = ({ 
  isOpen, 
  onClose, 
  countyLayers,
  wmaLayers,
  onToggleCountyLayer,
  onToggleWMALayer,
  isMobile 
}) => {
  const [expandedStates, setExpandedStates] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const toggleStateExpansion = (state) => {
    setExpandedStates(prev => ({
      ...prev,
      [state]: !prev[state]
    }));
  };

  const filteredStates = US_STATES.filter(state => 
    state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e5e7eb',
    flexShrink: 0,
  };

  const titleStyle = {
    fontSize: isMobile ? '18px' : '20px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s',
  };

  const sectionStyle = {
    marginBottom: '12px',
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  };

  const scrollContainerStyle = {
    maxHeight: isMobile ? '50vh' : '400px',
    overflowY: 'auto',
    marginTop: '12px',
    paddingRight: '4px',
  };

  const searchInputStyle = {
    width: '100%',
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    marginBottom: '12px',
    fontFamily: 'inherit',
  };

  const stateItemStyle = {
    marginBottom: '8px',
    backgroundColor: '#fff',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
  };

  const stateHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  const stateNameStyle = {
    flex: 1,
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  };

  const chevronStyle = {
    color: '#9ca3af',
    fontSize: '12px',
    marginRight: '8px',
    width: '12px',
  };

  const optionsContainerStyle = {
    padding: '8px 12px 12px 36px',
    borderTop: '1px solid #f3f4f6',
  };

  const optionRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    fontSize: '13px',
    color: '#6b7280',
  };

  const comingSoonStyle = {
    fontSize: '11px',
    color: '#9ca3af',
    fontStyle: 'italic',
  };

  const sectionTitleStyle = {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const toggleRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    fontSize: '14px',
    color: '#374151',
  };

  const checkboxStyle = {
    marginLeft: 'auto',
    cursor: 'pointer',
    width: '18px',
    height: '18px',
    accentColor: '#10b981',
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={getModalStyle(isMobile)}
      contentLabel="Map Layers"
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
    >
      <div style={headerStyle}>
        <h2 style={titleStyle}>Map Layers</h2>
        <button style={closeButtonStyle} onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search states..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={searchInputStyle}
      />

      {/* States List */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>State Layers</div>
        
        <div style={scrollContainerStyle}>
          {filteredStates.map(state => {
            const isExpanded = expandedStates[state];
            const isKentucky = state === 'Kentucky';
            const countyEnabled = countyLayers?.[state] || false;
            const wmaEnabled = wmaLayers?.[state] || false;

            return (
              <div key={state} style={stateItemStyle}>
                <div 
                  style={stateHeaderStyle}
                  onClick={() => toggleStateExpansion(state)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                >
                  <FontAwesomeIcon 
                    icon={isExpanded ? faChevronDown : faChevronRight} 
                    style={chevronStyle}
                  />
                  <span style={stateNameStyle}>{state}</span>
                </div>

                {isExpanded && (
                  <div style={optionsContainerStyle}>
                    {/* County Toggle */}
                    <div style={optionRowStyle}>
                      <span>County Boundaries</span>
                      <input
                        type="checkbox"
                        checked={countyEnabled}
                        onChange={() => onToggleCountyLayer(state)}
                        style={checkboxStyle}
                      />
                    </div>

                    {/* WMA Toggle */}
                    <div style={optionRowStyle}>
                      <span>WMA (Wildlife Management Areas)</span>
                      {isKentucky ? (
                        <input
                          type="checkbox"
                          checked={wmaEnabled}
                          onChange={() => onToggleWMALayer(state)}
                          style={checkboxStyle}
                        />
                      ) : (
                        <span style={comingSoonStyle}>Coming Soon</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
