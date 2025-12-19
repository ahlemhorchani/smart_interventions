export interface Commentaire {
  auteurId: string;
  texte: string;
  date: Date;
}

export interface HistoriqueStatut {
  ancienStatut: string;
  nouveauStatut: string;
  dateChangement: Date;
  auteurId: string;
}

export interface Intervention {
  id?: string;
  titre: string;
  type: string;
  description: string;
  urgence: 'NORMAL' | 'URGENT';
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'TERMINEE';
  dateCreation: Date;
  equipementId: string;
  technicienId: string;
 citoyenId?: string; 
  serviceMunicipalId: string;
  commentaires?: Commentaire[];
  historiqueStatut?: HistoriqueStatut[];
  dateDebut?: Date;
  dateFin?: Date;
  dureeReelle?: number;
}