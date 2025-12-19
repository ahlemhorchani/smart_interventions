import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, lastValueFrom } from 'rxjs';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { InterventionService } from '../../../core/services/intervention.service';
import { TechnicienService, TechnicienScore } from '../../../core/services/technicien.service';
import { EquipementService } from '../../../core/services/equipement.service';
import { Intervention } from '../../../core/models/intervention.model';
import { User } from '../../../core/models/user.model';
import { Equipement, Localisation } from '../../../core/models/equipement.model';
import { AdminNavbarComponent } from '../navbar/admin-navbar.component';

@Component({
  selector: 'app-intervention-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, AdminNavbarComponent],
  templateUrl: './intervention-form.component.html',
  styleUrls: ['./intervention-form.component.scss']
})
export class InterventionFormComponent implements OnInit, OnDestroy {
  @ViewChild('techSearchInput') techSearchInput!: ElementRef;

  interventionForm!: FormGroup;
  techniciensDisponibles: TechnicienScore[] = [];
  filteredTechniciens: TechnicienScore[] = [];
  equipements: Equipement[] = [];
  filteredEquipements: Equipement[] = [];
  signalementData: any = null;
  signalementId: string | null = null;

  // États
  isLoading = false;
  isSuggesting = false;
  showTechDropdown = false;
  showEquipDropdown = false;
  selectedTechnicien: TechnicienScore | null = null;
  selectedEquipement: Equipement | null = null;

  // Filtres
  techSearchTerm = '';
  equipSearchTerm = '';
  showOnlyProches = false;
  showOnlyCompetents = false;
  
