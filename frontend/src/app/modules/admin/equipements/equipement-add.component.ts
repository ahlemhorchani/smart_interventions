import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EquipementService } from '../../../core/services/equipement.service';
import { Equipement } from '../../../core/models/equipement.model';
import { AdminNavbarComponent } from '../navbar/admin-navbar.component';

@Component({
  selector: 'app-equipement-add',
  standalone: true,
  imports: [CommonModule, FormsModule,AdminNavbarComponent ],
  templateUrl: './equipement-add.component.html',
  styleUrls: ['./equipement-add.component.scss']
})
export class EquipementAddComponent {
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
  errorMessage = '';

  constructor(
    private equipementService: EquipementService,
    private router: Router
  ) {}

  onSubmit(): void {
  if (this.validateForm()) {
    this.isLoading = true;
    this.errorMessage = '';

    // Préparer les données au format attendu par le backend
    const equipementData = {
      type: this.equipement.type,
      adresse: this.equipement.adresse,
      etat: this.equipement.etat,
      localisation: {
        type: 'Point',
        coordinates: [
          this.equipement.localisation.coordinates[0] || 0,
          this.equipement.localisation.coordinates[1] || 0
        ]
      }
    };

    console.log('Données envoyées:', equipementData); // Pour debug

    this.equipementService.createEquipement(equipementData as any).subscribe({
      next: () => {
        this.router.navigate(['/admin/equipements']);
      },
      error: (error) => {
        console.error('Erreur création équipement:', error);
        console.error('Détails de l\'erreur:', error.error); // Plus de détails
        this.errorMessage = error.error?.message || 'Erreur lors de la création de l\'équipement';
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