import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EquipementService } from '../../../core/services/equipement.service';
import { Equipement } from '../../../core/models/equipement.model';
import { AdminNavbarComponent } from '../navbar/admin-navbar.component';

@Component({
  selector: 'app-equipement-edit',
  standalone: true,
  imports: [CommonModule, FormsModule,AdminNavbarComponent ],
  templateUrl: './equipement-edit.component.html',
  styleUrls: ['./equipement-edit.component.scss']
})
export class EquipementEditComponent implements OnInit {
  equipement: Equipement = {
    type: '',
    adresse: '',
    etat: 'FONCTIONNEL',
    localisation: {
      type: 'Point',
      coordinates: [0, 0]
    }
  };

  isLoading = false;
  isFetching = true;
  errorMessage = '';
  equipementId: string = '';

  constructor(
    private equipementService: EquipementService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.equipementId = this.route.snapshot.params['id'];
    this.loadEquipement();
  }

  loadEquipement(): void {
    this.isFetching = true;
    this.equipementService.getEquipementById(this.equipementId).subscribe({
      next: (data) => {
        this.equipement = data;
        this.isFetching = false;
      },
      error: (error) => {
        console.error('Erreur chargement équipement:', error);
        this.errorMessage = 'Impossible de charger l\'équipement';
        this.isFetching = false;
      }
    });
  }

  onSubmit(): void {
    if (this.validateForm()) {
      this.isLoading = true;
      this.errorMessage = '';

      this.equipementService.updateEquipement(this.equipementId, this.equipement).subscribe({
        next: () => {
          this.router.navigate(['/admin/equipements']);
        },
        error: (error) => {
          console.error('Erreur mise à jour équipement:', error);
          this.errorMessage = 'Erreur lors de la mise à jour de l\'équipement';
          this.isLoading = false;
        }
      });
    }
  }

  validateForm(): boolean {
    if (!this.equipement.type.trim()) {
      this.errorMessage = 'Le type est requis';
      return false;
    }
    if (!this.equipement.adresse.trim()) {
      this.errorMessage = 'L\'adresse est requise';
      return false;
    }
    return true;
  }

  onCancel(): void {
    this.router.navigate(['/admin/equipements']);
  }
}