  // Sujets pour debounce
  private searchSubject = new Subject<string>();
  private equipSearchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private interventionService: InterventionService,
    private technicienService: TechnicienService,
    private equipementService: EquipementService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupSearchListeners();
    this.loadEquipements();
    this.checkSignalementData();
    this.loadAllTechniciens();

    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  private checkSignalementData(): void {
    this.route.queryParams.subscribe(params => {
      if (params['fromSignalement'] && params['data']) {
        try {
          this.signalementData = JSON.parse(params['data']);
          this.prefillFormFromSignalement();
        } catch (error) {
          console.error('Erreur lors du parsing des données du signalement', error);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }

  private initForm() {
    this.interventionForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3)]],
      type: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      urgence: ['NORMAL', Validators.required],
      equipementId: ['', Validators.required],
      technicienId: ['', Validators.required],
      technicienInfo: [''],
      equipementInfo: [''],
      // MODIFICATION ICI: Retirer Validators.required pour citoyenId
      citoyenId: [''], // Retiré Validators.required
      serviceMunicipalId: ['', Validators.required],
      dateDebut: [null],
      dateFin: [null]
    });
  }

  private setupSearchListeners() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.techSearchTerm = searchTerm;
      this.filterTechniciens();
    });

    this.equipSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.equipSearchTerm = searchTerm;
      this.filterEquipements();
    });
  }

  private async loadAllTechniciens(): Promise<void> {
    try {
      const techniciens = await lastValueFrom(
        this.technicienService.getTechniciensDisponibles()
      );
      
      // Charger les techniciens sans score (juste la liste brute)
      this.techniciensDisponibles = (techniciens ?? []).map(user => ({
        ...user,
        score: 0,
        distance: undefined,
        competencesMatch: false,
        disponibiliteScore: user.disponibilite ? 30 : 0
      } as TechnicienScore));
      
      this.filteredTechniciens = [...this.techniciensDisponibles];
    } catch (error) {
      console.error('Erreur chargement techniciens', error);
      this.techniciensDisponibles = [];
      this.filteredTechniciens = [];
    }
  }

  private async loadEquipements() {
    try {
      this.isLoading = true;
      const equipements = await lastValueFrom(this.equipementService.getAllEquipements());
      this.equipements = equipements ?? [];
      this.filteredEquipements = [...this.equipements];
      this.isLoading = false;
    } catch (error) {
      console.error('Erreur chargement équipements', error);
      this.equipements = [];
      this.filteredEquipements = [];
      this.isLoading = false;
    }
  }

  onTechSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
    this.showTechDropdown = true;
  }

  onEquipSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.equipSearchSubject.next(input.value);
    this.showEquipDropdown = true;
  }

  async loadSuggestedTechniciens(): Promise<void> {
    const equipementId = this.interventionForm.get('equipementId')?.value;
    const typeIntervention = this.interventionForm.get('type')?.value;
    const urgence = this.interventionForm.get('urgence')?.value;

    if (!equipementId || !typeIntervention) return;

    try {
      this.isSuggesting = true;
      const equipement = this.equipements.find(e => e.id === equipementId);

      if (equipement && equipement.latitude && equipement.longitude) {
        const techniciens = await lastValueFrom(
          this.technicienService.suggestTechnicienForIntervention(
            equipement.latitude,
            equipement.longitude,
            typeIntervention,
            urgence
          )
        );

        this.techniciensDisponibles = techniciens ?? [];
        this.filteredTechniciens = [...this.techniciensDisponibles];
        this.showTechDropdown = true;
      } else {
        // Si pas de coordonnées GPS, recharger juste la liste normale
        this.loadAllTechniciens();
      }
    } catch (error) {
      console.error('Erreur suggestion techniciens', error);
      this.techniciensDisponibles = [];
      this.filteredTechniciens = [];
    } finally {
      this.isSuggesting = false;
    }
  }

  filterTechniciens(): void {
    let filtered = [...this.techniciensDisponibles];

    // Filtre par recherche texte
    if (this.techSearchTerm.trim()) {
      const term = this.techSearchTerm.toLowerCase().trim();
      filtered = filtered.filter(tech =>
        tech.nom?.toLowerCase().includes(term) ||
        tech.prenom?.toLowerCase().includes(term) ||
        tech.email?.toLowerCase().includes(term) ||
        tech.numeroTelephone?.includes(term)
      );
    }

    // Filtre "Proches uniquement (< 10km)"
    if (this.showOnlyProches) {
      filtered = filtered.filter(tech => {
        if (!tech.distance) return false; // Pas de distance calculée
        return tech.distance < 10;
      });
    }

    // Filtre "Compétents pour ce type"
    if (this.showOnlyCompetents) {
      filtered = filtered.filter(tech => {
        return tech.competencesMatch === true;
      });
    }

    this.filteredTechniciens = filtered;
  }

  filterEquipements(): void {
    if (!this.equipSearchTerm.trim()) {
      this.filteredEquipements = [...this.equipements];
      return;
    }

    const term = this.equipSearchTerm.toLowerCase().trim();
    this.filteredEquipements = this.equipements.filter(eq =>
      eq.type?.toLowerCase().includes(term) ||
      eq.adresse?.toLowerCase().includes(term) ||
      (eq.etat && eq.etat.toLowerCase().includes(term))
    );
  }

  selectTechnicien(technicien: TechnicienScore): void {
    this.selectedTechnicien = technicien;
    this.interventionForm.patchValue({
      technicienId: technicien.id,
      technicienInfo: `${technicien.prenom} ${technicien.nom} - Score: ${technicien.score}%`
    });
    this.showTechDropdown = false;
    this.techSearchTerm = '';
  }

  selectEquipement(equipement: Equipement): void {
    this.selectedEquipement = equipement;
    this.interventionForm.patchValue({
      equipementId: equipement.id,
      equipementInfo: `${equipement.type} - ${equipement.adresse}`
    });
    this.showEquipDropdown = false;
    this.equipSearchTerm = '';

    // Charger les techniciens suggérés pour cet équipement
    this.loadSuggestedTechniciens();
  }

  clearTechnicienSelection(): void {
    this.selectedTechnicien = null;
    this.interventionForm.patchValue({
      technicienId: '',
      technicienInfo: ''
    });
    this.showTechDropdown = false;
  }

  clearEquipementSelection(): void {
    this.selectedEquipement = null;
    this.interventionForm.patchValue({
      equipementId: '',
      equipementInfo: ''
    });
    this.showEquipDropdown = false;
  }

  handleClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.tech-search-container') && !target.closest('.equip-search-container')) {
      this.showTechDropdown = false;
      this.showEquipDropdown = false;
    }
  }

  getTechnicienBadgeColor(score: number): string {
    if (score >= 80) return 'badge-success';
    if (score >= 60) return 'badge-warning';
    return 'badge-danger';
  }

  get f() { return this.interventionForm.controls; }

  getAverageScore(): number {
    if (this.techniciensDisponibles.length === 0) return 0;
    const scores = this.techniciensDisponibles.map(t => t.score).filter(s => s > 0);
    if (scores.length === 0) return 0;
    const total = scores.reduce((sum, score) => sum + score, 0);
    return Math.round(total / scores.length);
  }

