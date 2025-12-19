import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ServiceMunicipalService } from '../../../core/services/service-municipal.service';
import { ServiceMunicipal } from '../../../core/models/service-municipal.model';
import { AdminNavbarComponent } from '../navbar/admin-navbar.component';

@Component({
  selector: 'app-services-municipaux-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AdminNavbarComponent],
  templateUrl: './services-municipaux-edit.component.html',
  styleUrls: ['./services-municipaux-edit.component.scss']
})
export class ServicesMunicipauxEditComponent implements OnInit, OnDestroy {

  serviceForm: FormGroup;
  serviceId: string = '';
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private service: ServiceMunicipalService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.serviceForm = this.fb.group({
      nom: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZÀ-ÿ0-9\s\-.,'&()]+$/)
      ]],
      description: ['', [
        Validators.maxLength(500)
      ]]
    });
  }

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.serviceId = params['id'];
      console.log('🔍 ID récupéré depuis la route:', this.serviceId);
      
      if (this.serviceId) {
        this.loadService();
      } else {
        this.errorMessage = 'Aucun ID de service fourni dans l\'URL';
        console.error('❌ Aucun ID trouvé dans les paramètres de route');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadService(): void {
    console.log('📥 Chargement du service avec ID:', this.serviceId);
    
    // ✅ Validation de l'ID avant l'appel API
    if (!this.serviceId || this.serviceId.trim() === '') {
      console.error('❌ ID de service invalide ou vide');
      this.errorMessage = 'ID de service manquant ou invalide';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    this.service.getServiceById(this.serviceId).subscribe({
      next: (service) => {
        console.log('✅ Service chargé avec succès:', service);
        
        // ✅ Vérification des données reçues
        if (!service) {
          console.error('❌ Aucune donnée de service reçue');
          this.errorMessage = 'Aucune donnée reçue pour ce service';
          this.isLoading = false;
          return;
        }
        
        this.serviceForm.patchValue({
          nom: service.nom || '',
          description: service.description || ''
        });
        
        this.isLoading = false;
        console.log('✅ Formulaire mis à jour avec les données');
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement du service:', err);
        console.error('📊 Status HTTP:', err.status);
        console.error('📄 Message d\'erreur:', err.message);
        console.error('📦 Corps de l\'erreur:', err.error);
        
        // ✅ Gestion détaillée des erreurs
        if (err.status === 0) {
          this.errorMessage = 'Impossible de contacter le serveur. Vérifiez que le backend est démarré sur http://localhost:8085';
        } else if (err.status === 404) {
          this.errorMessage = 'Service non trouvé. Il a peut-être été supprimé ou l\'ID est incorrect.';
        } else if (err.status === 400) {
          this.errorMessage = 'ID de service invalide. Vérifiez le format de l\'ID.';
        } else if (err.status === 500) {
          // ✅ Message plus détaillé pour erreur 500
          const backendMessage = err.error?.message || err.error?.error || '';
          this.errorMessage = `Erreur serveur: ${backendMessage || 'Erreur interne du serveur. Vérifiez les logs backend.'}`;
        } else if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'Non autorisé. Veuillez vous reconnecter.';
        } else {
          this.errorMessage = `Erreur inattendue (${err.status}): ${err.message}`;
        }
        
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.serviceForm.invalid) {
      this.markFormGroupTouched(this.serviceForm);
      this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const serviceData: ServiceMunicipal = {
      nom: this.serviceForm.value.nom,
      description: this.serviceForm.value.description
    };

    console.log('📤 Envoi des données de mise à jour:', serviceData);

    this.service.updateService(this.serviceId, serviceData).subscribe({
      next: (response) => {
        console.log('✅ Service mis à jour avec succès:', response);
        this.successMessage = 'Service mis à jour avec succès !';
        this.isSubmitting = false;
        
        // Redirection après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/admin/services-municipaux']);
        }, 2000);
      },
      error: (err) => {
        console.error('❌ Erreur lors de la mise à jour:', err);
        
        if (err.status === 404) {
          this.errorMessage = 'Service non trouvé. Il a peut-être été supprimé.';
        } else if (err.status === 400) {
          this.errorMessage = 'Données invalides. Veuillez vérifier les informations saisies.';
        } else if (err.status === 409) {
          this.errorMessage = 'Un service avec ce nom existe déjà.';
        } else if (err.status === 500) {
          const backendMessage = err.error?.message || '';
          this.errorMessage = `Erreur serveur: ${backendMessage || 'Veuillez réessayer'}`;
        } else {
          this.errorMessage = `Erreur lors de la mise à jour (${err.status})`;
        }
        
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    if (this.serviceForm.dirty) {
      if (confirm('Vous avez des modifications non enregistrées. Voulez-vous vraiment annuler ?')) {
        this.router.navigate(['/admin/services-municipaux']);
      }
    } else {
      this.router.navigate(['/admin/services-municipaux']);
    }
  }

  onDelete(): void {
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer le service "${this.serviceForm.value.nom}" ?\n\nCette action est irréversible.`;
    
    if (confirm(confirmMessage)) {
      this.isSubmitting = true;
      this.errorMessage = '';
      
      console.log('🗑️ Suppression du service:', this.serviceId);
      
      this.service.deleteService(this.serviceId).subscribe({
        next: () => {
          console.log('✅ Service supprimé avec succès');
          this.router.navigate(['/admin/services-municipaux']);
        },
        error: (err) => {
          console.error('❌ Erreur lors de la suppression:', err);
          
          if (err.status === 404) {
            this.errorMessage = 'Service non trouvé. Il a peut-être déjà été supprimé.';
          } else {
            this.errorMessage = 'Erreur lors de la suppression du service.';
          }
          
          this.isSubmitting = false;
        }
      });
    }
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

  // Helper pour les classes CSS
  getFieldClass(field: any): string {
    if (field?.invalid && field?.touched) return 'is-invalid';
    if (field?.valid && field?.touched) return 'is-valid';
    return '';
  }
}