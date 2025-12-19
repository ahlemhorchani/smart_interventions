// src/app/modules/citoyen/citoyen-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { MesSignalementsComponent } from './suivi/mes-signalements.component';
import { SuiviSignalementComponent } from './suivi/suivi-signalement.component';
import { SignalementFormComponent } from './signalement/signalement-form.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'signalement',
        component: SignalementFormComponent
      },
      {
        path: 'suivi',
        component: MesSignalementsComponent
      },
      {
        path: 'suivi/:id',
        component: SuiviSignalementComponent
      },
      { path: '', redirectTo: 'signalement', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CitoyenRoutingModule { }