async submitForm(): Promise<void> {
  if (this.interventionForm.invalid) {
    this.interventionForm.markAllAsTouched();
    return;
  }

  this.isLoading = true;

  // Préparer les données EXACTEMENT comme attendu par le DTO
  const formData: any = {
    titre: this.interventionForm.get('titre')?.value,
    type: this.interventionForm.get('type')?.value,
    description: this.interventionForm.get('description')?.value,
    urgence: this.interventionForm.get('urgence')?.value || 'NORMAL',
    statut: 'EN_ATTENTE',  // En string pour le DTO
    dateCreation: new Date(),
    equipementId: this.interventionForm.get('equipementId')?.value,
    technicienId: this.interventionForm.get('technicienId')?.value,
    serviceMunicipalId: this.interventionForm.get('serviceMunicipalId')?.value || 'DEFAULT_SERVICE_ID',
  };

  // ✅ Gérer citoyenId (optionnel)
  const citoyenIdValue = this.interventionForm.get('citoyenId')?.value;
  if (citoyenIdValue && citoyenIdValue.trim() !== '') {
    formData.citoyenId = citoyenIdValue;
  } else {
    // Ne pas envoyer le champ du tout si vide
    // formData.citoyenId = null; // Ou ne pas l'inclure
  }

  // ✅ Dates optionnelles
  const dateDebut = this.interventionForm.get('dateDebut')?.value;
  if (dateDebut) {
    formData.dateDebut = new Date(dateDebut);
  }

  const dateFin = this.interventionForm.get('dateFin')?.value;
  if (dateFin) {
    formData.dateFin = new Date(dateFin);
  }

  
  console.log('Données envoyées au backend:', JSON.stringify(formData, null, 2));

  try {
    // Envoyer les données (le service Angular doit envoyer le DTO)
    await lastValueFrom(this.interventionService.createIntervention(formData));
    
    alert('✅ Intervention créée avec succès !');
    
    // Réinitialiser
    this.interventionForm.reset({ urgence: 'NORMAL' });
    this.selectedTechnicien = null;
    this.selectedEquipement = null;
    this.signalementData = null;
    this.signalementId = null;
    
    // Rediriger
    this.router.navigate(['/admin/interventions']);
    
  } catch (err: any) {
    console.error('❌ Erreur création intervention:', err);
    
    // Message d'erreur détaillé
    let errorMsg = 'Erreur inconnue';
    if (err?.error?.message) {
      errorMsg = err.error.message;
    } else if (err?.message) {
      errorMsg = err.message;
    }
    
    // Si c'est une erreur MongoDB, montrer plus de détails
    if (err?.error?.details) {
      errorMsg += `\nDétails: ${JSON.stringify(err.error.details)}`;
    }
    
    alert(`❌ Erreur lors de la création de l'intervention:\n${errorMsg}`);
  } finally {
    this.isLoading = false;
  }
}



  private async findOrCreateEquipementForSignalement(): Promise<void> {
    if (!this.signalementData) return;

    try {
      const { latitude, longitude, type, adresse } = this.signalementData;

      if (!latitude || !longitude) {
        console.warn('Coordonnées GPS manquantes pour créer un équipement');
        return;
      }

      const equipements = await lastValueFrom(this.equipementService.getAllEquipements());
      const existingEquipement = equipements?.find(eq =>
        eq.latitude && eq.longitude &&
        this.calculateDistance(latitude, longitude, eq.latitude, eq.longitude) < 0.05
      );

      if (existingEquipement) {
        this.selectEquipement(existingEquipement);
      } else {
        const nouvelEquipement: Partial<Equipement> = {
          type: this.mapSignalementTypeToEquipement(type),
          adresse: adresse || 'Adresse inconnue',
          etat: 'FONCTIONNEL',
          localisation: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          latitude: latitude,
          longitude: longitude
        };

        const createdEquipement = await lastValueFrom(
          this.equipementService.createEquipement(nouvelEquipement as Equipement)
        );

        if (createdEquipement) {
          this.selectEquipement(createdEquipement);
          console.log('Nouvel équipement créé pour le signalement');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la recherche/création d\'équipement', error);
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }

  private mapSignalementTypeToEquipement(signalementType: string): string {
    const typeMap: { [key: string]: string } = {
      'POTHOLE': 'VOIRIE',
      'LIGHTING': 'ECLAIRAGE_PUBLIC',
      'GARBAGE': 'MOBILIER_URBAIN',
      'TREE': 'ESPACE_VERT',
      'WATER': 'RESEAU_HYDRIQUE',
      'SIGNAL': 'SIGNALISATION',
      'OTHER': 'EQUIPEMENT_URBAIN',
      'REPARATION_ROUTE': 'VOIRIE',
      'ELECTRICITE_ECLAIRAGE': 'ECLAIRAGE_PUBLIC',
      'NETTOYAGE_PUBLIC': 'MOBILIER_URBAIN',
      'ESPACES_VERTS': 'ESPACE_VERT',
      'PLOMBERIE_EAU': 'RESEAU_HYDRIQUE',
      'SIGNALISATION_ROUTIERE': 'SIGNALISATION',
      'MAINTENANCE_GENERALE': 'EQUIPEMENT_URBAIN'
    };

    return typeMap[signalementType] || 'EQUIPEMENT_URBAIN';
  }

  private async prefillFormFromSignalement(): Promise<void> {
    if (!this.signalementData) return;

    this.interventionForm.patchValue({
      titre: this.signalementData.titre,
      type: this.signalementData.type,
      description: this.signalementData.description,
      urgence: this.signalementData.urgence,
      localisation: this.signalementData.localisation,
      adresse: this.signalementData.adresse,
      coordonnees: this.signalementData.coordonnees,
      citoyenId: this.signalementData.citoyenId || '', // Valeur vide par défaut
      serviceMunicipalId: this.signalementData.serviceMunicipalId || 'SERVICE_MUNICIPAL',
      contactNom: this.signalementData.contactNom,
      contactEmail: this.signalementData.contactEmail,
      contactTelephone: this.signalementData.contactTelephone || '',
      signalementId: this.signalementData.signalementId
    });

    if (this.signalementData.photoUrl) {
      (this.interventionForm as any).signalementPhotoUrl = this.signalementData.photoUrl;
    }

    this.signalementId = this.signalementData.signalementId || null;

    if (this.signalementData.latitude && this.signalementData.longitude) {
      await this.findOrCreateEquipementForSignalement();
    }
  }

  getTechnicienDisplayInfo(tech: TechnicienScore): string {
    const distanceInfo = tech.distance ? ` - ${tech.distance}km` : '';
    return `${tech.prenom} ${tech.nom} (Score: ${tech.score}%${distanceInfo})`;
  }

  // Ajoutez cette méthode pour vérifier si les filtres sont actifs
  isFilterActive(): boolean {
    return this.showOnlyProches || this.showOnlyCompetents || this.techSearchTerm.trim() !== '';
  }

  // Méthode pour réinitialiser les filtres
  resetFilters(): void {
    this.showOnlyProches = false;
    this.showOnlyCompetents = false;
    this.techSearchTerm = '';
    this.filterTechniciens();
  }

  toggleProchesFilter(): void {
    this.showOnlyProches = !this.showOnlyProches;
    // Afficher un message si aucun technicien n'a de distance calculée
    if (this.showOnlyProches && !this.techniciensDisponibles.some(t => t.distance)) {
      alert('⚠️ Aucun technicien n\'a de distance calculée. Sélectionnez d\'abord un équipement avec GPS et utilisez "Suggérer les meilleurs".');
    }
    this.filterTechniciens();
  }

  toggleCompetentsFilter(): void {
    this.showOnlyCompetents = !this.showOnlyCompetents;
    // Afficher un message si aucune compétence n'est calculée
    if (this.showOnlyCompetents && !this.techniciensDisponibles.some(t => t.competencesMatch)) {
      alert('⚠️ Aucun technicien n\'a de compétence évaluée. Renseignez le type d\'intervention et utilisez "Suggérer les meilleurs".');
    }
    this.filterTechniciens();
  }
  // Nombre de techniciens proches (< 10 km)
get techniciensProchesCount(): number {
  return this.techniciensDisponibles.filter(
    t => typeof t.distance === 'number' && t.distance < 10
  ).length;
}

// Nombre de techniciens compétents
get techniciensCompetentsCount(): number {
  return this.techniciensDisponibles.filter(
    t => t.competencesMatch === true
  ).length;
}

}