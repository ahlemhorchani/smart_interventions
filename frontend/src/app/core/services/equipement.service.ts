import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Equipement } from '../models/equipement.model';

@Injectable({
  providedIn: 'root'
})
export class EquipementService {
  private apiUrl = 'http://localhost:8085/api/equipements';  // URL de base

  constructor(private http: HttpClient) {}

  // 🔹 Récupérer tous les équipements
  getAllEquipements(): Observable<Equipement[]> {
    return this.http.get<Equipement[]>(this.apiUrl + '/all');
  }

  // 🔹 Récupérer un équipement par ID
  getEquipementById(id: string): Observable<Equipement> {
    return this.http.get<Equipement>(`${this.apiUrl}/${id}`);
  }

  // 🔹 Créer un nouvel équipement
  createEquipement(equipement: Equipement): Observable<Equipement> {
    
    return this.http.post<Equipement>(this.apiUrl + '/create', equipement);
  }

  // 🔹 Mettre à jour un équipement
  updateEquipement(id: string, equipement: Equipement): Observable<Equipement> {
    return this.http.put<Equipement>(`${this.apiUrl}/update/${id}`, equipement);
  }

  // 🔹 Supprimer un équipement
  deleteEquipement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  // 🔹 Récupérer les équipements par état
  getEquipementsByEtat(etat: string): Observable<Equipement[]> {
    return this.http.get<Equipement[]>(`${this.apiUrl}/etat/${etat}`);
  }

  // 🔹 Ajouter une intervention à l'historique de l'équipement
  addInterventionToEquipement(equipementId: string, interventionId: string, titre: string, technicien: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${equipementId}/add-intervention`, {
      interventionId,
      titre,
      technicien
    });
  }
}