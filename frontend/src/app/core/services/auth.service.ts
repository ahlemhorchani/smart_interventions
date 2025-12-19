import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, throwError ,Observable} from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { User, Role } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private authUrl = 'http://localhost:8085/api/auth';
  private apiUrl = 'http://localhost:8085/api';
  private _user$ = new BehaviorSubject<User | null>(null);
  user$ = this._user$.asObservable();

  constructor() {
    console.log('🔧 AuthService initialisé, URL:', this.authUrl);
    this.loadCurrentUser();
  }

  login(email: string, motDePasse: string) {
    console.log('🔐 Tentative de login pour:', email);
    console.log('📤 Envoi vers:', `${this.authUrl}/login`);
    
    return this.http.post<{ 
      token: string; 
      role: string; 
      nom: string; 
      id:string;
      prenom: string;
      email?: string;
    }>(`${this.authUrl}/login`, { email, motDePasse }).pipe(
      tap(res => {
        console.log('✅ Réponse login reçue:', res);
        
        // Stockage avec EMAIL
        localStorage.setItem('token', res.token);
        const currentUser = {
          nom: res.nom,
          id: res.id,
          prenom: res.prenom,
          email: email,
          role: res.role
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        this._user$.next(currentUser as User);
        
        console.log('✅ Login successful, user stored:', currentUser);
      }),
      catchError(error => {
        console.error('❌ Erreur login:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Message:', error.message);
        console.error('❌ URL:', error.url);
        console.error('❌ Headers:', error.headers);
        console.error('❌ Error object:', error);
        return throwError(() => error);
      })
    );
  }

  register(payload: Partial<User> & { motDePasse: string }) {
    console.log('📝 Tentative d\'inscription pour:', payload.email);
    console.log('📤 Payload:', payload);
    console.log('📤 Envoi vers:', `${this.authUrl}/register`);
    
    return this.http.post<{ 
      token: string; 
      role: string; 
      nom: string; 
      prenom: string;
      email?: string;
    }>(`${this.authUrl}/register`, payload).pipe(
      tap(res => {
          console.log('✅ Réponse register reçue:', res);
  console.log('✅ Token reçu:', res.token);
  console.log('✅ Email utilisé:', payload.email);
  
  // Vérifiez AVANT stockage
  console.log('📦 Avant stockage - Token:', localStorage.getItem('token'));
        console.log('✅ Réponse register reçue:', res);
        
        // Stocker le token ET l'utilisateur
        localStorage.setItem('token', res.token);
        const currentUser = {
          nom: res.nom,
          prenom: res.prenom,
          email: payload.email || '',
          role: res.role
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        // Vérifiez APRÈS stockage
  console.log('📦 Après stockage - Token:', localStorage.getItem('token'));
  console.log('📦 Après stockage - User:', localStorage.getItem('currentUser'));
        this._user$.next(currentUser as User);
        
        console.log('✅ Registration successful, user stored:', currentUser);
      }),
      catchError(error => {
        console.error('❌ Erreur register:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Message:', error.message);
        console.error('❌ URL:', error.url);
        console.error('❌ Headers:', error.headers);
        console.error('❌ Error object:', error);
        return throwError(() => error);
      })
    );
  }

  logout() {
    console.log('🚪 Déconnexion');
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this._user$.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this._user$.value;
  }
  // Dans votre AuthService
getUserById(id: string): Observable<User> {
  return this.http.get<User>(`${this.apiUrl}/users/${id}`);
}
  private loadCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');

    console.log('🔍 Chargement user depuis localStorage');
    console.log('🔍 Token présent:', !!token);
    console.log('🔍 UserData présent:', !!userData);

    if (userData && token) {
      try {
        const user = JSON.parse(userData);
        this._user$.next(user);
        console.log('✅ User loaded from localStorage:', user);
      } catch (e) {
        console.error('❌ Error parsing user data:', e);
        this._user$.next(null);
      }
    } else {
      console.log('⚠️ Aucun utilisateur trouvé dans localStorage');
      this._user$.next(null);
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    const isAuth = !!token && !!user;
    console.log('🔐 isAuthenticated:', isAuth);
    return isAuth;
  }

  hasRole(role: Role) {
    const u = this.getCurrentUser();
    const has = !!u && u.role === role;
    console.log(`👤 hasRole(${role}):`, has);
    return has;
  }
}