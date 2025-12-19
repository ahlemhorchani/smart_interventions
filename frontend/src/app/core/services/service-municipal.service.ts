import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceMunicipal } from '../models/service-municipal.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceMunicipalService {
  private apiUrl = `http://localhost:8085/api/services-municipaux`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // 🔹 CRÉER un service municipal
  createService(service: ServiceMunicipal): Observable<ServiceMunicipal> {
    return this.http.post<ServiceMunicipal>(
      `${this.apiUrl}/create`,
      service,
      { headers: this.getHeaders() }
    );
  }

  // 🔹 RÉCUPÉRER tous les services
  getAllServices(): Observable<ServiceMunicipal[]> {
    return this.http.get<ServiceMunicipal[]>(
      `${this.apiUrl}/all`,
      { headers: this.getHeaders() }
    );
  }

 

  // 🔹 METTRE À JOUR un service (à ajouter dans le backend)
  updateService(id: string, service: ServiceMunicipal): Observable<ServiceMunicipal> {
    return this.http.put<ServiceMunicipal>(
      `${this.apiUrl}/update/${id}`,
      service,
      { headers: this.getHeaders() }
    );
  }

  // 🔹 SUPPRIMER un service (à ajouter dans le backend)
  deleteService(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/delete/${id}`,
      { headers: this.getHeaders() }
    );
  }


  // 🔹 SUPPRIMER une intervention récente (optionnel)
  removeInterventionRecent(serviceId: string, interventionIndex: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${serviceId}/interventions/${interventionIndex}`,
      { headers: this.getHeaders() }
    );
  }

  // 🔹 FILTRER les services (frontend)
  filterServices(services: ServiceMunicipal[], searchTerm: string): ServiceMunicipal[] {
    if (!searchTerm.trim()) return services;
    
    const term = searchTerm.toLowerCase().trim();
    return services.filter(service =>
      service.nom.toLowerCase().includes(term) ||
      service.description.toLowerCase().includes(term) ||
      service.interventionsRecent?.some(inter =>
        inter.titre.toLowerCase().includes(term)
      )
    );
  }
  // 🔹 AJOUTER une intervention récente
addInterventionRecent(
  serviceId: string,
  titre: string,
  statut: string,
  urgence: string
): Observable<{ message: string }> {
  console.log('ServiceMunicipalService: Ajout intervention récente', { serviceId, titre, statut, urgence });
  
  return this.http.post<{ message: string }>(
    `${this.apiUrl}/${serviceId}/interventions/add`,
    null,
    {
      params: { titre, statut, urgence },
      headers: this.getHeaders()
    }
  );
}

// 🔹 RÉCUPÉRER un service par ID
getServiceById(id: string): Observable<ServiceMunicipal> {
  console.log('ServiceMunicipalService: getServiceById', id);
  
  return this.http.get<ServiceMunicipal>(
    `${this.apiUrl}/${id}`,
    { headers: this.getHeaders() }
  );
}
}