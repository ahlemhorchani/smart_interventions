import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SignalementService } from '../../../core/services/signalement.service';
import { Signalement, StatutSignalement, TypeSignalement, UrgenceSignalement } from '../../../core/models/signalement.model';
import { AdminNavbarComponent } from '../navbar/admin-navbar.component';
@Component({
  selector: 'app-signalement-list',
  standalone: true,
  imports: [CommonModule, RouterModule,AdminNavbarComponent , FormsModule],
  templateUrl: './signalement-list.component.html',
  styleUrls: ['./signalement-list.component.scss']
})
export class SignalementListComponent implements OnInit {

  signalements: Signalement[] = [];
  filteredSignalements: Signalement[] = [];
  selectedStatut: StatutSignalement | 'ALL' = 'ALL';
  loading: boolean = true;
  
  // Pour le modal photo
  selectedPhoto: string | null = null;
  selectedSignalement: Signalement | null = null;

  constructor(
    private signalementService: SignalementService,
    private router: Router
  ) {}

  ngOnInit(): void {
  console.log('🔧 SignalementListComponent - OnInit');
  console.log('📍 URL actuelle:', window.location.href);
  console.log('🔗 Routes disponibles pour test:');
  console.log('  - /admin/interventions/nouvelle');
  console.log('  - /admin/signalements');
  
  // Test des boutons
  setTimeout(() => {
    const buttons = document.querySelectorAll('button');
    console.log(`✅ ${buttons.length} boutons trouvés sur la page`);
    
    buttons.forEach((btn, index) => {
      btn.addEventListener('click', (e) => {
        console.log(`🖱️ Bouton ${index + 1} cliqué:`, btn.textContent?.trim());
      });
    });
  }, 1000);
  
  this.loadSignalements();
}

  loadSignalements(): void {
    console.log('📥 Chargement des signalements...');
    this.loading = true;
    
    this.signalementService.getAllSignalements().subscribe({
      next: (data) => {
        console.log('✅ Signalements chargés:', data.length);
        this.signalements = data;
        this.filteredSignalements = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Erreur chargement signalements:', err);
        this.loading = false;
      }
    });
  }

  filterByStatut(): void {
    console.log('🔍 Filtrage par statut:', this.selectedStatut);
    
    if (this.selectedStatut === 'ALL') {
      this.filteredSignalements = this.signalements;
    } else {
      this.filteredSignalements = this.signalements.filter(
        s => s.statut === this.selectedStatut
      );
    }
    
    console.log('✅ Résultats filtrés:', this.filteredSignalements.length);
  }

  // Méthodes pour les labels
  getUrgenceLabel(urgence: UrgenceSignalement): string {
    switch(urgence) {
      case 'HIGH': return 'Élevée';
      case 'MEDIUM': return 'Moyenne';
      case 'LOW': return 'Basse';
      default: return urgence;
    }
  }

  getTypeLabel(type: TypeSignalement): string {
    const typeLabels: { [key in TypeSignalement]: string } = {
      'POTHOLE': 'Nid-de-poule',
      'LIGHTING': 'Éclairage',
      'GARBAGE': 'Déchets',
      'TREE': 'Arbre',
      'WATER': 'Eau',
      'SIGNAL': 'Signalisation',
      'OTHER': 'Autre'
    };
    return typeLabels[type] || type;
  }

  getStatutLabel(statut: StatutSignalement): string {
    switch(statut) {
      case 'RECU': return 'Reçu';
      case 'EN_TRAITEMENT': return 'En traitement';
      case 'RESOLU': return 'Résolu';
      default: return statut;
    }
  }

  getUrgenceClass(urgence: UrgenceSignalement): string {
    switch(urgence) {
      case 'HIGH': return 'badge-danger';
      case 'MEDIUM': return 'badge-warning';
      case 'LOW': return 'badge-success';
      default: return 'badge-secondary';
    }
  }

  // URL de la photo
  getPhotoUrl(photoPath: string): string {
    if (photoPath.startsWith('http')) {
      return photoPath;
    }
    return `http://localhost:8085/api/uploads/${photoPath}`;
  }

  // Gestion des photos
  viewPhoto(signalement: Signalement): void {
    if (signalement.photo) {
      this.selectedPhoto = signalement.photo;
      this.selectedSignalement = signalement;
    }
  }

  closePhotoModal(): void {
    this.selectedPhoto = null;
    this.selectedSignalement = null;
  }

