import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ServiceMunicipalService } from '../../../core/services/service-municipal.service';
import { ServiceMunicipal, InterventionRecent } from '../../../core/models/service-municipal.model';
import { AdminNavbarComponent } from '../navbar/admin-navbar.component';

@Component({
  selector: 'app-services-municipaux-details',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminNavbarComponent],
  templateUrl: './services-municipaux-details.component.html',
  styleUrls: ['./services-municipaux-details.component.scss']
})
export class ServicesMunicipauxDetailsComponent implements OnInit, OnDestroy {

  serviceId: string = '';
  service: ServiceMunicipal | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  
  private destroy$ = new Subject<void>();

  constructor(
    private serviceService: ServiceMunicipalService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.serviceId = params['id'];
      if (this.serviceId) {
        this.loadService();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadService(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.serviceService.getServiceById(this.serviceId).subscribe({
      next: (service) => {
        this.service = service;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement service', err);
        this.errorMessage = 'Impossible de charger les détails du service.';
        this.isLoading = false;
      }
    });
  }

  getInterventionStats(): { total: number, enCours: number, termine: number } {
    const interventions = this.service?.interventionsRecent || [];
    return {
      total: interventions.length,
      enCours: interventions.filter(i => i.statut === 'EN_COURS').length,
      termine: interventions.filter(i => i.statut === 'TERMINEE').length
    };
  }

  getUrgenceClass(urgence: string): string {
    switch (urgence) {
      case 'URGENT':
        return 'urgence-high';
      case 'NORMAL':
        return 'urgence-normal';
      default:
        return '';
    }
  }

  getStatutClass(statut: string): string {
    switch (statut) {
      case 'EN_COURS':
        return 'statut-en-cours';
      case 'TERMINEE':
        return 'statut-terminee';
      case 'EN_ATTENTE':
        return 'statut-en-attente';
      default:
        return '';
    }
  }

  onEdit(): void {
    this.router.navigate(['/admin/services-municipaux', this.serviceId, 'edit']);
  }

  onDelete(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      this.serviceService.deleteService(this.serviceId).subscribe({
        next: () => {
          this.router.navigate(['/admin/services-municipaux']);
        },
        error: (err) => {
          console.error('Erreur suppression', err);
          alert('Erreur lors de la suppression du service');
        }
      });
    }
  }

  onAddIntervention(): void {
    this.router.navigate(['/admin/services-municipaux', this.serviceId, 'interventions', 'add']);
  }
}