import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SignalementService } from '../../../core/services/signalement.service';
import { Signalement, StatutSignalement } from '../../../core/models/signalement.model';

@Component({
  selector: 'app-signalement-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signalement-form.component.html',
  styleUrls: ['./signalement-form.component.scss']
})
export class SignalementFormComponent implements OnInit {
  
  private fb = inject(FormBuilder);
  private signalementService = inject(SignalementService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  signalementForm!: FormGroup;
  isEditMode = false;
  signalementId: string | null = null;
  loading = false;
  submitted = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  
  // Variables pour la localisation
  selectedLocation: { lat: number; lng: number; address?: string } | null = null;
  locationFromMap = false;
  
  // Types de signalements
  typesSignalement = [
    { value: 'POTHOLE', label: 'Nid-de-poule', icon: 'road' },
    { value: 'LIGHTING', label: 'Éclairage défectueux', icon: 'lightbulb' },
    { value: 'GARBAGE', label: 'Déchets non collectés', icon: 'trash' },
    { value: 'TREE', label: 'Arbre dangereux', icon: 'tree' },
    { value: 'WATER', label: 'Fuite d\'eau', icon: 'tint' },
    { value: 'SIGNAL', label: 'Signalisation endommagée', icon: 'traffic-light' },
    { value: 'OTHER', label: 'Autre problème', icon: 'exclamation-circle' }
  ];
  
  // Urgences
  urgences = [
    { value: 'LOW', label: 'Faible', color: 'green' },
    { value: 'MEDIUM', label: 'Moyenne', color: 'orange' },
    { value: 'HIGH', label: 'Haute', color: 'red' }
  ];
  
  // Fichier photo
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  
  ngOnInit() {
    this.initForm();
    this.loadLocationFromStorage();
    this.checkEditMode();
  }
  
  initForm() {
    this.signalementForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      type: ['', Validators.required],
      urgence: ['MEDIUM', Validators.required],
      localisation: ['', Validators.required],
      coordonnees: ['', Validators.required], 
      adresse: ['', Validators.required],   
      photo: [null],
      contactNom: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactTelephone: ['', [Validators.pattern(/^[0-9]{8}$/)]]
    });
  }
  
  loadLocationFromStorage() {
    const storedLocation = localStorage.getItem('selectedLocation');
    if (storedLocation) {
      try {
        this.selectedLocation = JSON.parse(storedLocation);
        this.locationFromMap = true;
        
        if (this.selectedLocation) {
          this.signalementForm.patchValue({
            localisation: this.selectedLocation.address || 'Localisation sélectionnée sur la carte',
            coordonnees: `${this.selectedLocation.lat}, ${this.selectedLocation.lng}`,
            adresse: this.selectedLocation.address || ''
          });
        }
        
        localStorage.removeItem('selectedLocation');
      } catch (error) {
        console.error('Erreur lors du chargement de la localisation:', error);
      }
    }
  }
  
  checkEditMode() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.signalementId = id;
        this.loadSignalement(id);
      }
    });
  }
  
  loadSignalement(id: string) {
    this.loading = true;
    this.signalementService.getSignalementById(id).subscribe({
      next: (signalement) => {
        this.populateForm(signalement);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du signalement:', error);
        this.errorMessage = 'Impossible de charger le signalement';
        this.loading = false;
      }
    });
  }
  
  populateForm(signalement: Signalement) {
    this.signalementForm.patchValue({
      titre: signalement.titre,
      description: signalement.description,
      type: signalement.type,
      urgence: signalement.urgence,
      localisation: signalement.localisation,
      coordonnees: signalement.coordonnees || '',
      adresse: signalement.adresse || '',
      contactNom: signalement.contactNom,
      contactEmail: signalement.contactEmail,
      contactTelephone: signalement.contactTelephone || ''
    });
    
    if (signalement.photo) {
      this.previewUrl = signalement.photo;
    }
  }
  
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'La photo est trop volumineuse (max 5MB)';
        return;
      }
      
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
        this.errorMessage = 'Seules les images JPEG, PNG et GIF sont acceptées';
        return;
      }
      
      this.selectedFile = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
      
      this.signalementForm.patchValue({
        photo: file
      });
    }
  }
  
  removePhoto() {
    this.selectedFile = null;
    this.previewUrl = null;
    this.signalementForm.patchValue({
      photo: null
    });
  }
  
  useCurrentLocation() {
    if (navigator.geolocation) {
      this.loading = true;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.getAddressFromCoordinates(lat, lng);
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          this.errorMessage = 'Impossible d\'obtenir votre position';
          this.loading = false;
        }
      );
    } else {
      this.errorMessage = 'La géolocalisation n\'est pas supportée par votre navigateur';
    }
  }
  
  getAddressFromCoordinates(lat: number, lng: number) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const address = data.display_name || 'Localisation actuelle';
        
        this.signalementForm.patchValue({
          localisation: address,
          coordonnees: `${lat}, ${lng}`,
          adresse: address
        });
        
        this.loading = false;
      })
      .catch(error => {
        console.error('Erreur de géocodage:', error);
        this.signalementForm.patchValue({
          localisation: 'Position actuelle',
          coordonnees: `${lat}, ${lng}`
        });
        this.loading = false;
      });
  }
  
  selectOnMap() {
    this.router.navigate(['/map']);
  }
  
  
  onSubmit() {
  console.log('🟢🟢🟢 onSubmit() appelé !');
  
  this.submitted = true;
  this.errorMessage = null;
  this.successMessage = null;
  
  // Vérifier la validité du formulaire
  if (this.signalementForm.invalid) {
    console.log('❌ Formulaire invalide, arrêt de la soumission');
    Object.keys(this.signalementForm.controls).forEach(key => {
      const control = this.signalementForm.get(key);
      control?.markAsTouched();
    });
    return;
  }
  
  console.log('✅ Formulaire valide, poursuite de la soumission');
  this.loading = true;
  
  const formValue = this.signalementForm.value;
  
  // Créer l'objet signalement avec TOUS les champs requis
  const signalement: Signalement = {
    titre: formValue.titre,
    description: formValue.description,
    type: formValue.type,
    urgence: formValue.urgence,
    localisation: formValue.localisation,
    // ✅ Ces champs sont maintenant requis dans l'interface
    coordonnees: formValue.coordonnees || 'Non spécifié',
    adresse: formValue.adresse || formValue.localisation,
    contactNom: formValue.contactNom,
    contactEmail: formValue.contactEmail,
    contactTelephone: formValue.contactTelephone || '',
    // ✅ Champs requis par le backend
    statut: 'RECU',
    dateCreation: new Date(),
    historique: [{
      date: new Date(),
      action: 'Signalement créé',
      responsable: formValue.contactNom
    }]
  };

  console.log('📤 Signalement à envoyer:', signalement);

  if (this.isEditMode && this.signalementId) {
    this.updateSignalement(signalement);
  } else {
    this.createSignalement(signalement);
  }
}


  createSignalement(signalement: Signalement) {
    console.log('Envoi au backend:', signalement);
    
    this.signalementService.createSignalement(signalement).subscribe({
      next: (response) => {
        console.log('Réponse du backend:', response);
        
        if (this.selectedFile && response.id) {
          this.uploadPhoto(response.id);
        } else {
          this.onSignalementCreated(response);
        }
      },
      error: (error) => {
        console.error('Erreur complète:', error);
        if (error.error) {
          console.error('Détails erreur:', error.error);
        }
        this.errorMessage = `Erreur: ${error.message || 'Problème de connexion au serveur'}`;
        this.loading = false;
      }
    });
  }

  uploadPhoto(signalementId: string) {
    if (!this.selectedFile) {
      this.onSignalementCreated({ id: signalementId } as Signalement);
      return;
    }

    this.signalementService.uploadPhoto(signalementId, this.selectedFile).subscribe({
      next: () => {
        this.onSignalementCreated({ id: signalementId } as Signalement);
      },
      error: (error) => {
        console.error('Erreur lors de l\'upload de la photo:', error);
        this.onSignalementCreated({ id: signalementId } as Signalement);
      }
    });
  }

  onSignalementCreated(response: Signalement) {
    this.loading = false;
    this.successMessage = 'Signalement envoyé avec succès !';
    
    setTimeout(() => {
      this.router.navigate(['/citoyen/mes-signalements']);
    }, 2000);
  }
  
  updateSignalement(signalement: Signalement) {
    if (!this.signalementId) return;
    
    console.log('Mise à jour du signalement:', signalement);
    
    this.signalementService.updateSignalement(this.signalementId, signalement).subscribe({
      next: (response) => {
        this.onSignalementCreated(response);
      },
      error: (error) => {
        console.error('Erreur mise à jour:', error);
        this.errorMessage = 'Erreur lors de la mise à jour';
        this.loading = false;
      }
    });
  }
  
  // ⭐⭐ AJOUTEZ CES DEUX MÉTHODES MANQUANTES ⭐⭐
  
  cancel() {
    if (confirm('Voulez-vous vraiment annuler ? Les modifications seront perdues.')) {
      this.router.navigate(['/map']);
    }
  }
  
  get f() {
    return this.signalementForm.controls;
  }
  
  getTypeIcon(type: string): string {
    const typeObj = this.typesSignalement.find(t => t.value === type);
    return typeObj ? typeObj.icon : 'exclamation-circle';
  }
  
  getTypeLabel(type: string): string {
    const typeObj = this.typesSignalement.find(t => t.value === type);
    return typeObj ? typeObj.label : 'Autre';
  }
  // Dans la classe SignalementFormComponent, ajoutez :

}