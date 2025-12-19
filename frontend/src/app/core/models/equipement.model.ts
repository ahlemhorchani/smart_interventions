export interface Localisation {
  type: string;
  coordinates: [number, number];
}

export interface InterventionResume {
  interventionId: string;
  titre: string;
  date: Date;
  technicien: string;
}

export interface Equipement {
  id?: string;
  type: string;
  adresse: string;
  etat: 'FONCTIONNEL' | 'DEFECTUEUX';
  localisation: Localisation;
  dernieresInterventions?: InterventionResume[];
  latitude?: number;  // ← AJOUTÉ
  longitude?: number;
}