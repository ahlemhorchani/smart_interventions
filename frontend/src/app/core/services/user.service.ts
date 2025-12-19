import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8085/api/users';

  // Récupérer tous les utilisateurs
  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.url);
  }

  // Récupérer un utilisateur par ID
  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.url}/${id}`);
  }

  // Créer un nouvel utilisateur
  create(user: User): Observable<User> {
    return this.http.post<User>(this.url, user);
  }

  // Mettre à jour un utilisateur
  update(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.url}/${id}`, user);
  }

  // Supprimer un utilisateur
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
