// src/app/core/models/signalement.model.ts
export interface Historique {
  date: Date;
  action: string;
  responsable: string;
}

export type StatutSignalement = 'RECU' | 'EN_TRAITEMENT' | 'RESOLU';

export type TypeSignalement = 'POTHOLE' | 'LIGHTING' | 'GARBAGE' | 'TREE' | 'WATER' | 'SIGNAL' | 'OTHER';
export type UrgenceSignalement = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Signalement {
  id?: string;
  titre: string;
  description: string;
  type: TypeSignalement;
  urgence: UrgenceSignalement;
  localisation: string;
  coordonnees: string;        
  adresse: string;            
  photo?: string;
  statut: StatutSignalement;
  citoyenId?: string;
  interventionId?: string;
  historique?: Historique[];
  dateCreation: Date;
  
  contactNom: string;  
  contactEmail: string;  
  contactTelephone?: string; }