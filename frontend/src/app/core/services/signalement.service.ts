import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Signalement } from '../models/signalement.model';

@Injectable({
  providedIn: 'root'
})
export class SignalementService {
  private apiUrl = 'http://localhost:8085/api/signalements';

  constructor(private http: HttpClient) {}

  createSignalement(s: Signalement): Observable<Signalement> {
    return this.http.post<Signalement>(`${this.apiUrl}/create`, s);
  }

  uploadPhoto(id: string, photo: File): Observable<any> {
    const fd = new FormData();
    fd.append('photo', photo);
    return this.http.post(`${this.apiUrl}/${id}/photo`, fd);
  }

  updateSignalement(id: string, s: Signalement): Observable<Signalement> {
    return this.http.put<Signalement>(`${this.apiUrl}/${id}`, s);
  }

  getSignalementById(id: string) {
    return this.http.get<Signalement>(`${this.apiUrl}/${id}`);
  }

  updateStatut(id: string, statut: string) {
    return this.http.put<Signalement>(`${this.apiUrl}/${id}/statut?statut=${statut}`, {});
  }

  getAllSignalements(): Observable<Signalement[]> {
    return this.http.get<Signalement[]>(`${this.apiUrl}/all`);
  }

 


  /**
   * 🔹 Récupérer les signalements d'un citoyen
   */
  getSignalementsByCitoyen(citoyenId: string): Observable<Signalement[]> {
    return this.http.get<Signalement[]>(`${this.apiUrl}/citoyen/${citoyenId}`);
  }

 
  
  /**
   * 🔹 Ajouter un commentaire à l'historique
   */
  addHistorique(id: string, action: string, responsable: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/historique`, {
      action,
      responsable
    });
  }

  /**
   * 🔹 Lier un signalement à une intervention
   */
  lierIntervention(signalementId: string, interventionId: string): Observable<Signalement> {
    return this.http.put<Signalement>(`${this.apiUrl}/${signalementId}/lier/${interventionId}`, {});
  }

  /**
   * 🔹 Récupérer les signalements par statut
   */
  getSignalementsByStatut(statut: string): Observable<Signalement[]> {
    return this.http.get<Signalement[]>(`${this.apiUrl}/statut/${statut}`);
  }

  /**
   * 🔹 Récupérer les signalements urgents
   */
  getSignalementsUrgents(): Observable<Signalement[]> {
    return this.http.get<Signalement[]>(`${this.apiUrl}/urgents`);
  }

  /**
   * 🔹 Récupérer les signalements par type
   */
  getSignalementsByType(type: string): Observable<Signalement[]> {
    return this.http.get<Signalement[]>(`${this.apiUrl}/type/${type}`);
  }
}