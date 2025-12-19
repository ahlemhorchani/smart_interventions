import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppNotification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:8085/api/notifications';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Récupérer toutes les notifications
  getAllNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(
      `${this.apiUrl}/all`,
      { headers: this.getHeaders() }
    );
  }

  // Récupérer les notifications pour un utilisateur spécifique
  getNotificationsForUser(userId: string): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(
      `${this.apiUrl}/user/${userId}`,
      { headers: this.getHeaders() }
    );
  }

  // Marquer une notification comme lue
  markAsRead(notifId: string): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${notifId}/read`,
      null,
      { headers: this.getHeaders() }
    );
  }

  // Envoyer une nouvelle notification
  sendNotification(notification: AppNotification): Observable<AppNotification> {
    return this.http.post<AppNotification>(
      this.apiUrl,
      notification,
      { headers: this.getHeaders() }
    );
  }

  // Supprimer une notification (optionnel)
  deleteNotification(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }

  // Marquer toutes les notifications comme lues (optionnel)
  markAllAsRead(userId: string): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/user/${userId}/mark-all-read`,
      null,
      { headers: this.getHeaders() }
    );
  }

  // Obtenir le nombre de notifications non lues (optionnel)
  getUnreadCount(userId: string): Observable<number> {
    return this.http.get<number>(
      `${this.apiUrl}/user/${userId}/unread-count`,
      { headers: this.getHeaders() }
    );
  }
}