  // Navigation
  viewIntervention(interventionId: string): void {
    console.log('🔗 Navigation vers intervention:', interventionId);
    this.router.navigate(['/admin/interventions', interventionId]);
  }

  viewDetails(signalement: Signalement): void {
    console.log('👁️ Affichage des détails:', signalement.id);
    alert(`
      Détails du signalement:
      Titre: ${signalement.titre}
      Description: ${signalement.description}
      Type: ${this.getTypeLabel(signalement.type)}
      Urgence: ${this.getUrgenceLabel(signalement.urgence)}
      Adresse: ${signalement.adresse}
      Coordonnées: ${signalement.coordonnees}
      Signalé par: ${signalement.contactNom} (${signalement.contactEmail})
      Date: ${new Date(signalement.dateCreation).toLocaleString()}
      Statut: ${this.getStatutLabel(signalement.statut)}
    `);
  }

  /**
   * ✅ CORRECTION: Changer le statut et recharger
   */
  changeStatut(signalement: Signalement, nouveauStatut: StatutSignalement): void {
    console.log(`📝 Changement de statut pour ${signalement.id}:`, signalement.statut, '→', nouveauStatut);
    
    const confirmMessage = `Voulez-vous vraiment changer le statut en "${this.getStatutLabel(nouveauStatut)}" ?`;
    
    if (confirm(confirmMessage)) {
      // Créer une copie avec le nouveau statut
      const signalementUpdated = {
        ...signalement,
        statut: nouveauStatut
      };

      this.signalementService.updateSignalement(signalement.id!, signalementUpdated).subscribe({
        next: (updated) => {
          console.log('✅ Statut mis à jour avec succès:', updated);
          
          // ✅ CORRECTION: Recharger les signalements pour voir les changements
          this.loadSignalements();
          
          // Ajouter à l'historique si disponible
          this.addToHistory(
            signalement.id!, 
            `Statut changé en ${this.getStatutLabel(nouveauStatut)}`, 
            'Administrateur'
          );
        },
        error: (err) => {
          console.error('❌ Erreur mise à jour signalement:', err);
          alert(`Erreur lors de la mise à jour: ${err.message}`);
        }
      });
    }
  }

  private addToHistory(signalementId: string, action: string, responsable: string): void {
    console.log('📝 Ajout à l\'historique:', { signalementId, action, responsable });
    // Implémentez cette méthode si votre backend le permet
    // this.signalementService.addHistorique(signalementId, action, responsable).subscribe();
  }

  /**
   * ✅ CORRECTION: Créer une intervention avec navigation correcte
   */
 
  private mapSignalementUrgenceToIntervention(signalementUrgence: UrgenceSignalement): 'NORMAL' | 'URGENT' {
    switch(signalementUrgence) {
      case 'HIGH': return 'URGENT';
      case 'MEDIUM': return 'URGENT';
      case 'LOW': return 'NORMAL';
      default: return 'NORMAL';
    }
  }

  private mapSignalementTypeToIntervention(signalementType: TypeSignalement): string {
    const typeMap: { [key in TypeSignalement]: string } = {
      'POTHOLE': 'REPARATION_ROUTE',
      'LIGHTING': 'ELECTRICITE_ECLAIRAGE',
      'GARBAGE': 'NETTOYAGE_PUBLIC',
      'TREE': 'ESPACES_VERTS',
      'WATER': 'PLOMBERIE_EAU',
      'SIGNAL': 'SIGNALISATION_ROUTIERE',
      'OTHER': 'MAINTENANCE_GENERALE'
    };
    
    return typeMap[signalementType] || signalementType;
  }

  private generateInterventionDescription(signalement: Signalement): string {
    return `### Intervention basée sur un signalement citoyen

**Signalement ID:** ${signalement.id}
**Titre du signalement:** ${signalement.titre}
**Type:** ${this.getTypeLabel(signalement.type)}
**Urgence signalée:** ${this.getUrgenceLabel(signalement.urgence)}

**Description originale:**
${signalement.description}

**Localisation:**
${signalement.adresse}
${signalement.localisation !== signalement.adresse ? signalement.localisation : ''}
${signalement.coordonnees ? `Coordonnées GPS: ${signalement.coordonnees}` : ''}

**Signalé par:**
${signalement.contactNom}
${signalement.contactEmail}
${signalement.contactTelephone ? `Tél: ${signalement.contactTelephone}` : ''}

**Date du signalement:** ${new Date(signalement.dateCreation).toLocaleString()}

${signalement.photo ? '*Une photo est jointe au signalement*' : ''}`;
  }
  
