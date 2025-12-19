import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Statistiques } from '../models/statistiques.model';

@Injectable({
  providedIn: 'root'
})
export class StatistiquesService {

  private apiUrl = 'http://localhost:8085/api/statistiques';

  constructor(private http: HttpClient) {}

  getStatistiquesGenerales(): Observable<Statistiques> {
    return this.http.get<Statistiques>(`${this.apiUrl}/generales`);
  }

  /**
   * 🔹 Récupérer les statistiques globales
   */
  getStatistiquesGlobales(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/globales`);
  }

  /**
   * 🔹 Récupérer les statistiques par type de signalement
   */
  getStatistiquesParType(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/par-type`);
  }

  /**
   * 🔹 Récupérer les statistiques par statut
   */
  getStatistiquesParStatut(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/par-statut`);
  }

  /**
   * 🔹 Récupérer les statistiques par mois
   */
  getStatistiquesParMois(annee: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/par-mois/${annee}`);
  }

  /**
   * 🔹 Récupérer les statistiques par niveau d'urgence
   */
  getStatistiquesParUrgence(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/par-urgence`);
  }

}
