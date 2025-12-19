import { Component, OnInit } from '@angular/core';
import { InterventionService } from '../../../core/services/intervention.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-technicien-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './technicien-navbar.html',
  styleUrls: ['./technicien-navbar.scss']
})
export class TechnicienNavbarComponent {
 interventionsAssignees: any[] = [];
   interventionsEnCours: any[] = [];
   interventionsTerminees: number = 0;
   today: Date = new Date();
   user: any;
   isLoading = false;
   efficiencyRate = 85; // À calculer dynamiquement
   showUserMenu = false; // AJOUTER
 
   constructor(
     private interventionService: InterventionService,
     private authService: AuthService,
     private router: Router
   ) {}
 
   ngOnInit(): void {
     this.user = this.authService.getCurrentUser();
     console.log('Technicien connecté:', this.user);
     this.loadInterventions();
   }
    getUserInitials(): string {
     if (!this.user || !this.user.prenom || !this.user.nom) {
       return '?';
     }
     return `${this.user.prenom.charAt(0)}${this.user.nom.charAt(0)}`.toUpperCase();
   }
   toggleUserMenu(): void {
     this.showUserMenu = !this.showUserMenu;
   }
   closeUserMenu(): void {
     this.showUserMenu = false;
   }
     logout(): void {
     this.authService.logout();
     this.router.navigate(['/']);
   }
   
 
   loadInterventions(): void {
     this.isLoading = true;
     this.interventionService.getAllInterventions().subscribe({
       next: (interventions) => {
         console.log('Interventions reçues:', interventions.length);
         
         const technicienId = this.user?.email || 'test@technicien.com';
         
         this.interventionsAssignees = interventions
           .filter(i => i.technicienId === technicienId && i.statut === 'EN_ATTENTE')
           .slice(0, 10);
         
         this.interventionsEnCours = interventions
           .filter(i => i.technicienId === technicienId && i.statut === 'EN_COURS')
           .slice(0, 10);
         
         this.interventionsTerminees = interventions
           .filter(i => i.technicienId === technicienId && i.statut === 'TERMINEE').length;
         
         this.isLoading = false;
       },
       error: (error) => {
         console.error('Erreur chargement interventions:', error);
         this.isLoading = false;
       }
     });
   }
 
   getInterventionIcon(type: string): string {
     const icons: {[key: string]: string} = {
       'ELECTRICITE': 'fa-bolt',
       'EAU': 'fa-tint',
       'VOIRIE': 'fa-road',
       'ECLAIRAGE': 'fa-lightbulb',
       'PROPRETE': 'fa-trash-alt',
       'ESPACES_VERTS': 'fa-tree'
     };
     return icons[type] || 'fa-wrench';
   }
 
   getInterventionTypeLabel(type: string): string {
     const labels: {[key: string]: string} = {
       'ELECTRICITE': 'Électricité',
       'EAU': 'Eau',
       'VOIRIE': 'Voirie',
       'ECLAIRAGE': 'Éclairage',
       'PROPRETE': 'Propreté',
       'ESPACES_VERTS': 'Espaces verts'
     };
     return labels[type] || type;
   }
 
   getCompletionRate(): number {
     const total = this.interventionsAssignees.length + this.interventionsEnCours.length + this.interventionsTerminees;
     return total > 0 ? Math.round((this.interventionsTerminees / total) * 100) : 0;
   }
 
   getEfficiency(): number {
     // Logique simplifiée - à adapter avec vos données réelles
     return this.efficiencyRate;
   }
 
   getDuration(startDate: Date | string): string {
     if (!startDate) return '0 min';
     const start = new Date(startDate);
     const now = new Date();
     const diffMs = now.getTime() - start.getTime();
     const diffMins = Math.floor(diffMs / 60000);
     
     if (diffMins < 60) return `${diffMins} min`;
     const hours = Math.floor(diffMins / 60);
     const mins = diffMins % 60;
     return `${hours}h ${mins}min`;
   }
 
   getInterventionProgress(intervention: any): number {
     // Logique simplifiée - à adapter
     return Math.floor(Math.random() * 30) + 70;
   }
 
   demarrerIntervention(interventionId: string): void {
     const auteurId = this.user?.email || 'test@technicien.com';
     
     this.interventionService.changerStatutIntervention(
       interventionId, 
       'EN_COURS',
       auteurId
     ).subscribe({
       next: () => {
         console.log('Intervention démarrée');
         this.loadInterventions();
       },
       error: (error) => console.error('Erreur démarrage:', error)
     });
   }
 
   terminerIntervention(interventionId: string): void {
     const auteurId = this.user?.email || 'test@technicien.com';
     
     this.interventionService.changerStatutIntervention(
       interventionId, 
       'TERMINEE',
       auteurId
     ).subscribe({
       next: () => {
         console.log('Intervention terminée');
         this.loadInterventions();
       },
       error: (error) => console.error('Erreur fin:', error)
     });
   }
 
   viewInterventionDetails(id: string): void {
     this.router.navigate(['/technicien/interventions', id]);
   }
 
   pauseIntervention(id: string): void {
     console.log('Mettre en pause l\'intervention', id);
     // Implémentez cette fonctionnalité
   }
 
   addReport(id: string): void {
     console.log('Ajouter un rapport pour', id);
     // Implémentez cette fonctionnalité
   }
 
   openCalendar(): void {
     console.log('Ouvrir le calendrier');
     // Implémentez cette fonctionnalité
   }
 
   generateReport(): void {
     console.log('Générer un rapport');
     // Implémentez cette fonctionnalité
   }
 }
