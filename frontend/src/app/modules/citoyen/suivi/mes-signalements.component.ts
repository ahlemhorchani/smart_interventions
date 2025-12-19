// src/app/modules/citoyen/suivi/mes-signalements.component.ts
import { Component, OnInit } from '@angular/core';
import { Signalement } from '../../../core/models/signalement.model';
import { SignalementService } from '../../../core/services/signalement.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  standalone : true ,
  imports :[CommonModule,FormsModule,RouterModule],
  selector: 'app-mes-signalements',
  templateUrl: './mes-signalements.component.html',
  styleUrls: ['./mes-signalements.component.scss']
})
export class MesSignalementsComponent implements OnInit {
  signalements: Signalement[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private signalementService: SignalementService,
    private authService: AuthService
  ) {}

   ngOnInit(): void {
    // Utilisation réactive du BehaviorSubject
    this.authService.user$.subscribe(user => {
      if (user?.id) {
        this.getMesSignalements(user.id);
      }
    })}
  getMesSignalements(citoyenId: string): void {
    this.loading = true;
    this.signalementService.getSignalementsByCitoyen(citoyenId).subscribe({
      next: (data) => {
        this.signalements = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Impossible de récupérer vos signalements.';
        console.error(err);
        this.loading = false;
      }
    });
  }

  formatDate(date: Date | undefined): string {
    return date ? new Date(date).toLocaleString() : '';
  }
}
