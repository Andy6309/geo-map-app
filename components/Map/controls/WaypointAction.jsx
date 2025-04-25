import mapboxgl from 'mapbox-gl';

// This file now only exports the WaypointDrawer class for logic purposes.
// All UI for adding waypoints is handled in WaypointButton.jsx.

export class WaypointDrawer {
  constructor(map) {
    this.map = map;
    this.markers = [];
  }

  // Place a waypoint marker at the given location, with optional name/notes
  addWaypoint(lngLat, name, _color, notes) {
    console.log('addWaypoint called', { lngLat, map: this.map });
    // Custom marker element with color
    let markerEl;
    if (_color) {
      markerEl = document.createElement('div');
      markerEl.className = 'custom-icon-marker';
      markerEl.innerHTML = `
        <svg width="36" height="48" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Teardrop shape (map pin) with hollow circle -->
          <path d="M18 46C18 46 32 30.5 32 19C32 10.1634 25.8366 4 18 4C10.1634 4 4 10.1634 4 19C4 30.5 18 46 18 46Z" fill="#fff" stroke="${_color}" stroke-width="4"/>
          <circle cx="18" cy="19" r="7" fill="#fff" stroke="${_color}" stroke-width="4"/>
        </svg>
      `;
    }
    // Store waypoint data as attributes for editing
    if (markerEl) {
      markerEl.dataset.name = name || '';
      markerEl.dataset.color = _color || '';
      markerEl.dataset.notes = notes || '';
    }
    // Assign a unique id to the marker element and instance
    const markerId = `waypoint-${Date.now()}-${Math.floor(Math.random()*100000)}`;
    if (markerEl) {
      markerEl.dataset.name = name || '';
      markerEl.dataset.color = _color || '';
      markerEl.dataset.notes = notes || '';
      markerEl.dataset.id = markerId;
    }
    const marker = new mapboxgl.Marker({ element: markerEl || undefined, draggable: false })
      .setLngLat(lngLat)
      .addTo(this.map);
    marker._waypointId = markerId;
    // Attach click handler for editing (always)
    marker.getElement().addEventListener('click', (e) => {
      e.stopPropagation();
      // Remove any existing custom popup
      const prevPopup = document.getElementById('waypoint-action-popup');
      if (prevPopup) prevPopup.remove();
      // Create popup
      const popup = document.createElement('div');
      popup.id = 'waypoint-action-popup';
      popup.style.position = 'absolute';
      popup.style.top = '-65px';
      popup.style.left = '-40px';
      popup.style.background = '#fff';
      popup.style.border = '1px solid #aaa';
      popup.style.borderRadius = '8px';
      popup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
      popup.style.padding = '8px 12px';
      popup.style.zIndex = 9999;
      popup.style.display = 'flex';
      popup.style.alignItems = 'center';
      popup.style.gap = '10px';
      // Info section (name and notes)
      const infoDiv = document.createElement('div');
      infoDiv.style.marginRight = '12px';
      infoDiv.innerHTML = `<strong>${marker.getElement().dataset.name || ''}</strong>${marker.getElement().dataset.notes ? `<br/>${marker.getElement().dataset.notes}` : ''}`;
      // Delete button
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.style.background = '#e53935';
      delBtn.style.color = 'white';
      delBtn.style.border = 'none';
      delBtn.style.borderRadius = '4px';
      delBtn.style.padding = '4px 10px';
      delBtn.style.cursor = 'pointer';
      delBtn.onclick = () => {
        // Remove from this.markers and from map
        const idx = this.markers.findIndex(m => m._waypointId === markerId);
        if (idx !== -1) {
          this.markers[idx].remove();
          this.markers.splice(idx, 1);
        }
        popup.remove();
      };
      // Draggable toggle
      const dragLabel = document.createElement('label');
      dragLabel.style.display = 'flex';
      dragLabel.style.alignItems = 'center';
      dragLabel.style.gap = '4px';
      const dragCheckbox = document.createElement('input');
      dragCheckbox.type = 'checkbox';
      dragCheckbox.checked = marker.isDraggable && marker.isDraggable();
      dragCheckbox.onchange = (ev) => {
        marker.setDraggable(ev.target.checked);
        // Always sync _isDraggable to the marker's actual state
        marker._isDraggable = marker.isDraggable && marker.isDraggable();
      };
      dragLabel.appendChild(dragCheckbox);
      dragLabel.appendChild(document.createTextNode('Draggable'));
      // Add to popup
      popup.appendChild(infoDiv);
      popup.appendChild(delBtn);
      popup.appendChild(dragLabel);
      // Attach popup to map container at marker position
      const mapContainer = this.map.getContainer();
      // Get marker's screen position
      const markerLngLat = marker.getLngLat();
      const markerPoint = this.map.project(markerLngLat);
      popup.style.position = 'absolute';
      popup.style.left = `${markerPoint.x - 40}px`;
      popup.style.top = `${markerPoint.y - 65}px`;
      mapContainer.appendChild(popup);
      // Remove popup if user clicks elsewhere
      setTimeout(() => {
        document.addEventListener('click', function docClick(ev) {
          if (!popup.contains(ev.target)) {
            popup.remove();
            document.removeEventListener('click', docClick);
          }
        });
      }, 0);
      // Keep popup in sync with marker position as map moves
      const updatePopupPosition = () => {
        const pt = this.map.project(marker.getLngLat());
        popup.style.left = `${pt.x - 40}px`;
        popup.style.top = `${pt.y - 65}px`;
      };
      this.map.on('move', updatePopupPosition);
      // Remove popup and listener when popup is closed
      const cleanup = () => {
        popup.remove();
        this.map.off('move', updatePopupPosition);
      };
      popup.cleanup = cleanup;
      // Ensure cleanup is called if popup is removed
      const observer = new MutationObserver(() => {
        if (!document.body.contains(popup)) {
          this.map.off('move', updatePopupPosition);
          observer.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });
    // Attach dragend handler (if callback is set)
    marker._isDraggable = false;
    marker._waypointId = markerId;
    marker._setDraggable = (draggable) => {
      marker.setDraggable(draggable);
      marker._isDraggable = draggable;
    };
    if (this.onMarkerDrag) {
      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        this.onMarkerDrag({
          id: markerId,
          lngLat
        });
      });
    }
    console.log('Marker created:', marker, marker.getLngLat());
    this.markers.push(marker);
    // Attach popup if name or notes
    if (name || notes) {
      const popupContent = `<strong>${name || ''}</strong>${notes ? `<br/>${notes}` : ''}`;
      marker.setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent));
    }
  }

  // Set draggable for a marker by id
  setDraggable(id, draggable) {
    const marker = this.markers.find(m => m._waypointId === id);
    if (marker) {
      marker.setDraggable(draggable);
      marker._isDraggable = draggable;
    }
  }

  // Method to update a waypoint (called during editing)
  updateWaypoint(id, { name, color, notes }) {
    const marker = this.markers.find(m => m._waypointId === id);
    if (marker) {
      const markerEl = marker.getElement();
      const iconEl = markerEl.querySelector('.custom-icon-marker svg circle');
      if (iconEl && color) {
        iconEl.setAttribute('fill', color);
      }
    }  // Update other properties like name and notes if applicable
  }

  // Method to remove a waypoint
  removeWaypoint(id) {
    const markerIndex = this.markers.findIndex(m => m._waypointId === id);
    if (markerIndex !== -1) {
      this.markers[markerIndex].remove();
      this.markers.splice(markerIndex, 1);
    }
  }
}
