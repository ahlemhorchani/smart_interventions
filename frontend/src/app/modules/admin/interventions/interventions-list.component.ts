import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InterventionService } from '../../../core/services/intervention.service';
import { Intervention } from '../../../core/models/intervention.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminNavbarComponent } from '../navbar/admin-navbar.component';

@Component({
  selector: 'app-interventions-list',
  standalone: true,
  imports: [FormsModule,CommonModule,AdminNavbarComponent ],
  templateUrl: './interventions-list.component.html',
  styleUrls: ['./interventions-list.component.scss']
})
export class InterventionsListComponent implements OnInit {

  interventions: Intervention[] = [];
  filteredInterventions: Intervention[] = [];

  // Filtres
  filterStatut: string = '';
  filterUrgence: string = '';
  filterType: string = '';

  // Pagination simple
  currentPage: number = 1;
  pageSize: number = 5;

  constructor(
    private interventionService: InterventionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInterventions();
  }

  loadInterventions(): void {
    this.interventionService.getAllInterventions().subscribe({
      next: (data) => {
        this.interventions = data;
        this.applyFilters();
      },
      error: (err) => console.error(err)
    });
  }

  applyFilters(): void {
    this.filteredInterventions = this.interventions.filter(i => 
      (!this.filterStatut || i.statut === this.filterStatut) &&
      (!this.filterUrgence || i.urgence === this.filterUrgence) &&
      (!this.filterType || i.type.toLowerCase().includes(this.filterType.toLowerCase()))
    );
    this.currentPage = 1;
  }

  clearFilters(): void {
    this.filterStatut = '';
    this.filterUrgence = '';
    this.filterType = '';
    this.applyFilters();
  }

  modifierIntervention(id: string | undefined): void {
    if (id) this.router.navigate([`/admin/interventions/${id}/modifier`]);
  }

  supprimerIntervention(id: string | undefined): void {
    if (!id) return;
    if (confirm('Êtes-vous sûr de vouloir supprimer cette intervention ?')) {
      this.interventionService.deleteIntervention(id).subscribe({
        next: () => this.loadInterventions(),
        error: (err) => console.error(err)
      });
    }
  }

  affecterTechnicien(intervention: Intervention): void {
    alert('Fonctionnalité Affecter Technicien à implémenter');
  }

  getStatutColor(statut: string): string {
    switch(statut) {
      case 'EN_ATTENTE': return 'orange';
      case 'EN_COURS': return 'blue';
      case 'TERMINEE': return 'green';
      default: return 'gray';
    }
  }

  getUrgenceColor(urgence: string): string {
    return urgence === 'URGENT' ? 'red' : 'black';
  }

  // Pagination simple
  get paginatedInterventions(): Intervention[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredInterventions.slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.filteredInterventions.length / this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage = page;
    }
  }
}
