import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SignalementService } from '../../../core/services/signalement.service';
import { InterventionService } from '../../../core/services/intervention.service';
import { EquipementService } from '../../../core/services/equipement.service';
import { TechnicienService } from '../../../core/services/technicien.service';
import { ServiceMunicipalService } from '../../../core/services/service-municipal.service';
import { StatistiquesService } from '../../../core/services/statistique.service';
import { Signalement } from '../../../core/models/signalement.model';
import { Intervention } from '../../../core/models/intervention.model';
import { Equipement } from '../../../core/models/equipement.model';
import { User } from '../../../core/models/user.model';
import { ServiceMunicipal } from '../../../core/models/service-municipal.model';
import { Statistiques } from '../../../core/models/statistiques.model';
import { AdminNavbarComponent } from '../navbar/admin-navbar.component';
import { FormsModule } from '@angular/forms'; // ✅ AJOUT OBLIGATOIRE

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  // Statistiques rapides
  stats = {
    totalSignalements: 0,
    signalementsEnAttente: 0,
    interventionsEnCours: 0,
    equipementsDefectueux: 0,
    techniciensDisponibles: 0,
    tauxResolution: 0
  };

  // Données récentes
  recentSignalements: Signalement[] = [];
  recentInterventions: Intervention[] = [];
  defectEquipements: Equipement[] = [];
  activeTechniciens: User[] = [];
  servicesMunicipaux: ServiceMunicipal[] = [];
  
  // Statistiques détaillées
  detailedStats?: Statistiques;
  
  // Date courante
  currentDate: Date = new Date();
  
  loading = true;

  constructor(
    private signalementService: SignalementService,
    private interventionService: InterventionService,
    private equipementService: EquipementService,
    private technicienService: TechnicienService,
    private serviceMunicipalService: ServiceMunicipalService,
    private statistiquesService: StatistiquesService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    Promise.all([
      this.loadSignalements(),
      this.loadInterventions(),
      this.loadEquipements(),
      this.loadTechniciens(),
      this.loadServicesMunicipaux(),
      this.loadStatistiques()
    ]).finally(() => {
      this.loading = false;
    });
  }

  loadSignalements(): Promise<void> {
    return new Promise((resolve) => {
      this.signalementService.getAllSignalements().subscribe({
        next: (data) => {
          this.recentSignalements = data
            .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
            .slice(0, 5);
          
          this.stats.totalSignalements = data.length;
          this.stats.signalementsEnAttente = data.filter(s => s.statut === 'RECU').length;
          resolve();
        },
        error: (err) => {
          console.error('Erreur chargement signalements', err);
          resolve();
        }
      });
    });
  }

  loadInterventions(): Promise<void> {
    return new Promise((resolve) => {
      this.interventionService.getAllInterventions().subscribe({
        next: (data) => {
          this.recentInterventions = data
            .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
            .slice(0, 5);
          
          this.stats.interventionsEnCours = data.filter(i => i.statut === 'EN_COURS').length;
          resolve();
        },
        error: (err) => {
          console.error('Erreur chargement interventions', err);
          resolve();
        }
      });
    });
  }

  loadEquipements(): Promise<void> {
    return new Promise((resolve) => {
      this.equipementService.getAllEquipements().subscribe({
        next: (data) => {
          this.defectEquipements = data
            .filter(e => e.etat === 'DEFECTUEUX')
            .slice(0, 5);
          
          this.stats.equipementsDefectueux = data.filter(e => e.etat === 'DEFECTUEUX').length;
          resolve();
        },
        error: (err) => {
          console.error('Erreur chargement équipements', err);
          resolve();
        }
      });
    });
  }

  loadTechniciens(): Promise<void> {
    return new Promise((resolve) => {
      this.technicienService.getTechniciensDisponibles().subscribe({
        next: (data) => {
          this.activeTechniciens = data.slice(0, 5);
          this.stats.techniciensDisponibles = data.length;
          resolve();
        },
        error: (err) => {
          console.error('Erreur chargement techniciens', err);
          resolve();
        }
      });
    });
  }

  loadServicesMunicipaux(): Promise<void> {
    return new Promise((resolve) => {
      this.serviceMunicipalService.getAllServices().subscribe({
        next: (data) => {
          this.servicesMunicipaux = data;
          resolve();
        },
        error: (err) => {
          console.error('Erreur chargement services municipaux', err);
          resolve();
        }
      });
    });
  }

  loadStatistiques(): Promise<void> {
    return new Promise((resolve) => {
      this.statistiquesService.getStatistiquesGenerales().subscribe({
        next: (data) => {
          this.detailedStats = data;
          this.stats.tauxResolution = data.tauxResolution;
          resolve();
        },
        error: (err) => {
          console.error('Erreur chargement statistiques', err);
          resolve();
        }
      });
    });
  }

  getStatutColor(statut: string): string {
    switch(statut) {
      case 'RECU': return 'warning';
      case 'EN_TRAITEMENT': return 'info';
      case 'RESOLU': return 'success';
      case 'EN_ATTENTE': return 'warning';
      case 'EN_COURS': return 'primary';
      case 'TERMINEE': return 'success';
      default: return 'secondary';
    }
  }

  getUrgenceColor(urgence: string): string {
    switch(urgence) {
      case 'HIGH': 
      case 'URGENT': return 'danger';
      case 'MEDIUM': return 'warning';
      case 'LOW':
      case 'NORMAL': return 'success';
      default: return 'secondary';
    }
  }

  getEquipementEtatColor(etat: string): string {
    return etat === 'FONCTIONNEL' ? 'success' : 'danger';
  }

  refreshDashboard(): void {
    this.loadDashboardData();
    this.currentDate = new Date();
  }

  getProgressPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }
  
  getLastInterventionDate(equipement: Equipement): string {
    if (!equipement.dernieresInterventions || equipement.dernieresInterventions.length === 0) {
      return 'Jamais';
    }
    const lastDate = new Date(equipement.dernieresInterventions[0].date);
    return lastDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }
  
}