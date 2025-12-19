import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatistiquesService } from '../../../core/services/statistique.service';
import { Statistiques } from '../../../core/models/statistiques.model';
import { FormsModule } from '@angular/forms';
import { AdminNavbarComponent } from '../navbar/admin-navbar.component';

@Component({
  selector: 'app-statistiques',
  standalone: true,
  imports: [CommonModule, FormsModule,AdminNavbarComponent ],
  templateUrl: './statistiques.component.html',
  styleUrls: ['./statistiques.component.scss']
})
export class StatistiquesComponent implements OnInit {

  stats?: Statistiques;
  loading: boolean = true;
  error?: string;

  constructor(private statsService: StatistiquesService) {}

  ngOnInit(): void {
    this.statsService.getStatistiquesGenerales().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erreur lors du chargement des statistiques';
        this.loading = false;
      }
    });
  }
  // statistiques.component.ts
getMaxTechPerformance(): number {
  if (!this.stats?.performanceTechniciens) return 100;
  
  const values = Object.values(this.stats.performanceTechniciens);
  return Math.max(...values as number[], 100);
}
}
