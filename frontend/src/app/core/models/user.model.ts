export type Role = 'ADMIN' | 'TECHNICIEN' | 'CITOYEN';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  motDePasse?: string; // présent seulement côté envoi (register/login)
  role: Role;
  disponibilite?: boolean | null;
  position?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  numeroTelephone?: string | null;
  dateCreation?: string;
  dateModification?: string | null;
}
