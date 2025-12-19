import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ServiceMunicipalService } from '../../../core/services/service-municipal.service';
import { ServiceMunicipal } from '../../../core/models/service-municipal.model';
import { AdminNavbarComponent } from '../navbar/admin-navbar.component';

@Component({
  selector: 'app-services-municipaux-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AdminNavbarComponent],
  templateUrl: './services-municipaux-form.component.html',
  styleUrls: ['./services-municipaux-form.component.scss']
})
export class ServicesMunicipauxFormComponent implements OnInit {

  serviceForm: FormGroup;
  isEditMode: boolean = false;
  serviceId: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private service: ServiceMunicipalService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.serviceForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.serviceId = params['id'];
        this.loadService();
      }
    });
  }

  loadService(): void {
    this.isLoading = true;
    this.service.getServiceById(this.serviceId).subscribe({
      next: (service) => {
        this.serviceForm.patchValue({
          nom: service.nom,
          description: service.description
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement service', err);
        this.errorMessage = 'Impossible de charger le service';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.serviceForm.invalid) {
      this.markFormGroupTouched(this.serviceForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const serviceData: ServiceMunicipal = {
      ...this.serviceForm.value
    };

    if (this.isEditMode) {
      this.service.updateService(this.serviceId, serviceData).subscribe({
        next: () => {
          this.router.navigate(['/admin/services-municipaux']);
        },
        error: (err) => {
          console.error('Erreur mise à jour', err);
          this.errorMessage = 'Erreur lors de la mise à jour du service';
          this.isLoading = false;
        }
      });
    } else {
      this.service.createService(serviceData).subscribe({
        next: () => {
          this.router.navigate(['/admin/services-municipaux']);
        },
        error: (err) => {
          console.error('Erreur création', err);
          this.errorMessage = 'Erreur lors de la création du service';
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/services-municipaux']);
  }

  // Marquer tous les champs comme touchés pour afficher les erreurs
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Getters pour accéder facilement aux contrôles du formulaire
  get nom() { return this.serviceForm.get('nom'); }
  get description() { return this.serviceForm.get('description'); }
}