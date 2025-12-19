import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ServiceMunicipalService } from '../../../core/services/service-municipal.service';
import { ServiceMunicipal } from '../../../core/models/service-municipal.model';
import { AdminNavbarComponent } from '../navbar/admin-navbar.component';

@Component({
  selector: 'app-services-municipaux-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminNavbarComponent],
  templateUrl: './services-municipaux-list.component.html',
  styleUrls: ['./services-municipaux-list.component.scss']
})
export class ServicesMunicipauxListComponent implements OnInit, OnDestroy {

  services: ServiceMunicipal[] = [];
  originalServices: ServiceMunicipal[] = [];
  filteredServices: ServiceMunicipal[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private service: ServiceMunicipalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadServices();
    
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.searchTerm = term;
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadServices(): void {
    this.isLoading = true;
    this.service.getAllServices().subscribe({
      next: (data) => {
        this.services = data;
        this.originalServices = [...data];
        this.filteredServices = [...data];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement services', err);
        this.isLoading = false;
      }
    });
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  applyFilters(): void {
    if (!this.searchTerm.trim()) {
      this.filteredServices = [...this.services];
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredServices = this.services.filter(service =>
      service.nom.toLowerCase().includes(term) ||
      service.description.toLowerCase().includes(term) ||
      (service.interventionsRecent && 
        service.interventionsRecent.some(inter => 
          inter.titre.toLowerCase().includes(term)
        )
      )
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredServices = [...this.services];
  }

  getInterventionStats(service: ServiceMunicipal): { total: number, enCours: number, termine: number } {
    const interventions = service.interventionsRecent || [];
    return {
      total: interventions.length,
      enCours: interventions.filter(i => i.statut === 'EN_COURS').length,
      termine: interventions.filter(i => i.statut === 'TERMINEE').length
    };
  }

  deleteService(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      this.service.deleteService(id).subscribe({
        next: () => {
          this.loadServices();
        },
        error: (err) => {
          console.error('Erreur suppression', err);
          alert('Erreur lors de la suppression du service');
        }
      });
    }
  }

  addIntervention(serviceId: string): void {
    this.router.navigate(['/admin/services-municipaux', serviceId, 'interventions', 'add']);
  }
}