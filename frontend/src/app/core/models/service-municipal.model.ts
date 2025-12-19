export interface InterventionRecent {
  titre: string;
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'TERMINEE';  // Note: "TERMINEE" avec deux E
  dateCreation: string | Date;
  urgence: 'NORMAL' | 'URGENT';  // Note: changé pour correspondre à MongoDB
}

export interface ServiceMunicipal {
  id?: string;
  nom: string;
  description: string;
  interventionsRecent?: InterventionRecent[];
  dateCreation?: string | Date;
}