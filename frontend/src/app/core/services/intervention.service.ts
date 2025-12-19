// intervention.service.ts - CORRIGÉ
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Intervention } from '../models/intervention.model';

@Injectable({
  providedIn: 'root'
})
export class InterventionService {
  private apiUrl = 'http://localhost:8085/api/interventions';

  constructor(private http: HttpClient) {}

  // 🔹 Récupérer toutes les interventions (CORRIGÉ)
  getAllInterventions(): Observable<Intervention[]> {
    return this.http.get<Intervention[]>(`${this.apiUrl}`);  // ← SUPPRIMEZ "/all"
  }

  // 🔹 Créer une nouvelle intervention (CORRIGÉ)
  createIntervention(intervention: Intervention): Observable<Intervention> {
    return this.http.post<Intervention>(`${this.apiUrl}`, intervention);  // ← SUPPRIMEZ "/create"
  }

  // 🔹 Mettre à jour une intervention (CORRIGÉ)
  updateIntervention(id: string, intervention: Intervention): Observable<Intervention> {
    return this.http.put<Intervention>(`${this.apiUrl}/${id}`, intervention);  // ← "/{id}"
  }

  // 🔹 Supprimer une intervention (CORRIGÉ)
  deleteIntervention(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);  // ← "/{id}"
  }

  // 🔹 Récupérer les interventions par statut
  getInterventionsByStatut(statut: string): Observable<Intervention[]> {
    return this.http.get<Intervention[]>(`${this.apiUrl}/statut/${statut}`);
  }

  // 🔹 Changer le statut d'une intervention (CORRIGÉ)
  changerStatutIntervention(id: string, nouveauStatut: string, auteurId: string): Observable<Intervention> {
    // Utilisez PATCH comme dans Spring Boot
    return this.http.patch<Intervention>(
      `${this.apiUrl}/${id}/statut?nouveauStatut=${nouveauStatut}&auteurId=${auteurId}`,
      {}
    );
  }

  // 🔹 Récupérer une intervention par ID
  getInterventionById(id: string): Observable<Intervention> {
    return this.http.get<Intervention>(`${this.apiUrl}/${id}`);
  }

  // 🔹 Affecter un technicien à une intervention
  affecterTechnicien(interventionId: string, technicienId: string): Observable<Intervention> {
    // Vous devrez créer cet endpoint dans Spring Boot
    return this.http.put<Intervention>(`${this.apiUrl}/${interventionId}/affecter`, { technicienId });
  }
  // intervention.service.ts - AJOUTEZ CETTE MÉTHODE
getInterventionsByTechnicien(technicienId: string): Observable<Intervention[]> {
  return this.http.get<Intervention[]>(`${this.apiUrl}/technicien/${technicienId}`);
}
getMyInterventions(): Observable<Intervention[]> {
    return this.http.get<Intervention[]>(`${this.apiUrl}/technicien/me`);
  }
}