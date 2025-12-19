// src/app/app.routes.ts - CORRIGÉ
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

// Import des composants standalone
import { SignalementListComponent } from './modules/admin/signalement/signalement-list.component';
import { SignalementFormComponent } from './modules/citoyen/signalement/signalement-form.component';
import { MesSignalementsComponent } from './modules/citoyen/suivi/mes-signalements.component';
import { SuiviSignalementComponent } from './modules/citoyen/suivi/suivi-signalement.component';
import { AdminDashboardComponent } from './modules/admin/dashboard/admin-dashboard.component';
import { InterventionsListComponent } from './modules/admin/interventions/interventions-list.component';
import { InterventionFormComponent } from './modules/admin/interventions/intervention-form.component';
import { EquipementsListComponent } from './modules/admin/equipements/equipements-list.component';
import { TechniciensListComponent } from './modules/admin/techniciens/techniciens-list.component';
import { StatistiquesComponent } from './modules/admin/statistiques/statistiques.component';
import { TechnicienDashboardComponent } from './modules/technicien/dashboard/technicien-dashboard.component';
import { InterventionsTechnicienComponent } from './modules/technicien/interventions/interventions-technicien.component';
import { LeafletMapComponent } from './modules/map/leaflet-map/leaflet-map.component';
import { ServicesMunicipauxListComponent } from './modules/admin/services-municipaux/services-municipaux-list.component';
import { ServicesMunicipauxFormComponent } from './modules/admin/services-municipaux/services-municipaux-form.component';
import { ServicesMunicipauxEditComponent  } from './modules/admin/services-municipaux/services-municipaux-edit.component';
import { EquipementAddComponent } from './modules/admin/equipements/equipement-add.component';
import { EquipementEditComponent } from './modules/admin/equipements/equipement-edit.component';
import { ServicesMunicipauxDetailsComponent } from './modules/admin/services-municipaux/services-municipaux-details.component';
import { CanActivate } from '@angular/router';
// app.routes.ts - Vérifiez que c'est exactement comme ça
export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,  // HomeComponent est le layout principal
    children: [
      // Routes publiques
      { path: 'citoyen/signalement', component: SignalementFormComponent },
      { path: 'citoyen/suivi', component: MesSignalementsComponent },
      { path: 'citoyen/suivi/:id', component: SuiviSignalementComponent },
      { path: 'carte', component: LeafletMapComponent },
      // Lazy load standalone components directement
      { path: 'auth/login', loadComponent: () => import('./modules/auth/login/login.component').then(c => c.LoginComponent) },
      { path: 'auth/register', loadComponent: () => import('./modules/auth/register/register.component').then(c => c.RegisterComponent) },
      // Routes admin
      { 
        path: 'admin',
        canActivate: [authGuard, roleGuard],
        data: { expectedRole: 'ADMIN' },
        children: [
          
          { path: 'signalements', component: SignalementListComponent, canActivate:[authGuard] },
          { path: 'services-municipaux', component: ServicesMunicipauxListComponent,  canActivate:[authGuard]  },
          { path: 'services-municipaux/new', component: ServicesMunicipauxFormComponent ,  canActivate:[authGuard] },
          { path: 'services-municipaux/:id/edit', component: ServicesMunicipauxEditComponent,  canActivate:[authGuard]  },
          { path: '', component: AdminDashboardComponent,  canActivate:[authGuard]  },
          { path: 'interventions', component: InterventionsListComponent ,  canActivate:[authGuard] },
          { path: 'interventions/nouvelle', component: InterventionFormComponent ,  canActivate:[authGuard] },
          { path: 'equipements', component: EquipementsListComponent ,  canActivate:[authGuard] },
          { path: 'equipements/ajouter', component: EquipementAddComponent ,  canActivate:[authGuard] },
          { path: 'equipements/:id/modifier', component: EquipementEditComponent,  canActivate:[authGuard]  },
          { path: 'services-municipaux/:id', component: ServicesMunicipauxDetailsComponent ,  canActivate:[authGuard] },
          { path: 'techniciens', component: TechniciensListComponent ,  canActivate:[authGuard] },
          { path: 'statistiques', component: StatistiquesComponent,  canActivate:[authGuard]  },
        ]
      },
      
      // Routes technicien
      { 
        path: 'technicien',
        canActivate: [authGuard, roleGuard],
        data: { expectedRole: 'TECHNICIEN' },
        children: [
          { path: '', component: TechnicienDashboardComponent,  canActivate:[authGuard]  },
          { path: 'interventions', component: InterventionsTechnicienComponent,  canActivate:[authGuard]  },
        ]
      },
      
      // Redirection par défaut
    ]
  },
  
  // Auth module
  
  
  // 404
  { path: '**', redirectTo: '' }
];