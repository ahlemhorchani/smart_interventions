import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TechnicienService } from '../../../core/services/technicien.service';
import { User } from '../../../core/models/user.model';
import { AdminNavbarComponent } from '../navbar/admin-navbar.component';

@Component({
  selector: 'app-techniciens-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavbarComponent],
  templateUrl: './techniciens-list.component.html',
  styleUrls: ['./techniciens-list.component.scss'],
})
export class TechniciensListComponent implements OnInit {

  techniciens: User[] = [];
  filteredTechniciens: User[] = []; // AJOUTÉ pour les filtres
  filterDisponibilite: string = '';
  filterNom: string = '';
  loading: boolean = false; // AJOUTÉ pour gérer l'état de chargement

  constructor(
    private technicienService: TechnicienService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTechniciens();
  }

  loadTechniciens(): void {
    this.loading = true; // AJOUTÉ
    this.technicienService.getAllTechniciens().subscribe({
      next: (data: User[]) => {
        this.techniciens = data;
        this.filteredTechniciens = data; // AJOUTÉ
        this.loading = false; // AJOUTÉ
      },
      error: (err: any) => {
        console.error('Erreur chargement techniciens', err);
        this.loading = false; // AJOUTÉ
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.techniciens];
    
    if (this.filterDisponibilite) {
      const dispo = this.filterDisponibilite === 'true';
      filtered = filtered.filter(t => t.disponibilite === dispo);
    }
    
    if (this.filterNom) {
      const filtre = this.filterNom.toLowerCase();
      filtered = filtered.filter(t => 
        t.nom.toLowerCase().includes(filtre) || 
        t.prenom.toLowerCase().includes(filtre)
      );
    }
    
    this.filteredTechniciens = filtered;
  }

  clearFilters(): void {
    this.filterDisponibilite = '';
    this.filterNom = '';
    this.filteredTechniciens = [...this.techniciens];
  }

  modifierTechnicien(id: string): void {
    this.router.navigate([`/admin/techniciens/${id}/modifier`]);
  }

  getDisponibleCount(): number {
    return this.techniciens.filter(t => t.disponibilite).length;
  }

  getTotalCount(): number {
    return this.techniciens.length;
  }

  supprimerTechnicien(id: string): void {
    if (confirm('Voulez-vous vraiment supprimer ce technicien ?')) {
      this.technicienService.deleteTechnicien(id).subscribe({
        next: () => this.loadTechniciens(),
        error: (err: any) => console.error('Erreur suppression', err)
      });
    }
  }
}