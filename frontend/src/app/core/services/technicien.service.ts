import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '../models/user.model';

// Interface pour le scoring des techniciens
export interface TechnicienScore extends User {
  score: number;
  distance?: number;
  competencesMatch?: boolean;
  disponibiliteScore?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TechnicienService {
  private apiUrl = 'http://localhost:8085/api/users';

  constructor(private http: HttpClient) {}

  /**
   * 🔹 Récupérer tous les techniciens
   */
  getAllTechniciens(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/techniciens/disponibles`);
  }

  /**
   * 🔹 Récupérer les techniciens disponibles
   */
  getTechniciensDisponibles(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/techniciens/disponibles`);
  }

  /**
   * 🔹 Récupérer un technicien par ID
   */
  getTechnicienById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * 🔹 Créer un nouveau technicien
   */
  createTechnicien(technicien: User): Observable<User> {
    const technicienData = {
      ...technicien,
      role: 'TECHNICIEN',
      disponibilite: true
    };
    return this.http.post<User>(`${this.apiUrl}`, technicienData);
  }

  /**
   * 🔹 Mettre à jour un technicien
   */
  updateTechnicien(id: string, technicien: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, technicien);
  }

  /**
   * 🔹 Supprimer un technicien
   */
  deleteTechnicien(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * 🔹 Mettre à jour la disponibilité d'un technicien
   */
  updateDisponibilite(id: string, disponible: boolean): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/disponibilite`, { disponibilite: disponible });
  }

  /**
   * 🔹 Mettre à jour la position GPS d'un technicien
   */
  updatePosition(id: string, latitude: number, longitude: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/position`, {
      latitude,
      longitude,
      position: `${latitude},${longitude}`
    });
  }

  /**
   * 🔹 Récupérer les interventions assignées à un technicien
   */
  getInterventionsByTechnicien(technicienId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${technicienId}/interventions`);
  }

  /**
   * 🔹 Calculer la distance entre deux points GPS (Haversine formula)
   * Utilitaire pour trouver le technicien le plus proche
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance en km
  }

  /**
   * 🔹 Convertir degrés en radians
   */
  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * 🔹 Trouver le technicien le plus proche d'une localisation
   */
  findClosestTechnicien(latitude: number, longitude: number): Observable<User[]> {
    return new Observable(observer => {
      this.getTechniciensDisponibles().subscribe({
        next: (techniciens) => {
          // Filtrer les techniciens avec position GPS
          const techniciensWithPosition = techniciens.filter(t => 
            t.latitude && t.longitude
          );

          // Calculer les distances
          const techniciensWithDistance = techniciensWithPosition.map(tech => ({
            ...tech,
            distance: this.calculateDistance(
              latitude, longitude,
              tech.latitude!, tech.longitude!
            )
          }));

          // Trier par distance
          const sortedTechniciens = techniciensWithDistance.sort((a, b) => 
            a.distance - b.distance
          );

          observer.next(sortedTechniciens);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * 🔹 Récupérer les statistiques de performance d'un technicien
   */
  getPerformanceStats(technicienId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${technicienId}/stats`);
  }

  /**
   * 🔹 Suggérer le meilleur technicien pour une intervention (Version améliorée)
   * Basé sur : distance, disponibilité, compétences, urgence
   */
  suggestTechnicienForIntervention(
    latitude: number, 
    longitude: number, 
    typeIntervention: string,
    urgence: 'NORMAL' | 'URGENT' = 'NORMAL'
  ): Observable<TechnicienScore[]> {
    return this.getTechniciensDisponibles().pipe(
      map((techniciens: User[]) => {
        return this.calculateTechnicienScores(
          techniciens, 
          latitude, 
          longitude, 
          typeIntervention, 
          urgence
        );
      }),
      catchError(() => of([]))
    );
  }

  /**
   * 🔹 Calculer les scores des techniciens
   */
  private calculateTechnicienScores(
    techniciens: User[],
    latitude: number,
    longitude: number,
    typeIntervention: string,
    urgence: 'NORMAL' | 'URGENT'
  ): TechnicienScore[] {
    // Base de données simulée de compétences (à remplacer par votre propre logique)
    const competencesMap: { [key: string]: string[] } = {
      'ELECTRIQUE': ['ELECTRICITE', 'MAINTENANCE'],
      'MECANIQUE': ['MECANIQUE', 'REPARATION'],
      'PLOMBERIE': ['PLOMBERIE', 'SANITAIRE'],
      'INFORMATIQUE': ['INFORMATIQUE', 'RESEAU'],
      'CLIMATISATION': ['CLIMATISATION', 'FROID'],
      'ÉLECTRIQUE': ['ELECTRICITE', 'MAINTENANCE'], // Avec accent
      'ÉLECTRICITÉ': ['ELECTRICITE', 'MAINTENANCE'],
      'MAINTENANCE': ['MAINTENANCE', 'REPARATION'],
      'RÉPARATION': ['REPARATION', 'MAINTENANCE']
    };

    return techniciens
      .filter(tech => tech.disponibilite === true)
      .map(tech => {
        let score = 0;
        let distance = Infinity;
        
        // 1. Score de disponibilité (30%)
        score += 30;

        // 2. Score de distance (40%)
        if (tech.latitude && tech.longitude) {
          distance = this.calculateDistance(latitude, longitude, tech.latitude, tech.longitude);
          
          // Pondération selon l'urgence
          const distanceWeight = urgence === 'URGENT' ? 50 : 40;
          const distanceScore = Math.max(0, distanceWeight - (distance * 5));
          score += distanceScore;
        }

        // 3. Score de compétences (20%)
        const competencesMatch = this.checkCompetencesMatch(tech, typeIntervention, competencesMap);
        if (competencesMatch) {
          score += 20;
        }

        // 4. Score de charge de travail (10%)
        // (À implémenter avec des données réelles)
        score += 10;

        // 5. Bonus pour les interventions urgentes
        if (urgence === 'URGENT' && distance < 5) {
          score += 15;
        }

        return {
          ...tech,
          score: Math.min(100, score), // Limiter à 100
          distance: distance !== Infinity ? parseFloat(distance.toFixed(2)) : undefined,
          competencesMatch,
          disponibiliteScore: tech.disponibilite ? 30 : 0
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  /**
   * 🔹 Vérifier la correspondance des compétences
   */
  private checkCompetencesMatch(
    technicien: User, 
    typeIntervention: string,
    competencesMap: { [key: string]: string[] }
  ): boolean {
    // Logique simplifiée - à adapter selon votre modèle de données
    // Vous pourriez avoir un champ "competences" dans votre modèle User
    const techCompetences = (technicien as any).competences || [];
    const requiredCompetences = competencesMap[typeIntervention.toUpperCase()] || [];
    
    return requiredCompetences.some(comp => 
      techCompetences.some((t: string) => 
        t.toUpperCase().includes(comp)
      )
    );
  }

  /**
   * 🔹 Rechercher des techniciens avec filtres
   */
    /**
   * 🔹 Rechercher des techniciens avec filtres
   */
  searchTechniciens(searchTerm: string, filters?: any): Observable<User[]> {
  return this.getTechniciensDisponibles().pipe(
    map((techniciens: User[]) => {
      if (!searchTerm && !filters) return techniciens;

      return techniciens.filter(tech => {
        let match = true;

        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          match = match && (
            (tech.nom?.toLowerCase().includes(term)) ||
            (tech.prenom?.toLowerCase().includes(term)) ||
            (tech.email?.toLowerCase().includes(term)) ||
            (tech.numeroTelephone?.includes(term) ?? false)
          );
        }

        if (filters) {
          if (filters.disponibilite !== undefined) {
            const dispo = !!tech.disponibilite;
            match = match && (dispo === filters.disponibilite);
          }
          if (filters.avecPosition) {
            match = match && !!(tech.latitude != null && tech.longitude != null);
          }
        }

        return match;
      });
    })
  );
}


  /**
   * 🔹 Obtenir les statistiques d'un technicien
   */
  getTechnicienStats(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/stats`).pipe(
      catchError(() => of({
        interventionsTerminees: 0,
        tempsMoyen: 0,
        satisfaction: 0,
        specialites: []
      }))
    );
  }

  /**
   * 🔹 Suggestion simple (méthode alternative plus simple)
   * À utiliser si vous avez besoin d'une version plus simple
   */
  suggestTechnicienSimple(
    latitude: number, 
    longitude: number, 
    typeIntervention: string
  ): Observable<User[]> {
    return this.getTechniciensDisponibles().pipe(
      map((techniciens: User[]) => {
        // Logique de suggestion simplifiée
        return techniciens
          .filter(tech => tech.disponibilite === true)
          .map(tech => {
            let score = 0;
            
            // Points pour disponibilité
            if (tech.disponibilite) score += 30;
            
            // Points pour proximité (si position disponible)
            if (tech.latitude && tech.longitude) {
              const distance = this.calculateDistance(
                latitude, longitude,
                tech.latitude, tech.longitude
              );
              score += Math.max(0, 50 - (distance * 10));
            }
            
            return {
              ...tech,
              score
            };
          })
          .sort((a: any, b: any) => b.score - a.score);
      })
    );
  }
}