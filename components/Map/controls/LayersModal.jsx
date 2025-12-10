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

// Modal styles - responsive for mobile, right-aligned for desktop
const getModalStyle = (isMobile) => ({
  overlay: {
    zIndex: 100001,
    backgroundColor: 'transparent', // Transparent to allow map interaction
    display: 'flex',
    alignItems: isMobile ? 'flex-end' : 'flex-start',
    justifyContent: isMobile ? 'center' : 'flex-end',
    paddingTop: isMobile ? '0' : '5px',
    paddingRight: isMobile ? '0' : '20px',
    paddingBottom: isMobile ? '0' : '20px',
    pointerEvents: 'none', // Allow clicks to pass through overlay
  },
  content: {
    position: 'relative',
    inset: 'auto',
    width: isMobile ? '100%' : '400px',
    maxHeight: isMobile ? '80vh' : 'calc(100vh - 60px)',
    border: 'none',
    background: '#fff',
    padding: '0',
    borderRadius: isMobile ? '20px 20px 0 0' : '13px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18)',
    fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    pointerEvents: 'auto', // Re-enable pointer events on the modal content itself
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
  countyBoundariesVisible,
  onToggleCountyBoundaries,
  nationalParksVisible,
  onToggleNationalParks,
  wmaLayers,
  onToggleWMALayer,
  isMobile 
}) => {
  const [expandedStates, setExpandedStates] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFiltersExpanded, setActiveFiltersExpanded] = useState(true);

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
    padding: isMobile ? '16px 16px 12px 16px' : '20px 22px 12px 22px',
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
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={true}
    >
      {/* Header - Fixed */}
      <div style={headerStyle}>
        <h2 style={titleStyle}>Map Layers</h2>
        <button style={closeButtonStyle} onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: isMobile ? '16px' : '0 22px 20px 22px' 
      }}>
        {/* National Filters - Top Level Toggles */}
        <div style={sectionStyle}>
        <div style={sectionTitleStyle}>National</div>
        
        <div style={toggleRowStyle}>
          <span>County Boundaries</span>
          <input
            type="checkbox"
            checked={countyBoundariesVisible}
            onChange={onToggleCountyBoundaries}
            style={checkboxStyle}
          />
        </div>

        <div style={toggleRowStyle}>
          <span>National Parks (Landuse)</span>
          <input
            type="checkbox"
            checked={nationalParksVisible}
            onChange={onToggleNationalParks}
            style={checkboxStyle}
          />
        </div>
      </div>

      {/* Active WMA States - Show enabled states */}
      {Object.keys(wmaLayers).filter(state => wmaLayers[state]).length > 0 && (
        <div style={sectionStyle}>
          <div 
            style={{
              ...sectionTitleStyle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none',
            }}
            onClick={() => setActiveFiltersExpanded(!activeFiltersExpanded)}
          >
            <span>Active Filters</span>
            <FontAwesomeIcon 
              icon={activeFiltersExpanded ? faChevronDown : faChevronRight} 
              style={{ fontSize: '14px', color: '#6b7280' }}
            />
          </div>
          
          {activeFiltersExpanded && (
            <div style={{ padding: '0 12px', marginTop: '8px' }}>
              {Object.keys(wmaLayers)
                .filter(state => wmaLayers[state])
                .map(state => (
                  <div key={`active-${state}`} style={{ marginBottom: '12px' }}>
                    {/* State Name */}
                    <div style={{ 
                      fontSize: '13px', 
                      fontWeight: '600', 
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      {state}
                    </div>
                    {/* Active Filters for this State */}
                    <div style={{ paddingLeft: '12px' }}>
                      <div style={toggleRowStyle}>
                        <span style={{ fontSize: '12px' }}>WMA Boundaries</span>
                        <input
                          type="checkbox"
                          checked={true}
                          onChange={() => onToggleWMALayer(state)}
                          style={checkboxStyle}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search states..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={searchInputStyle}
      />

      {/* States List - WMA Only */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>All States - Wildlife Management Areas</div>
        
        <div style={scrollContainerStyle}>
          {filteredStates.map(state => {
            const isExpanded = expandedStates[state];
            const wmaAvailable = state === 'Kentucky' || state === 'Ohio' || state === 'Georgia' || state === 'Tennessee'|| state === 'Arkansas';
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
                    {/* WMA Toggle */}
                    <div style={optionRowStyle}>
                      <span>WMA Boundaries</span>
                      {wmaAvailable ? (
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
      </div>
    </Modal>
  );
};
