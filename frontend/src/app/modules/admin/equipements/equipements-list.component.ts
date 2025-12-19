import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { EquipementService } from '../../../core/services/equipement.service';
import { Equipement } from '../../../core/models/equipement.model';
import { RouterModule, Router } from '@angular/router';
import { AdminNavbarComponent } from '../navbar/admin-navbar.component';

@Component({
  selector: 'app-equipements-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule,AdminNavbarComponent ],
  templateUrl: './equipements-list.component.html',
  styleUrls: ['./equipements-list.component.scss']
})
export class EquipementsListComponent implements OnInit, OnDestroy {

  equipements: Equipement[] = [];
  originalEquipements: Equipement[] = [];
  filterEtat: string = '';
  filterType: string = '';
  isLoading: boolean = false;
  
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private equipementService: EquipementService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEquipements();
    
    // Configurer le debounce pour la recherche
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.filterType = searchTerm;
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEquipements(): void {
    this.isLoading = true;
    this.equipementService.getAllEquipements().subscribe({
      next: (data: Equipement[]) => {
        this.equipements = data;
        this.originalEquipements = [...data];
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement équipements', err);
        this.isLoading = false;
      }
    });
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  applyFilters(): void {
    if (!this.originalEquipements.length) return;

    let filteredEquipements = [...this.originalEquipements];

    // Filtre par état
    if (this.filterEtat) {
      filteredEquipements = filteredEquipements.filter(e => 
        e.etat === this.filterEtat
      );
    }

    // Filtre par type/recherche
    if (this.filterType.trim()) {
      const searchTerm = this.filterType.toLowerCase().trim();
      filteredEquipements = filteredEquipements.filter(e => 
        e.type.toLowerCase().includes(searchTerm) ||
        (e.adresse && e.adresse.toLowerCase().includes(searchTerm))
      );
    }

    this.equipements = filteredEquipements;
  }

  clearFilters(): void {
    this.filterEtat = '';
    this.filterType = '';
    this.equipements = [...this.originalEquipements];
  }

  modifierEquipement(id: string): void {
    this.router.navigate([`/admin/equipements/${id}/modifier`]);
  }

  supprimerEquipement(id: string): void {
    if (confirm('Voulez-vous vraiment supprimer cet équipement ?')) {
      this.equipementService.deleteEquipement(id).subscribe({
        next: () => {
          this.loadEquipements();
        },
        error: (err: any) => {
          console.error('Erreur suppression', err);
          alert('Erreur lors de la suppression de l\'équipement');
        }
      });
    }
  }
}