  /**
   * ✅ Méthode helper pour vérifier si le bouton doit être désactivé
   */
  isCreateInterventionDisabled(signalement: Signalement): boolean {
    // Désactiver si le signalement est résolu OU si une intervention existe déjà
    return signalement.statut === 'RESOLU' || !!signalement.interventionId;
  }
  
  /**
   * ✅ Méthode helper pour le texte du bouton
   */
  getCreateInterventionButtonText(signalement: Signalement): string {
    if (signalement.interventionId) {
      return 'Intervention existante';
    }
    if (signalement.statut === 'RESOLU') {
      return 'Signalement résolu';
    }
    return 'Créer Intervention';
  }
  // Ajoutez cette méthode dans la classe
private handleNavigationError(error: any): void {
  console.error('❌ Erreur de navigation:', error);
  
  if (error.message?.includes('Cannot match')) {
    console.error('⚠️ Route introuvable. Vérifiez les routes dans app.routes.ts');
    alert('Erreur: La page demandée n\'existe pas. Vérifiez la configuration des routes.');
  } else if (error.message?.includes('permission')) {
    alert('Erreur: Vous n\'avez pas les permissions nécessaires.');
  } else {
    alert(`Erreur de navigation: ${error.message || 'Erreur inconnue'}`);
  }
}

// Modifiez la méthode createInterventionFromSignalement :
createInterventionFromSignalement(signalement: Signalement): void {
  console.log('🚀 Création d\'intervention depuis signalement:', signalement.id);
  
  // ✅ Vérifier si une intervention existe déjà
  if (signalement.interventionId) {
    console.warn('⚠️ Intervention déjà existante:', signalement.interventionId);
    alert('Une intervention est déjà associée à ce signalement.');
    return;
  }

  // ✅ Vérifier que le signalement n'est pas résolu
  if (signalement.statut === 'RESOLU') {
    alert('Impossible de créer une intervention pour un signalement déjà résolu.');
    return;
  }

  // Convertir les coordonnées
  const coords = signalement.coordonnees?.split(',').map(coord => parseFloat(coord.trim()));
  const latitude = coords && coords.length >= 1 ? coords[0] : null;
  const longitude = coords && coords.length >= 2 ? coords[1] : null;

  // Convertir l'urgence
  const urgenceIntervention = this.mapSignalementUrgenceToIntervention(signalement.urgence);
  
  // Convertir le type
  const typeIntervention = this.mapSignalementTypeToIntervention(signalement.type);

  // Préparer les données (JSON simplifié pour éviter les problèmes)
  const interventionData = {
    signalementId: signalement.id,
    titre: `Intervention: ${signalement.titre}`,
    type: typeIntervention,
    description: this.generateInterventionDescription(signalement),
    urgence: urgenceIntervention,
    localisation: signalement.localisation,
    adresse: signalement.adresse,
    coordonnees: signalement.coordonnees,
    latitude: latitude,
    longitude: longitude,
    contactNom: signalement.contactNom,
    contactEmail: signalement.contactEmail,
    contactTelephone: signalement.contactTelephone || '',
    citoyenId: signalement.citoyenId || '',
    serviceMunicipalId: 'SERVICE_MUNICIPAL_URBAIN',
    photoUrl: signalement.photo ? this.getPhotoUrl(signalement.photo) : null
  };

  console.log('🔀 Navigation vers /admin/interventions/nouvelle');
  
  // ✅ CORRECTION: Utiliser navigateByUrl avec encodage correct
  try {
    const queryParams = {
      fromSignalement: 'true',
      data: encodeURIComponent(JSON.stringify(interventionData))
    };
    
    const url = `/admin/interventions/nouvelle?fromSignalement=${queryParams.fromSignalement}&data=${queryParams.data}`;
    
    this.router.navigateByUrl(url)
      .then(success => {
        if (success) {
          console.log('✅ Navigation réussie vers le formulaire d\'intervention');
        } else {
          console.error('❌ Navigation échouée - Route non trouvée');
          alert('Erreur: Impossible d\'accéder au formulaire d\'intervention. Vérifiez les permissions.');
        }
      })
      .catch(err => {
        this.handleNavigationError(err);
      });
  } catch (error) {
    console.error('❌ Erreur lors de la préparation de la navigation:', error);
    alert('Erreur lors de la préparation des données. Veuillez réessayer.');
  }
}
}