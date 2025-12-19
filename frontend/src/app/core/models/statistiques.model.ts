export interface Statistiques {
  id?: string;
  tauxResolution: number;
  tempsMoyenIntervention: number;
  nbInterventionsParService: { [service: string]: number };
  nbInterventionsParZone: { [zone: string]: number };
  performanceTechniciens: { [technicien: string]: number };
  topZonesProblemes: string[];
  tauxSatisfactionCitoyens: number;
}
