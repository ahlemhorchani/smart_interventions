// home.component.ts
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { User, Role } from '../../core/models/user.model'; // ⭐ IMPORT: Ajouter Role
import { AuthService } from '../../core/services/auth.service'; // ⭐ IMPORT
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, FormsModule,RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  // Variables existantes
  isScrolled = false;
  isNavHidden = false;
  lastScrollTop = 0;
  showMobileMenu = false;
  showUserMenu = false;
  
  // Variables d'authentification
  isAuthenticated = false;
  currentUser: User | null = null; // ⭐ TYPER avec User
  
  // Statistiques
  stats = {
    totalInterventions: 15432,
    interventionsToday: 42,
    resolvedToday: 38,
    satisfactionRate: 94
  };
  
  // Route actuelle
  currentRoute = '/';
  
  private routerSubscription?: Subscription;
  private authSubscription?: Subscription; // ⭐ AJOUTER
  
  constructor(
    private router: Router,
    private authService: AuthService // ⭐ INJECTER
  ) {}
  
  ngOnInit() {
    this.setupScrollListener();
    this.subscribeToRouteChanges();
    this.setupAuthListener(); // ⭐ AJOUTER
    this.checkAndRedirect(); 
  }
  
  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe(); // ⭐ AJOUTER
  }
  
  // ⭐ NOUVELLE MÉTHODE : Configurer l'écoute de l'authentification
  private setupAuthListener(): void {
    // S'abonner aux changements d'utilisateur
    this.authSubscription = this.authService.user$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
      console.log('User auth state updated:', user);
    });
    
    // Vérifier l'état initial
    this.checkAuthState();
  }
    shouldShowHomeContent(): boolean {
    return this.isHomeRoute() && 
           !this.isTechnicienRoute() && 
           !this.isAdminRoute();
  }
  // ⭐ NOUVELLE MÉTHODE : Vérifier l'état d'authentification
  private checkAuthState(): void {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('currentUser');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUser = user;
        this.isAuthenticated = true;
        console.log('User authenticated from localStorage:', user);
      } catch (e) {
        console.error('Error parsing user data:', e);
        this.currentUser = null;
        this.isAuthenticated = false;
      }
    } else {
      this.currentUser = null;
      this.isAuthenticated = false;
    }
  }
  
  // Méthode pour vérifier si on est sur la page d'accueil
  isHomeRoute(): boolean {
    return this.currentRoute === '/' || 
           this.currentRoute === '/home' ;
           //this.currentRoute.startsWith('/citoyen/') ||
           //this.currentRoute === '/carte';
  }
  
  // S'abonner aux changements de route
  private subscribeToRouteChanges(): void {
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
      console.log('Route changée:', this.currentRoute);
    });
    
    // Initialiser avec la route actuelle
    this.currentRoute = this.router.url;
  }
  
  // Méthodes existantes
  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }
  
  scrollToSection(sectionId: string): void {
    if (!this.isHomeRoute()) {
      // Si on n'est pas sur la page d'accueil, naviguer vers l'accueil avec le hash
      this.router.navigate(['/'], { fragment: sectionId }).then(() => {
        // Scroll après la navigation
        setTimeout(() => this.scrollToElement(sectionId), 100);
      });
    } else {
      // Si on est déjà sur l'accueil, juste scroller
      this.scrollToElement(sectionId);
    }
  }

  // Méthode pour scroller vers un élément spécifique
  private scrollToElement(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Si l'élément n'existe pas, essayer de trouver par data-section
      const sectionElement = document.querySelector(`[data-section="${elementId}"]`);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
  
  // ⭐ CORRIGER : Vérifier que l'utilisateur existe
  getUserInitials(): string {
    if (!this.currentUser || !this.currentUser.prenom || !this.currentUser.nom) {
      return '?';
    }
    const firstInitial = this.currentUser.prenom.charAt(0) || '';
    const lastInitial = this.currentUser.nom.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }
  
  // ⭐ CORRIGER : Vérifier l'existence du rôle
  getUserRole(): string {
    // Si pas d'utilisateur ou pas de rôle
    if (!this.currentUser?.role) {
      return 'Utilisateur';
    }
    
    const roles: Record<Role, string> = {
      'ADMIN': 'Administrateur',
      'TECHNICIEN': 'Technicien',
      'CITOYEN': 'Citoyen'
    };
    
    return roles[this.currentUser.role] || 'Utilisateur';
  }
  
  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }
  
  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }
  
  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }
  
  // ⭐ CORRIGER : Utiliser AuthService pour logout
  logout(): void {
    this.authService.logout(); // ⭐ Appeler le service
    this.closeMobileMenu();
    this.toggleUserMenu(); // Fermer aussi le menu utilisateur
    this.router.navigate(['/']);
  }
  
  @HostListener('window:scroll')
  setupScrollListener(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const delta = 5;
    
    // Gestion du défilement pour la navbar
    if (Math.abs(this.lastScrollTop - scrollTop) <= delta) return;
    
    this.isScrolled = scrollTop > 50;
    
    // Cacher/montrer la navbar au scroll
    if (scrollTop > this.lastScrollTop && scrollTop > 100) {
      this.isNavHidden = true;
    } else {
      this.isNavHidden = false;
    }
    
    this.lastScrollTop = scrollTop;
  }
   isTechnicienRoute(): boolean {
    // Retourne true UNIQUEMENT pour les routes technicien
    return this.currentRoute.startsWith('/technicien');
    // ⚠️ Retirer le || this.currentRoute.startsWith('/admin')
  }
  isAdminRoute(): boolean {
    return this.currentRoute.startsWith('/admin');
  }
   shouldHideNavbar(): boolean {
    // Cacher la navbar uniquement pour les routes technicien
    return this.isTechnicienRoute();
    // OU si vous voulez cacher aussi pour admin :
    // return this.isTechnicienRoute() || this.isAdminRoute();
  }
    private checkAndRedirect(): void {
  setTimeout(() => {
    const currentUser = this.authService.getCurrentUser();
    const currentRoute = this.router.url;

    if (currentUser && (currentRoute === '/' || currentRoute === '')) {
      if (currentUser.role === 'ADMIN') {
        this.router.navigate(['/admin']);
      } else if (currentUser.role === 'TECHNICIEN') {
        this.router.navigate(['/technicien']);
      }
    }
  }, 100);
}

}