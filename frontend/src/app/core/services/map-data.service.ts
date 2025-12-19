import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';

import { Incident, Technician, Equipment } from '../models/map.model';

@Injectable({
  providedIn: 'root'
})
export class MapDataService {
  private apiUrl = 'http://localhost:8085/api'; // À remplacer par ton API
  
  constructor(private http: HttpClient) {}
  
  getIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.apiUrl}/incidents`).pipe(
    catchError(() => {
        // Données mockées pour développement
        return of(this.getMockIncidents()).pipe(delay(500));
      })
    );
  }
  
  getTechnicians(): Observable<Technician[]> {
    return this.http.get<Technician[]>(`${this.apiUrl}/technicians`).pipe(
      catchError(() => {
        // Données mockées pour développement
        return of(this.getMockTechnicians()).pipe(delay(500));
      })
    );
  }
  
  getEquipment(): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(`${this.apiUrl}/equipment`).pipe(
      catchError(() => {
        // Données mockées pour développement
        return of(this.getMockEquipment()).pipe(delay(500));
      })
    );
  }
  
  private getMockIncidents(): Incident[] {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 86400000);
    const twoDaysAgo = new Date(now.getTime() - 172800000);
    
    return [
      {
        id: '1',
        type: 'POTHOLE',
        status: 'PENDING',
        location: { 
          lat: 36.8065, 
          lng: 10.1815, 
          address: 'Avenue Habib Bourguiba, Tunis',
          city: 'Tunis'
        },
        description: 'Nid de poule important sur la voie rapide',
        reportedAt: twoDaysAgo,
        updatedAt: twoDaysAgo,
        reporterName: 'Ahmed Ben Ali',
        priority: 3,
        assignedTo: 'Mohamed Ali'
      },
      {
        id: '2',
        type: 'LIGHTING',
        status: 'IN_PROGRESS',
        location: { 
          lat: 36.8085, 
          lng: 10.1835, 
          address: 'Rue de la République, Tunis',
          city: 'Tunis'
        },
        description: 'Lampadaire défectueux ne s\'allume pas la nuit',
        reportedAt: yesterday,
        updatedAt: now,
        reporterName: 'Fatima Zohra',
        priority: 2,
        assignedTo: 'Karim Ben Salah'
      },
      {
        id: '3',
        type: 'GARBAGE',
        status: 'URGENT',
        location: { 
          lat: 36.8045, 
          lng: 10.1795, 
          address: 'Rue d\'Alger, Tunis',
          city: 'Tunis'
        },
        description: 'Déchets non collectés depuis 3 jours, odeur nauséabonde',
        reportedAt: now,
        updatedAt: now,
        reporterName: 'Samir Ben Amor',
        priority: 5,
        assignedTo: 'Hassan Trabelsi'
      },
      {
        id: '4',
        type: 'TREE',
        status: 'RESOLVED',
        location: { 
          lat: 36.8105, 
          lng: 10.1855, 
          address: 'Jardin du Belvédère, Tunis',
          city: 'Tunis'
        },
        description: 'Arbre menaçant de tomber sur la voie publique',
        reportedAt: twoDaysAgo,
        updatedAt: yesterday,
        reporterName: 'Leila Ben Youssef',
        priority: 4,
        assignedTo: 'Rachid Ben Ahmed'
      },
      {
        id: '5',
        type: 'WATER',
        status: 'PENDING',
        location: { 
          lat: 36.8025, 
          lng: 10.1775, 
          address: 'Rue de Carthage, Tunis',
          city: 'Tunis'
        },
        description: 'Fuite d\'eau importante sur la chaussée',
        reportedAt: yesterday,
        updatedAt: yesterday,
        reporterName: 'Youssef Ben Hamida',
        priority: 3
      }
    ];
  }
  
  private getMockTechnicians(): Technician[] {
    const now = new Date();
    
    return [
      {
        id: 't1',
        name: 'Mohamed Ali',
        location: { lat: 36.8075, lng: 10.1825 },
        status: 'BUSY',
        currentIntervention: 'Réparation éclairage Rue de la République',
        vehicle: 'Véhicule 123-TUN-456',
        lastUpdate: now
      },
      {
        id: 't2',
        name: 'Karim Ben Salah',
        location: { lat: 36.8055, lng: 10.1805 },
        status: 'BUSY',
        currentIntervention: 'Collecte déchets Rue d\'Alger',
        vehicle: 'Camion 789-TUN-012',
        lastUpdate: new Date(now.getTime() - 1800000) // 30 minutes ago
      },
      {
        id: 't3',
        name: 'Hassan Trabelsi',
        location: { lat: 36.8095, lng: 10.1845 },
        status: 'AVAILABLE',
        vehicle: 'Véhicule 345-TUN-678',
        lastUpdate: new Date(now.getTime() - 3600000) // 1 hour ago
      },
      {
        id: 't4',
        name: 'Rachid Ben Ahmed',
        location: { lat: 36.8035, lng: 10.1785 },
        status: 'OFFLINE',
        lastUpdate: new Date(now.getTime() - 86400000) // 1 day ago
      }
    ];
  }
  
  private getMockEquipment(): Equipment[] {
    const now = new Date();
    
    return [
      {
        id: 'e1',
        type: 'Camion de collecte',
        location: { lat: 36.8055, lng: 10.1845 },
        status: 'OPERATIONAL',
        lastMaintenance: new Date(now.getTime() - 86400000) // 1 day ago
      },
      {
        id: 'e2',
        type: 'Benne à ordures',
        location: { lat: 36.8085, lng: 10.1865 },
        status: 'MAINTENANCE',
        lastMaintenance: new Date(now.getTime() - 172800000) // 2 days ago
      },
      {
        id: 'e3',
        type: 'Véhicule technique',
        location: { lat: 36.8045, lng: 10.1825 },
        status: 'OPERATIONAL',
        lastMaintenance: new Date(now.getTime() - 259200000) // 3 days ago
      }
    ];
  }
}