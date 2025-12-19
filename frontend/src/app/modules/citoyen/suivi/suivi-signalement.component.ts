// src/app/modules/citoyen/suivi/suivi-signalement.component.ts
import { Component, OnInit } from '@angular/core';
import { Signalement, StatutSignalement } from '../../../core/models/signalement.model';
import { SignalementService } from '../../../core/services/signalement.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  standalone : true ,
  imports :[CommonModule,FormsModule,RouterModule],
  selector: 'app-suivi-signalement',
  templateUrl: './suivi-signalement.component.html',
  styleUrls: ['./suivi-signalement.component.scss']
})
export class SuiviSignalementComponent implements OnInit {
  signalementId!: string;
  signalement?: Signalement;
  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private signalementService: SignalementService
  ) {}

  ngOnInit(): void {
    this.signalementId = this.route.snapshot.paramMap.get('id')!;
    this.getSignalement();
  }

  getSignalement(): void {
    this.loading = true;
    this.signalementService.getSignalementById(this.signalementId).subscribe({
      next: (data) => {
        this.signalement = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Impossible de récupérer le signalement.';
        console.error(err);
        this.loading = false;
      }
    });
  }

  // Formater la date pour affichage
  formatDate(date: Date | undefined): string {
    return date ? new Date(date).toLocaleString() : '';
  }
}
