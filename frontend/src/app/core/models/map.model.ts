export interface MapLocation {
  lat: number;
  lng: number;
  address?: string;
  city?: string;
}

export type IncidentType = 'POTHOLE' | 'LIGHTING' | 'GARBAGE' | 'TREE' | 'WATER' | 'OTHER';
export type IncidentStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'URGENT';
export type TechnicianStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';
export type EquipmentStatus = 'OPERATIONAL' | 'MAINTENANCE' | 'OUT_OF_SERVICE';

export interface Incident {
  id: string;
  type: IncidentType;
  status: IncidentStatus;
  location: MapLocation;
  description: string;
  reportedAt: Date;
  updatedAt: Date;
  reporterName?: string;
  priority: number;
  assignedTo?: string;
  images?: string[];
}

export interface Technician {
  id: string;
  name: string;
  location: MapLocation;
  status: TechnicianStatus;
  currentIntervention?: string;
  vehicle?: string;
  lastUpdate: Date;
}

export interface Equipment {
  id: string;
  type: string;
  location: MapLocation;
  status: EquipmentStatus;
  lastMaintenance: Date;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  lastUpdated: Date;
  forecast?: DailyForecast[];
}

export interface DailyForecast {
  date: Date;
  tempMax: number;
  tempMin: number;
  condition: string;
  icon: string;
}

export interface MapLayers {
  incidents: boolean;
  technicians: boolean;
  equipment: boolean;
  weather: boolean;
  traffic: boolean;
}

// Types pour les statistiques
export interface MapStats {
  pendingIncidents: number;
  activeTechnicians: number;
  urgentIncidents: number;
  resolvedToday: number;
}