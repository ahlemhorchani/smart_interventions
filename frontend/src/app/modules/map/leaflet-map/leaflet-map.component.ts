import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';
import { Router, RouterModule } from '@angular/router';

import { MapDataService } from '../../../core/services/map-data.service';
import { Incident, Technician, Equipment, MapLayers } from '../../../core/models/map.model';

// Configuration des icônes par défaut de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

@Component({
  selector: 'app-leaflet-map',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './leaflet-map.component.html',
  styleUrls: ['./leaflet-map.component.scss']
})
export class LeafletMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  
  private map!: L.Map;
  private mapInitialized = false;
  
  // Services
  private mapDataService = inject(MapDataService);
  private router = inject(Router);
  
  // Couches de la carte
  private incidentLayer: L.LayerGroup = L.layerGroup();
  private technicianLayer: L.LayerGroup = L.layerGroup();
  private equipmentLayer: L.LayerGroup = L.layerGroup();
  
  // Données
  incidents: Incident[] = [];
  technicians: Technician[] = [];
  equipmentList: Equipment[] = [];
  userLocation: { lat: number; lng: number } | null = null;
  
  // États
  activeLayers: MapLayers = {
    incidents: true,
    technicians: true,
    equipment: false,
    weather: false,
    traffic: false
  };
  
  // Statistiques
  stats = {
    pendingIncidents: 0,
    activeTechnicians: 0,
    urgentIncidents: 0,
    resolvedToday: 0
  };
  
  loading = true;
  error: string | null = null;
  sidebarVisible = true;
  
  // Variables pour la sélection de position
  isSelectingLocation = false;
  selectedLocation: { lat: number; lng: number; address?: string } | null = null;
  private selectionMarker: L.Marker | null = null;
  
  // ⭐ AJOUTER: Variables pour la copie d'URL
  isCopyingUrl = false;
  locationUrl: string = '';
  copySuccess = false;
  copyError = false;
  
  // Abonnements
  private subscriptions: Subscription[] = [];
  private autoRefreshInterval: any;
  
  ngOnInit() {
    this.getUserLocation();
    this.loadMapData();
    this.setupAutoRefresh();
  }
  
  ngAfterViewInit() {
    setTimeout(() => {
      this.initMap();
    }, 100);
  }
  
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
    if (this.map) {
      this.map.off('click');
      this.map.remove();
    }
  }
  
  // ========== MÉTHODES PUBLIQUES ==========
  
  toggleLayer(layer: keyof MapLayers) {
    if (layer === 'weather') return;
    
    this.activeLayers[layer] = !this.activeLayers[layer];
    this.updateMapLayers();
  }
  
  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }
  
  zoomToLocation(lat: number, lng: number, zoom: number = 15) {
    if (this.map) {
      this.map.setView([lat, lng], zoom);
    }
  }
  
  zoomToUser() {
    if (this.userLocation && this.map) {
      this.zoomToLocation(this.userLocation.lat, this.userLocation.lng);
    }
  }
  
  zoomToIncidents() {
    if (this.incidents.length > 0 && this.map) {
      const bounds = L.latLngBounds(
        this.incidents.map(i => [i.location.lat, i.location.lng] as L.LatLngTuple)
      );
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }
  
  // Méthode pour activer la sélection de position
  enableLocationSelection(): void {
    this.isSelectingLocation = true;
    
    if (this.map) {
      this.map.on('click', this.onMapClick.bind(this));
      this.map.getContainer().style.cursor = 'crosshair';
    }
  }
  
  // Méthode pour confirmer la sélection
  confirmLocation(): void {
    if (!this.selectedLocation) return;
    
    // Stocker dans le localStorage pour le formulaire
    localStorage.setItem('selectedLocation', JSON.stringify(this.selectedLocation));
    
    // Rediriger vers le formulaire
    this.router.navigate(['/citoyen/signalement']);
  }
  
  // Méthode pour annuler la sélection
  cancelLocationSelection(): void {
    this.isSelectingLocation = false;
    this.selectedLocation = null;
    
    if (this.selectionMarker) {
      this.selectionMarker.remove();
      this.selectionMarker = null;
    }
    
    if (this.map) {
      this.map.off('click');
      this.map.getContainer().style.cursor = '';
    }
  }
  
  // ⭐ AJOUTER: Méthode pour copier l'URL de position
  copyLocationUrl(): void {
    if (!this.selectedLocation) {
      this.copyError = true;
      setTimeout(() => this.copyError = false, 3000);
      return;
    }
    
    // Générer l'URL de position (Google Maps)
    this.locationUrl = `https://www.google.com/maps?q=${this.selectedLocation.lat},${this.selectedLocation.lng}`;
    
    // Copier dans le presse-papier
    navigator.clipboard.writeText(this.locationUrl).then(
      () => {
        this.copySuccess = true;
        setTimeout(() => this.copySuccess = false, 3000);
      },
      (err) => {
        console.error('Erreur lors de la copie:', err);
        this.copyError = true;
        setTimeout(() => this.copyError = false, 3000);
      }
    );
  }
  
  // ⭐ AJOUTER: Méthode pour partager la position
  shareLocation(): void {
    if (!this.selectedLocation) return;
    
    if (navigator.share) {
      navigator.share({
        title: 'Position sélectionnée',
        text: 'Voici la position que j\'ai sélectionnée sur la carte',
        url: `https://www.google.com/maps?q=${this.selectedLocation.lat},${this.selectedLocation.lng}`
      }).catch(error => console.log('Erreur de partage:', error));
    } else {
      // Fallback: copier l'URL
      this.copyLocationUrl();
    }
  }
  
  // Getters pour les statistiques
  getPendingIncidents(): number {
    return this.stats.pendingIncidents;
  }
  
  getActiveTechnicians(): number {
    return this.stats.activeTechnicians;
  }
  
  getUrgentIncidents(): number {
    return this.stats.urgentIncidents;
  }
  
  getResolvedToday(): number {
    return this.stats.resolvedToday;
  }
  
  getIncidentTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'POTHOLE': 'road',
      'LIGHTING': 'lightbulb',
      'GARBAGE': 'trash',
      'TREE': 'tree',
      'WATER': 'tint',
      'OTHER': 'exclamation-circle'
    };
    return icons[type] || 'exclamation-circle';
  }
  
  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'En attente',
      'IN_PROGRESS': 'En cours',
      'RESOLVED': 'Résolu',
      'URGENT': 'Urgent'
    };
    return labels[status] || status;
  }
  
  getIncidentTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'POTHOLE': 'Nid-de-poule',
      'LIGHTING': 'Éclairage défectueux',
      'GARBAGE': 'Déchets non collectés',
      'TREE': 'Arbre dangereux',
      'WATER': 'Fuite d\'eau',
      'OTHER': 'Autre problème'
    };
    return labels[type] || 'Problème';
  }
  
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  loadMapData() {
    this.loading = true;
    this.error = null;
    
    console.log('Loading map data...');
    
    const incidentsSub = this.mapDataService.getIncidents().subscribe({
      next: (incidents) => {
        console.log('Incidents loaded:', incidents.length);
        this.incidents = incidents;
        this.updateIncidentLayer();
        this.updateStats();
      },
      error: (error) => {
        console.error('Erreur incidents:', error);
        
        if (error.status === 403 || error.status === 401) {
          console.warn('API inaccessible, using demo data');
          this.useDemoData();
        } else {
          this.handleError('Erreur lors du chargement des incidents');
        }
      }
    });
    
    const techsSub = this.mapDataService.getTechnicians().subscribe({
      next: (technicians) => {
        this.technicians = technicians;
        this.updateTechnicianLayer();
      },
      error: (error) => {
        console.error('Erreur techniciens:', error);
      }
    });
    
    const equipSub = this.mapDataService.getEquipment().subscribe({
      next: (equipment) => {
        this.equipmentList = equipment;
        this.updateEquipmentLayer();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur équipements:', error);
        this.loading = false;
      }
    });
    
    this.subscriptions.push(incidentsSub, techsSub, equipSub);
  }
  
  // ========== MÉTHODES PRIVÉES ==========
  
  private initMap() {
    if (this.mapInitialized || !this.mapContainer?.nativeElement) {
      return;
    }
    
    try {
      const defaultCenter: L.LatLngTuple = [36.8065, 10.1815];
      
      this.map = L.map(this.mapContainer.nativeElement).setView(defaultCenter, 13);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '©OpenStreetMap, ©CartoDB',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(this.map);
      
      L.control.scale().addTo(this.map);
      this.addLayerControl();
      
      if (this.userLocation) {
        this.map.setView([this.userLocation.lat, this.userLocation.lng], 15);
        this.addUserMarker();
      }
      
      this.mapInitialized = true;
      this.updateMapLayers();
      
    } catch (error) {
      console.error('Erreur d\'initialisation de la carte:', error);
      this.error = 'Impossible de charger la carte';
      this.loading = false;
    }
  }
  
  private onMapClick(e: L.LeafletMouseEvent): void {
    if (!this.isSelectingLocation) return;
    
    if (this.selectionMarker) {
      this.selectionMarker.remove();
    }
    
    const icon = L.divIcon({
      html: `
        <div style="
          background: linear-gradient(135deg, #4CAF50, #8BC34A);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          border: 3px solid white;
          box-shadow: 0 3px 15px rgba(76, 175, 80, 0.5);
        ">
          <i class="fas fa-map-pin"></i>
        </div>
      `,
      className: 'selection-marker',
      iconSize: [50, 50] as L.PointTuple,
      iconAnchor: [25, 50] as L.PointTuple
    });
    
    this.selectionMarker = L.marker([e.latlng.lat, e.latlng.lng], { icon })
      .addTo(this.map!)
      .bindPopup('Emplacement sélectionné pour signalement');
    
    this.selectedLocation = {
      lat: e.latlng.lat,
      lng: e.latlng.lng
    };
    
    this.getAddressFromCoordinates(e.latlng.lat, e.latlng.lng);
  }
  
  private getAddressFromCoordinates(lat: number, lng: number): void {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.display_name && this.selectedLocation) {
          this.selectedLocation.address = data.display_name;
          
          if (this.selectionMarker) {
            this.selectionMarker.setPopupContent(`
              <div>
                <strong>Emplacement sélectionné</strong><br>
                <small>${data.display_name}</small>
                <br><br>
                <button onclick="navigator.clipboard.writeText('https://www.google.com/maps?q=${lat},${lng}')"
                        style="padding: 5px 10px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                  Copier le lien Google Maps
                </button>
              </div>
            `);
          }
        }
      })
      .catch(error => {
        console.error('Erreur de géocodage:', error);
      });
  }
  
  private createIcon(color: string, iconName: string, markerColor: string = 'white'): L.DivIcon {
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${markerColor};
          font-size: 18px;
          border: 3px solid white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          position: relative;
        ">
          <i class="fas fa-${iconName}"></i>
          <div style="
            position: absolute;
            bottom: -5px;
            width: 100%;
            height: 5px;
            background-color: ${color};
            border-radius: 0 0 50% 50%;
          "></div>
        </div>
      `,
      className: 'custom-marker',
      iconSize: [40, 40] as L.PointTuple,
      iconAnchor: [20, 40] as L.PointTuple,
      popupAnchor: [0, -40] as L.PointTuple
    });
  }
  
  private getUserLocation() {
    if (navigator.geolocation) {
      console.log('Requesting user location...');
      
      const options = {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000
      };
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          console.log('User location obtained:', this.userLocation);
          
          setTimeout(() => {
            if (this.map && this.mapInitialized) {
              console.log('Setting map view to user location');
              this.map.setView([this.userLocation!.lat, this.userLocation!.lng], 15);
              this.addUserMarker();
            }
          }, 500);
        },
        (error) => {
          console.warn('Erreur de géolocalisation:', error);
          this.userLocation = null;
          this.setDefaultLocation();
        },
        options
      );
    } else {
      console.warn('La géolocalisation n\'est pas supportée');
      this.userLocation = null;
      this.setDefaultLocation();
    }
  }
  
  private setDefaultLocation() {
    this.userLocation = {
      lat: 36.8065,
      lng: 10.1815
    };
    
    console.log('Using default location:', this.userLocation);
  }
  
  private addUserMarker() {
    if (!this.userLocation || !this.map) return;
    
    const userIcon = L.divIcon({
      html: `
        <div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          border: 3px solid white;
          box-shadow: 0 3px 15px rgba(102, 126, 234, 0.5);
        ">
          <i class="fas fa-user"></i>
        </div>
      `,
      className: 'user-marker',
      iconSize: [50, 50] as L.PointTuple,
      iconAnchor: [25, 50] as L.PointTuple
    });
    
    L.marker([this.userLocation.lat, this.userLocation.lng], { icon: userIcon })
      .addTo(this.map)
      .bindPopup('<b>Votre position</b><br>Vous êtes ici')
      .openPopup();
  }
  
  private updateIncidentLayer() {
    this.incidentLayer.clearLayers();
    
    if (!this.activeLayers.incidents || !this.map) return;
    
    this.incidents.forEach(incident => {
      const icon = this.getIncidentIcon(incident);
      const marker = L.marker([incident.location.lat, incident.location.lng], { icon })
        .addTo(this.incidentLayer);
      
      this.bindIncidentPopup(marker, incident);
    });
  }
  
  private getIncidentIcon(incident: Incident): L.Icon | L.DivIcon {
    const iconConfigs = {
      'PENDING': { color: '#FFC107', icon: 'exclamation-triangle' },
      'IN_PROGRESS': { color: '#2196F3', icon: 'tools' },
      'RESOLVED': { color: '#4CAF50', icon: 'check-circle' },
      'URGENT': { color: '#F44336', icon: 'exclamation' }
    };
    
    const config = iconConfigs[incident.status] || iconConfigs.PENDING;
    return this.createIcon(config.color, config.icon);
  }
  
  private bindIncidentPopup(marker: L.Marker, incident: Incident) {
    const popupContent = `
      <div style="min-width: 250px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h4 style="margin: 0; color: #333;">
            <i class="fas fa-${this.getIncidentTypeIcon(incident.type)}"></i>
            ${this.getIncidentTypeLabel(incident.type)}
          </h4>
          <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; 
                background-color: ${this.getStatusColor(incident.status)}; color: white;">
            ${this.getStatusLabel(incident.status)}
          </span>
        </div>
        
        <p style="margin: 5px 0; color: #666;">
          <i class="fas fa-map-marker-alt"></i> 
          ${incident.location.address || 'Localisation non spécifiée'}
        </p>
        
        <p style="margin: 5px 0;">${incident.description}</p>
        
        <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 12px; color: #888;">
          <span><i class="far fa-clock"></i> ${this.formatDate(incident.reportedAt)}</span>
          <span><i class="fas fa-bolt"></i> Priorité: ${incident.priority}</span>
        </div>
        
        ${incident.assignedTo ? `
          <div style="margin-top: 10px; padding: 8px; background: #f5f5f5; border-radius: 5px;">
            <i class="fas fa-user-hard-hat"></i> Assigné à: ${incident.assignedTo}
          </div>
        ` : ''}
      </div>
    `;
    
    marker.bindPopup(popupContent);
  }
  
  private updateTechnicianLayer() {
    this.technicianLayer.clearLayers();
    
    if (!this.activeLayers.technicians || !this.map) return;
    
    this.technicians.forEach(tech => {
      const icon = this.getTechnicianIcon(tech);
      const marker = L.marker([tech.location.lat, tech.location.lng], { icon })
        .addTo(this.technicianLayer);
      
      this.bindTechnicianPopup(marker, tech);
    });
  }
  
  private getTechnicianIcon(tech: Technician): L.DivIcon {
    const iconConfigs = {
      'AVAILABLE': { color: '#4CAF50', icon: 'user' },
      'BUSY': { color: '#FF9800', icon: 'user-cog' },
      'OFFLINE': { color: '#9E9E9E', icon: 'user-slash' }
    };
    
    const config = iconConfigs[tech.status] || iconConfigs.AVAILABLE;
    return this.createIcon(config.color, config.icon, 'white');
  }
  
  private bindTechnicianPopup(marker: L.Marker, tech: Technician) {
    const popupContent = `
      <div style="min-width: 200px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">
          <i class="fas fa-user-hard-hat"></i> ${tech.name}
        </h4>
        
        <div style="margin-bottom: 8px;">
          <span style="padding: 3px 8px; border-radius: 12px; font-size: 11px; 
                background-color: ${this.getTechnicianStatusColor(tech.status)}; color: white;">
            ${this.getTechnicianStatusLabel(tech.status)}
          </span>
        </div>
        
        ${tech.currentIntervention ? `
          <p style="margin: 5px 0; font-size: 13px;">
            <i class="fas fa-tools"></i> ${tech.currentIntervention}
          </p>
        ` : ''}
        
        ${tech.vehicle ? `
          <p style="margin: 5px 0; font-size: 13px;">
            <i class="fas fa-truck"></i> ${tech.vehicle}
          </p>
        ` : ''}
        
        <p style="margin: 5px 0; font-size: 12px; color: #666;">
          <i class="far fa-clock"></i> Dernière mise à jour: ${this.formatDate(tech.lastUpdate)}
        </p>
      </div>
    `;
    
    marker.bindPopup(popupContent);
  }
  
  private updateEquipmentLayer() {
    this.equipmentLayer.clearLayers();
    
    if (!this.activeLayers.equipment || !this.map) return;
    
    this.equipmentList.forEach(equip => {
      const icon = this.getEquipmentIcon(equip);
      const marker = L.marker([equip.location.lat, equip.location.lng], { icon })
        .addTo(this.equipmentLayer);
      
      this.bindEquipmentPopup(marker, equip);
    });
  }
  
  private getEquipmentIcon(equip: Equipment): L.DivIcon {
    const iconConfigs = {
      'OPERATIONAL': { color: '#2196F3', icon: 'cog' },
      'MAINTENANCE': { color: '#FF9800', icon: 'wrench' },
      'OUT_OF_SERVICE': { color: '#F44336', icon: 'ban' }
    };
    
    const config = iconConfigs[equip.status] || iconConfigs.OPERATIONAL;
    return this.createIcon(config.color, config.icon, 'white');
  }
  
  private bindEquipmentPopup(marker: L.Marker, equip: Equipment) {
    const popupContent = `
      <div style="min-width: 200px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">
          <i class="fas fa-${equip.type.includes('camion') ? 'truck' : 'cog'}"></i> ${equip.type}
        </h4>
        
        <div style="margin-bottom: 8px;">
          <span style="padding: 3px 8px; border-radius: 12px; font-size: 11px; 
                background-color: ${this.getEquipmentStatusColor(equip.status)}; color: white;">
            ${this.getEquipmentStatusLabel(equip.status)}
          </span>
        </div>
        
        <p style="margin: 5px 0; font-size: 12px; color: #666;">
          <i class="fas fa-wrench"></i> Dernière maintenance: ${this.formatDate(equip.lastMaintenance)}
        </p>
      </div>
    `;
    
    marker.bindPopup(popupContent);
  }
  
  private addLayerControl() {
    const overlayMaps: { [name: string]: L.Layer } = {
      '🚨 Incidents': this.incidentLayer,
      '👷 Techniciens': this.technicianLayer,
      '⚙️ Équipements': this.equipmentLayer
    };
    
    L.control.layers({}, overlayMaps, {
      collapsed: true,
      position: 'topright'
    }).addTo(this.map);
  }
  
  private updateMapLayers() {
    if (!this.map) return;
    
    if (this.activeLayers.incidents) {
      this.incidentLayer.addTo(this.map);
    } else {
      this.map.removeLayer(this.incidentLayer);
    }
    
    if (this.activeLayers.technicians) {
      this.technicianLayer.addTo(this.map);
    } else {
      this.map.removeLayer(this.technicianLayer);
    }
    
    if (this.activeLayers.equipment) {
      this.equipmentLayer.addTo(this.map);
    } else {
      this.map.removeLayer(this.equipmentLayer);
    }
  }
  
  private updateStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.stats = {
      pendingIncidents: this.incidents.filter(i => i.status === 'PENDING').length,
      activeTechnicians: this.technicians.filter(t => t.status === 'BUSY').length,
      urgentIncidents: this.incidents.filter(i => i.status === 'URGENT').length,
      resolvedToday: this.incidents.filter(i => 
        i.status === 'RESOLVED' && 
        new Date(i.updatedAt) >= today
      ).length
    };
  }
  
  private setupAutoRefresh() {
    this.autoRefreshInterval = setInterval(() => {
      this.loadMapData();
    }, 60000);
  }
  
  private useDemoData() {
    this.incidents = [
      {
        id: '1',
        type: 'POTHOLE',
        description: 'Nid-de-poule important sur la chaussée',
        location: { 
          lat: 36.8065 + (Math.random() * 0.01 - 0.005), 
          lng: 10.1815 + (Math.random() * 0.01 - 0.005),
          address: 'Rue Habib Bourguiba, Tunis'
        },
        status: 'PENDING',
        priority: 3,
        reportedAt: new Date(),
        updatedAt: new Date(),
        assignedTo: undefined
      },
      {
        id: '2',
        type: 'LIGHTING',
        description: 'Lampadaire défectueux',
        location: { 
          lat: 36.8065 + (Math.random() * 0.01 - 0.005), 
          lng: 10.1815 + (Math.random() * 0.01 - 0.005),
          address: 'Avenue de la Liberté, Tunis'
        },
        status: 'IN_PROGRESS',
        priority: 2,
        reportedAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(),
        assignedTo: 'Tech 01'
      },
      {
        id: '3',
        type: 'GARBAGE',
        description: 'Déchets non collectés depuis 3 jours',
        location: { 
          lat: 36.8065 + (Math.random() * 0.01 - 0.005), 
          lng: 10.1815 + (Math.random() * 0.01 - 0.005),
          address: 'Rue du Maroc, Tunis'
        },
        status: 'URGENT',
        priority: 3,
        reportedAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(),
        assignedTo: undefined
      }
    ];
    
    this.technicians = [
      {
        id: 't1',
        name: 'Mohamed Ali',
        location: { 
          lat: 36.8065 + (Math.random() * 0.01 - 0.005), 
          lng: 10.1815 + (Math.random() * 0.01 - 0.005)
        },
        status: 'BUSY',
        currentIntervention: 'Réparation éclairage',
        vehicle: 'Camion 01',
        lastUpdate: new Date()
      },
      {
        id: 't2',
        name: 'Fatima Ben',
        location: { 
          lat: 36.8065 + (Math.random() * 0.01 - 0.005), 
          lng: 10.1815 + (Math.random() * 0.01 - 0.005)
        },
        status: 'AVAILABLE',
        currentIntervention: undefined,
        vehicle: 'Véhicule 02',
        lastUpdate: new Date()
      }
    ];
    
    this.updateIncidentLayer();
    this.updateTechnicianLayer();
    this.updateStats();
    this.loading = false;
    
    console.log('Demo data loaded:', this.incidents.length, 'incidents');
  }
  
  private getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'PENDING': '#FFC107',
      'IN_PROGRESS': '#2196F3',
      'RESOLVED': '#4CAF50',
      'URGENT': '#F44336'
    };
    return colors[status] || '#6c757d';
  }
  
  private getTechnicianStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'AVAILABLE': 'Disponible',
      'BUSY': 'Occupé',
      'OFFLINE': 'Hors ligne'
    };
    return labels[status] || status;
  }
  
  private getTechnicianStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'AVAILABLE': '#4CAF50',
      'BUSY': '#FF9800',
      'OFFLINE': '#9E9E9E'
    };
    return colors[status] || '#6c757d';
  }
  
  private getEquipmentStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'OPERATIONAL': 'Opérationnel',
      'MAINTENANCE': 'Maintenance',
      'OUT_OF_SERVICE': 'Hors service'
    };
    return labels[status] || status;
  }
  
  private getEquipmentStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'OPERATIONAL': '#2196F3',
      'MAINTENANCE': '#FF9800',
      'OUT_OF_SERVICE': '#F44336'
    };
    return colors[status] || '#6c757d';
  }
  
  private handleError(message: string) {
    this.error = message;
    console.error(message);
  }
  // ⭐ AJOUTER cette méthode dans leaflet-map.component.ts
testButtons() {
  console.log('=== ÉTAT DE LA CARTE ===');
  console.log('Map initialized:', this.mapInitialized);
  console.log('Map object:', !!this.map);
  console.log('User location:', this.userLocation);
  console.log('Incidents count:', this.incidents.length);
  console.log('Sidebar visible:', this.sidebarVisible);
  console.log('Loading:', this.loading);
  
  if (this.map) {
    console.log('Map center:', this.map.getCenter());
    console.log('Map zoom:', this.map.getZoom());
  }
}
}