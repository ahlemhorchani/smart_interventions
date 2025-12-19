// interventions-technicien.component.ts - MODIFIÉ
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { InterventionService } from '../../../core/services/intervention.service';
import { Intervention } from '../../../core/models/intervention.model';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { TechnicienNavbarComponent } from '../technicien-navbar/technicien-navbar';
@Component({
  selector: 'app-interventions-technicien',
  standalone: true,
  imports: [CommonModule, FormsModule, TechnicienNavbarComponent,RouterModule],
  templateUrl: './interventions-technicien.component.html',
  styleUrls: ['./interventions-technicien.component.scss']
})
export class InterventionsTechnicienComponent implements OnInit {
  interventions: Intervention[] = [];
  loading = false;
  errorMessage = '';
  technicienInfo: User | null = null;

  // Filtres
  statutFilter: string = 'TOUS';
  urgenceFilter: string = 'TOUS';
  
  // Statistiques
  stats = {
    total: 0,
    enAttente: 0,
    enCours: 0,
    terminees: 0,
    urgentes: 0
  };

  constructor(
    private interventionService: InterventionService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log('🔧 Initialisation du composant interventions technicien');
    
    // Récupérer l'utilisateur connecté
    this.technicienInfo = this.authService.getCurrentUser();
    
    if (this.technicienInfo && this.technicienInfo.role === 'TECHNICIEN') {
      console.log('👤 Technicien identifié:', this.technicienInfo);
      this.loadInterventions();
    } else {
      console.error('❌ Utilisateur non connecté ou non technicien');
      this.errorMessage = 'Vous devez être connecté en tant que technicien';
    }
  }
  

  loadInterventions(): void {
    this.loading = true;
    this.errorMessage = '';
    
    console.log('📡 Appel de getMyInterventions()');
    
    this.interventionService.getMyInterventions().subscribe({
      next: (data) => {
        console.log('✅ Interventions reçues:', data);
        console.log('📊 Nombre d\'interventions:', data.length);
        
        this.interventions = data;
        this.calculateStats();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('❌ Erreur lors du chargement des interventions:', err);
        console.error('📊 Status:', err.status);
        console.error('📄 Message:', err.message);
        console.error('🔗 URL appelée:', err.url);
        
        this.errorMessage = 'Erreur lors du chargement des interventions: ' + 
          (err.status === 401 ? 'Non authentifié' : 
           err.status === 403 ? 'Accès refusé' : 
           err.message || 'Inconnue');
        this.loading = false;
        
        // Fallback: essayer avec l'ancienne méthode si /me ne fonctionne pas
        if (this.technicienInfo?.id) {
          console.log('🔄 Tentative avec méthode de secours (getInterventionsByTechnicien)');
          this.loadInterventionsFallback();
        }
      }
    });
  }

  loadInterventionsFallback(): void {
    if (!this.technicienInfo?.id) {
      this.errorMessage = 'Impossible de charger les interventions';
      return;
    }
    
    this.interventionService.getInterventionsByTechnicien(this.technicienInfo.id).subscribe({
      next: (data) => {
        console.log('✅ Interventions (fallback) reçues:', data.length);
        this.interventions = data;
        this.calculateStats();
      },
      error: (err) => {
        console.error('❌ Erreur fallback:', err);
      }
    });
  }

  calculateStats(): void {
    this.stats = {
      total: this.interventions.length,
      enAttente: this.interventions.filter(i => i.statut === 'EN_ATTENTE').length,
      enCours: this.interventions.filter(i => i.statut === 'EN_COURS').length,
      terminees: this.interventions.filter(i => i.statut === 'TERMINEE').length,
      urgentes: this.interventions.filter(i => i.urgence === 'URGENT').length
    };
    
    console.log('📈 Statistiques calculées:', this.stats);
  }

  get filteredInterventions(): Intervention[] {
    return this.interventions.filter(intervention => {
      let statutMatch = true;
      let urgenceMatch = true;

      if (this.statutFilter !== 'TOUS') {
        statutMatch = intervention.statut === this.statutFilter;
      }

      if (this.urgenceFilter !== 'TOUS') {
        urgenceMatch = intervention.urgence === this.urgenceFilter;
      }

      return statutMatch && urgenceMatch;
    });
  }

  changerStatut(intervention: Intervention, nouveauStatut: string): void {
    const auteurId = this.authService.getCurrentUser()?.id || 'system';
    console.log(`🔄 Changement de statut: ${intervention.id} -> ${nouveauStatut}`);
    
    this.interventionService.changerStatutIntervention(intervention.id!, nouveauStatut, auteurId)
      .subscribe({
        next: (updated: Intervention) => {
          console.log('✅ Statut mis à jour:', updated);
          
          const index = this.interventions.findIndex(i => i.id === intervention.id);
          if (index !== -1) {
            this.interventions[index] = updated;
            this.calculateStats();
          }

          if (nouveauStatut === 'EN_COURS' && !intervention.dateDebut) {
            this.enregistrerDateDebut(intervention.id!);
          }

          if (nouveauStatut === 'TERMINEE' && !intervention.dateFin) {
            this.enregistrerDateFin(intervention.id!);
          }
        },
        error: (err) => {
          console.error('❌ Erreur lors du changement de statut:', err);
          alert('Erreur lors du changement de statut: ' + (err.message || 'Inconnue'));
        }
      });
  }

  enregistrerDateDebut(interventionId: string): void {
    const intervention = this.interventions.find(i => i.id === interventionId);
    if (intervention) {
      intervention.dateDebut = new Date();
      this.interventionService.updateIntervention(interventionId, intervention).subscribe({
        next: () => console.log('✅ Date début enregistrée'),
        error: (err) => console.error('❌ Erreur date début:', err)
      });
    }
  }

  enregistrerDateFin(interventionId: string): void {
    const intervention = this.interventions.find(i => i.id === interventionId);
    if (intervention) {
      intervention.dateFin = new Date();
      if (intervention.dateDebut) {
        const dureeMs = intervention.dateFin.getTime() - intervention.dateDebut.getTime();
        intervention.dureeReelle = Math.round(dureeMs / (1000 * 60)); // minutes
      }
      this.interventionService.updateIntervention(interventionId, intervention).subscribe({
        next: () => console.log('✅ Date fin enregistrée'),
        error: (err) => console.error('❌ Erreur date fin:', err)
      });
    }
  }

  truncateText(text: string, limit: number): string {
    if (!text) return '';
    return text.length <= limit ? text : text.substring(0, limit) + '...';
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'Non défini';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}