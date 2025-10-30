// API client for geospatial data operations

export interface Waypoint {
  id?: string;
  name: string;
  notes?: string;
  color?: string;
  icon_type?: string;
  longitude: number;
  latitude: number;
  created_at?: string;
  updated_at?: string;
}

export interface Line {
  id?: string;
  name: string;
  notes?: string;
  color?: string;
  coordinates: number[][]; // Array of [lng, lat]
  total_distance?: number;
  segment_distances?: number[];
  created_at?: string;
  updated_at?: string;
}

export interface Area {
  id?: string;
  name: string;
  notes?: string;
  color?: string;
  coordinates: number[][]; // Array of [lng, lat]
  total_area?: number;
  perimeter?: number;
  created_at?: string;
  updated_at?: string;
}

// Waypoint API calls
export const waypointAPI = {
  async getAll(): Promise<Waypoint[]> {
    const res = await fetch('/api/waypoints');
    if (!res.ok) throw new Error('Failed to fetch waypoints');
    return res.json();
  },

  async create(waypoint: Waypoint): Promise<Waypoint> {
    const res = await fetch('/api/waypoints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(waypoint),
    });
    if (!res.ok) throw new Error('Failed to create waypoint');
    return res.json();
  },

  async update(waypoint: Waypoint): Promise<Waypoint> {
    const res = await fetch('/api/waypoints', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(waypoint),
    });
    if (!res.ok) throw new Error('Failed to update waypoint');
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`/api/waypoints?id=${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete waypoint');
  },
};

// Line API calls
export const lineAPI = {
  async getAll(): Promise<Line[]> {
    const res = await fetch('/api/lines');
    if (!res.ok) throw new Error('Failed to fetch lines');
    return res.json();
  },

  async create(line: Line): Promise<Line> {
    const res = await fetch('/api/lines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(line),
    });
    if (!res.ok) throw new Error('Failed to create line');
    return res.json();
  },

  async update(line: Line): Promise<Line> {
    const res = await fetch('/api/lines', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(line),
    });
    if (!res.ok) throw new Error('Failed to update line');
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`/api/lines?id=${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete line');
  },
};

// Area API calls
export const areaAPI = {
  async getAll(): Promise<Area[]> {
    const res = await fetch('/api/areas');
    if (!res.ok) throw new Error('Failed to fetch areas');
    return res.json();
  },

  async create(area: Area): Promise<Area> {
    const res = await fetch('/api/areas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(area),
    });
    if (!res.ok) throw new Error('Failed to create area');
    return res.json();
  },

  async update(area: Area): Promise<Area> {
    const res = await fetch('/api/areas', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(area),
    });
    if (!res.ok) throw new Error('Failed to update area');
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`/api/areas?id=${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete area');
  },
};
