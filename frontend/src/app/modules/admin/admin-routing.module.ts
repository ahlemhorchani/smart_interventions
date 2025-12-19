import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

// Components
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { InterventionsListComponent  } from './interventions/interventions-list.component';
import { InterventionFormComponent } from './interventions/intervention-form.component';
import { EquipementsListComponent } from './equipements/equipements-list.component';
import { TechniciensListComponent } from './techniciens/techniciens-list.component';
import { StatistiquesComponent } from './statistiques/statistiques.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { 
        path: 'dashboard', 
        component: AdminDashboardComponent,
        canActivate: [roleGuard],
        data: { expectedRole: 'ADMIN' }
      },
      { 
        path: 'interventions', 
        component: InterventionsListComponent,
        canActivate: [roleGuard],
        data: { expectedRole: 'ADMIN' }
      },
      { 
        path: 'interventions/nouveau', 
        component: InterventionFormComponent,
        canActivate: [roleGuard],
        data: { expectedRole: 'ADMIN' }
      },
      { 
        path: 'interventions/:id/modifier', 
        component: InterventionFormComponent,
        canActivate: [roleGuard],
        data: { expectedRole: 'ADMIN' }
      },
      { 
        path: 'equipements', 
        component: EquipementsListComponent,
        canActivate: [roleGuard],
        data: { expectedRole: 'ADMIN' }
      },
      { 
        path: 'techniciens', 
        component: TechniciensListComponent,
        canActivate: [roleGuard],
        data: { expectedRole: 'ADMIN' }
      },
      { 
        path: 'statistiques', 
        component: StatistiquesComponent,
        canActivate: [roleGuard],
        data: { expectedRole: 'ADMIN' }
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }