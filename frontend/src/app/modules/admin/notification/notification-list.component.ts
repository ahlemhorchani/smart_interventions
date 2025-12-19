import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { SignalementService } from '../../../core/services/signalement.service';
import { AppNotification } from '../../../core/models/notification.model';
import { Signalement, StatutSignalement } from '../../../core/models/signalement.model';
import { Subscription, interval } from 'rxjs';
import { AdminNavbarComponent } from '../navbar/admin-navbar.component';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule,AdminNavbarComponent ],
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit, OnDestroy {
  notifications: AppNotification[] = [];
  signalements: Signalement[] = [];
  unreadCount: number = 0;
  
  // Filtres
  filterNotificationType: string = '';
  filterSignalementStatut: string = '';
  filterSignalementUrgence: string = '';
  
  // Pagination
  currentPageNotif: number = 1;
  currentPageSignal: number = 1;
  pageSize: number = 10;
  
  // Compteurs pour le template
  signalementsRecuCount: number = 0;
  signalementsEnTraitementCount: number = 0;
  
  // Auto-refresh
  private refreshSubscription?: Subscription;
  
  constructor(
    private notificationService: NotificationService,
    private signalementService: SignalementService
  ) {}
  
  ngOnInit(): void {
    this.loadData();
    
    // Auto-refresh toutes les 30 secondes
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadData();
    });
  }
  
  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }
  
  loadData(): void {
    this.loadNotifications();
    this.loadSignalements();
  }
  
  loadNotifications(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.notificationService.getNotificationsForUser(userId).subscribe({
        next: (data) => {
          this.notifications = data;
          this.unreadCount = data.filter(n => !n.statutLecture).length;
          this.sortNotifications();
        },
        error: (err) => console.error('Erreur chargement notifications', err)
      });
    } else {
      this.notificationService.getAllNotifications().subscribe({
        next: (data) => {
          this.notifications = data;
          this.unreadCount = data.filter(n => !n.statutLecture).length;
          this.sortNotifications();
        },
        error: (err) => console.error('Erreur chargement notifications', err)
      });
    }
  }
  
  loadSignalements(): void {
    this.signalementService.getAllSignalements().subscribe({
      next: (data) => {
        this.signalements = data;
        this.updateSignalementCounts();
        this.sortSignalements();
      },
      error: (err) => console.error('Erreur chargement signalements', err)
    });
  }
  
  sortNotifications(): void {
    this.notifications.sort((a, b) => 
      new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
    );
  }
  
  sortSignalements(): void {
    this.signalements.sort((a, b) => 
      new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
    );
  }
  
  markAsRead(notification: AppNotification): void {
    if (notification.id && !notification.statutLecture) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.statutLecture = true;
          this.unreadCount--;
        },
        error: (err) => console.error('Erreur marquage lu', err)
      });
    }
  }
  
  markAllAsRead(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.notificationService.markAllAsRead(userId).subscribe({
        next: () => {
          this.notifications.forEach(n => n.statutLecture = true);
          this.unreadCount = 0;
        },
        error: (err) => console.error('Erreur marquage tous lus', err)
      });
    }
  }
  
  updateSignalementStatut(signalementId: string, newStatut: StatutSignalement): void {
    this.signalementService.updateStatut(signalementId, newStatut).subscribe({
      next: () => {
        const signalement = this.signalements.find(s => s.id === signalementId);
        if (signalement) {
          signalement.statut = newStatut;
          this.updateSignalementCounts();
          
          const action = `Statut changé à ${newStatut}`;
          const responsable = 'Administrateur';
          this.signalementService.addHistorique(signalementId, action, responsable).subscribe();
        }
      },
      error: (err) => console.error('Erreur mise à jour statut', err)
    });
  }
  
  private updateSignalementCounts(): void {
    this.signalementsRecuCount = this.signalements.filter(s => s.statut === 'RECU').length;
    this.signalementsEnTraitementCount = this.signalements.filter(s => s.statut === 'EN_TRAITEMENT').length;
  }
  
  getStatutClass(statut: StatutSignalement): string {
    switch(statut) {
      case 'RECU': return 'badge bg-warning';
      case 'EN_TRAITEMENT': return 'badge bg-info';
      case 'RESOLU': return 'badge bg-success';
      default: return 'badge bg-secondary';
    }
  }
  
  getUrgenceClass(urgence: string): string {
    switch(urgence) {
      case 'HIGH': return 'badge bg-danger';
      case 'MEDIUM': return 'badge bg-warning';
      case 'LOW': return 'badge bg-success';
      default: return 'badge bg-secondary';
    }
  }
  
  getTypeIcon(type: string): string {
    switch(type) {
      case 'POTHOLE': return '🕳️';
      case 'LIGHTING': return '💡';
      case 'GARBAGE': return '🗑️';
      case 'TREE': return '🌳';
      case 'WATER': return '💧';
      case 'SIGNAL': return '🚦';
      case 'OTHER': return '📋';
      default: return '📄';
    }
  }
  
  // Pagination
  get paginatedNotifications(): AppNotification[] {
    const start = (this.currentPageNotif - 1) * this.pageSize;
    return this.notifications.slice(start, start + this.pageSize);
  }
  
  get paginatedSignalements(): Signalement[] {
    const start = (this.currentPageSignal - 1) * this.pageSize;
    return this.signalements.slice(start, start + this.pageSize);
  }
  
  totalPagesNotif(): number {
    return Math.ceil(this.notifications.length / this.pageSize);
  }
  
  totalPagesSignal(): number {
    return Math.ceil(this.signalements.length / this.pageSize);
  }
  
  goToPageNotif(page: number): void {
    if (page >= 1 && page <= this.totalPagesNotif()) {
      this.currentPageNotif = page;
    }
  }
  
  goToPageSignal(page: number): void {
    if (page >= 1 && page <= this.totalPagesSignal()) {
      this.currentPageSignal = page;
    }
  }
  
  // Filtres
  applyFilters(): void {
    this.currentPageNotif = 1;
    this.currentPageSignal = 1;
    this.loadData();
  }
  
  clearFilters(): void {
    this.filterNotificationType = '';
    this.filterSignalementStatut = '';
    this.filterSignalementUrgence = '';
    this.loadData();
  }
}